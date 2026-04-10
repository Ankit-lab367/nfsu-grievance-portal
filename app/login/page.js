'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaEnvelope, FaLock, FaSpinner, FaSun, FaMoon, FaCheckCircle } from 'react-icons/fa';
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

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const emailLower = formData.email.toLowerCase();
        if (!emailLower.endsWith('@gmail.com')) {
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', formData);

            if (response.data.success) {
                const user = response.data.user;
                setWelcomeUser(user.name);
                setShowWelcome(true);

                localStorage.setItem('token', response.data.token);
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
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
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
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-20 h-20 object-contain mx-auto"
                            />
                        </div>
                        <h1 className="text-3xl font-bold dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400 font-medium">Login to your NFSU account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                    </form>

                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <p className="dark:text-gray-300 font-medium">
                            Don't have an account?{' '}
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