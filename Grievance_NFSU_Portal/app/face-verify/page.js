'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
    FaCamera, FaCheckCircle, FaTimesCircle, FaSpinner,
    FaShieldAlt, FaRedo, FaSun, FaMoon, FaUserCheck,
} from 'react-icons/fa';

// ── Status enum ──────────────────────────────────────────────────────────────
const STATUS = {
    IDLE: 'idle',
    CAMERA_STARTING: 'camera_starting',
    READY: 'ready',
    CAPTURING: 'capturing',
    VERIFYING: 'verifying',
    SUCCESS: 'success',
    FAILED: 'failed',
    NO_CAMERA: 'no_camera',
};

export default function FaceVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [name, setName] = useState('');
    const [status, setStatus] = useState(STATUS.IDLE);
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(null);
    const [darkMode, setDarkMode] = useState(true);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);

    // Pre-fill name from URL query (?name=Aryan)
    useEffect(() => {
        const qname = searchParams.get('name') || '';
        setName(qname);
    }, [searchParams]);

    // Theme sync
    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'dark';
        setDarkMode(saved === 'dark');
        document.body.classList.toggle('dark', saved === 'dark');
    }, []);

    const toggleTheme = () => {
        const next = !darkMode;
        setDarkMode(next);
        document.body.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    // ── Start camera ─────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        setStatus(STATUS.CAMERA_STARTING);
        setMessage('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStatus(STATUS.READY);
        } catch {
            setStatus(STATUS.NO_CAMERA);
            setMessage('Camera access denied or not available. Please allow camera access and reload.');
        }
    }, []);

    // ── Stop camera ──────────────────────────────────────────────────────────
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => () => stopCamera(), [stopCamera]);

    // ── Capture frame → base64 ────────────────────────────────────────────────
    const captureFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // Draw WITHOUT the CSS mirror flip so the face is correct for recognition
        ctx.drawImage(video, 0, 0, w, h);
        return canvas.toDataURL('image/jpeg', 0.92);
    }, []);

    // ── Countdown then capture + verify ──────────────────────────────────────
    const handleVerify = useCallback(async () => {
        if (!name.trim()) {
            setMessage('Please enter your name first.');
            return;
        }
        if (status !== STATUS.READY) return;

        // 3-second countdown
        setStatus(STATUS.CAPTURING);
        for (let i = 3; i >= 1; i--) {
            setCountdown(i);
            await new Promise((r) => setTimeout(r, 1000));
        }
        setCountdown(null);

        const imageBase64 = captureFrame();
        if (!imageBase64) {
            setStatus(STATUS.FAILED);
            setMessage('Could not capture frame. Please try again.');
            return;
        }

        setStatus(STATUS.VERIFYING);
        setMessage('Analyzing your face…');

        try {
            const res = await axios.post('/api/auth/face-verify', {
                name: name.trim(),
                imageBase64,
            });

            if (res.data.matched) {
                setStatus(STATUS.SUCCESS);
                setMessage('Identity verified! Redirecting to your dashboard…');
                stopCamera();
                setTimeout(() => router.push('/dashboard/student'), 2000);
            } else {
                setStatus(STATUS.FAILED);
                setMessage(res.data.message || 'Face did not match. Please try again.');
            }
        } catch (err) {
            setStatus(STATUS.FAILED);
            setMessage(
                err.response?.data?.error ||
                'Verification failed. Make sure the face recognition server is running.'
            );
        }
    }, [name, status, captureFrame, stopCamera, router]);

    const handleRetry = () => {
        setMessage('');
        setCountdown(null);
        // If camera is already open just go back to READY
        if (streamRef.current) {
            setStatus(STATUS.READY);
        } else {
            // camera was stopped — restart it
            startCamera();
        }
    };

    // ── Derived UI helpers ────────────────────────────────────────────────────
    const isVerifying = status === STATUS.VERIFYING || status === STATUS.CAPTURING;
    const showCamera = [STATUS.CAMERA_STARTING, STATUS.READY, STATUS.CAPTURING, STATUS.VERIFYING].includes(status);
    const ringColor =
        status === STATUS.SUCCESS ? 'ring-green-500' :
            status === STATUS.FAILED ? 'ring-red-500' :
                status === STATUS.CAPTURING || status === STATUS.VERIFYING ? 'ring-yellow-400 animate-pulse' :
                    'ring-blue-500/40';

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }} />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            {/* Floating blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 glass-theme rounded-full text-slate-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all z-50 border border-slate-200 dark:border-white/10 shadow-lg">
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-xl px-6">
                <div className="glass-card-theme p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            <img src="/logo.png" alt="NFSU Logo" className="w-20 h-20 object-contain mx-auto" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FaShieldAlt className="text-blue-500 text-xl" />
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verify Identity</h1>
                        </div>
                        <p className="text-slate-600 dark:text-gray-300 font-medium">
                            Face verification — Step 2 of registration
                        </p>
                    </div>

                    {/* Progress stepper */}
                    <div className="flex items-center mb-8 px-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                            <span className="text-xs text-slate-500 dark:text-gray-400 mt-1">Account</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 mx-2" />
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">2</div>
                            <span className="text-xs text-blue-500 font-semibold mt-1">Face ID</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-slate-200 dark:bg-white/10 mx-2" />
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-400 text-sm font-bold">3</div>
                            <span className="text-xs text-slate-400 mt-1">Dashboard</span>
                        </div>
                    </div>

                    {/* Name input */}
                    <div className="mb-6">
                        <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">
                            Your Full Name *
                        </label>
                        <div className="relative">
                            <FaUserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isVerifying || status === STATUS.SUCCESS}
                                placeholder="Enter your full name (must match dataset)"
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium disabled:opacity-60"
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                            Must match exactly the folder name in the face dataset
                        </p>
                    </div>

                    {/* Camera area */}
                    <div className="mb-6">
                        {!showCamera ? (
                            /* Start camera button */
                            <button
                                onClick={startCamera}
                                disabled={status === STATUS.SUCCESS}
                                className="w-full py-16 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-all">
                                    <FaCamera className="text-3xl text-blue-500" />
                                </div>
                                <span className="font-semibold text-sm">Click to open camera</span>
                            </button>
                        ) : (
                            /* Live video feed */
                            <div className={`relative rounded-2xl overflow-hidden ring-4 ${ringColor} transition-all`}>
                                <video
                                    ref={videoRef}
                                    muted
                                    playsInline
                                    className="w-full rounded-2xl object-cover"
                                    style={{ minHeight: '280px' }}
                                />
                                {/* Face guide overlay */}
                                {status === STATUS.READY && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-44 h-56 border-2 border-dashed border-blue-400/60 rounded-full" />
                                    </div>
                                )}
                                {/* Countdown overlay */}
                                {status === STATUS.CAPTURING && countdown && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <span className="text-8xl font-black text-white drop-shadow-lg animate-ping-once">
                                            {countdown}
                                        </span>
                                    </div>
                                )}
                                {/* Scanning overlay */}
                                {status === STATUS.VERIFYING && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-3">
                                        <FaSpinner className="text-4xl text-blue-400 animate-spin" />
                                        <span className="text-white font-semibold">Scanning…</span>
                                    </div>
                                )}
                                {/* Success overlay */}
                                {status === STATUS.SUCCESS && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/60 gap-3">
                                        <FaCheckCircle className="text-6xl text-green-400" />
                                        <span className="text-white font-bold text-lg">Verified!</span>
                                    </div>
                                )}
                                {/* Failed overlay */}
                                {status === STATUS.FAILED && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 gap-2">
                                        <FaTimesCircle className="text-5xl text-red-400" />
                                        <span className="text-white font-semibold text-sm text-center px-4">{message}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status message */}
                    {message && status !== STATUS.FAILED && (
                        <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-medium border ${status === STATUS.SUCCESS
                            ? 'bg-green-500/10 border-green-500/40 text-green-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            }`}>
                            {message}
                        </div>
                    )}
                    {status === STATUS.NO_CAMERA && (
                        <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                            {message}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-3">
                        {/* Take selfie */}
                        {(status === STATUS.READY) && (
                            <button
                                onClick={handleVerify}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <FaCamera /> Take Selfie &amp; Verify
                            </button>
                        )}

                        {/* Retry after failure */}
                        {status === STATUS.FAILED && (
                            <button
                                onClick={handleRetry}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <FaRedo /> Try Again
                            </button>
                        )}

                        {/* Loading state */}
                        {isVerifying && (
                            <button disabled
                                className="w-full py-3 bg-gradient-to-r from-blue-500/50 to-purple-600/50 text-white rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                                <FaSpinner className="animate-spin" />
                                {status === STATUS.CAPTURING ? `Capturing in ${countdown}…` : 'Verifying…'}
                            </button>
                        )}
                    </div>

                    {/* Footer links */}
                    <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6 space-y-2">
                        <p className="text-slate-500 dark:text-gray-400 text-sm">
                            Don&apos;t have your photo in the dataset?
                        </p>
                        <Link href="/dashboard/student"
                            className="text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm font-medium underline-offset-2 hover:underline">
                            Skip for now → Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
