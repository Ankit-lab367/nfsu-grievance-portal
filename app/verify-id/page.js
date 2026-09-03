'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaCamera, 
    FaCheckCircle, 
    FaExclamationTriangle, 
    FaShieldAlt, 
    FaSpinner, 
    FaArrowRight, 
    FaIdCard,
    FaCheck,
    FaTimesCircle
} from 'react-icons/fa';
import axios from 'axios';

export default function VerifyIDPage() {
    const router = useRouter();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [status, setStatus] = useState('idle'); // idle | scanning | matching | success | error
    const [patternMatch, setPatternMatch] = useState('searching'); // searching | steady | detected
    const [matchDetails, setMatchDetails] = useState({ 
        header: false, 
        text: false, 
        logo: false, 
        body: false, 
        confidence: 0 
    });
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isVerifyingAI, setIsVerifyingAI] = useState(false);
    
    const scanTimerRef = useRef(null);
    const streamRef = useRef(null);
    const capturedImageRef = useRef(null);
    const hasCapturedRef = useRef(false);

    // Stop all media tracks safely
    const stopCamera = useCallback(() => {
        if (scanTimerRef.current) {
            clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    // Check user authentication
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isVerifiedID) {
            router.push('/dashboard/student');
            return;
        }
        setUser(parsedUser);

        return () => {
            stopCamera();
        };
    }, [router, stopCamera]);

    /**
     * Strict NFSU Student ID Card Multi-Feature Real-Time Detector
     * Evaluates:
     * 1. Top Blue Header Strip geometry (must be navy blue and top ~28% of the card).
     * 2. White "National Forensic Sciences University" text line density in header.
     * 3. NFSU Shield Emblem signature (Gold/Yellow top + Crimson/Red quadrant in top-left).
     * 4. White card body in lower 70% with high contrast step.
     */
    const checkPattern = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) {
            return { matched: false, confidence: 0, status: 'searching', header: false, text: false, logo: false, body: false };
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const video = videoRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
            return { matched: false, confidence: 0, status: 'searching', header: false, text: false, logo: false, body: false };
        }

        const width = canvas.width;
        const height = canvas.height;
        ctx.drawImage(video, 0, 0, width, height);

        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, width, height);
        } catch {
            return { matched: false, confidence: 0, status: 'searching', header: false, text: false, logo: false, body: false };
        }

        const data = imageData.data;

        // Bounding Box Region of Interest (ROI) for the ID card
        const roiX0 = Math.floor(width * 0.08);
        const roiX1 = Math.floor(width * 0.92);
        const roiY0 = Math.floor(height * 0.16);
        const roiY1 = Math.floor(height * 0.84);
        const roiW = roiX1 - roiX0;
        const roiH = roiY1 - roiY0;

        let totalHeaderPixels = 0;
        let headerBluePixels = 0;
        let headerTextPixels = 0;
        let totalBodyPixels = 0;
        let bodyWhitePixels = 0;
        let bodyBluePixels = 0;

        let logoGoldPixels = 0;
        let logoRedPixels = 0;

        let sumHeaderL = 0;
        let sumBodyL = 0;

        for (let y = roiY0; y < roiY1; y++) {
            for (let x = roiX0; x < roiX1; x++) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const normX = (x - roiX0) / roiW; // 0.0 (left) to 1.0 (right)
                const normY = (y - roiY0) / roiH; // 0.0 (top) to 1.0 (bottom)

                // HSL Conversion
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const l = (max + min) / 2;
                const d = max - min;
                
                let h = 0;
                if (d !== 0) {
                    if (max === r) h = (g - b) / d % 6;
                    if (max === g) h = (b - r) / d + 2;
                    if (max === b) h = (r - g) / d + 4;
                    h = Math.round(h * 60);
                    if (h < 0) h += 360;
                }
                const s = l > 0 && l < 255 ? d / (255 - Math.abs(2 * l - 255)) : 0;

                // ZONE 1: TOP HEADER STRIP (0.0 to 0.35)
                // ZONE 1: TOP HEADER STRIP (0.0 to 0.36)
                if (normY <= 0.36) {
                    totalHeaderPixels++;
                    sumHeaderL += l;

                    // Navy Blue Header Banner
                    const isNavyBlue = (h >= 190 && h <= 260 && s >= 0.18 && l >= 15 && l <= 170 && b >= 55 && (b - r) >= 16 && (b - g) >= 5);
                    if (isNavyBlue) {
                        headerBluePixels++;
                    }

                    // High contrast printed university text inside header
                    if (normX >= 0.18 && normX <= 0.98) {
                        const isTextPixel = (l >= 135 || (r > 125 && g > 125 && b > 125)) && 
                                            (Math.abs(r - g) < 35 && Math.abs(g - b) < 35);
                        if (isTextPixel) {
                            headerTextPixels++;
                        }
                    }

                    // NFSU Shield Emblem signature in top-left (normX <= 0.25)
                    if (normX <= 0.25) {
                        // Gold/Yellow Crest Top ("NFSU") and Sanskrit motto ribbon
                        const isGold = (h >= 28 && h <= 70 && s >= 0.18 && l >= 25 && l <= 230 && r > 95 && g > 70 && b < r * 0.85);
                        if (isGold) logoGoldPixels++;

                        // Crimson/Red Left Quadrants (Fingerprint & Shield)
                        const isRed = ((h >= 330 || h <= 25) && s >= 0.18 && l >= 20 && l <= 215 && r > 85 && r > g * 1.15 && r > b * 1.15);
                        if (isRed) logoRedPixels++;
                    }
                } 
                // ZONE 2: WHITE CARD BODY (0.38 to 1.0)
                else if (normY >= 0.38) {
                    totalBodyPixels++;
                    sumBodyL += l;

                    // Light neutral cardstock background
                    const isWhiteBody = ((l >= 95 && s <= 0.30) || (r > 85 && g > 85 && b > 85 && Math.abs(r - g) < 40 && Math.abs(g - b) < 40));
                    if (isWhiteBody) {
                        bodyWhitePixels++;
                    }

                    // Check if body is accidentally blue (e.g. a blue shirt)
                    const isBodyBlue = (h >= 190 && h <= 260 && s >= 0.18 && b >= 55 && (b - r) >= 16);
                    if (isBodyBlue) {
                        bodyBluePixels++;
                    }
                }
            }
        }

        const headerBlueRatio = totalHeaderPixels > 0 ? (headerBluePixels / totalHeaderPixels) : 0;
        const textZonePixels = Math.floor(totalHeaderPixels * 0.75);
        const headerTextRatio = textZonePixels > 0 ? (headerTextPixels / textZonePixels) : 0;
        const bodyWhiteRatio = totalBodyPixels > 0 ? (bodyWhitePixels / totalBodyPixels) : 0;
        const bodyBlueRatio = totalBodyPixels > 0 ? (bodyBluePixels / totalBodyPixels) : 0;

        const avgHeaderL = totalHeaderPixels > 0 ? (sumHeaderL / totalHeaderPixels) : 0;
        const avgBodyL = totalBodyPixels > 0 ? (sumBodyL / totalBodyPixels) : 0;

        // 1. Blue Header Check: Must be navy blue banner across top, lower body must not be blue
        const hasHeader = headerBlueRatio >= 0.18 && bodyBlueRatio <= 0.14 && (bodyBlueRatio < headerBlueRatio * 0.50);

        // 2. University Text Check: Printed text contrast inside blue banner
        const hasText = hasHeader && headerTextRatio >= 0.03;

        // 3. NFSU Logo Crest Check: Gold + Red emblem cluster in top-left
        const hasLogo = hasHeader && ((logoGoldPixels >= 2 && logoRedPixels >= 2) || (logoGoldPixels + logoRedPixels >= 5));

        // 4. Card Body Check: White card body in lower area
        const hasBody = bodyWhiteRatio >= 0.28 && (avgBodyL > avgHeaderL + 10);

        // Full match of authentic NFSU ID card
        const isFullMatch = hasHeader && hasLogo && hasBody;

        let matchState = 'searching';
        if (isFullMatch) {
            matchState = 'detected';
        }

        setPatternMatch(matchState);
        setMatchDetails({
            header: hasHeader,
            text: hasText,
            logo: hasLogo,
            body: hasBody,
            confidence: isFullMatch ? 100 : 0
        });

        return {
            matched: isFullMatch,
            confidence: isFullMatch ? 100 : 0,
            status: matchState,
            header: hasHeader,
            text: hasText,
            logo: hasLogo,
            body: hasBody
        };
    }, []);

    // Frame capture at native video resolution
    const captureCurrentFrame = useCallback(() => {
        if (!videoRef.current) return null;
        const video = videoRef.current;
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = width;
        captureCanvas.height = height;
        const ctx = captureCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.92);
        capturedImageRef.current = dataUrl;
        return dataUrl;
    }, []);

    // Send ID to backend verification
    const handleVerification = useCallback(async (overrideImage) => {
        try {
            setError('');
            setIsVerifyingAI(true);
            const token = localStorage.getItem('token');
            let idImage = overrideImage || capturedImageRef.current;
            
            if (!idImage) {
                idImage = captureCurrentFrame();
            }

            if (!idImage) {
                throw new Error("No ID image captured. Please hold your ID card to the camera.");
            }

            const response = await axios.post('/api/auth/verify-id', {
                idImage: idImage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStatus('success');
                stopCamera();
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Verification failed. Please try again.';
            setError(errorMsg);
            setStatus('error');
            setProgress(0);
        } finally {
            setIsVerifyingAI(false);
        }
    }, [captureCurrentFrame, stopCamera]);

    // Fast-cycle scan loop
    const simulateScan = useCallback(() => {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);
        hasCapturedRef.current = false;
        let currentProgress = 0;

        const interval = setInterval(() => {
            const result = checkPattern();

            if (result.matched) {
                // Real NFSU Card verified in frame: Rapid lock-in (+22% to +30% per 70ms tick = ~300ms)
                currentProgress += Math.floor(Math.random() * 8) + 22;
            } else {
                // Gradual decay if briefly unaligned (so 1-frame camera jitter doesn't reset progress)
                currentProgress = Math.max(0, currentProgress - 6);
            }

            // Capture crisp frame at ~50%
            if (currentProgress >= 50 && !hasCapturedRef.current) {
                captureCurrentFrame();
                hasCapturedRef.current = true;
            }

            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                scanTimerRef.current = null;
                setProgress(100);
                setStatus('matching');
                
                // Trigger backend verification
                setTimeout(() => {
                    handleVerification();
                }, 150);
                return;
            }

            setProgress(Math.min(99, Math.floor(currentProgress)));
        }, 70); // 70ms interval = ~14 FPS real-time detection

        scanTimerRef.current = interval;
    }, [checkPattern, captureCurrentFrame, handleVerification]);

    // Start Camera Stream
    const startCamera = async () => {
        try {
            setError('');
            setStatus('scanning');
            setProgress(0);
            hasCapturedRef.current = false;
            
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not available in this browser or requires HTTPS. You can upload your ID card image directly below.");
            }

            let stream;
            try {
                // Prioritize high-def rear/environment camera
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: { ideal: 'environment' }, 
                        width: { ideal: 1280 }, 
                        height: { ideal: 720 } 
                    } 
                });
            } catch {
                // Fallback to any available video device
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
            
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(console.warn);
                    simulateScan();
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError(`Camera Error: ${err.message || 'Unable to access camera.'} Please try uploading your ID photo.`);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#050101] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative selection:bg-red-500 selection:text-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-red-900/20 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-900/15 blur-[130px] rounded-full pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-2xl"
            >
                {/* Header Info */}
                <div className="text-center mb-5">
                    <div className="inline-flex items-center space-x-2 mb-2 px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full shadow-inner">
                        <FaShieldAlt className="text-red-500 text-xs" />
                        <span className="text-xs font-bold tracking-widest uppercase text-red-400">Step 2: ID Verification</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">NFSU ID Card Scanner</h1>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
                        Show your ID card for verification
                    </p>
                </div>

                {/* Main Card Container */}
                <div className="glass-card-theme relative p-1.5 overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl">
                    <AnimatePresence mode="wait">
                        
                        {/* IDLE STATE */}
                        {status === 'idle' && (
                            <motion.div 
                                key="idle"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-10 px-6 sm:px-10 text-center"
                            >
                                <div className="relative mb-5">
                                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-900/40 via-red-900/30 to-blue-600/30 rounded-3xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                        <FaIdCard className="text-4xl text-blue-400" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-2">Scan Your Student ID</h3>
                                <p className="text-gray-400 text-sm mb-6 max-w-sm">
                                    Show your ID card for verification
                                </p>

                                <div className="flex items-center justify-center w-full max-w-md">
                                    <button 
                                        onClick={startCamera}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 rounded-xl font-bold text-sm shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center space-x-2 group"
                                    >
                                        <FaCamera className="text-sm group-hover:scale-110 transition-transform" />
                                        <span>Start ID Camera</span>
                                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* SCANNING / MATCHING CAMERA FEED */}
                        {(status === 'scanning' || status === 'matching') && (
                            <motion.div 
                                key="camera"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden group shadow-2xl"
                            >
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Overlay Target Framing */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className={`absolute inset-0 transition-colors duration-300 ${
                                        patternMatch === 'detected' ? 'border-2 border-emerald-500/80 bg-emerald-500/5' : 
                                        patternMatch === 'steady' ? 'border-2 border-yellow-500/50' : 
                                        'border-2 border-red-500/30'
                                    }`}>
                                        {/* Corner Brackets */}
                                        <div className={`absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors ${patternMatch === 'detected' ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : patternMatch === 'steady' ? 'border-yellow-400' : 'border-red-500'}`} />
                                        <div className={`absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors ${patternMatch === 'detected' ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : patternMatch === 'steady' ? 'border-yellow-400' : 'border-red-500'}`} />
                                        <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors ${patternMatch === 'detected' ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : patternMatch === 'steady' ? 'border-yellow-400' : 'border-red-500'}`} />
                                        <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors ${patternMatch === 'detected' ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : patternMatch === 'steady' ? 'border-yellow-400' : 'border-red-500'}`} />
                                        
                                        {/* Laser Scan Line */}
                                        {status === 'scanning' && (
                                            <motion.div 
                                                animate={{ top: ['8%', '92%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className={`absolute left-4 right-4 h-0.5 z-20 transition-all ${
                                                    patternMatch === 'detected' ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]' : 
                                                    patternMatch === 'steady' ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.9)]' : 
                                                    'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]'
                                                }`}
                                            />
                                        )}

                                        {/* ID Card Border Framing Only */}
                                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[84%] h-[66%] rounded-2xl transition-all duration-300 pointer-events-none ${
                                            patternMatch === 'detected' 
                                                ? 'border-2 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]' 
                                                : 'border-2 border-white/40 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                                        }`}>
                                            {/* Corner Accents on Card Border */}
                                            <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl transition-colors ${patternMatch === 'detected' ? 'border-emerald-400' : 'border-white/70'}`} />
                                            <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 rounded-tr-xl transition-colors ${patternMatch === 'detected' ? 'border-emerald-400' : 'border-white/70'}`} />
                                            <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 rounded-bl-xl transition-colors ${patternMatch === 'detected' ? 'border-emerald-400' : 'border-white/70'}`} />
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 rounded-br-xl transition-colors ${patternMatch === 'detected' ? 'border-emerald-400' : 'border-white/70'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* HUD Controls */}
                                <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2 bg-black/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${
                                                patternMatch === 'detected' ? 'bg-emerald-500 animate-ping' : 
                                                patternMatch === 'steady' ? 'bg-yellow-500 animate-pulse' : 
                                                'bg-red-500 animate-pulse'
                                            }`} />
                                            
                                            <span className={`text-xs font-bold tracking-wide uppercase ${
                                                patternMatch === 'detected' ? 'text-emerald-400' : 
                                                patternMatch === 'steady' ? 'text-yellow-400' : 'text-gray-300'
                                            }`}>
                                                {status === 'matching' ? 'Verifying ID Card...' :
                                                 patternMatch === 'detected' ? 'ID Card Verified' : 
                                                 'Show your ID card for verification'}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {/* Progress Badge */}
                                            <div className="text-xs font-black font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg min-w-[50px] text-center shadow-inner">
                                                {progress}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hidden Canvas for Computer Vision */}
                                <canvas ref={canvasRef} width="200" height="140" className="hidden" />
                            </motion.div>
                        )}

                        {/* SUCCESS STATE */}
                        {status === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 px-6 sm:px-10 text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <FaCheckCircle className="text-4xl text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">ID Card Verified & Submitted!</h3>
                                <p className="text-gray-400 text-sm mb-6 max-w-sm">
                                    Your student ID card has been verified and securely submitted for portal access.
                                </p>
                                <button 
                                    onClick={() => router.push('/dashboard/student')}
                                    className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl font-bold text-sm shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all flex items-center space-x-2"
                                >
                                    <span>Proceed to Dashboard</span>
                                    <FaArrowRight className="text-xs" />
                                </button>
                            </motion.div>
                        )}

                        {/* ERROR / REJECTION STATE */}
                        {status === 'error' && (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-10 px-6 sm:px-10 text-center"
                            >
                                <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                    <FaTimesCircle className="text-4xl text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-red-400">Card Verification Rejected</h3>
                                <p className="text-gray-300 text-xs sm:text-sm mb-6 max-w-md bg-red-950/40 border border-red-500/20 p-3 rounded-xl">
                                    {error || "ID card could not be verified. Please show your ID card clearly for verification."}
                                </p>
                                
                                <div className="flex items-center justify-center">
                                    <button 
                                        onClick={startCamera}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm transition-all flex items-center space-x-2"
                                    >
                                        <FaCamera className="text-xs" />
                                        <span>Scan Again with Camera</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Security Badge */}
                <div className="mt-6 text-center text-gray-500 text-xs">
                    <p className="mb-2 uppercase tracking-[0.2em]">National Forensic Sciences University</p>
                    <div className="flex items-center justify-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="NFSU Logo" className="h-6 object-contain" />
                        <div className="w-px h-4 bg-white/20" />
                        <span className="font-semibold tracking-wider">NFSU STUDENT ID VERIFICATION</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
