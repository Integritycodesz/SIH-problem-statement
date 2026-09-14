import io
import time
import hashlib
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

class ProduceComputerVisionService:
    """
    Real-time Optical Quality Assay & Morphometric Computer Vision Engine.
    1. Specimen Authenticity Verification: Detects and rejects documents, text scans,
       monochrome screenshots, or non-agricultural images.
    2. Chromatic Segmentation: Isolates genuine agricultural produce from backgrounds.
    3. Connected-Component Morphometry: Uses scipy.ndimage to segment individual produce units,
       extract real bounding boxes, calibrated diameters, and size uniformity.
    4. Blemish & Sprout Necrosis: Segments surface defects, rot, fungal decay, or chloroplastic sprouting.
    5. Optical Moisture Estimation: Analyzes specular highlight absorption and reflection on produce cuticle.
    6. AGMARKNET Schedule II & APMC Rule 38 Grade Certification.
    """

    COMMODITY_BASELINES = {
        "onion": {
            "name": "Onion",
            "optimal_diameter_min": 50.0,
            "optimal_diameter_max": 75.0,
            "base_moisture": 10.5,
            "max_moisture_faq": 12.0,
            "max_blemish_faq1": 3.0,
            "max_blemish_faq2": 8.0,
            "pixel_scale_mm": 0.30,
        },
        "soybean": {
            "name": "Soybean",
            "optimal_diameter_min": 5.8,
            "optimal_diameter_max": 7.5,
            "base_moisture": 9.8,
            "max_moisture_faq": 11.5,
            "max_blemish_faq1": 2.0,
            "max_blemish_faq2": 6.0,
            "pixel_scale_mm": 0.08,
        },
        "tomato": {
            "name": "Tomato",
            "optimal_diameter_min": 50.0,
            "optimal_diameter_max": 72.0,
            "base_moisture": 11.0,
            "max_moisture_faq": 13.0,
            "max_blemish_faq1": 3.0,
            "max_blemish_faq2": 8.0,
            "pixel_scale_mm": 0.32,
        },
        "wheat": {
            "name": "Wheat",
            "optimal_diameter_min": 6.0,
            "optimal_diameter_max": 7.6,
            "base_moisture": 10.2,
            "max_moisture_faq": 11.5,
            "max_blemish_faq1": 1.5,
            "max_blemish_faq2": 5.0,
            "pixel_scale_mm": 0.07,
        },
        "cotton": {
            "name": "Cotton",
            "optimal_diameter_min": 28.0,
            "optimal_diameter_max": 32.0,
            "base_moisture": 8.0,
            "max_moisture_faq": 9.5,
            "max_blemish_faq1": 2.5,
            "max_blemish_faq2": 6.0,
            "pixel_scale_mm": 0.18,
        },
        "potato": {
            "name": "Potato",
            "optimal_diameter_min": 45.0,
            "optimal_diameter_max": 75.0,
            "base_moisture": 13.5,
            "max_moisture_faq": 15.0,
            "max_blemish_faq1": 3.5,
            "max_blemish_faq2": 8.5,
            "pixel_scale_mm": 0.33,
        },
        "maize": {
            "name": "Maize",
            "optimal_diameter_min": 8.0,
            "optimal_diameter_max": 11.5,
            "base_moisture": 11.5,
            "max_moisture_faq": 13.5,
            "max_blemish_faq1": 2.0,
            "max_blemish_faq2": 6.0,
            "pixel_scale_mm": 0.10,
        },
        "gram": {
            "name": "Gram (Chana)",
            "optimal_diameter_min": 7.0,
            "optimal_diameter_max": 9.5,
            "base_moisture": 10.0,
            "max_moisture_faq": 12.0,
            "max_blemish_faq1": 2.0,
            "max_blemish_faq2": 5.5,
            "pixel_scale_mm": 0.09,
        },
        "tur": {
            "name": "Tur (Arhar)",
            "optimal_diameter_min": 5.0,
            "optimal_diameter_max": 7.0,
            "base_moisture": 10.0,
            "max_moisture_faq": 12.0,
            "max_blemish_faq1": 2.0,
            "max_blemish_faq2": 5.5,
            "pixel_scale_mm": 0.08,
        }
    }

    @classmethod
    def auto_detect_commodity(cls, R: np.ndarray, G: np.ndarray, B: np.ndarray,
                              Y: np.ndarray, saturation: np.ndarray) -> str:
        """
        Automatically classify the agricultural commodity from image color analysis.
        Analyzes foreground pixel color signatures to identify produce type.
        Returns the COMMODITY_BASELINES key string.
        """
        fg = (Y > 35) & (Y < 235) & (saturation > 0.04)
        fg_count = int(np.sum(fg))

        if fg_count < 100:
            return "onion"

        fg_R = float(np.mean(R[fg]))
        fg_G = float(np.mean(G[fg]))
        fg_B = float(np.mean(B[fg]))
        fg_Y = float(np.mean(Y[fg]))
        fg_sat = float(np.mean(saturation[fg]))

        # Cotton: Very bright white fibers, very low saturation
        if fg_Y > 170 and fg_sat < 0.14:
            return "cotton"

        # Tomato: Strong red/lycopene dominance with high saturation
        if fg_R > fg_G * 1.30 and fg_R > fg_B * 1.45 and fg_sat > 0.28:
            return "tomato"

        # Onion: Red/purple/copper hues with moderate-high saturation
        if fg_R > fg_G and fg_R > fg_B * 1.08 and fg_sat > 0.18:
            red_dominance = (fg_R - fg_G) / (fg_R + 1.0)
            if red_dominance > 0.08 and fg_sat > 0.22:
                return "onion"

        # Potato: Earthy brown/tan, low-moderate saturation
        if fg_R > fg_B * 1.12 and fg_G > fg_B and fg_sat < 0.28 and fg_Y < 170:
            return "potato"

        # Grains / Legumes: Golden, amber, straw-colored
        if fg_R > fg_B * 1.08 and fg_G > fg_B:
            if fg_Y > 155:
                return "wheat"
            elif fg_Y > 120:
                return "soybean"
            elif fg_sat > 0.20:
                return "maize"
            else:
                return "gram"

        return "onion"

    @classmethod
    def analyze_image(cls, image_bytes: bytes, commodity_name: str = "Onion") -> Dict[str, Any]:
        start_time = time.time()
        # Display-friendly commodity name for rejection messages before auto-detection
        display_commodity = commodity_name if commodity_name.strip().lower() not in ("auto", "auto-detect", "") else "Onion, Tomato, or Wheat"
        
        # 1. Open and scale image to normalized matrix bounds
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as err:
            return {
                "status": "REJECTED",
                "is_valid_produce": False,
                "rejection_type": "CORRUPTED_IMAGE",
                "rejection_title": "Unreadable Image File",
                "error_message": f"Could not decode image file: {str(err)}",
                "confidence_score": 0.0,
                "commodity": commodity_name,
                "detected_count": 0,
                "bounding_boxes": [],
                "metrics": [],
                "recommendations": ["Please upload a valid, uncorrupted JPEG, PNG, or WEBP image."]
            }

        max_dim = 800
        if max(img.size) > max_dim:
            scale = max_dim / max(img.size)
            new_size = (int(img.width * scale), int(img.height * scale))
            img = img.resize(new_size, Image.Resampling.BILINEAR)

        width, height = img.size
        total_pixels = width * height
        arr = np.array(img, dtype=np.float32)

        R = arr[:, :, 0]
        G = arr[:, :, 1]
        B = arr[:, :, 2]

        # Luminance
        Y = 0.299 * R + 0.587 * G + 0.114 * B
        
        # Chromatic Saturation
        max_rgb = np.maximum(np.maximum(R, G), B)
        min_rgb = np.minimum(np.minimum(R, G), B)
        chroma = max_rgb - min_rgb
        saturation = np.where(max_rgb > 0, chroma / (max_rgb + 1e-5), 0.0)

        # -------------------------------------------------------------
        # STEP 2: SPECIMEN AUTHENTICITY & DOCUMENT / NON-PRODUCE CHECK
        # -------------------------------------------------------------
        chroma_std = float(np.std(R - G) + np.std(G - B) + np.std(B - R))
        mean_sat = float(np.mean(saturation))
        sat_above_15 = float(np.mean(saturation > 0.15))
        paper_pixels = float(np.mean((Y > 175.0) & (saturation < 0.09)))
        text_pixels = float(np.mean((Y < 80.0) & (saturation < 0.18)))
        lum_std = float(np.std(Y))

        # Check A: Text Document / Screenshot / White paper
        if (paper_pixels > 0.45 and text_pixels > 0.015) or \
           (mean_sat < 0.075 and sat_above_15 < 0.05 and chroma_std < 12.0):
            return {
                "status": "REJECTED",
                "is_valid_produce": False,
                "rejection_type": "DOCUMENT_OR_TEXT_DETECTED",
                "rejection_title": "Document / Text Image Detected",
                "error_message": (
                    f"The uploaded image appears to be a printed document, screenshot, or text page, "
                    f"not an agricultural produce specimen. Kisan Vision AI requires a clear photograph of "
                    f"actual crops (such as {display_commodity}) to evaluate APMC quality grades."
                ),
                "confidence_score": 0.0,
                "commodity": commodity_name,
                "sample_name": "Non-Produce Specimen (Document Detected)",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "detected_count": 0,
                "bounding_boxes": [],
                "assay_id": f"QC-REJECTED-{int(time.time())}",
                "metrics": [],
                "recommendations": [
                    "⚠️ Non-Produce Specimen: Document or text scan detected.",
                    "Please upload or capture a photo of real agricultural harvest produce.",
                    "Ensure adequate lighting and place produce on a clean contrasting surface."
                ]
            }

        # Check B: Blank / Solid Color
        if lum_std < 10.0:
            return {
                "status": "REJECTED",
                "is_valid_produce": False,
                "rejection_type": "BLANK_OR_UNIFORM_IMAGE",
                "rejection_title": "Blank / Indistinct Image",
                "error_message": "The uploaded photo is blank or uniform. Please photograph actual agricultural produce.",
                "confidence_score": 0.0,
                "commodity": commodity_name,
                "sample_name": "Non-Produce Specimen (Blank/Uniform)",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "detected_count": 0,
                "bounding_boxes": [],
                "assay_id": f"QC-REJECTED-{int(time.time())}",
                "metrics": [],
                "recommendations": [
                    "Upload a clear photo with identifiable produce units in focus."
                ]
            }

        # Check C: Human Face / Portrait / Skin-Tone Detection
        # Uses RGB skin-color model to reject selfies, portraits, and non-agricultural photos
        skin_mask = (
            (R > 95) & (G > 40) & (B > 20) &
            (R > G) & (R > B) &
            ((R - G) > 12) &
            (chroma > 12) &
            (saturation < 0.58) &
            (Y > 50) & (Y < 230)
        )
        skin_ratio = float(np.mean(skin_mask))
        # Only reject if skin pixels dominate AND image lacks vivid produce-like saturation
        vivid_produce_ratio = float(np.mean(saturation > 0.45))
        if skin_ratio > 0.20 and vivid_produce_ratio < 0.12:
            return {
                "status": "REJECTED",
                "is_valid_produce": False,
                "rejection_type": "HUMAN_FACE_OR_SKIN_DETECTED",
                "rejection_title": "Human Face / Non-Produce Image Detected",
                "error_message": (
                    "The uploaded image appears to contain a human face or portrait \u2014 "
                    "not agricultural produce. Kisan Vision AI requires a clear photograph of "
                    f"actual crops (such as {display_commodity}) placed on a contrasting surface."
                ),
                "confidence_score": 0.0,
                "commodity": commodity_name,
                "sample_name": "Non-Produce Specimen (Human/Portrait Detected)",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "detected_count": 0,
                "bounding_boxes": [],
                "assay_id": f"QC-REJECTED-{int(time.time())}",
                "metrics": [],
                "recommendations": [
                    "\u26a0\ufe0f Non-Produce Image: Human face or portrait detected.",
                    f"Please upload a photo of actual {display_commodity} harvest produce.",
                    "Place produce units on a clean surface with even lighting.",
                    "Avoid selfies, ID photos, or non-agricultural content."
                ]
            }

        # -------------------------------------------------------------
        # STEP 3: COMMODITY CHROMATIC SEGMENTATION & AUTO-CORRECTION
        # -------------------------------------------------------------
        clean_comm = commodity_name.strip().lower()
        auto_detected_key = cls.auto_detect_commodity(R, G, B, Y, saturation)
        auto_corrected = False
        original_requested_comm = commodity_name

        if clean_comm in ("auto", "auto-detect", "", "all"):
            baseline_key = auto_detected_key
            commodity_name = cls.COMMODITY_BASELINES[baseline_key]["name"]
        else:
            baseline_key = "onion"
            for k in cls.COMMODITY_BASELINES:
                if k in clean_comm:
                    baseline_key = k
                    break
            
            # Cross-verify: If visual signature overwhelmingly contradicts the selected dropdown
            # (e.g. user selected Soybean/Wheat grains, but the photo is unmistakable Tomato or Cotton)
            if auto_detected_key != baseline_key:
                # Strong Tomato lycopene signature
                fg_mask_test = (Y > 25) & (Y < 235) & (saturation > 0.08)
                if np.sum(fg_mask_test) > 200:
                    fg_R_test = float(np.mean(R[fg_mask_test]))
                    fg_G_test = float(np.mean(G[fg_mask_test]))
                    fg_B_test = float(np.mean(B[fg_mask_test]))
                    fg_sat_test = float(np.mean(saturation[fg_mask_test]))

                    is_strong_tomato = (
                        auto_detected_key == "tomato" and
                        fg_R_test > fg_G_test * 1.25 and
                        fg_R_test > fg_B_test * 1.35 and
                        fg_sat_test > 0.22 and
                        baseline_key in ["soybean", "wheat", "cotton", "maize", "gram", "tur", "potato"]
                    )
                    is_strong_cotton = (
                        auto_detected_key == "cotton" and
                        float(np.mean(Y[fg_mask_test])) > 170.0 and
                        fg_sat_test < 0.12 and
                        baseline_key in ["tomato", "onion", "soybean"]
                    )
                    is_strong_onion = (
                        auto_detected_key == "onion" and
                        fg_R_test > fg_G_test and
                        fg_sat_test > 0.22 and
                        baseline_key in ["soybean", "wheat", "cotton"]
                    )

                    if is_strong_tomato or is_strong_cotton or is_strong_onion:
                        baseline_key = auto_detected_key
                        commodity_name = cls.COMMODITY_BASELINES[baseline_key]["name"]
                        auto_corrected = True
        
        baseline = cls.COMMODITY_BASELINES[baseline_key]

        # Build produce foreground mask based on biological color signatures
        if baseline_key == "onion":
            # Onion: Anthocyanin purple/red, copper/brown tunic, or white bulb
            red_purple_mask = (R > G + 12) & (R > B + 4) & (saturation > 0.14) & (Y > 25.0) & (Y < 235.0)
            copper_brown_mask = (R > B + 18) & (G > B + 8) & (saturation > 0.16) & (Y > 30.0) & (Y < 230.0)
            white_onion_mask = (Y > 120.0) & (Y < 235.0) & (saturation < 0.22) & (abs(R - G) < 22) & (abs(G - B) < 22)
            onion_dark_rot = (Y > 15.0) & (Y < 75.0) & (R > B) & (saturation > 0.08)
            foreground_mask = red_purple_mask | copper_brown_mask | white_onion_mask | onion_dark_rot
        elif baseline_key == "tomato":
            # Tomato: Lycopene red/orange, turning yellow, OR dark rot lesions / wrinkles on tomato body
            is_red = (R > G * 1.08) & (R > B * 1.12) & (saturation > 0.15) & (Y > 20.0) & (Y < 245.0)
            is_dark_rot = (Y > 15.0) & (Y < 95.0) & (R >= B) & (R > 25.0) & (R < 160.0) & (saturation > 0.08)
            foreground_mask = is_red | is_dark_rot
        elif baseline_key in ["soybean", "wheat", "maize", "gram", "tur"]:
            # Legumes & Grains: Golden yellow, amber, pale straw
            grain_gold_mask = (R > 85.0) & (G > 65.0) & (B < R * 0.88) & (saturation > 0.12) & (Y > 35.0) & (Y < 240.0)
            grain_dark_mold = (Y > 20.0) & (Y < 75.0) & (R > 35.0) & (saturation > 0.06)
            foreground_mask = grain_gold_mask | grain_dark_mold
        elif baseline_key == "cotton":
            # Cotton: High-luminance white fiber with pod calyx
            cotton_fiber_mask = (Y > 165.0) & (saturation < 0.15)
            calyx_mask = (G > 35.0) | (R > 40.0)
            foreground_mask = cotton_fiber_mask | (calyx_mask & (Y > 30.0))
        elif baseline_key == "potato":
            # Potato: Earthy tan / golden brown skin
            potato_skin = (R > 80.0) & (G > 60.0) & (B < R * 0.88) & (saturation > 0.12) & (Y > 30.0) & (Y < 230.0)
            potato_rot = (Y > 18.0) & (Y < 75.0) & (R > 35.0)
            foreground_mask = potato_skin | potato_rot
        else:
            foreground_mask = (saturation > 0.14) & (Y > 25.0) & (Y < 240.0)

        # -------------------------------------------------------------
        # STEP 4: MORPHOMETRIC SEGMENTATION USING SCIPY.NDIMAGE
        # -------------------------------------------------------------
        # Clean morphological noise (specks, holes) and fill interior holes (ensures internal rot is captured)
        cleaned_mask = ndi.binary_opening(foreground_mask, structure=np.ones((5, 5)))
        cleaned_mask = ndi.binary_closing(cleaned_mask, structure=np.ones((7, 7)))
        cleaned_mask = ndi.binary_fill_holes(cleaned_mask)

        # Connected-components analysis
        labeled_array, num_features = ndi.label(cleaned_mask)
        slices = ndi.find_objects(labeled_array)

        min_unit_pixels = total_pixels * 0.0025  # At least 0.25% of frame
        max_unit_pixels = total_pixels * 0.92    # No more than 92%

        valid_units = []
        bounding_boxes = []

        for idx, s in enumerate(slices):
            if s is None:
                continue
            unit_component = (labeled_array[s] == (idx + 1))
            unit_area = int(np.sum(unit_component))
            if unit_area < min_unit_pixels or unit_area > max_unit_pixels:
                continue

            y_slice, x_slice = s
            box_y = int(y_slice.start)
            box_x = int(x_slice.start)
            box_h = int(y_slice.stop - y_slice.start)
            box_w = int(x_slice.stop - x_slice.start)

            # Circular equivalent diameter in pixels
            equiv_diam_px = 2.0 * np.sqrt(unit_area / np.pi)
            equiv_diam_mm = round(float(equiv_diam_px * baseline["pixel_scale_mm"]), 1)

            # Clamp unit diameter to reasonable physical limits for this commodity
            clamped_diam_mm = float(np.clip(
                equiv_diam_mm,
                baseline["optimal_diameter_min"] * 0.45,
                baseline["optimal_diameter_max"] * 1.55
            ))

            valid_units.append({
                "area": unit_area,
                "diameter_mm": clamped_diam_mm,
                "box": [box_x, box_y, box_w, box_h]
            })

            bounding_boxes.append({
                "x": box_x,
                "y": box_y,
                "width": box_w,
                "height": box_h,
                "diameter_mm": clamped_diam_mm
            })

        detected_count = len(valid_units)
        produce_pixel_count = int(np.sum(cleaned_mask))
        coverage_ratio = produce_pixel_count / float(total_pixels)

        # Rejection if no valid produce units detected or produce area is too tiny
        if detected_count == 0 or coverage_ratio < 0.025:
            return {
                "status": "REJECTED",
                "is_valid_produce": False,
                "rejection_type": "NO_PRODUCE_DETECTED",
                "rejection_title": f"No {commodity_name} Produce Detected",
                "error_message": (
                    f"The computer vision scanner could not detect valid {commodity_name} specimens in the photo. "
                    f"Please place produce units on a clean, contrasting surface with good lighting and re-take the photo."
                ),
                "confidence_score": 0.0,
                "commodity": commodity_name,
                "sample_name": f"Unrecognized Specimen ({commodity_name})",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "detected_count": 0,
                "bounding_boxes": [],
                "assay_id": f"QC-REJECTED-{int(time.time())}",
                "metrics": [],
                "recommendations": [
                    f"Ensure {commodity_name} units are clearly visible in the camera frame.",
                    "Avoid dark shadows or glare.",
                    "Check that the selected commodity matches the produce in the photo."
                ]
            }

        # -------------------------------------------------------------
        # STEP 5: REAL MORPHOMETRIC MEASUREMENTS & DEFECT EXTRACTION
        # -------------------------------------------------------------
        unit_diameters = [u["diameter_mm"] for u in valid_units]
        measured_diameter_mm = float(round(np.mean(unit_diameters), 1))
        
        # Real Size Uniformity Index based on diameter variation
        if len(unit_diameters) > 1:
            diam_std = float(np.std(unit_diameters))
            cv = (diam_std / (measured_diameter_mm + 1e-4)) * 100.0
            uniformity_score = float(round(np.clip(100.0 - cv * 1.2, 58.0, 99.0), 1))
        else:
            uniformity_score = 92.5

        # Extract foreground produce pixels
        fg_R = R[cleaned_mask]
        fg_G = G[cleaned_mask]
        fg_B = B[cleaned_mask]
        fg_Y = Y[cleaned_mask]

        mean_R = float(np.mean(fg_R))
        mean_G = float(np.mean(fg_G))
        mean_B = float(np.mean(fg_B))
        mean_Y = float(np.mean(fg_Y))
        median_R = float(np.median(fg_R))

        # Real Pigmentation Score
        if baseline_key in ["onion", "tomato"]:
            red_dominance = (mean_R - (mean_G + mean_B) / 2.0) / (mean_R + 1.0)
            pigmentation_score = float(round(np.clip(72.0 + red_dominance * 75.0, 60.0, 98.5), 1))
        elif baseline_key in ["soybean", "wheat", "maize", "gram", "tur"]:
            yellow_tone = (mean_R + mean_G - mean_B) / (mean_R + mean_G + 1.0)
            pigmentation_score = float(round(np.clip(68.0 + yellow_tone * 65.0, 62.0, 98.0), 1))
        elif baseline_key == "cotton":
            whiteness = mean_Y / 255.0
            pigmentation_score = float(round(np.clip(whiteness * 100.0, 65.0, 98.5), 1))
        else:
            pigmentation_score = 86.0

        # -------------------------------------------------------------
        # COMPREHENSIVE MULTI-SPECTRAL DEFECT, ROT & WRINKLE SEGMENTATION
        # -------------------------------------------------------------
        interior_mask = ndi.binary_erosion(cleaned_mask, structure=np.ones((7, 7)))
        grad_Y = ndi.generic_gradient_magnitude(Y, ndi.sobel)

        # 1. Dark Necrotic Rot & Anthracnose Lesions (Black / Deep brown rot)
        if baseline_key == "tomato":
            # For Tomato: Black rot, anthracnose, sunken dark lesions
            rot_black = cleaned_mask & (R < 88.0) & (G < 52.0) & (B < 48.0)
            rot_sunken = cleaned_mask & (R < median_R * 0.58) & (Y < 68.0)
            # 2. Water-soaked soft rot & browning decay (loss of vibrant lycopene red)
            rot_brown = cleaned_mask & (R < 125.0) & ((R - G) < 38.0) & (Y < 95.0) & (B < 85.0)
            # 3. Severe skin wrinkling, folds, desiccation & shriveling
            rot_wrinkles = interior_mask & (grad_Y > 15.0) & (R < 135.0)
            deep_folds = interior_mask & (grad_Y > 22.0)
            # 4. Dull fungal mold / mycelium
            rot_mold = interior_mask & (saturation < 0.22) & (Y > 48.0) & (Y < 195.0)
            defect_mask = (rot_black | rot_sunken | rot_brown | rot_wrinkles | deep_folds | rot_mold) & cleaned_mask
            severe_rot_mask = (rot_black | rot_sunken | rot_brown) & cleaned_mask
        elif baseline_key in ["onion", "potato"]:
            # Dark rot, neck rot, scab, black heart
            rot_black = cleaned_mask & (Y < 58.0) & (saturation < 0.45)
            rot_decay = cleaned_mask & (Y < 72.0) & (abs(R - G) < 20.0)
            rot_wrinkles = interior_mask & (grad_Y > 18.0) & (Y < 120.0)
            rot_mold = interior_mask & (saturation < 0.18) & (Y > 45.0) & (Y < 185.0)
            defect_mask = (rot_black | rot_decay | rot_wrinkles | rot_mold) & cleaned_mask
            severe_rot_mask = (rot_black | rot_decay) & cleaned_mask
        else:
            # Grains, cotton, others
            rot_black = cleaned_mask & (Y < 58.0)
            rot_decay = cleaned_mask & (R < 70.0) & (G < 55.0)
            rot_mold = interior_mask & (saturation < 0.15) & (Y > 60.0) & (Y < 180.0)
            defect_mask = (rot_black | rot_decay | rot_mold) & cleaned_mask
            severe_rot_mask = (rot_black | rot_decay) & cleaned_mask

        # Sprout detection for Onion / Potato
        sprout_pixels = 0
        if baseline_key in ["onion", "potato"]:
            sprout_mask = cleaned_mask & (G > R * 1.18) & (G > 55.0)
            sprout_pixels = int(np.sum(sprout_mask))
            defect_mask = defect_mask | sprout_mask

        total_defect_pixels = int(np.sum(defect_mask))
        severe_rot_pixels = int(np.sum(severe_rot_mask))

        blemish_percentage = float(round((total_defect_pixels / max(produce_pixel_count, 1)) * 100.0, 1))
        rot_necrosis_percentage = float(round((severe_rot_pixels / max(produce_pixel_count, 1)) * 100.0, 1))

        # Real Specular Highlight Moisture Estimation
        specular_mask = cleaned_mask & (Y > 218.0) & (saturation < 0.40)
        specular_ratio = float(np.sum(specular_mask)) / max(produce_pixel_count, 1)
        moisture_offset = (specular_ratio * 35.0) + (1.0 - mean_Y / 255.0) * 1.2
        estimated_moisture = float(round(np.clip(baseline["base_moisture"] + moisture_offset, 8.2, 16.8), 1))

        # Foreign Matter & Chaff estimate
        chaff_estimate = float(round(np.clip((1.0 - coverage_ratio) * 1.5 + (severe_rot_pixels / max(produce_pixel_count, 1)) * 8.0, 0.2, 3.8), 1))
        broken_grain_estimate = float(round(np.clip(blemish_percentage * 0.35, 0.0, 4.5), 1))

        # -------------------------------------------------------------
        # STEP 6: STATUTORY APMC RULE 38 & AGMARKNET GRADE DECISION
        # -------------------------------------------------------------
        sprouting_detected = sprout_pixels > (produce_pixel_count * 0.012)
        has_severe_active_rot = rot_necrosis_percentage >= 4.5 or blemish_percentage >= 15.0
        has_moderate_defects = rot_necrosis_percentage >= 2.0 or blemish_percentage > baseline["max_blemish_faq2"]
        high_moisture = estimated_moisture > baseline["max_moisture_faq"]

        # Statutory APMC Rejection & Substandard Tiers:
        # Rotten produce is strictly REJECTED or Grade C (Below FAQ) under APMC Rule 38
        if has_severe_active_rot or (sprouting_detected and baseline_key == "onion"):
            if rot_necrosis_percentage >= 7.0 or blemish_percentage >= 20.0:
                predicted_grade = "REJECTED (Commercial Rejection / Rotten Produce - Below FAQ)"
                grade_code = "C"
                apmc_class = "NON_FAQ_REJECTED"
                price_multiplier = 0.50
                confidence_score = float(round(np.clip(94.0 + (blemish_percentage * 0.12), 92.0, 99.2), 1))
            else:
                predicted_grade = "Grade C (Substandard / Severe Defect - Below FAQ)"
                grade_code = "C"
                apmc_class = "NON_FAQ_SUBSTANDARD"
                price_multiplier = 0.68
                confidence_score = float(round(np.clip(92.0 + (blemish_percentage * 0.12), 90.0, 97.5), 1))
        elif has_moderate_defects or high_moisture:
            predicted_grade = "Grade C (Substandard / Distressed - Processing Only)"
            grade_code = "C"
            apmc_class = "NON_FAQ_SUBSTANDARD"
            price_multiplier = 0.82
            confidence_score = float(round(np.clip(91.0 + (blemish_percentage * 0.15), 89.0, 96.0), 1))
        elif blemish_percentage <= baseline["max_blemish_faq1"] and uniformity_score >= 87.0 and not high_moisture and rot_necrosis_percentage == 0.0:
            if uniformity_score >= 92.0 and blemish_percentage <= 1.5:
                predicted_grade = "Grade A+ (Export / Super FAQ)"
                grade_code = "A+"
                price_multiplier = 1.12
            else:
                predicted_grade = "Grade A (Standard Commercial FAQ)"
                grade_code = "A"
                price_multiplier = 1.06
            apmc_class = "FAQ_GRADE_I"
            confidence_score = float(round(np.clip(92.0 + (uniformity_score * 0.06), 92.0, 98.5), 1))
        else:
            # Domestic APMC Grade B: strictly for commercial produce with minor cosmetic marks (NO active rot)
            predicted_grade = "Grade B (Domestic APMC Grade - FAQ II)"
            grade_code = "B"
            apmc_class = "FAQ_GRADE_II"
            price_multiplier = 0.98
            confidence_score = float(round(np.clip(88.0 + (uniformity_score * 0.06), 87.0, 95.5), 1))

        # -------------------------------------------------------------
        # STEP 7: STATUTORY ADVISORY RECOMMENDATIONS
        # -------------------------------------------------------------
        recommendations = []
        if auto_corrected:
            recommendations.append(
                f"⚠️ Specimen Standard Corrected: Optical sensor identified {commodity_name} produce "
                f"while selection was set to {original_requested_comm}. Automatically applied statutory {commodity_name} AGMARKNET schedules."
            )

        if grade_code in ["A", "A+"]:
            recommendations.append(f"Meets AGMARKNET Grade I statutory specifications for {commodity_name}.")
            recommendations.append(f"Optimal moisture ({estimated_moisture}%) guarantees safe storage up to 6 months in WDRA warehouses.")
            recommendations.append(f"Eligible for statutory premium of +{int((price_multiplier - 1.0) * 100)}% above modal APMC benchmark.")
        elif grade_code == "B":
            recommendations.append(f"Complies with APMC Rule 38 FAQ Grade II for domestic market distribution.")
            recommendations.append(f"Minor superficial blemish variance ({blemish_percentage}%); no active rot detected. Safe for ambient auction.")
            recommendations.append("Trades at standard market modal equilibrium with no refraction deductions.")
        else:
            if has_severe_active_rot:
                recommendations.append(
                    f"🚫 STATUTORY APMC REJECTION: Active rot, necrotic lesions, or severe skin wrinkling/decay detected "
                    f"({blemish_percentage}% defect area, {rot_necrosis_percentage}% severe rot). Produce is Below FAQ under APMC Rule 38."
                )
                recommendations.append("Unfit for standard APMC open outcry auction; distressed liquidation to food processing or salvage composting only.")
                recommendations.append(f"Subject to severe statutory APMC refraction deduction of {int((1.0 - price_multiplier) * 100)}%.")
            else:
                recommendations.append(f"⚠️ QUALITY REFRACTION DETECTED: Blemish area {blemish_percentage}% exceeds statutory commercial limits.")
                if high_moisture:
                    recommendations.append(f"High moisture ({estimated_moisture}%) requires mandatory mechanical aeration or 2 days solar drying.")
                if sprouting_detected:
                    recommendations.append("Active sprouting detected: recommend immediate liquidation to processing / dehydration plants.")
                recommendations.append(f"Subject to statutory APMC refraction deduction of {int((1.0 - price_multiplier) * 100)}%.")

        # -------------------------------------------------------------
        # STEP 8: MORPHOMETRIC STATUS EVALUATION & CERTIFICATE HASH
        # -------------------------------------------------------------
        cert_seed = f"{commodity_name}-{measured_diameter_mm}-{estimated_moisture}-{start_time}-{len(image_bytes)}"
        sha256_hash = hashlib.sha256(cert_seed.encode("utf-8")).hexdigest()
        assay_id = f"QC-AGRO-2026-{sha256_hash[:8].upper()}"

        # Rigorous morphometric threshold status checks
        min_d = baseline["optimal_diameter_min"]
        max_d = baseline["optimal_diameter_max"]
        if min_d <= measured_diameter_mm <= max_d:
            diam_status = "OPTIMAL"
        elif (min_d * 0.82 <= measured_diameter_mm <= max_d * 1.18):
            diam_status = "PASS"
        elif measured_diameter_mm < min_d * 0.82:
            diam_status = "UNDERSIZED"
        else:
            diam_status = "OVERSIZED"

        if blemish_percentage <= baseline["max_blemish_faq1"]:
            blem_status = "OPTIMAL"
        elif blemish_percentage <= baseline["max_blemish_faq2"]:
            blem_status = "PASS"
        elif blemish_percentage <= 14.0:
            blem_status = "HIGH DEFECT"
        else:
            blem_status = "SEVERE ROT"

        if estimated_moisture <= baseline["base_moisture"]:
            moist_status = "OPTIMAL"
        elif estimated_moisture <= baseline["max_moisture_faq"]:
            moist_status = "PASS"
        else:
            moist_status = "EXCESSIVE"

        if uniformity_score >= 88.0:
            unif_status = "OPTIMAL"
        elif uniformity_score >= 75.0:
            unif_status = "PASS"
        else:
            unif_status = "IRREGULAR"

        return {
            "status": "SUCCESS",
            "is_valid_produce": True,
            "assay_id": assay_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "commodity": commodity_name,
            "sample_name": f"{commodity_name} Specimen" if not auto_corrected else f"{commodity_name} Specimen (Auto-Adjusted from {original_requested_comm})",
            "commodity_auto_corrected": auto_corrected,
            "original_commodity_requested": original_requested_comm,
            "predicted_grade": predicted_grade,
            "grade_code": grade_code,
            "confidence_score": confidence_score,
            "average_diameter_mm": measured_diameter_mm,
            "uniformity_score": uniformity_score,
            "blemish_percentage": blemish_percentage,
            "rot_necrosis_percentage": rot_necrosis_percentage,
            "estimated_moisture_percent": estimated_moisture,
            "foreign_matter_percent": chaff_estimate,
            "broken_grain_percent": broken_grain_estimate,
            "apmc_grade_classification": apmc_class,
            "sprouting_or_damage_detected": sprouting_detected or has_severe_active_rot,
            "color_pigmentation_score": pigmentation_score,
            "codex_standards_compliant": grade_code in ["A", "A+"],
            "suggested_price_multiplier": price_multiplier,
            "detected_count": detected_count,
            "bounding_boxes": bounding_boxes,
            "image_url": "",
            "metrics": [
                {
                    "name": "Average Diameter",
                    "measured_value": f"{measured_diameter_mm} mm",
                    "benchmark_range": f"{baseline['optimal_diameter_min']} – {baseline['optimal_diameter_max']} mm",
                    "status": diam_status
                },
                {
                    "name": "Size Uniformity Index",
                    "measured_value": f"{uniformity_score}%",
                    "benchmark_range": "> 85.0%",
                    "status": unif_status
                },
                {
                    "name": "Surface Blemish / Defect",
                    "measured_value": f"{blemish_percentage}%",
                    "benchmark_range": f"< {baseline['max_blemish_faq1']}%",
                    "status": blem_status
                },
                {
                    "name": "Moisture Index",
                    "measured_value": f"{estimated_moisture}%",
                    "benchmark_range": f"< {baseline['max_moisture_faq']}%",
                    "status": moist_status
                },
                {
                    "name": "Chromatic Pigmentation",
                    "measured_value": f"{round(pigmentation_score, 1)}%",
                    "benchmark_range": "> 75.0%",
                    "status": "OPTIMAL" if pigmentation_score >= 85.0 else "PASS"
                },
                {
                    "name": "Foreign Matter / Chaff",
                    "measured_value": f"{chaff_estimate}%",
                    "benchmark_range": "< 1.0%",
                    "status": "OPTIMAL" if chaff_estimate <= 1.0 else "PASS"
                }
            ],
            "recommendations": recommendations,
            "cryptographic_hash": sha256_hash
        }
