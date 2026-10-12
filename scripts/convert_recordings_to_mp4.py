"""
Convert ShilpSetu scene recordings (.webp) into universally shareable H.264 .mp4 video files,
and generate a stitched Master Demo Video.
"""

import os
import glob
import cv2
import numpy as np
from PIL import Image, ImageSequence

SCENES = [
    {
        "id": 1,
        "src": "recordings/scene_one_walkthrough_1790947850133.webp",
        "dest": "recordings/Scene_1_The_Problem_and_Vision.mp4",
        "title": "Scene 1: The Problem & Vision (0:00 - 0:35)",
    },
    {
        "id": 2,
        "src": "recordings/scene_two_walkthrough_1790948286116.webp",
        "dest": "recordings/Scene_2_Cultural_Genome_Map.mp4",
        "title": "Scene 2: Cultural Genome Map (0:35 - 1:15)",
    },
    {
        "id": 3,
        "src": "recordings/scene_three_walkthrough_1790948617495.webp",
        "dest": "recordings/Scene_3_Naad_Virasat_Audio_DSP.mp4",
        "title": "Scene 3: Naad-Virasat Audio DSP (1:15 - 1:55)",
    },
    {
        "id": 4,
        "src": "recordings/scene_four_walkthrough_1790950051226.webp",
        "dest": "recordings/Scene_4_Motif_Decoder_and_Student_Lens.mp4",
        "title": "Scene 4: Cultural Motif Decoder & Student Lens (1:55 - 2:30)",
    },
    {
        "id": 5,
        "src": "recordings/scene_five_walkthrough_1790952173028.webp",
        "dest": "recordings/Scene_5_Artisan_Economic_Engine.mp4",
        "title": "Scene 5: Artisan Economic Engine (2:30 - 3:05)",
    },
    {
        "id": 6,
        "src": "recordings/scene_six_walkthrough_1790952693111.webp",
        "dest": "recordings/Scene_6_Digital_GI_Passport_and_Conclusion.mp4",
        "title": "Scene 6: Sovereign Passport & Conclusion (3:05 - 3:30)",
    },
]

MASTER_DEST = "recordings/ShilpSetu_Full_Demo_All_Scenes.mp4"
MASTER_W, MASTER_H = 1920, 1080
FPS = 10.0

def pad_or_fit(frame_bgr, target_w=MASTER_W, target_h=MASTER_H):
    """Letterbox/pillarbox frame into target resolution maintaining aspect ratio."""
    h, w = frame_bgr.shape[:2]
    scale = min(target_w / w, target_h / h)
    new_w, new_h = int(w * scale), int(h * scale)
    # Ensure even
    new_w = new_w if new_w % 2 == 0 else new_w - 1
    new_h = new_h if new_h % 2 == 0 else new_h - 1
    
    resized = cv2.resize(frame_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((target_h, target_w, 3), dtype=np.uint8)
    
    x_offset = (target_w - new_w) // 2
    y_offset = (target_h - new_h) // 2
    canvas[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = resized
    return canvas

def convert_single_scene(scene_info, master_writer=None):
    src = scene_info["src"]
    dest = scene_info["dest"]
    print(f"--- Converting {scene_info['title']} ---")
    
    im = Image.open(src)
    orig_w, orig_h = im.size
    # Ensure native even dimensions for individual scene MP4
    pad_w = orig_w if orig_w % 2 == 0 else orig_w + 1
    pad_h = orig_h if orig_h % 2 == 0 else orig_h + 1
    
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    writer = cv2.VideoWriter(dest, fourcc, FPS, (pad_w, pad_h))
    if not writer.isOpened():
        # Fallback to mp4v if avc1 fails
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(dest, fourcc, FPS, (pad_w, pad_h))
    
    total_frames = getattr(im, 'n_frames', 1)
    for idx in range(total_frames):
        im.seek(idx)
        rgb = im.convert('RGB')
        arr = np.array(rgb)
        
        # Native pad for single scene
        if pad_w != orig_w or pad_h != orig_h:
            arr = cv2.copyMakeBorder(arr, 0, pad_h - orig_h, 0, pad_w - orig_w, cv2.BORDER_CONSTANT, value=[0, 0, 0])
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        writer.write(bgr)
        
        # Write to master if provided
        if master_writer is not None:
            master_frame = pad_or_fit(bgr, MASTER_W, MASTER_H)
            master_writer.write(master_frame)
            
        if (idx + 1) % 50 == 0 or idx == total_frames - 1:
            print(f"  Frame {idx + 1}/{total_frames} processed")
            
    writer.release()
    file_size_mb = os.path.getsize(dest) / (1024 * 1024)
    print(f"  Saved {dest} ({file_size_mb:.2f} MB, {total_frames} frames, {total_frames/FPS:.1f}s)")

def main():
    print("Starting ShilpSetu WebP -> MP4 Conversion...")
    
    # Initialize master writer for stitched presentation
    fourcc_master = cv2.VideoWriter_fourcc(*'avc1')
    master_writer = cv2.VideoWriter(MASTER_DEST, fourcc_master, FPS, (MASTER_W, MASTER_H))
    if not master_writer.isOpened():
        fourcc_master = cv2.VideoWriter_fourcc(*'mp4v')
        master_writer = cv2.VideoWriter(MASTER_DEST, fourcc_master, FPS, (MASTER_W, MASTER_H))
        
    for scene in SCENES:
        convert_single_scene(scene, master_writer)
        
    master_writer.release()
    master_size_mb = os.path.getsize(MASTER_DEST) / (1024 * 1024)
    print(f"\n==========================================")
    print(f"ALL SCENES CONVERTED SUCCESSFULLY!")
    print(f"Master Video: {MASTER_DEST} ({master_size_mb:.2f} MB, 1080p)")
    print(f"==========================================")

if __name__ == "__main__":
    main()
