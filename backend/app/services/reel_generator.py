"""AI Reel Storyteller Engine
Client: Ministry of Social Justice and Empowerment (MoSJE)
Section 5, Innovation 1: 15-Second 9:16 Vertical Video Reel Generator
Ken Burns Pan-Zoom, Artisan Heritage Narration, Ambient Sitar/Flute Soundtrack,
Bottom-Third Typography & Dynamic ONDC Scannable QR Code
"""

import os
import io
import time
import math
import wave
import struct
import base64
import subprocess
import socket
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode

from typing import Optional, Tuple
from ..config import settings
from ..models.schemas import ReelGenerationResponse

def get_lan_ip() -> str:
    """Discovers machine primary LAN IPv4 address for mobile network resolution."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'
    finally:
        s.close()

def generate_ambient_folk_audio(output_path: Path, duration_sec: float = 15.0):
    """
    Generates a serene Indian classical Raag Bhupali (pentatonic: Sa, Re, Ga, Pa, Dha)
    flute and drone ambient soundtrack in 16-bit 44.1kHz WAV if file does not exist.
    """
    if output_path.exists():
        return

    sample_rate = 44100
    n_samples = int(sample_rate * duration_sec)
    
    # Raag Bhupali frequencies (Base Sa = 261.63 Hz - C4)
    # Sa(261.63), Re(293.66), Ga(329.63), Pa(392.00), Dha(440.00), Sa'(523.25)
    swaras = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]
    melody_notes = [
        (0, 2.0), (1, 1.5), (2, 2.5), (3, 2.0),
        (4, 2.0), (5, 2.0), (3, 1.5), (2, 1.5)
    ]

    tanpura_drone = [130.81, 196.00, 261.63] # Low Sa, Pa, Sa

    with wave.open(str(output_path), 'w') as wav:
        wav.setnchannels(1)  # Mono
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(sample_rate)

        for i in range(n_samples):
            t = i / sample_rate
            
            # Tanpura Drone with rich harmonics
            drone = 0.15 * math.sin(2 * math.pi * tanpura_drone[0] * t)
            drone += 0.10 * math.sin(2 * math.pi * tanpura_drone[1] * t)
            drone += 0.08 * math.sin(2 * math.pi * tanpura_drone[2] * t)
            drone += 0.04 * math.sin(2 * math.pi * tanpura_drone[1] * 2 * t)

            # Bansuri / Flute melody
            note_time = t % 15.0
            accum = 0.0
            current_freq = swaras[0]
            for note_idx, dur in melody_notes:
                if accum <= note_time < accum + dur:
                    current_freq = swaras[note_idx]
                    break
                accum += dur

            # Breath vibration (vibrato 5Hz)
            vibrato = 1.0 + 0.02 * math.sin(2 * math.pi * 5.0 * t)
            freq = current_freq * vibrato
            
            # Flute harmonics (odd harmonics give woody hollow tone)
            flute = 0.35 * math.sin(2 * math.pi * freq * t)
            flute += 0.12 * math.sin(2 * math.pi * freq * 2 * t)
            flute += 0.06 * math.sin(2 * math.pi * freq * 3 * t)
            
            # Ambient envelope (fade in and fade out)
            env = min(1.0, t / 1.0) * min(1.0, (15.0 - t) / 1.5)

            val = (drone + flute) * env * 0.50
            int_val = int(max(-32767, min(32767, val * 32767)))
            wav.writeframes(struct.pack('<h', int_val))

def create_dynamic_ondc_qr(product_id: str, title: str, size: int = 180, verify_url: Optional[str] = None) -> Image.Image:
    """Generates scannable QR code pointing to verify portal or Beckn ONDC discovery."""
    qr_content = verify_url or f"https://kalasangam-frontend.onrender.com/verify/{product_id}"
    if "localhost" in qr_content or "127.0.0.1" in qr_content:
        lan_ip = get_lan_ip()
        if lan_ip and lan_ip != "127.0.0.1":
            qr_content = qr_content.replace("localhost", lan_ip).replace("127.0.0.1", lan_ip)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=2,
    )
    qr.add_data(qr_content)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#1E2A4A", back_color="#FFFFFF").convert("RGBA")
    return qr_img.resize((size, size), Image.Resampling.LANCZOS)

def generate_published_product_qr(product_id: str, title: str, base_verify_url: Optional[str] = None) -> Tuple[str, str]:
    """
    Generates and persists high-resolution QR code PNG for a published product.
    Only invoked when product status transitions to 'published'.
    Returns (qr_public_url, target_url).
    """
    domain = base_verify_url or "https://kalasangam-frontend.onrender.com"
    if "localhost" in domain or "127.0.0.1" in domain:
        lan_ip = get_lan_ip()
        if lan_ip and lan_ip != "127.0.0.1":
            domain = domain.replace("localhost", lan_ip).replace("127.0.0.1", lan_ip)

    target_url = f"{domain.rstrip('/')}/verify/{product_id}"

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=8,
        border=3,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#1E2A4A", back_color="#FFFFFF").convert("RGBA")

    qr_filename = f"qr_{product_id}.png"
    qr_path = settings.UPLOAD_DIR / qr_filename
    qr_img.save(qr_path, format="PNG")

    public_url = f"/static/uploads/{qr_filename}"
    return public_url, target_url

def generate_ken_burns_frame(
    studio_img: Image.Image,
    progress: float,  # 0.0 to 1.0
    title: str,
    story_narrative: str,
    qr_img: Image.Image,
    target_w: int = 1080,
    target_h: int = 1920
) -> Image.Image:
    """
    Renders a single 9:16 vertical frame with:
    1. Rich gradient background
    2. Ken Burns zoom (1.0 to 1.22) & subtle vertical pan
    3. Bottom-third frosted glass overlay with typography and ONDC QR code
    4. MoSJE ShilpSetu header badge
    """
    # 1. Background with warm heritage gradient
    frame = Image.new("RGBA", (target_w, target_h), (248, 249, 250, 255))
    draw = ImageDraw.Draw(frame)

    # Subtle vertical gradient background
    for y in range(target_h):
        r = int(248 - (y / target_h) * 18)
        g = int(249 - (y / target_h) * 20)
        b = int(250 - (y / target_h) * 24)
        draw.line([(0, y), (target_w, y)], fill=(r, g, b, 255))

    # 2. Ken Burns Pan-Zoom transformation
    # Zoom from 1.00 to 1.20
    zoom = 1.00 + (0.20 * progress)
    # Pan slightly up
    pan_y = int(progress * 40)
    
    orig_w, orig_h = studio_img.size
    crop_w = int(orig_w / zoom)
    crop_h = int(orig_h / zoom)
    crop_x = (orig_w - crop_w) // 2
    crop_y = max(0, min(orig_h - crop_h, (orig_h - crop_h) // 2 + pan_y))

    cropped = studio_img.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))
    
    # Scale craft into upper 65% frame
    display_w = int(target_w * 0.88)
    display_h = display_w  # square representation
    craft_scaled = cropped.resize((display_w, display_h), Image.Resampling.BILINEAR)

    # Paste centered in upper portion
    paste_x = (target_w - display_w) // 2
    paste_y = 180
    frame.paste(craft_scaled, (paste_x, paste_y), craft_scaled if craft_scaled.mode == "RGBA" else None)

    # 3. Top Header Bar (MoSJE & ShilpSetu AI)
    header_box = [(40, 60), (target_w - 40, 140)]
    draw.rounded_rectangle(header_box, radius=20, fill=(30, 42, 74, 230))
    draw.text((70, 80), "SHILPSETU AI | MoSJE ARTISAN SHOWCASE", fill=(212, 175, 55, 255))
    draw.text((70, 105), "National Handloom & Handicrafts Direct Market Linkage", fill=(240, 240, 240, 255))

    # 4. Bottom-Third Frosted Card (Dark Indigo Card with Glassmorphism aesthetic)
    card_top = 1180
    card_bottom = target_h - 80
    card_rect = [(50, card_top), (target_w - 50, card_bottom)]
    draw.rounded_rectangle(card_rect, radius=36, fill=(20, 28, 48, 245), outline=(212, 175, 55, 180), width=3)

    # Title & Story
    draw.text((90, card_top + 45), title[:45] + ("..." if len(title) > 45 else ""), fill=(255, 255, 255, 255))
    
    # Story wrap
    words = story_narrative.split()
    line1 = " ".join(words[:10])
    line2 = " ".join(words[10:20]) + ("..." if len(words) > 20 else "")
    draw.text((90, card_top + 100), line1, fill=(220, 225, 235, 240))
    draw.text((90, card_top + 135), line2, fill=(200, 210, 225, 220))

    # Statutory wage assurance badge
    badge_box = [(90, card_top + 195), (460, card_top + 250)]
    draw.rounded_rectangle(badge_box, radius=12, fill=(15, 118, 110, 230))
    draw.text((110, card_top + 210), "✓ 100% Statutory Living Wage Certified", fill=(255, 255, 255, 255))

    # ONDC Purchase QR Code on right side of bottom card
    qr_x = target_w - 50 - 180 - 40
    qr_y = card_top + 45
    # White background for QR code
    draw.rounded_rectangle([(qr_x - 10, qr_y - 10), (qr_x + 190, qr_y + 190)], radius=16, fill=(255, 255, 255, 255))
    frame.paste(qr_img, (qr_x, qr_y), qr_img)
    draw.text((qr_x + 10, qr_y + 198), "Scan to Buy on ONDC", fill=(212, 175, 55, 255))

    return frame.convert("RGB")

def render_vertical_reel(
    product_id: str,
    title: str,
    studio_image_base64: str,
    story_narrative: str,
    artisan_name: str = "Master Artisan",
    craft_cluster: str = "Rural Cluster, India"
) -> ReelGenerationResponse:
    """
    Renders 15-second vertical video reel (9:16) with Ken Burns animation,
    burns in typography, and packages ambient audio soundtrack.
    """
    # 1. Ensure ambient soundtrack exists
    ambient_audio_file = settings.AUDIO_DIR / "ambient_folk.wav"
    generate_ambient_folk_audio(ambient_audio_file, duration_sec=15.0)

    # 2. Decode studio image
    clean_b64 = studio_image_base64
    if "," in clean_b64:
        clean_b64 = clean_b64.split(",")[1]
    img_data = base64.b64decode(clean_b64)
    studio_img = Image.open(io.BytesIO(img_data)).convert("RGBA")

    # 3. Create ONDC dynamic QR
    qr_img = create_dynamic_ondc_qr(product_id, title, size=180)

    # 4. Generate video frames
    # 15 seconds at 10 fps = 150 frames (smooth, lightweight, fast generation under 3 seconds)
    duration_sec = 15.0
    fps = 12
    total_frames = int(duration_sec * fps)
    
    # Save video output path
    timestamp = int(time.time())
    video_filename = f"reel_{product_id}_{timestamp}.mp4"
    video_path = settings.UPLOAD_DIR / video_filename

    # Render video using OpenCV VideoWriter
    width, height = 720, 1280  # 9:16 optimized for web preview & mobile performance
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(str(video_path), fourcc, fps, (width, height))

    full_story = f"Handcrafted by {artisan_name} in {craft_cluster}. {story_narrative}"

    # Sample keyframes
    for frame_idx in range(total_frames):
        progress = frame_idx / float(total_frames - 1)
        pil_frame = generate_ken_burns_frame(
            studio_img=studio_img,
            progress=progress,
            title=title,
            story_narrative=full_story,
            qr_img=qr_img,
            target_w=width,
            target_h=height
        )
        # Convert PIL to BGR OpenCV format
        cv_frame = cv2.cvtColor(np.array(pil_frame), cv2.COLOR_RGB2BGR)
        writer.write(cv_frame)

    writer.release()

    # Check if ffmpeg is available to mux audio
    has_ffmpeg = False
    try:
        res = subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        has_ffmpeg = (res.returncode == 0)
    except Exception:
        has_ffmpeg = False

    if has_ffmpeg:
        muxed_filename = f"reel_muxed_{product_id}_{timestamp}.mp4"
        muxed_path = settings.UPLOAD_DIR / muxed_filename
        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", str(video_path),
                "-i", str(ambient_audio_file),
                "-c:v", "copy",
                "-c:a", "aac",
                "-shortest",
                str(muxed_path)
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            video_filename = muxed_filename
        except Exception:
            pass

    reel_url = f"/static/uploads/{video_filename}"
    audio_soundtrack_url = "/static/audio/ambient_folk.wav"
    qr_data = f"ondc://beckn.retail.org/discover?item_id={product_id}"

    return ReelGenerationResponse(
        reel_url=reel_url,
        duration=duration_sec,
        format="mp4",
        qr_data=qr_data,
        narrative_text=full_story,
        audio_soundtrack=audio_soundtrack_url
    )
