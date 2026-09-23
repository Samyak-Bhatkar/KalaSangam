import sys
import logging
from typing import Any, Union

logger = logging.getLogger("ShilpSetu.SystemDiagnostics")

def log_gemini_error(service_name: str, error: Exception, context: str = "", model_name: str = "") -> str:
    """
    Logs a high-visibility, unmistakable error banner to the server terminal console (sys.stderr)
    whenever a Google Gemini API call fails, allowing the developer to see the exact error,
    HTTP status, or quota issue immediately without breaking the UI.
    
    Returns the formatted single-line error message for API response propagation.
    """
    border = "=" * 78
    err_cls = type(error).__name__
    err_text = str(error)

    banner = [
        f"\n{border}",
        f"🚨 [GEMINI API ERROR DETECTED]",
        f"   Component  : {service_name}",
    ]
    if model_name:
        banner.append(f"   Model      : {model_name}")
    if context:
        banner.append(f"   Context    : {context}")
    banner.extend([
        f"   Error Type : {err_cls}",
        f"   Details    : {err_text}",
        f"   Action     : UI PRESERVED — Gracefully routed to backup/heuristic engine.",
        f"{border}\n"
    ])
    full_banner = "\n".join(banner)
    print(full_banner, file=sys.stderr, flush=True)
    logger.error(f"[Gemini Error in {service_name}] {err_cls}: {err_text} (Context: {context})")
    
    return f"{err_cls}: {err_text}"


def log_fallback_event(
    service_name: str,
    component: str,
    reason: Any,
    fallback_action: str,
    context: str = "",
    severity: str = "WARNING"
) -> str:
    """
    Logs a high-visibility diagnostic banner to the server terminal console (sys.stderr)
    whenever any subsystem (Bhashini ASR, Pexels, Pixabay, Rembg/MobileSAM, FFmpeg, Cloud Storage, n8n)
    encounters an error or missing configuration and safely triggers a fallback.
    
    Guarantees:
    1. The developer/evaluator sees the exact error on the console in real-time.
    2. The UI never breaks, freezes, or crashes.
    3. The return value can be sent in API JSON payloads for browser devtools inspection.
    """
    border = "=" * 78
    if isinstance(reason, Exception):
        err_cls = type(reason).__name__
        err_text = str(reason)
    else:
        err_cls = "ConfigOrRuntimeNotice"
        err_text = str(reason)

    icon = "🚨" if severity == "ERROR" else "⚠️"
    banner = [
        f"\n{border}",
        f"{icon}  [SYSTEM FALLBACK ACTIVATED: {component.upper()}]",
        f"   Service    : {service_name}",
    ]
    if context:
        banner.append(f"   Context    : {context}")
    banner.extend([
        f"   Trigger/Err: {err_cls}: {err_text}",
        f"   Fallback   : {fallback_action}",
        f"   Status     : UI PROTECTED — Execution continuing seamlessly.",
        f"{border}\n"
    ])
    full_banner = "\n".join(banner)
    print(full_banner, file=sys.stderr, flush=True)
    logger.warning(f"[{component} Fallback in {service_name}] {err_cls}: {err_text} -> {fallback_action}")
    
    return f"{err_cls}: {err_text}"

