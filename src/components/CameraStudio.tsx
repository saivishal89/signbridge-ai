import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  FlipHorizontal,
  AlertTriangle,
  Play,
  Activity,
  Maximize2
} from 'lucide-react';
import { mediaPipeService } from '../services/mediapipe';
import { Landmark3D, SystemStatus } from '../types/gesture';

interface CameraStudioProps {
  status: SystemStatus;
  mirrored: boolean;
  onToggleMirror: () => void;
  onLandmarksDetected: (landmarks: Landmark3D[] | null, rawGestureResult: any) => void;
  onStatusChange: (statusUpdate: Partial<SystemStatus>) => void;
}

export const CameraStudio: React.FC<CameraStudioProps> = ({
  status,
  mirrored,
  onToggleMirror,
  onLandmarksDetected,
  onStatusChange
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastVideoTime = useRef<number>(-1);
  const fpsCounter = useRef<{ frames: number; lastTime: number }>({ frames: 0, lastTime: performance.now() });

  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize MediaPipe model
  useEffect(() => {
    let isMounted = true;
    onStatusChange({ modelLoading: true, modelError: null });

    mediaPipeService
      .getGestureRecognizer()
      .then(() => {
        if (isMounted) {
          onStatusChange({ modelLoading: false, modelReady: true, modelError: null });
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Model initialization error:', err);
          onStatusChange({
            modelLoading: false,
            modelReady: false,
            modelError: err.message || 'Failed to download or initialize MediaPipe Gesture Recognizer'
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Frame processing loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      animFrameId.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Synchronize canvas size with internal video stream resolution
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate FPS
    const now = performance.now();
    fpsCounter.current.frames++;
    if (now - fpsCounter.current.lastTime >= 1000) {
      const currentFps = Math.round((fpsCounter.current.frames * 1000) / (now - fpsCounter.current.lastTime));
      onStatusChange({ fps: currentFps });
      fpsCounter.current.frames = 0;
      fpsCounter.current.lastTime = now;
    }

    // Run MediaPipe inference if new video frame is available
    if (video.currentTime !== lastVideoTime.current && mediaPipeService.isReady()) {
      lastVideoTime.current = video.currentTime;
      const result = mediaPipeService.detectForVideo(video, now);

      if (result && result.landmarks && result.landmarks.length > 0) {
        const rawLandmarks = result.landmarks[0];
        const landmarks3D: Landmark3D[] = rawLandmarks.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z ?? 0
        }));

        // Render skeleton on canvas
        mediaPipeService.drawLandmarks(ctx, landmarks3D, canvas.width, canvas.height, mirrored);

        onStatusChange({ handDetected: true });
        onLandmarksDetected(landmarks3D, result);
      } else {
        onStatusChange({ handDetected: false });
        onLandmarksDetected(null, null);
      }
    }

    animFrameId.current = requestAnimationFrame(processFrame);
  }, [mirrored, onLandmarksDetected, onStatusChange]);

  // Start Camera
  const startCamera = async () => {
    setErrorMessage(null);
    setIsStartingCamera(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam access (getUserMedia) is not supported by your current browser.');
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsStartingCamera(false);
            onStatusChange({ cameraReady: true, cameraError: null });
            if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
            animFrameId.current = requestAnimationFrame(processFrame);
          });
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsStartingCamera(false);
      let friendlyError = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyError = 'Camera permission was denied. Please allow camera access in your browser bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyError = 'No camera found on this device. Please connect a webcam.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyError = 'Camera is already in use by another app (e.g. Zoom, Meet, Teams).';
      } else {
        friendlyError = err.message || 'Camera initialization error.';
      }

      setErrorMessage(friendlyError);
      onStatusChange({ cameraReady: false, cameraError: friendlyError });
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onStatusChange({ cameraReady: false, handDetected: false, fps: 0 });
    onLandmarksDetected(null, null);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
      {/* Viewport Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={18} color="#06b6d4" />
            Live Hand Tracking Studio
          </h2>
          {status.cameraReady && (
            <span className="badge badge-live" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }}
              />
              LIVE FEED
            </span>
          )}
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            onClick={onToggleMirror}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
            title={mirrored ? 'Mirrored (Selfie view)' : 'Normal view'}
          >
            <FlipHorizontal size={15} />
            <span>{mirrored ? 'Mirrored' : 'Unmirrored'}</span>
          </button>

          {status.cameraReady ? (
            <button
              onClick={stopCamera}
              className="btn btn-danger"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              <CameraOff size={15} />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              disabled={isStartingCamera}
              className="btn btn-primary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
            >
              {isStartingCamera ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Camera size={15} />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="camera-viewport">
        {/* HTML5 Video element */}
        <video
          ref={videoRef}
          className={`camera-video ${mirrored ? 'mirrored' : ''}`}
          playsInline
          muted
        />

        {/* HTML5 Canvas Overlay for Landmarks */}
        <canvas ref={canvasRef} className="camera-canvas" />

        {/* Inactive Standby Screen */}
        {!status.cameraReady && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #0f172a 0%, #050810 100%)',
              padding: '2rem',
              textAlign: 'center',
              zIndex: 10
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#06b6d4'
              }}
            >
              <Camera size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Camera is Inactive
            </h3>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#94a3b8',
                maxWidth: '420px',
                lineHeight: 1.5,
                marginBottom: '1.25rem'
              }}
            >
              Click below to grant camera permission. Video frames are processed entirely inside your browser for 100% privacy.
            </p>

            <button
              onClick={startCamera}
              disabled={isStartingCamera}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
            >
              {isStartingCamera ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Requesting Camera...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Launch Live Camera</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Model Loading Overlay */}
        {status.modelLoading && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '0.5rem',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#fbbf24',
              zIndex: 15,
              backdropFilter: 'blur(8px)'
            }}
          >
            <RefreshCw size={14} className="animate-spin" />
            <span>Loading MediaPipe AI Model...</span>
          </div>
        )}

        {/* Hand Guidance HUD when Camera is Active */}
        {status.cameraReady && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 12
            }}
          >
            <div
              style={{
                background: status.handDetected
                  ? 'rgba(16, 185, 129, 0.85)'
                  : 'rgba(15, 23, 42, 0.85)',
                border: `1px solid ${status.handDetected ? '#10b981' : 'rgba(148, 163, 184, 0.2)'}`,
                backdropFilter: 'blur(8px)',
                borderRadius: '0.5rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: status.handDetected ? '#ffffff' : '#94a3b8',
                fontWeight: 500,
                transition: 'all 0.25s ease'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: status.handDetected ? '#ffffff' : '#f59e0b',
                  boxShadow: status.handDetected ? '0 0 8px #ffffff' : 'none'
                }}
              />
              {status.handDetected
                ? 'Hand Tracked (21 Keypoints)'
                : 'Hold hand clearly in front of camera'}
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.15)'
              }}
            >
              Resolution: {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}
            </div>
          </div>
        )}
      </div>

      {/* Error Recovery Alert */}
      {(errorMessage || status.cameraError || status.modelError) && (
        <div
          style={{
            marginTop: '0.85rem',
            padding: '0.75rem 1rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '0.65rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            color: '#fda4af',
            fontSize: '0.85rem'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong>Troubleshooting Tip:</strong> {errorMessage || status.cameraError || status.modelError}
            <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={startCamera}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} /> Retry Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
