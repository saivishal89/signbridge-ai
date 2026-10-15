import { Landmark3D, PretrainedGestureName } from '../types/gesture';

function dist3D(a: Landmark3D, b: Landmark3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export interface GeometricDetectionResult {
  category: PretrainedGestureName | null;
  confidence: number;
}

/**
 * Geometric Landmark Pose Analyzer
 * Evaluates anatomical distances and finger curl/extension states from 21 MediaPipe 3D landmarks.
 * Provides real-time detection for OK Sign (👌), Call Me (🤙), Rock On (🤘),
 * Three/W (3️⃣), Four (4️⃣), and Pinch (🤏).
 */
export function detectGeometricGesture(landmarks: Landmark3D[]): GeometricDetectionResult {
  if (!landmarks || landmarks.length !== 21) {
    return { category: null, confidence: 0 };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexTip = landmarks[8];
  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleTip = landmarks[12];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];

  // Palm reference scale
  const palmScale = Math.max(0.01, dist3D(wrist, middleMcp));

  // Finger extension relative to wrist
  const isIndexExtended = dist3D(indexTip, wrist) > dist3D(indexPip, wrist) * 1.15;
  const isMiddleExtended = dist3D(middleTip, wrist) > dist3D(middlePip, wrist) * 1.15;
  const isRingExtended = dist3D(ringTip, wrist) > dist3D(ringPip, wrist) * 1.15;
  const isPinkyExtended = dist3D(pinkyTip, wrist) > dist3D(pinkyPip, wrist) * 1.15;

  // Thumb state
  const thumbSpan = dist3D(thumbTip, middleMcp) / palmScale;
  const isThumbExtended = thumbSpan > 0.85;
  const isThumbCurled = thumbSpan < 0.6;

  // Thumb to Index tip proximity
  const thumbIndexDist = dist3D(thumbTip, indexTip) / palmScale;
  const isThumbIndexPinching = thumbIndexDist < 0.28;

  // 1. OK / Perfect Sign (👌)
  // Thumb and index tips touching in circle, middle and pinky extended
  if (isThumbIndexPinching && isMiddleExtended && isPinkyExtended) {
    const score = Math.max(0.75, Math.min(0.96, 1.0 - thumbIndexDist));
    return { category: 'OK_Sign', confidence: score };
  }

  // 2. Call Me / Phone (🤙)
  // Thumb and pinky extended, middle 3 fingers curled
  if (isThumbExtended && isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
    return { category: 'Call_Me', confidence: 0.92 };
  }

  // 3. Rock On / High Energy (🤘)
  // Index and pinky extended, middle and ring curled, thumb tucked
  if (isIndexExtended && isPinkyExtended && !isMiddleExtended && !isRingExtended && !isThumbExtended) {
    return { category: 'Rock_On', confidence: 0.90 };
  }

  // 4. Three Fingers / W Sign (3️⃣)
  // Index, middle, ring extended, pinky curled
  if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
    return { category: 'Three_Fingers', confidence: 0.88 };
  }

  // 5. Four Fingers / Wait (4️⃣)
  // Index, middle, ring, pinky extended, thumb folded across palm
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbCurled) {
    return { category: 'Four_Fingers', confidence: 0.88 };
  }

  // 6. Pinch / Small Amount (🤏)
  // Thumb and index very close, other fingers curled
  if (thumbIndexDist < 0.22 && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { category: 'Pinch_Sign', confidence: 0.86 };
  }

  return { category: null, confidence: 0 };
}
