"""ShilpSetu SQLite Database Manager
Provides persistent local storage for artisan craft products.
Implements:
- Strict separation of 'draft' vs 'published' status
- 24-hour lazy auto-cleanup of unverified drafts
- Atomic publish transaction with timestamping
"""

import sqlite3
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List
from .config import settings

logger = logging.getLogger("ShilpSetu.Database")

DB_PATH = settings.STATIC_DIR / "shilpsetu.db"

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Initializes database tables and indexes."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                title_hi TEXT,
                title_en TEXT,
                description_hi TEXT,
                description_en TEXT,
                craft_category TEXT,
                technique TEXT,
                raw_cost REAL DEFAULT 0.0,
                labor_hours REAL DEFAULT 0.0,
                b2c_price REAL DEFAULT 0.0,
                b2b_price REAL DEFAULT 0.0,
                gem_price REAL DEFAULT 0.0,
                artisan_name TEXT,
                beneficiary_id TEXT,
                cluster_pin TEXT,
                raw_image_url TEXT,
                studio_image_url TEXT,
                watermarked_image_url TEXT,
                status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
                qr_code_url TEXT,
                beckn_payload TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at)
        """)
        conn.commit()
    logger.info(f"Initialized SQLite database at {DB_PATH}")

def cleanup_expired_drafts(hours: int = 24) -> int:
    """
    Lazy Auto-Cleanup:
    Deletes any draft product created more than `hours` ago that was never published.
    Returns the count of purged drafts.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM products
                WHERE status = 'draft'
                AND created_at < datetime('now', ?)
            """, (f"-{hours} hours",))
            deleted_count = cursor.rowcount
            conn.commit()
            if deleted_count > 0:
                logger.info(f"Lazy auto-cleanup purged {deleted_count} expired draft(s) older than {hours}h.")
            return deleted_count
    except Exception as e:
        logger.error(f"Error during draft lazy cleanup: {e}")
        return 0

def save_draft_product(product: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates or updates a product as a 'draft'.
    Guarantees no QR code is generated or assigned.
    """
    product_id = product.get("id")
    if not product_id:
        raise ValueError("Product id is required")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Check if already published - published products cannot be reverted to draft
        cursor.execute("SELECT status, published_at, qr_code_url FROM products WHERE id = ?", (product_id,))
        existing = cursor.fetchone()
        if existing and existing["status"] == "published":
            raise ValueError(f"Product {product_id} is already published and cannot be demoted to draft.")

        cursor.execute("""
            INSERT INTO products (
                id, title_hi, title_en, description_hi, description_en,
                craft_category, technique, raw_cost, labor_hours,
                b2c_price, b2b_price, gem_price, artisan_name,
                beneficiary_id, cluster_pin, raw_image_url,
                studio_image_url, watermarked_image_url, status,
                qr_code_url, created_at, published_at
            ) VALUES (
                :id, :title_hi, :title_en, :description_hi, :description_en,
                :craft_category, :technique, :raw_cost, :labor_hours,
                :b2c_price, :b2b_price, :gem_price, :artisan_name,
                :beneficiary_id, :cluster_pin, :raw_image_url,
                :studio_image_url, :watermarked_image_url, 'draft',
                NULL, CURRENT_TIMESTAMP, NULL
            )
            ON CONFLICT(id) DO UPDATE SET
                title_hi = excluded.title_hi,
                title_en = excluded.title_en,
                description_hi = excluded.description_hi,
                description_en = excluded.description_en,
                craft_category = excluded.craft_category,
                technique = excluded.technique,
                raw_cost = excluded.raw_cost,
                labor_hours = excluded.labor_hours,
                b2c_price = excluded.b2c_price,
                b2b_price = excluded.b2b_price,
                gem_price = excluded.gem_price,
                artisan_name = excluded.artisan_name,
                beneficiary_id = excluded.beneficiary_id,
                cluster_pin = excluded.cluster_pin,
                raw_image_url = excluded.raw_image_url,
                studio_image_url = excluded.studio_image_url,
                watermarked_image_url = excluded.watermarked_image_url,
                status = 'draft',
                qr_code_url = NULL
        """, {
            "id": product_id,
            "title_hi": product.get("title_hi", ""),
            "title_en": product.get("title_en", ""),
            "description_hi": product.get("description_hi", ""),
            "description_en": product.get("description_en", ""),
            "craft_category": product.get("craft_category", ""),
            "technique": product.get("technique", ""),
            "raw_cost": float(product.get("raw_cost") or 0.0),
            "labor_hours": float(product.get("labor_hours") or 0.0),
            "b2c_price": float(product.get("b2c_price") or 0.0),
            "b2b_price": float(product.get("b2b_price") or 0.0),
            "gem_price": float(product.get("gem_price") or 0.0),
            "artisan_name": product.get("artisan_name", "Rural Artisan"),
            "beneficiary_id": product.get("beneficiary_id", "MoSJE-NBCFDC-01"),
            "cluster_pin": product.get("cluster_pin", "273001"),
            "raw_image_url": product.get("raw_image_url", ""),
            "studio_image_url": product.get("studio_image_url", ""),
            "watermarked_image_url": product.get("watermarked_image_url", ""),
        })
        conn.commit()

    return get_product_by_id(product_id)

