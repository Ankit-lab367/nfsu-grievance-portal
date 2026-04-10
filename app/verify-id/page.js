'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaSpinner, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

export default function VerifyIDPage() {
    const router = useRouter();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, scanning, matching, success, error
    const [patternMatch, setPatternMatch] = useState('searching'); // searching, detected, steady, mismatch
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [progress, setProgress] = useState(0);
    const scanTimerRef = useRef(null);

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
    }, [router]);

    const startCamera = async () => {
        try {
            setError('');
            setStatus('scanning');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            // Start scanning - scanner will just wait passively until correct ID is shown
            simulateScan();
        } catch (err) {
            console.error('Camera error:', err);
            setError('Unable to access camera. Please ensure permissions are granted.');
            setStatus('error');
        }
    };


    const checkPattern = () => {
        if (!videoRef.current || !canvasRef.current) return false;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const video = videoRef.current;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let blueScore = 0;
        let logoScore = 0;
        let whiteScore = 0;
        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Convert to HSL-ish
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

            // Signature 1: University Navy Blue (Hue 190-270, Low Light)
            if (h > 180 && h < 280 && l < 160 && s > 0.1) blueScore++;
            
            // Signature 2: Logo Gold/Yellow/Red (Hue 0-80, High Saturation)
            if (h < 85 && s > 0.25 && l > 30) logoScore++;
            
            // Signature 3: White Text/High Highlights (High Lightness, Low Saturation)
            if (l > 200 && s < 0.2) whiteScore++;
        }

        const bPerc = (blueScore / totalPixels) * 100;
        const lPerc = (logoScore / totalPixels) * 100;
        const wPerc = (whiteScore / totalPixels) * 100;

        // Strict Requirement: Navy Blue AND Logo signatures
        // Thresholds lowered to work at normal holding distance
        const isStrictMatch = bPerc > 5 && lPerc > 0.08;
        const isPartialMatch = bPerc > 2;

        if (isStrictMatch) {
            setPatternMatch('detected');
            return true;
        } else if (isPartialMatch) {
            setPatternMatch('steady');
            return false;
        } else {
            setPatternMatch('mismatch');
            return false;
        }
    };

    const simulateScan = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
            const isMatch = checkPattern();
            
            if (isMatch) {
                // Progress faster if match is solid
                currentProgress += Math.random() * 5 + 3;
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    clearInterval(interval);
                    setStatus('matching');
                    setTimeout(handleVerification, 2000);
                }
                setProgress(currentProgress);
            }
        }, 400);
        scanTimerRef.current = interval;
    };

    const handleVerification = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/auth/verify-id', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Update local storage user data
                const updatedUser = { ...user, isVerifiedID: true };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setStatus('success');
                
                // Stop camera stream
                if (videoRef.current && videoRef.current.srcObject) {
                    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please try again.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#050101] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-2xl"
            >
                {/* Header Area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-3 mb-4 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                        <FaShieldAlt className="text-red-500 text-sm" />
                        <span className="text-xs font-bold tracking-widest uppercase text-red-400">Step 2: Identity Verification</span>
                    </div>
                    <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Activate Your Student ID</h1>
                    <p className="text-gray-400 max-w-md mx-auto">Please show your official student ID card to the camera to activate your portal access.</p>
                </div>

                {/* Main Console */}
                <div className="glass-card-theme relative p-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div 
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 px-10 text-center"
                            >
                                <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <FaCamera className="text-4xl text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">Ready to scan?</h3>
                                <p className="text-gray-400 mb-8 max-w-xs">Position your ID card in clear view of the camera.</p>
                                <button 
                                    onClick={startCamera}
                                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-700 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex items-center space-x-2"
                                >
                                    <span>Start Secure Scanner</span>
                                    <FaArrowRight className="text-sm" />
                                </button>
                            </motion.div>
                        )}

                        {(status === 'scanning' || status === 'matching') && (
                            <motion.div 
                                key="camera"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative aspect-video bg-black rounded-lg overflow-hidden group"
                            >
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Scanning Overlay */}
                                <div className="absolute inset-0 border-2 border-red-500/30">
                                    {/* Corners */}
                                    <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
                                    <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
                                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
                                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
                                    
                                    {/* Laser Line */}
                                    {status === 'scanning' && (
                                        <motion.div 
                                            animate={{ top: ['10%', '90%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20"
                                        />
                                    )}

                                    {/* Floating reference box */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[60%] border-2 border-dashed border-white/40 rounded-2xl flex items-center justify-center">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest text-center px-4">
                                            Show your ID card here
                                        </span>
                                    </div>
                                </div>

                                {/* Status Indicators */}
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                patternMatch === 'detected' ? 'bg-green-500 animate-ping' : 
                                                patternMatch === 'steady' ? 'bg-yellow-500 animate-pulse' : 
                                                'bg-gray-500 animate-pulse'
                                            }`} />
                                            <span className={`text-[10px] font-bold tracking-widest uppercase ${
                                                patternMatch === 'detected' ? 'text-green-400' : 
                                                patternMatch === 'steady' ? 'text-yellow-400' : 'text-gray-400'
                                            }`}>
                                                {patternMatch === 'detected' ? 'Signature Matched — Processing...' : 
                                                 patternMatch === 'steady' ? 'Partial Match: Hold Steady' : 'Searching for NFSU ID...'}
                                            </span>
                                        </div>
                                        <div className="text-[9px] text-gray-500 uppercase tracking-tighter">
                                            {status === 'scanning' ? 'Optical Analysis in Progress...' : 'Validating Credentials...'}
                                        </div>
                                    </div>
                                    <div className="text-sm font-black font-mono text-red-500 bg-red-500/10 px-2 py-1 rounded">
                                        {Math.floor(progress)}%
                                    </div>
                                </div>
                                <canvas ref={canvasRef} width="200" height="150" className="hidden" />
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 px-10 text-center"
                            >
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                    <FaCheckCircle className="text-5xl text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Identity Verified!</h3>
                                <p className="text-gray-400 mb-8 max-w-xs">NFSU patterns matched. Your portal access has been activated successfully.</p>
                                <button 
                                    onClick={() => router.push('/dashboard/student')}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all flex items-center space-x-2"
                                >
                                    <span>Enter Student Portal</span>
                                    <FaArrowRight className="text-sm" />
                                </button>
                            </motion.div>
                        )}

                        {/* Fraud state removed for passive rejection */}

                        {status === 'error' && (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 px-10 text-center"
                            >
                                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                                    <FaExclamationTriangle className="text-4xl text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-red-500">Scan Interrupted</h3>
                                <p className="text-gray-400 mb-8 max-w-xs">{error}</p>
                                <button 
                                    onClick={startCamera}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Reference */}
                <div className="mt-12 text-center text-gray-500 text-xs">
                    <p className="mb-4 uppercase tracking-[0.2em]">Secure Authentication Protocol</p>
                    <div className="flex items-center justify-center space-x-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <img src="/assets/nfsu-logo.png" alt="NFSU Logo" className="h-8 object-contain" />
                        <div className="w-px h-6 bg-white/20" />
                        <span className="font-bold">NFSU SECUREID™</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
