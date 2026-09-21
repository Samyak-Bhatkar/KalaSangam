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

        # Schema Migration: Dynamically ensure coordinator panel columns and expanded status exist
        cursor.execute("PRAGMA table_info(products)")
        existing_cols = {row["name"] for row in cursor.fetchall()}

        if "channel" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN channel TEXT DEFAULT 'camera'")
        if "original_transcript" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN original_transcript TEXT DEFAULT ''")
        if "rejection_reason" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN rejection_reason TEXT DEFAULT ''")
        if "correction_log" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN correction_log TEXT DEFAULT '[]'")
        if "lifestyle_image_url" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN lifestyle_image_url TEXT DEFAULT ''")
        if "craft_pins" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN craft_pins TEXT DEFAULT '[]'")
        if "annotated_image_url" not in existing_cols:
            cursor.execute("ALTER TABLE products ADD COLUMN annotated_image_url TEXT DEFAULT ''")

        # If old table had restrictive status CHECK constraint, recreate table cleanly
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='products'")
        tbl_meta = cursor.fetchone()
        if tbl_meta and "CHECK(status IN ('draft', 'published'))" in (tbl_meta["sql"] or ""):
            cursor.execute("""
                CREATE TABLE products_v2 (
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
                    status TEXT CHECK(status IN ('draft', 'pending', 'approved', 'rejected', 'published')) DEFAULT 'draft',
                    qr_code_url TEXT,
                    beckn_payload TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    published_at TIMESTAMP,
                    channel TEXT DEFAULT 'camera',
                    original_transcript TEXT DEFAULT '',
                    rejection_reason TEXT DEFAULT '',
                    correction_log TEXT DEFAULT '[]'
                )
            """)
            cursor.execute("""
                INSERT INTO products_v2 (
                    id, title_hi, title_en, description_hi, description_en,
                    craft_category, technique, raw_cost, labor_hours,
                    b2c_price, b2b_price, gem_price, artisan_name,
                    beneficiary_id, cluster_pin, raw_image_url,
                    studio_image_url, watermarked_image_url, status,
                    qr_code_url, beckn_payload, created_at, published_at,
                    channel, original_transcript, rejection_reason, correction_log
                )
                SELECT
                    id, title_hi, title_en, description_hi, description_en,
                    craft_category, technique, raw_cost, labor_hours,
                    b2c_price, b2b_price, gem_price, artisan_name,
                    beneficiary_id, cluster_pin, raw_image_url,
                    studio_image_url, watermarked_image_url, status,
                    qr_code_url, beckn_payload, created_at, published_at,
                    COALESCE(channel, 'camera'),
                    COALESCE(original_transcript, ''),
                    COALESCE(rejection_reason, ''),
                    COALESCE(correction_log, '[]')
                FROM products
            """)
            cursor.execute("DROP TABLE products")
            cursor.execute("ALTER TABLE products_v2 RENAME TO products")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at)")

        conn.commit()
    logger.info(f"Initialized SQLite database at {DB_PATH}")
    seed_canonical_fixtures()

