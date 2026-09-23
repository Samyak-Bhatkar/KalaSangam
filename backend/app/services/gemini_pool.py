"""ShilpSetu AI - Dynamic Multi-Key Gemini API Pool & Failover Manager
Ministry of Social Justice and Empowerment (MoSJE), Government of India

Manages a pool of multiple Gemini API keys to multiply daily quota limits:
- Automatically load balances or failovers across configured keys
- When a key encounters HTTP 429 / RESOURCE_EXHAUSTED, automatically rotates to the next key
- Seamless retry transparent to callers across IVR, Catalog, Speech, and Studio pipelines
"""

import os
import time
import logging
import asyncio
import threading
from pathlib import Path
from typing import List, Optional, Callable, Any, Coroutine
from dotenv import load_dotenv

# Ensure backend .env is loaded
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

logger = logging.getLogger("ShilpSetu.GeminiPool")

class GeminiKeyPool:
    def __init__(self):
        self._lock = threading.Lock()
        self._keys: List[str] = []
        self._active_index: int = 0
        self._exhausted_keys: dict[str, float] = {}  # key -> timestamp when exhausted
        self._cooldown_seconds = 60.0  # retry key after 60s cooldown if temporary
        self.reload_keys()

    def reload_keys(self) -> List[str]:
        with self._lock:
            raw_keys = os.getenv("GEMINI_API_KEYS", "")
            keys_list = [k.strip() for k in raw_keys.split(",") if k.strip()]
            
            single_key = os.getenv("GEMINI_API_KEY", "").strip()
            if single_key and single_key not in keys_list:
                keys_list.insert(0, single_key)

            # Deduplicate while preserving order
            seen = set()
            self._keys = [k for k in keys_list if not (k in seen or seen.add(k))]
            
            if not self._keys and single_key:
                self._keys = [single_key]
                
            self._active_index = 0
            logger.info(f"[Gemini Key Pool] Loaded {len(self._keys)} API key(s) into active pool.")
            return self._keys

    @property
    def total_keys(self) -> int:
        return len(self._keys)

    def get_active_key(self) -> str:
        with self._lock:
            if not self._keys:
                return os.getenv("GEMINI_API_KEY", "")
            
            now = time.time()
            # Clean expired cooldowns
            expired = [k for k, t in self._exhausted_keys.items() if now - t > self._cooldown_seconds]
            for k in expired:
                del self._exhausted_keys[k]

            # Try to pick a non-exhausted key starting from current index
            for offset in range(len(self._keys)):
                idx = (self._active_index + offset) % len(self._keys)
                candidate = self._keys[idx]
                if candidate not in self._exhausted_keys:
                    self._active_index = idx
                    return candidate

            # If all are exhausted, return current index anyway
            return self._keys[self._active_index % len(self._keys)]

    def mark_key_exhausted(self, key: str, reason: str = "429 Quota Exhausted") -> str:
        with self._lock:
            if not self._keys:
                return key

            self._exhausted_keys[key] = time.time()
            old_idx = self._active_index
            self._active_index = (self._active_index + 1) % len(self._keys)
            next_key = self._keys[self._active_index]

            masked_old = f"...{key[-6:]}" if len(key) >= 6 else key
            masked_next = f"...{next_key[-6:]}" if len(next_key) >= 6 else next_key
            logger.warning(
                f"[Gemini Key Pool] Key #{old_idx + 1} ({masked_old}) exhausted ({reason}). "
                f"Auto-rotated to Key #{self._active_index + 1} ({masked_next}). "
                f"({len(self._keys) - len(self._exhausted_keys)}/{len(self._keys)} keys active)"
            )
            return next_key

    def is_quota_error(self, err: Exception) -> bool:
        err_str = str(err).lower()
        return (
            "429" in err_str
            or "resource_exhausted" in err_str
            or "quota" in err_str
            or "rate limit" in err_str
        )

    def execute_with_failover(self, call_fn: Callable[[Any], Any]) -> Any:
        """
        Executes call_fn(client) using the active key.
        If a quota / 429 error occurs, automatically marks the key exhausted,
        switches to the next key in the pool, and retries.
        """
        from google import genai
        
        attempts = 0
        max_attempts = max(1, len(self._keys))
        last_error = None

        while attempts < max_attempts:
            active_key = self.get_active_key()
            if not active_key:
                raise ValueError("No Gemini API keys available in pool.")

            client = genai.Client(api_key=active_key)
            try:
                return call_fn(client)
            except Exception as e:
                last_error = e
                if self.is_quota_error(e):
                    self.mark_key_exhausted(active_key, reason=str(e)[:100])
                    attempts += 1
                    continue
                else:
                    # Non-quota error, raise immediately
                    raise e

        if last_error:
            raise last_error

    async def execute_async_with_failover(self, async_call_fn: Callable[[Any], Coroutine[Any, Any, Any]]) -> Any:
        """
        Asynchronous variant: executes await async_call_fn(client) with auto-failover.
        """
        from google import genai

        attempts = 0
        max_attempts = max(1, len(self._keys))
        last_error = None

        while attempts < max_attempts:
            active_key = self.get_active_key()
            if not active_key:
                raise ValueError("No Gemini API keys available in pool.")

            client = genai.Client(api_key=active_key)
            try:
                return await async_call_fn(client)
            except Exception as e:
                last_error = e
                if self.is_quota_error(e):
                    self.mark_key_exhausted(active_key, reason=str(e)[:100])
                    attempts += 1
                    continue
                else:
                    raise e

        if last_error:
            raise last_error

# Singleton instance
gemini_pool = GeminiKeyPool()
