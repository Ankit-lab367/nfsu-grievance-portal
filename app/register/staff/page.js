'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaSpinner, FaSun, FaMoon, FaUserShield, FaCamera } from 'react-icons/fa';
export default function StaffRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
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
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Profile picture must be less than 5MB');
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            // Only allow letters and spaces
            const alphaValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData({ ...formData, [name]: alphaValue });
        } else if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length > 10) return;
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
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
                role: 'staff'
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

        if (!formData.phone || formData.phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }
        if (!otp) {
            setError('Please enter the verification code sent to your email.');
            return;
        }
        if (!avatar) {
            setError('Profile picture is mandatory for staff members. Please upload your photo.');
            return;
        }
        setLoading(true);
        try {
            const signupData = new FormData();
            signupData.append('name', formData.name);
            signupData.append('email', formData.email);
            signupData.append('password', formData.password);
            signupData.append('phone', formData.phone);
            signupData.append('role', 'staff');
            signupData.append('otp', otp);
            signupData.append('avatar', avatar);

            const response = await axios.post('/api/auth/register', signupData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                if (response.data.pendingVerification) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    router.push('/registration-pending');
                } else {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    router.push('/dashboard/admin');
                }
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
                className="fixed top-6 right-6 p-3 glass-theme rounded-full dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all z-50 border border-white/10 shadow-lg"
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            {}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-rose-800/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" />
            </div>
            {}
            <div className="relative z-10 w-full max-w-2xl px-6">
                <div className="glass-card-theme p-8 md:p-10 border border-white/10 shadow-2xl">
                    {}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-4">
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-20 h-20 object-contain mx-auto"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-red-600 p-2 rounded-lg text-white shadow-lg">
                                <FaUserShield className="text-sm" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold dark:text-white mb-2">Staff Registration</h1>
                        <p className="dark:text-gray-300 font-medium">Create a Staff Account</p>
                    </div>
                    {}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}
                    {}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture Upload Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/20 overflow-hidden bg-white/5 flex items-center justify-center relative transition-all group-hover:border-red-500/50">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUserShield className="text-4xl text-gray-500" />
                                    )}
                                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <FaCamera className="text-white text-xl mb-1" />
                                        <span className="text-[10px] text-white uppercase font-bold">Upload</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                {!avatar && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping" />}
                            </div>
                            <p className="mt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Mandatory Profile Picture *
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block dark:text-gray-300 mb-2 font-bold text-sm">Full Name *</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
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
                                        required
                                        inputMode="numeric"
                                        maxLength={10}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                        placeholder="10-digit Phone Number"
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
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
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
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
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
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
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
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
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
                                    Creating Staff Account...
                                </>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>
                    </form>
                    {}
                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <p className="dark:text-gray-300 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="dark:text-red-400 hover:underline font-bold">
                                Login here
                            </Link>
                        </p>
                        <Link href="/register-selection" className="block mt-4 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-semibold">
                            ← Change Registration Role
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}