def publish_product(
    product_id: str,
    qr_code_url: str,
    beckn_payload: Optional[Dict[str, Any]] = None,
    product_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Publishes a product:
    - Flips status to 'published'
    - Assigns verified QR code URL
    - Sets published_at to current timestamp
    - Optionally creates or updates product fields if provided
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
        exists = cursor.fetchone()
        
        beckn_str = json.dumps(beckn_payload) if beckn_payload else None

        if not exists and product_data:
            cursor.execute("""
                INSERT INTO products (
                    id, title_hi, title_en, description_hi, description_en,
                    craft_category, technique, raw_cost, labor_hours,
                    b2c_price, b2b_price, gem_price, artisan_name,
                    beneficiary_id, cluster_pin, raw_image_url,
                    studio_image_url, watermarked_image_url, status,
                    qr_code_url, beckn_payload, created_at, published_at
                ) VALUES (
                    :id, :title_hi, :title_en, :description_hi, :description_en,
                    :craft_category, :technique, :raw_cost, :labor_hours,
                    :b2c_price, :b2b_price, :gem_price, :artisan_name,
                    :beneficiary_id, :cluster_pin, :raw_image_url,
                    :studio_image_url, :watermarked_image_url, 'published',
                    :qr_code_url, :beckn_payload, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            """, {
                "id": product_id,
                "title_hi": product_data.get("title_hi", ""),
                "title_en": product_data.get("title_en", ""),
                "description_hi": product_data.get("description_hi", ""),
                "description_en": product_data.get("description_en", ""),
                "craft_category": product_data.get("craft_category", ""),
                "technique": product_data.get("technique", ""),
                "raw_cost": float(product_data.get("raw_cost") or 0.0),
                "labor_hours": float(product_data.get("labor_hours") or 0.0),
                "b2c_price": float(product_data.get("b2c_price") or 0.0),
                "b2b_price": float(product_data.get("b2b_price") or 0.0),
                "gem_price": float(product_data.get("gem_price") or 0.0),
                "artisan_name": product_data.get("artisan_name", "Rural Artisan"),
                "beneficiary_id": product_data.get("beneficiary_id", "MoSJE-NBCFDC-01"),
                "cluster_pin": product_data.get("cluster_pin", "273001"),
                "raw_image_url": product_data.get("raw_image_url", ""),
                "studio_image_url": product_data.get("studio_image_url", ""),
                "watermarked_image_url": product_data.get("watermarked_image_url", ""),
                "qr_code_url": qr_code_url,
                "beckn_payload": beckn_str
            })
        else:
            if product_data:
                cursor.execute("""
                    UPDATE products SET
                        title_hi = COALESCE(:title_hi, title_hi),
                        title_en = COALESCE(:title_en, title_en),
                        description_hi = COALESCE(:description_hi, description_hi),
                        description_en = COALESCE(:description_en, description_en),
                        craft_category = COALESCE(:craft_category, craft_category),
                        technique = COALESCE(:technique, technique),
                        raw_cost = COALESCE(:raw_cost, raw_cost),
                        labor_hours = COALESCE(:labor_hours, labor_hours),
                        b2c_price = COALESCE(:b2c_price, b2c_price),
                        b2b_price = COALESCE(:b2b_price, b2b_price),
                        gem_price = COALESCE(:gem_price, gem_price),
                        artisan_name = COALESCE(:artisan_name, artisan_name),
                        beneficiary_id = COALESCE(:beneficiary_id, beneficiary_id),
                        cluster_pin = COALESCE(:cluster_pin, cluster_pin),
                        raw_image_url = COALESCE(:raw_image_url, raw_image_url),
                        studio_image_url = COALESCE(:studio_image_url, studio_image_url),
                        watermarked_image_url = COALESCE(:watermarked_image_url, watermarked_image_url),
                        status = 'published',
                        qr_code_url = :qr_code_url,
                        beckn_payload = COALESCE(:beckn_payload, beckn_payload),
                        published_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                """, {
                    "id": product_id,
                    "title_hi": product_data.get("title_hi"),
                    "title_en": product_data.get("title_en"),
                    "description_hi": product_data.get("description_hi"),
                    "description_en": product_data.get("description_en"),
                    "craft_category": product_data.get("craft_category"),
                    "technique": product_data.get("technique"),
                    "raw_cost": float(product_data.get("raw_cost")) if product_data.get("raw_cost") is not None else None,
                    "labor_hours": float(product_data.get("labor_hours")) if product_data.get("labor_hours") is not None else None,
                    "b2c_price": float(product_data.get("b2c_price")) if product_data.get("b2c_price") is not None else None,
                    "b2b_price": float(product_data.get("b2b_price")) if product_data.get("b2b_price") is not None else None,
                    "gem_price": float(product_data.get("gem_price")) if product_data.get("gem_price") is not None else None,
                    "artisan_name": product_data.get("artisan_name"),
                    "beneficiary_id": product_data.get("beneficiary_id"),
                    "cluster_pin": product_data.get("cluster_pin"),
                    "raw_image_url": product_data.get("raw_image_url"),
                    "studio_image_url": product_data.get("studio_image_url"),
                    "watermarked_image_url": product_data.get("watermarked_image_url"),
                    "qr_code_url": qr_code_url,
                    "beckn_payload": beckn_str
                })
            else:
                cursor.execute("""
                    UPDATE products SET
                        status = 'published',
                        qr_code_url = ?,
                        beckn_payload = COALESCE(?, beckn_payload),
                        published_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (qr_code_url, beckn_str, product_id))

        conn.commit()

    return get_product_by_id(product_id)

def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a product by primary key."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            return None
        res = dict(row)
        if res.get("beckn_payload"):
            try:
                res["beckn_payload"] = json.loads(res["beckn_payload"])
            except Exception:
                pass
        return res

def list_artisan_products(include_drafts: bool = True, perform_cleanup: bool = True) -> List[Dict[str, Any]]:
    """
    Returns products for the artisan dashboard.
    Triggers lazy auto-cleanup of unverified drafts older than 24 hours.
    """
    if perform_cleanup:
        cleanup_expired_drafts(hours=24)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        if include_drafts:
            cursor.execute("""
                SELECT * FROM products
                ORDER BY created_at DESC
            """)
        else:
            cursor.execute("""
                SELECT * FROM products
                WHERE status = 'published'
                ORDER BY published_at DESC
            """)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if d.get("beckn_payload"):
                try:
                    d["beckn_payload"] = json.loads(d["beckn_payload"])
                except Exception:
                    pass
            result.append(d)
        return result

def delete_product(product_id: str) -> bool:
    """Deletes a product by ID (e.g. discarding a draft)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        return cursor.rowcount > 0
