import { FilesetResolver, GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { Landmark3D } from '../types/gesture';

const WASM_CDN_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const MODEL_ASSET_PATH =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export const HAND_CONNECTIONS: [number, number][] = [
  // Wrist & Palm base
  [0, 1],
  [0, 5],
  [5, 9],
  [9, 13],
  [13, 17],
  [0, 17],
  // Thumb
  [1, 2],
  [2, 3],
  [3, 4],
  // Index
  [5, 6],
  [6, 7],
  [7, 8],
  // Middle
  [9, 10],
  [10, 11],
  [11, 12],
  // Ring
  [13, 14],
  [14, 15],
  [15, 16],
  // Pinky
  [17, 18],
  [18, 19],
  [19, 20]
];

export const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

class MediaPipeService {
  private recognizer: GestureRecognizer | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<GestureRecognizer> | null = null;

  public async getGestureRecognizer(): Promise<GestureRecognizer> {
    if (this.recognizer) {
      return this.recognizer;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN_PATH);

        let recognizerInstance: GestureRecognizer;
        try {
          // Attempt GPU acceleration first
          recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_PATH,
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 1
          });
        } catch (gpuErr) {
          console.warn('GPU delegate failed, falling back to CPU delegate:', gpuErr);
          recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_PATH,
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numHands: 1
          });
        }

        this.recognizer = recognizerInstance;
        this.isInitializing = false;
        return recognizerInstance;
      } catch (err: any) {
        this.isInitializing = false;
        this.initPromise = null;
        console.error('Failed to initialize MediaPipe GestureRecognizer:', err);
        throw new Error(
          `MediaPipe Model Load Error: ${err.message || 'Check your internet connection for initial model download.'}`
        );
      }
    })();

    return this.initPromise;
  }

  public isReady(): boolean {
    return this.recognizer !== null;
  }

  public detectForVideo(video: HTMLVideoElement, timestamp: number): GestureRecognizerResult | null {
    if (!this.recognizer) return null;
    try {
      return this.recognizer.recognizeForVideo(video, timestamp);
    } catch (err) {
      console.warn('Recognition frame error:', err);
      return null;
    }
  }

  public destroy(): void {
    if (this.recognizer) {
      try {
        this.recognizer.close();
      } catch (e) {
        console.warn('Error closing recognizer', e);
      }
      this.recognizer = null;
      this.initPromise = null;
    }
  }

  /**
   * High-performance overlay renderer for hand landmarks & connections
   */
  public drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark3D[],
    width: number,
    height: number,
    mirrored: boolean = true,
    activeColor: string = '#06b6d4', // electric cyan
    glowColor: string = '#3b82f6' // neon blue
  ): void {
    ctx.save();

    // Map landmark coords to canvas pixels
    const points = landmarks.map((pt) => {
      let x = pt.x * width;
      if (mirrored) {
        x = (1 - pt.x) * width; // Mirror coordinate to match mirrored video
      }
      const y = pt.y * height;
      return { x, y, z: pt.z ?? 0 };
    });

    // 1. Draw glowing skeletal connection lines
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = points[startIdx];
      const p2 = points[endIdx];
      if (!p1 || !p2) continue;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Draw interior joints
    ctx.shadowBlur = 8;
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const isTip = FINGERTIP_INDICES.includes(i);
      const isWrist = i === 0;

      ctx.beginPath();
      if (isTip) {
        // Highlighted fingertips with outer ring
        ctx.arc(pt.x, pt.y, 6.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981'; // emerald green pulse
        ctx.shadowColor = '#10b981';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9.5, 0, 2 * Math.PI);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      } else if (isWrist) {
        // Wrist anchor
        ctx.arc(pt.x, pt.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b'; // amber
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
      } else {
        // Standard joint
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = glowColor;
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export const mediaPipeService = new MediaPipeService();