def seed_canonical_fixtures() -> None:
    """Seeds canonical craft presets into products table if not present so public buyer dossier and storefront always work."""
    from .models.mock_data import CRAFT_FIXTURES
    sample_pins = {
        "CRAFT-NBCFDC-002": [
            {
                "id": "pin_1",
                "pin_number": 1,
                "x": 48.0,
                "y": 52.0,
                "x_pct": 48.0,
                "y_pct": 52.0,
                "category": "craft_detail",
                "bank_term": "Traditional Motif",
                "short_label": "पारंपरिक चाक नक्काशी",
                "short_label_hi": "पारंपरिक चाक नक्काशी",
                "short_label_en": "Hand Carved Traditional Motif",
                "full_description": "हस्तनिर्मित चाक पर गढ़ी गई पारंपरिक नक्काशी",
                "full_description_hi": "हस्तनिर्मित चाक पर गढ़ी गई पारंपरिक नक्काशी",
                "full_description_en": "Traditional wheel-turned clay etching with Warli folk motifs.",
                "audio_url": None,
                "language": "hi"
            },
            {
                "id": "pin_2",
                "pin_number": 2,
                "x": 35.0,
                "y": 68.0,
                "x_pct": 35.0,
                "y_pct": 68.0,
                "category": "imperfection",
                "bank_term": "Kiln Color Variation",
                "short_label": "प्राकृतिक भट्टी रंग भेद",
                "short_label_hi": "प्राकृतिक भट्टी रंग भेद",
                "short_label_en": "Natural Kiln Firing Variation",
                "full_description": "पारंपरिक लकड़ी की भट्टी में धीमी आंच से उपजा प्राकृतिक रंग भेद।",
                "full_description_hi": "पारंपरिक लकड़ी की भट्टी में धीमी आंच से उपजा प्राकृतिक रंग भेद।",
                "full_description_en": "Organic color shade variation from traditional wood kiln firing.",
                "audio_url": None,
                "language": "hi"
            }
        ]
    }
    preset_prices = {
        "CRAFT-NBCFDC-002": (2461.25, 1850.0, 2165.90),
        "CRAFT-NSFDC-001": (3250.0, 2600.0, 2860.0),
        "CRAFT-NBCFDC-003": (1450.0, 1100.0, 1276.0),
        "CRAFT-NSFDC-004": (850.0, 650.0, 748.0),
    }
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for key, fixture in CRAFT_FIXTURES.items():
            pid = fixture.get("id")
            if not pid:
                continue
            cursor.execute("SELECT id FROM products WHERE id = ?", (pid,))
            if not cursor.fetchone():
                b2c, b2b, gem = preset_prices.get(pid, (480.0, 380.0, 420.0))
                pins = sample_pins.get(pid, [])
                img = fixture.get("clean_image_url") or fixture.get("sample_image_url") or fixture.get("raw_image_url")
                cursor.execute("""
                    INSERT INTO products (
                        id, title_hi, title_en, description_hi, description_en,
                        craft_category, technique, raw_cost, labor_hours,
                        b2c_price, b2b_price, gem_price, artisan_name,
                        beneficiary_id, cluster_pin, raw_image_url,
                        studio_image_url, lifestyle_image_url, watermarked_image_url, annotated_image_url, craft_pins, status,
                        qr_code_url, created_at, published_at, channel, original_transcript
                    ) VALUES (
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?,
                        ?, ?, ?, ?, ?, 'published',
                        ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'camera', ?
                    )
                """, (
                    pid,
                    fixture.get("title_hi", ""),
                    fixture.get("title_en", ""),
                    fixture.get("description_hi", ""),
                    fixture.get("description_en", ""),
                    fixture.get("craft_category", "Traditional Craft"),
                    fixture.get("technique", "Handmade"),
                    float(fixture.get("raw_material_cost_estimate_inr") or 180.0),
                    float(fixture.get("estimated_hours") or 6.0),
                    b2c, b2b, gem,
                    fixture.get("artisan_name", "Rural Master Artisan"),
                    fixture.get("beneficiary_id", "NBCFDC-UP-18492"),
                    fixture.get("cluster_pin", "273001"),
                    fixture.get("raw_image_url", img),
                    img, img, img, img,
                    json.dumps(pins),
                    f"/static/uploads/qr_{pid}.png",
                    fixture.get("sample_transcript_hi", "")
                ))

                # Ensure high-res QR code PNG exists on disk
                qr_file = settings.UPLOAD_DIR / f"qr_{pid}.png"
                if not qr_file.exists():
                    try:
                        from .services.reel_generator import generate_published_product_qr
                        generate_published_product_qr(pid, fixture.get("title_en", "Craft"), "http://localhost:5173")
                    except Exception as qr_err:
                        logger.warning(f"Could not generate QR for {pid}: {qr_err}")
        conn.commit()

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

        target_status = product.get("status") or "draft"
        target_channel = product.get("channel") or ("ivr" if "IVR" in str(product_id) else "camera")
        original_transcript = product.get("original_transcript", "")
        rejection_reason = product.get("rejection_reason", "")
        correction_log = product.get("correction_log", "[]")
        if isinstance(correction_log, list):
            correction_log = json.dumps(correction_log)

        raw_craft_pins = product.get("craft_pins", [])
        craft_pins_json = json.dumps([p.dict() if hasattr(p, "dict") else p for p in raw_craft_pins]) if raw_craft_pins else "[]"

        cursor.execute("""
            INSERT INTO products (
                id, title_hi, title_en, description_hi, description_en,
                craft_category, technique, raw_cost, labor_hours,
                b2c_price, b2b_price, gem_price, artisan_name,
                beneficiary_id, cluster_pin, raw_image_url,
                studio_image_url, lifestyle_image_url, watermarked_image_url, annotated_image_url, craft_pins, status,
                qr_code_url, channel, original_transcript,
                rejection_reason, correction_log, created_at, published_at
            ) VALUES (
                :id, :title_hi, :title_en, :description_hi, :description_en,
                :craft_category, :technique, :raw_cost, :labor_hours,
                :b2c_price, :b2b_price, :gem_price, :artisan_name,
                :beneficiary_id, :cluster_pin, :raw_image_url,
                :studio_image_url, :lifestyle_image_url, :watermarked_image_url, :annotated_image_url, :craft_pins, :status,
                NULL, :channel, :original_transcript,
                :rejection_reason, :correction_log, CURRENT_TIMESTAMP, NULL
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
                lifestyle_image_url = CASE WHEN excluded.lifestyle_image_url != '' THEN excluded.lifestyle_image_url ELSE products.lifestyle_image_url END,
                watermarked_image_url = excluded.watermarked_image_url,
                annotated_image_url = CASE WHEN excluded.annotated_image_url != '' THEN excluded.annotated_image_url ELSE products.annotated_image_url END,
                craft_pins = excluded.craft_pins,
                status = excluded.status,
                channel = excluded.channel,
                original_transcript = excluded.original_transcript,
                rejection_reason = excluded.rejection_reason,
                correction_log = excluded.correction_log,
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
            "lifestyle_image_url": product.get("lifestyle_image_url", ""),
            "watermarked_image_url": product.get("watermarked_image_url", ""),
            "annotated_image_url": product.get("annotated_image_url", ""),
            "craft_pins": craft_pins_json,
            "status": target_status,
            "channel": target_channel,
            "original_transcript": original_transcript,
            "rejection_reason": rejection_reason,
            "correction_log": correction_log,
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

        raw_craft_pins = product_data.get("craft_pins") if product_data else None
        craft_pins_json = json.dumps([p.dict() if hasattr(p, "dict") else p for p in raw_craft_pins]) if raw_craft_pins is not None else None

        if not exists and product_data:
            cursor.execute("""
                INSERT INTO products (
                    id, title_hi, title_en, description_hi, description_en,
                    craft_category, technique, raw_cost, labor_hours,
                    b2c_price, b2b_price, gem_price, artisan_name,
                    beneficiary_id, cluster_pin, raw_image_url,
                    studio_image_url, lifestyle_image_url, watermarked_image_url, annotated_image_url, craft_pins, status,
                    qr_code_url, beckn_payload, created_at, published_at
                ) VALUES (
                    :id, :title_hi, :title_en, :description_hi, :description_en,
                    :craft_category, :technique, :raw_cost, :labor_hours,
                    :b2c_price, :b2b_price, :gem_price, :artisan_name,
                    :beneficiary_id, :cluster_pin, :raw_image_url,
                    :studio_image_url, :lifestyle_image_url, :watermarked_image_url, :annotated_image_url, :craft_pins, 'published',
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
                "lifestyle_image_url": product_data.get("lifestyle_image_url", ""),
                "watermarked_image_url": product_data.get("watermarked_image_url", ""),
                "annotated_image_url": product_data.get("annotated_image_url", ""),
                "craft_pins": craft_pins_json or "[]",
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
                        lifestyle_image_url = COALESCE(:lifestyle_image_url, lifestyle_image_url),
                        watermarked_image_url = COALESCE(:watermarked_image_url, watermarked_image_url),
                        annotated_image_url = COALESCE(:annotated_image_url, annotated_image_url),
                        craft_pins = COALESCE(:craft_pins, craft_pins),
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
                    "lifestyle_image_url": product_data.get("lifestyle_image_url"),
                    "watermarked_image_url": product_data.get("watermarked_image_url"),
                    "annotated_image_url": product_data.get("annotated_image_url"),
                    "craft_pins": craft_pins_json,
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
        if res.get("craft_pins"):
            try:
                res["craft_pins"] = json.loads(res["craft_pins"]) if isinstance(res["craft_pins"], str) else res["craft_pins"]
            except Exception:
                res["craft_pins"] = []
        else:
            res["craft_pins"] = []
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
            if d.get("craft_pins"):
                try:
                    d["craft_pins"] = json.loads(d["craft_pins"]) if isinstance(d["craft_pins"], str) else d["craft_pins"]
                except Exception:
                    d["craft_pins"] = []
            else:
                d["craft_pins"] = []
            result.append(d)
        return result

def delete_product(product_id: str) -> bool:
    """Deletes a product by ID (e.g. discarding a draft)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        return cursor.rowcount > 0

def list_coordinator_drafts(filter_type: Optional[str] = "all") -> Dict[str, Any]:
    """
    Returns pending and non-published drafts for the Village Field Coordinator Review Panel.
    Includes rich counts for queue filtration (All, Camera, IVR, Missing Photo).
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM products
            WHERE status != 'published'
            ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
        
        all_drafts = []
        for r in rows:
            d = dict(r)
            if d.get("correction_log"):
                try:
                    d["correction_log"] = json.loads(d["correction_log"]) if isinstance(d["correction_log"], str) else d["correction_log"]
                except Exception:
                    d["correction_log"] = []
            else:
                d["correction_log"] = []

            # Infer channel if not set
            if not d.get("channel"):
                d["channel"] = "ivr" if "IVR" in str(d.get("id", "")) else "camera"

            # Parse beckn_payload if string
            if d.get("beckn_payload") and isinstance(d["beckn_payload"], str):
                try:
                    d["beckn_payload"] = json.loads(d["beckn_payload"])
                except Exception:
                    pass

            all_drafts.append(d)

        total_pending = len([d for d in all_drafts if d.get("status") in ("draft", "pending")])
        missing_photo = len([d for d in all_drafts if not d.get("studio_image_url") and not d.get("raw_image_url")])
        camera_drafts = len([d for d in all_drafts if d.get("channel") == "camera" and "IVR" not in str(d.get("id", ""))])
        ivr_drafts = len([d for d in all_drafts if d.get("channel") == "ivr" or "IVR" in str(d.get("id", ""))])

        filtered = all_drafts
        f_lower = (filter_type or "all").lower().strip()
        if f_lower == "camera":
            filtered = [d for d in all_drafts if d.get("channel") == "camera" and "IVR" not in str(d.get("id", ""))]
        elif f_lower == "ivr":
            filtered = [d for d in all_drafts if d.get("channel") == "ivr" or "IVR" in str(d.get("id", ""))]
        elif f_lower == "missing_photo":
            filtered = [d for d in all_drafts if not d.get("studio_image_url") and not d.get("raw_image_url")]

        return {
            "status": "success",
            "counts": {
                "total_pending": total_pending,
                "missing_photo": missing_photo,
                "camera_drafts": camera_drafts,
                "ivr_drafts": ivr_drafts,
                "all": len(all_drafts)
            },
            "drafts": filtered
        }

def update_coordinator_draft(draft_id: str, updates: Dict[str, Any], actor: str = "coordinator") -> Dict[str, Any]:
    """
    Updates draft fields from coordinator edit screen.
    Records structured audit diff in correction_log so we can track:
    'AI suggested X, coordinator changed to Y'.
    """
    product = get_product_by_id(draft_id)
    if not product:
        raise ValueError(f"Draft {draft_id} not found")

    corrections = []
    if product.get("correction_log"):
        try:
            corrections = json.loads(product["correction_log"]) if isinstance(product["correction_log"], str) else product["correction_log"]
        except Exception:
            corrections = []

    trackable_fields = [
        ("title_en", "Title (English)"),
        ("title_hi", "Title (Hindi)"),
        ("description_en", "Description (English)"),
        ("description_hi", "Description (Hindi)"),
        ("b2c_price", "Selling Price (INR)"),
        ("craft_category", "Craft Category"),
        ("technique", "Heritage Technique"),
    ]

    timestamp = datetime.utcnow().isoformat() + "Z"
    for fld, label in trackable_fields:
        if fld in updates and updates[fld] is not None:
            old_val = product.get(fld)
            new_val = updates[fld]
            if fld == "b2c_price":
                try:
                    old_num = float(old_val or 0)
                    new_num = float(new_val or 0)
                    if abs(old_num - new_num) > 0.01:
                        corrections.append({
                            "field": fld,
                            "label": label,
                            "original": old_num,
                            "corrected": new_num,
                            "timestamp": timestamp,
                            "actor": actor
                        })
                except Exception:
                    pass
            else:
                str_old = str(old_val or "").strip()
                str_new = str(new_val or "").strip()
                if str_old and str_new and str_old != str_new:
                    corrections.append({
                        "field": fld,
                        "label": label,
                        "original": str_old,
                        "corrected": str_new,
                        "timestamp": timestamp,
                        "actor": actor
                    })

    corr_json = json.dumps(corrections)
    new_status = updates.get("status") or product.get("status") or "draft"

    with get_db_connection() as conn:
        cursor = conn.cursor()
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
                status = :status,
                correction_log = :correction_log
            WHERE id = :id
        """, {
            "id": draft_id,
            "title_hi": updates.get("title_hi"),
            "title_en": updates.get("title_en"),
            "description_hi": updates.get("description_hi"),
            "description_en": updates.get("description_en"),
            "craft_category": updates.get("craft_category"),
            "technique": updates.get("technique"),
            "raw_cost": updates.get("raw_cost"),
            "labor_hours": updates.get("labor_hours"),
            "b2c_price": updates.get("b2c_price"),
            "b2b_price": updates.get("b2b_price"),
            "gem_price": updates.get("gem_price"),
            "artisan_name": updates.get("artisan_name"),
            "beneficiary_id": updates.get("beneficiary_id"),
            "cluster_pin": updates.get("cluster_pin"),
            "raw_image_url": updates.get("raw_image_url"),
            "studio_image_url": updates.get("studio_image_url"),
            "watermarked_image_url": updates.get("watermarked_image_url"),
            "status": new_status,
            "correction_log": corr_json
        })
        conn.commit()

    return get_product_by_id(draft_id)

def reject_coordinator_draft(draft_id: str, reason: str) -> Dict[str, Any]:
    """Rejects a draft with required coordinator justification."""
    if not reason or not reason.strip():
        raise ValueError("Rejection reason is required.")
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE products SET
                status = 'rejected',
                rejection_reason = ?
            WHERE id = ?
        """, (reason.strip(), draft_id))
        conn.commit()
    return get_product_by_id(draft_id)

def list_published_products() -> List[Dict[str, Any]]:
    """Returns verified live published listings for the storefront view."""
    return list_artisan_products(include_drafts=False, perform_cleanup=False)
