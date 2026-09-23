import sys
import logging

logger = logging.getLogger("ShilpSetu.Gemini")

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
