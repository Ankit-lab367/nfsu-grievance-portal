'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaSpinner, FaSun, FaMoon, FaChalkboardTeacher } from 'react-icons/fa';
export default function TeacherRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(true);
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

    const sendOTP = async () => {
        if (!formData.email) {
            setError('Please enter your email address first.');
            return;
        }


        setOtpLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/auth/send-otp', {
                email: formData.email,
                role: 'teacher'
            });
            if (response.data.success) {
                setOtpSent(true);
                setOtpCountdown(60);
                const timer = setInterval(() => {
                    setOtpCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!otp) {
            setError('Please enter the verification code sent to your email.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: 'teacher',
                otp: otp
            });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                router.push('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 transition-colors duration-500">
            {}
            {}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 glass-theme rounded-full text-slate-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-all z-50 border border-slate-200 dark:border-white/10 shadow-lg"
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {}
            <div className="relative z-10 w-full max-w-2xl px-6">
                <div className="glass-card-theme p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-4">
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-20 h-20 object-contain mx-auto"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-red-600 p-2 rounded-lg text-white shadow-lg">
                                <FaChalkboardTeacher className="text-sm" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Teacher Registration</h1>
                        <p className="text-slate-600 dark:text-gray-300 font-medium">Create a Teacher Account</p>
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Full Name *</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Phone Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Email Address *</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        placeholder="yourname@example.com"
                                    />
                                    <button
                                        type="button"
                                        onClick={sendOTP}
                                        disabled={otpLoading || otpCountdown > 0}
                                        className="absolute right-2 top-1.2 transform flex items-center justify-center px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1.5"
                                    >
                                        {otpLoading ? <FaSpinner className="animate-spin" /> : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : otpSent ? 'Resend Code' : 'Send Code'}
                                    </button>
                                </div>
                            </div>
                            <div className={otpSent ? "block animate-fade-in" : "hidden"}>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Verification Code *</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required={otpSent}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Password *</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Confirm Password *</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
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
                                    Creating Teacher Account...
                                </>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6">
                        <p className="text-slate-600 dark:text-gray-300 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-red-600 dark:text-red-400 hover:underline font-bold">
                                Login here
                            </Link>
                        </p>
                        <Link href="/register-selection" className="block mt-4 text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-semibold">
                            ← Change Registration Role
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}