import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Video, VideoOff } from 'lucide-react';

export default function CameraCapture({ onPhotoCaptured, capturedPhoto, onRetake }) {
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err) {
      console.error('Kamera gagal diakses:', err);
      let message = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.';
      if (err.name === 'NotAllowedError') {
        message = 'Akses kamera ditolak. Silakan izinkan akses kamera pada ikon gembok di address bar browser.';
      } else if (err.name === 'NotFoundError') {
        message = 'Kamera tidak ditemukan pada perangkat ini.';
      }
      setCameraError(message);
      setStreamActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  // Switch between front & back camera
  const switchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Take Snapshot
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 220);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to video feed's actual size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    
    ctx.save();
    // Invert horizontal axis if front camera to maintain natural mirror preview
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Export high-quality JPEG
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    
    // Stop live stream after capture
    stopCamera();
    
    onPhotoCaptured(photoDataUrl);
  };

  // Retake photo
  const handleRetake = () => {
    onRetake();
    startCamera();
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="camera-component">
      <div className="camera-box">
        {/* Flash Effect */}
        <div className={`shutter-flash ${isFlashing ? 'active' : ''}`} />

        {/* Hidden Canvas for Drawing Frame */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* 1. Captured Photo Preview */}
        {capturedPhoto ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img 
              src={capturedPhoto} 
              alt="Hasil Selfie Presensi" 
              className="camera-preview-img" 
              style={{ transform: 'none' }} // Canvas already inverted for mirror
            />
            <div className="camera-status-badge">
              <span className="pulse-dot" />
              <span>FOTO SELFIE SIAP</span>
            </div>
          </div>
        ) : streamActive ? (
          /* 2. Active Live Video Stream */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="camera-video"
            />
            <div className="camera-status-badge">
              <span className="pulse-dot pulse-red" />
              <span>KAMERA LIVE AKTIF</span>
            </div>

            {/* Oval Face Guide Overlay */}
            <div className="face-guide-overlay">
              <span className="face-guide-text">
                Posisikan wajah di dalam oval
              </span>
            </div>
          </div>
        ) : (
          /* 3. Camera Off / Placeholder */
          <div className="camera-placeholder">
            <div className="camera-placeholder-icon">
              <Camera size={34} />
            </div>
            <h4 style={{ color: '#fff', marginBottom: '0.4rem', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              Kamera Belum Aktif
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', maxWidth: '320px', marginBottom: '1.35rem', lineHeight: 1.45 }}>
              Sistem presensi mewajibkan foto selfie yang diambil langsung secara live untuk menjamin validitas kehadiran.
            </p>
            <button 
              type="button" 
              onClick={() => startCamera()} 
              className="btn-primary" 
              style={{ width: 'auto', padding: '0.75rem 1.6rem' }}
            >
              <Video size={18} />
              <span>Aktifkan Kamera Sekarang</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {cameraError && (
        <div style={{ 
          marginTop: '0.85rem', 
          padding: '0.85rem 1rem', 
          background: 'var(--danger-subtle)', 
          border: '1px solid var(--danger-border)', 
          borderRadius: 'var(--radius-sm)',
          color: 'var(--danger-light)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Camera Action Controls */}
      <div style={{ marginTop: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
        {capturedPhoto ? (
          <button 
            type="button" 
            onClick={handleRetake} 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <RefreshCw size={16} />
            <span>Ambil Ulang Foto Selfie</span>
          </button>
        ) : streamActive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              type="button"
              onClick={switchCamera}
              className="btn-secondary btn-circle"
              title="Ganti Kamera Depan/Belakang"
            >
              <RefreshCw size={18} />
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              className="btn-shutter"
              title="Jepret Foto Selfie"
            >
              <Camera size={26} />
            </button>

            <button
              type="button"
              onClick={stopCamera}
              className="btn-secondary btn-circle"
              title="Matikan Kamera"
            >
              <VideoOff size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
