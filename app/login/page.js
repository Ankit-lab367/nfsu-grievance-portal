'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaEnvelope, FaLock, FaSpinner, FaSun, FaMoon, FaCheckCircle, FaShieldAlt, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [welcomeUser, setWelcomeUser] = useState('');
    const [otpRequired, setOtpRequired] = useState(false);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const [otpSuccess, setOtpSuccess] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBackToLogin = () => {
        setOtpRequired(false);
        setOtpDigits(['', '', '', '', '', '']);
        setError('');
        setOtpSuccess(false);
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...otpDigits];
        
        if (value.length > 1) {
            // Handle paste
            const pasted = value.slice(0, 6).split('');
            pasted.forEach((char, i) => {
                if (index + i < 6) newDigits[index + i] = char;
            });
            setOtpDigits(newDigits);
            const nextIndex = Math.min(index + pasted.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        newDigits[index] = value;
        setOtpDigits(newDigits);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', formData);
            if (response.data.otpRequired) {
                setResendTimer(60);
                setError('');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to resend verification code.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (otpRequired) {
                const otpCode = otpDigits.join('');
                const response = await axios.post('/api/auth/verify-otp', {
                    email: formData.email,
                    otpCode: otpCode
                });

                if (response.data.success) {
                    setOtpSuccess(true);
                    const user = response.data.user;
                    setWelcomeUser(user.name);
                    setShowWelcome(true);

                    localStorage.setItem('token', 'cookie-auth');
                    localStorage.setItem('user', JSON.stringify(user));

                    setTimeout(() => {
                        const role = user.role;
                        if (role === 'student') {
                            if (user.isVerifiedID) {
                                router.push('/dashboard/student');
                            } else {
                                router.push('/verify-id');
                            }
                        } else if (role === 'admin' || role === 'staff') {
                            router.push('/dashboard/admin');
                        } else if (role === 'super-admin') {
                            router.push('/dashboard/super-admin');
                        }
                    }, 2200);
                }
            } else {
                const response = await axios.post('/api/auth/login', formData);

                if (response.data.otpRequired) {
                    setOtpRequired(true);
                    setOtpDigits(['', '', '', '', '', '']);
                    setResendTimer(60);
                    setTimeout(() => inputRefs.current[0]?.focus(), 300);
                    setError('');
                } else if (response.data.success) {
                    const user = response.data.user;
                    setWelcomeUser(user.name);
                    setShowWelcome(true);

                    localStorage.setItem('token', 'cookie-auth');
                    localStorage.setItem('user', JSON.stringify(user));

                    setTimeout(() => {
                        const role = user.role;
                        if (role === 'student') {
                            if (user.isVerifiedID) {
                                router.push('/dashboard/student');
                            } else {
                                router.push('/verify-id');
                            }
                        } else if (role === 'admin' || role === 'staff') {
                            router.push('/dashboard/admin');
                        } else if (role === 'super-admin') {
                            router.push('/dashboard/super-admin');
                        }
                    }, 2200);
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.';
            if (err.response?.status === 403 && errorMessage.toLowerCase().includes('inactive')) {
                router.push('/registration-pending');
                return;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-500">
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 glass-theme rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all z-50 border border-white/10 shadow-lg"
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-800/10 rounded-full blur-3xl animate-float" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="glass-card-theme p-8 md:p-10 border-white/10 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-20 h-20 object-contain mx-auto"
                            />
                        </div>
                        <h1 className="text-3xl font-bold dark:text-white mb-2">
                            {otpRequired ? 'Verification Code' : 'Welcome Back'}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            {otpRequired ? 'Enter the 6-digit code sent to' : 'Login to your NFSU account'}
                        </p>
                        {otpRequired && (
                            <p className="text-red-400 font-semibold text-sm mt-1 flex items-center justify-center gap-1.5">
                                <FaEnvelope className="text-xs animate-pulse" />
                                {formData.email}
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {otpRequired ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Shield Icon */}
                                <div className="flex justify-center mb-5">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                                        className="relative"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center border border-red-500/30">
                                            <FaShieldAlt className={`text-2xl ${otpSuccess ? 'text-green-400' : 'text-red-400'} transition-colors duration-500`} />
                                        </div>
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-red-500/40"
                                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Step Indicator */}
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <div className="w-8 h-1 rounded-full bg-red-500" />
                                    <div className={`w-8 h-1 rounded-full transition-all duration-500 ${otpSuccess ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                </div>

                                {/* 6 Individual Digit Boxes */}
                                <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                                    {otpDigits.map((digit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * index + 0.2 }}
                                        >
                                            <input
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-300 focus:outline-none bg-white/5 dark:text-white ${
                                                    otpSuccess
                                                        ? 'border-green-500/70 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                        : digit
                                                            ? 'border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                                            : 'border-white/10 hover:border-white/20'
                                                } focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]`}
                                                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                            />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Verify Button */}
                                <motion.button
                                    type="submit"
                                    disabled={loading || otpDigits.some(d => !d) || otpSuccess}
                                    className={`w-full py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white ${
                                        otpSuccess
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-700'
                                            : 'bg-gradient-to-r from-red-600 to-rose-800 hover:shadow-lg hover:shadow-red-600/40'
                                    }`}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : otpSuccess ? (
                                        <>
                                            <FaCheckCircle className="mr-2" />
                                            Verified!
                                        </>
                                    ) : (
                                        <>
                                            <FaShieldAlt className="mr-2 text-sm" />
                                            Verify & Login
                                        </>
                                    )}
                                </motion.button>

                                {/* Countdown Timer + Controls */}
                                <div className="flex justify-between items-center text-sm pt-4 mt-2 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        className="text-gray-400 hover:text-white transition-colors font-medium flex items-center gap-1"
                                    >
                                        ← Back
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {resendTimer > 0 ? (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <div className="relative w-7 h-7">
                                                    <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                                                        <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
                                                        <circle
                                                            cx="14" cy="14" r="12" fill="none"
                                                            stroke="rgba(239,68,68,0.7)" strokeWidth="2"
                                                            strokeDasharray={`${(resendTimer / 60) * 75.4} 75.4`}
                                                            strokeLinecap="round"
                                                            className="transition-all duration-1000"
                                                        />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-red-400">
                                                        {resendTimer}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">to resend</span>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={loading}
                                                className="text-red-500 hover:text-red-400 disabled:text-gray-500 transition-colors font-bold flex items-center gap-1.5"
                                            >
                                                <FaRedo className="text-xs" />
                                                Resend
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div>
                                    <label className="block dark:text-gray-300 mb-2 font-bold text-sm">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block dark:text-gray-300 mb-2 font-bold text-sm">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </>
                        )}
                    </form>

                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <p className="dark:text-gray-300 font-medium">
                            Don&apos;t have an account?{' '}
                            <Link href="/register-selection" className="text-red-600 dark:text-red-400 hover:underline font-bold">
                                Register here
                            </Link>
                        </p>
                        <Link href="/" className="block mt-4 text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-semibold">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            <ChatbotWidget />

            <AnimatePresence>
                {showWelcome && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'linear-gradient(135deg, #0a0505 0%, #1a0505 50%, #0a0505 100%)',
                                zIndex: 9997,
                            }}
                        />

                        <motion.div
                            initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
                            animate={{ backdropFilter: 'blur(20px)', opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 9998,
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                                textAlign: 'center',
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, type: 'spring' }}
                                className="mb-8"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo.png" alt="NFSU" className="w-24 h-24 mx-auto object-contain filter drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase"
                            >
                                WELCOME <span className="text-rose-600">BACK</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-xl md:text-3xl font-black text-rose-500 italic uppercase mt-2 tracking-widest px-4"
                            >
                                {welcomeUser}
                            </motion.p>

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: 200 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent mt-8 mx-auto rounded-full shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                            />

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 1.2 }}
                                className="text-white text-xs font-bold tracking-[0.3em] uppercase mt-4"
                            >
                                Initializing Portal Experience...
                            </motion.p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}