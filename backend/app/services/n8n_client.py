"""n8n Automation Client
Client: Ministry of Social Justice and Empowerment (MoSJE)
Orchestrates event-driven webhook dispatching from FastAPI to n8n workflows:
- WhatsApp Bargain Guard Interactive Alerts
- ONDC & GeM Multi-Channel Broadcast
- Asynchronous Video Reel Distribution
- MoSJE Ministry Beneficiary Analytics

Guarantees non-blocking, zero-fail execution: if n8n is offline, requests log gracefully without crashing the main application.
"""

import logging
import requests
from typing import Dict, Any, Optional
from ..config import settings

logger = logging.getLogger("ShilpSetu.n8nClient")

def dispatch_n8n_webhook(
    webhook_url: str,
    payload: Dict[str, Any],
    event_type: str = "GENERIC_EVENT",
    timeout_sec: float = 3.0
) -> bool:
    """
    Sends JSON payload to the designated n8n webhook URL.
    Returns True if successfully received (HTTP 2xx), False otherwise.
    """
    if not settings.N8N_ENABLED or not webhook_url:
        logger.debug(f"n8n integration disabled or empty URL for {event_type}")
        return False

    try:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": f"ShilpSetu-MoSJE-Backend/{settings.APP_VERSION}",
            "X-Event-Type": event_type
        }
        res = requests.post(webhook_url, json=payload, headers=headers, timeout=timeout_sec)
        if res.status_code in (200, 201, 202, 204):
            logger.info(f"n8n webhook [{event_type}] triggered successfully (Status: {res.status_code})")
            return True
        else:
            logger.warning(f"n8n webhook [{event_type}] returned status {res.status_code}")
            return False
    except requests.exceptions.RequestException as ex:
        # Non-blocking graceful catch with visible diagnostic notice
        from .gemini_logger import log_fallback_event
        log_fallback_event(
            service_name="n8n Workflow Automation",
            component=f"Webhook [{event_type}]",
            reason=ex,
            fallback_action="Local internal processing active (UI continues without interruption)",
            context=f"Target: {webhook_url}"
        )
        return False

# ==============================================================================
# SPECIALIZED DISPATCHERS FOR CORE WORKFLOWS
# ==============================================================================

def trigger_bargain_guard_workflow(negotiation_data: Dict[str, Any]) -> bool:
    """
    Triggers Workflow 1: WhatsApp Voice Note & Interactive Buttons for rural artisans.
    """
    payload = {
        "event": "BARGAIN_GUARD_OFFER_EVALUATED",
        "ministry": settings.CLIENT_MINISTRY,
        "product_id": negotiation_data.get("product_id"),
        "buyer_offer_inr": negotiation_data.get("buyer_offer_inr"),
        "quantity": negotiation_data.get("quantity"),
        "base_cost_inr": negotiation_data.get("base_cost_inr"),
        "verdict": negotiation_data.get("verdict"),
        "counter_offer_inr": negotiation_data.get("counter_offer_inr"),
        "artisan_audio_explanation_hi": negotiation_data.get("artisan_audio_explanation_hi"),
        "counter_message_en": negotiation_data.get("counter_message_en"),
        "margin_recovered_inr": negotiation_data.get("margin_recovered_inr"),
        "total_fair_value_inr": negotiation_data.get("total_fair_value_inr")
    }
    return dispatch_n8n_webhook(
        webhook_url=settings.N8N_WEBHOOK_BARGAIN_GUARD,
        payload=payload,
        event_type="BARGAIN_GUARD"
    )

def trigger_ondc_publish_workflow(beckn_payload: Dict[str, Any]) -> bool:
    """
    Triggers Workflow 2: Multi-channel broadcast to ONDC registry, GeM, and social media.
    """
    payload = {
        "event": "CATALOG_PUBLISHED_BECKN_V12",
        "ministry": settings.CLIENT_MINISTRY,
        "beckn_schema": beckn_payload
    }
    return dispatch_n8n_webhook(
        webhook_url=settings.N8N_WEBHOOK_ONDC_PUBLISH,
        payload=payload,
        event_type="ONDC_GEM_SYNC"
    )

def trigger_reel_dispatch_workflow(reel_data: Dict[str, Any]) -> bool:
    """
    Triggers Workflow 3: Asynchronous Reel distribution and WhatsApp media sharing.
    """
    payload = {
        "event": "REEL_GENERATED",
        "ministry": settings.CLIENT_MINISTRY,
        "product_id": reel_data.get("product_id"),
        "video_url": reel_data.get("video_url"),
        "audio_url": reel_data.get("audio_url"),
        "title": reel_data.get("title"),
        "artisan_name": reel_data.get("artisan_name"),
        "cluster_pin": reel_data.get("craft_cluster")
    }
    return dispatch_n8n_webhook(
        webhook_url=settings.N8N_WEBHOOK_REEL_DISPATCH,
        payload=payload,
        event_type="REEL_DISPATCH"
    )

def trigger_ministry_analytics_workflow(event_name: str, details: Dict[str, Any]) -> bool:
    """
    Triggers Workflow 4: Streams live artisan, wage, and craft statistics to MoSJE dashboards.
    """
    payload = {
        "event": event_name,
        "ministry": settings.CLIENT_MINISTRY,
        "beneficiary_collective": "NBCFDC & NSFDC",
        "details": details
    }
    return dispatch_n8n_webhook(
        webhook_url=settings.N8N_WEBHOOK_MINISTRY_ANALYTICS,
        payload=payload,
        event_type="MINISTRY_ANALYTICS"
    )
