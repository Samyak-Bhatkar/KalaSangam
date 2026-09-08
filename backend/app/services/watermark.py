"""Steganographic Digital GI & Anti-Counterfeit Watermark Engine
Client: Ministry of Social Justice and Empowerment (MoSJE)
Section 5, Innovation 3: 2D Discrete Cosine Transform (DCT) frequency watermark
Embedding: [MoSJE-Beneficiary-ID | Cluster-PIN | GI-Tag-Serial]
Extract & Verify: Validates authenticity against predatory powerloom counterfeits
"""

import io
import time
import base64
import numpy as np
import cv2
from PIL import Image

MAGIC_HEADER = "GI64"  # 4-byte synchronization header

def string_to_bits(s: str) -> list[int]:
    """Converts string to list of binary bits (0 or 1)."""
    bits = []
    for char in s.encode('utf-8'):
        for i in range(7, -1, -1):
            bits.append((char >> i) & 1)
    return bits

def bits_to_string(bits: list[int]) -> str:
    """Converts list of binary bits to decoded UTF-8 string."""
    chars = []
    for i in range(0, len(bits) - 7, 8):
        byte_val = 0
        for bit in bits[i:i+8]:
            byte_val = (byte_val << 1) | bit
        chars.append(chr(byte_val))
    return "".join(chars)

def embed_dct_watermark(
    image_bytes: bytes,
    beneficiary_id: str = "MoSJE-849201",
    cluster_pin: str = "473446",
    gi_tag_serial: str = "GI-0078"
) -> tuple[bytes, str]:
    """
    Embeds steganographic 64-bit payload into middle-frequency DCT coefficients
    of 8x8 blocks in the Luminance (Y) channel.
    Payload: MAGIC_HEADER + beneficiary_id + "|" + cluster_pin + "|" + gi_tag_serial
    """
    # 1. Format payload
    payload_str = f"{MAGIC_HEADER}:{beneficiary_id}:{cluster_pin}:{gi_tag_serial}"
    payload_bits = string_to_bits(payload_str)
    num_bits = len(payload_bits)

    # 2. Decode image into OpenCV BGR and convert to YCrCb
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    h, w = img_bgr.shape[:2]

    img_ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    y_channel = np.float32(img_ycrcb[:, :, 0])

    # 8x8 block layout
    block_h = h // 8
    block_w = w // 8
    total_blocks = block_h * block_w

    # Mid-frequency embedding coordinates (robust to slight compression, invisible to human eye)
    u1, v1 = 3, 4
    u2, v2 = 4, 3
    strength = 28.0  # differential coefficient strength

    bit_idx = 0
    # Embed bits across the first 512 blocks (sufficient for multiple redundant repetitions)
    max_blocks = min(512, total_blocks)
    for i in range(max_blocks):
        by = i // block_w
        bx = i % block_w
        if bit_idx >= num_bits:
            bit_idx = 0

        target_bit = payload_bits[bit_idx]
        block = y_channel[by*8:(by+1)*8, bx*8:(bx+1)*8]
        dct_block = cv2.dct(block)

        # Embed using relative coefficient polarity
        if target_bit == 1:
            if dct_block[u1, v1] < dct_block[u2, v2] + strength:
                dct_block[u1, v1] = dct_block[u2, v2] + strength
        else:
            if dct_block[u2, v2] < dct_block[u1, v1] + strength:
                dct_block[u2, v2] = dct_block[u1, v1] + strength

        # Inverse DCT
        idct_block = cv2.idct(dct_block)
        y_channel[by*8:(by+1)*8, bx*8:(bx+1)*8] = idct_block
        bit_idx += 1

    # 3. Clip and recombine channels
    y_channel = np.clip(y_channel, 0, 255).astype(np.uint8)
    img_ycrcb[:, :, 0] = y_channel
    watermarked_bgr = cv2.cvtColor(img_ycrcb, cv2.COLOR_YCrCb2BGR)

    # Encode to PNG to preserve lossless frequency integrity
    _, encoded = cv2.imencode(".png", watermarked_bgr)
    return encoded.tobytes(), payload_str

def extract_dct_watermark(image_bytes: bytes) -> tuple[bool, dict]:
    """
    Extracts embedded DCT watermark from 8x8 blocks of the Y channel.
    Returns: (is_authentic, metadata_dict)
    """
    try:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            return False, {"error": "Invalid image data"}

        h, w = img_bgr.shape[:2]
        img_ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        y_channel = np.float32(img_ycrcb[:, :, 0])

        block_h = h // 8
        block_w = w // 8
        total_blocks = block_h * block_w

        u1, v1 = 3, 4
        u2, v2 = 4, 3

        extracted_bits = []
        max_blocks = min(512, total_blocks)
        for i in range(max_blocks):
            by = i // block_w
            bx = i % block_w
            block = y_channel[by*8:(by+1)*8, bx*8:(bx+1)*8]
            dct_block = cv2.dct(block)
            bit = 1 if dct_block[u1, v1] >= dct_block[u2, v2] else 0
            extracted_bits.append(bit)

        # Look for magic header GI64 in extracted stream
        magic_bits = string_to_bits(MAGIC_HEADER)
        found_idx = -1

        search_range = min(len(extracted_bits) - len(magic_bits), 512)
        for i in range(search_range):
            if extracted_bits[i:i+len(magic_bits)] == magic_bits:
                found_idx = i
                break

        if found_idx != -1:
            # Decode payload following header
            candidate_bits = extracted_bits[found_idx:found_idx + 400]
            decoded_str = bits_to_string(candidate_bits)
            parts = decoded_str.split(":")
            if len(parts) >= 4 and parts[0] == MAGIC_HEADER:
                beneficiary_id = parts[1].strip()
                cluster_pin = parts[2].strip()
                gi_tag_serial = parts[3].split("\x00")[0].strip()
                return True, {
                    "is_authentic": True,
                    "beneficiary_id": beneficiary_id,
                    "cluster_pin": cluster_pin,
                    "gi_tag_serial": gi_tag_serial,
                    "payload_raw": decoded_str[:60],
                    "status_message": f"Verified Authentic: Registered to MoSJE Beneficiary {beneficiary_id}, Cluster {cluster_pin}."
                }

        # If strict bit matching didn't catch header, check fallback
        return False, {
            "is_authentic": False,
            "status_message": "Watermark Absent or Corrupted: Design appears unverified or machine-replicated copy."
        }

    except Exception as e:
        return False, {
            "is_authentic": False,
            "error": str(e),
            "status_message": "Verification error during frequency analysis."
        }
