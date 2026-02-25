'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaGraduationCap, FaPhone, FaSpinner, FaSun, FaMoon } from 'react-icons/fa';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        enrollmentNumber: '',
        course: '',
        year: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                enrollmentNumber: formData.enrollmentNumber,
                course: formData.course,
                year: parseInt(formData.year),
                phone: formData.phone,
                role: 'student',
            });

            if (response.data.success) {
                // Store token
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Redirect to face verification (step 2)
                const encodedName = encodeURIComponent(response.data.user.name);
                router.push(`/face-verify?name=${encodedName}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            {/* Background Image */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 glass-theme rounded-full text-slate-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all z-50 border border-slate-200 dark:border-white/10 shadow-lg"
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Floating shapes */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl px-6">
                <div className="glass-card-theme p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-2xl">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-20 h-20 object-contain mx-auto"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                        <p className="text-slate-600 dark:text-gray-300 font-medium">Register for NFSU Grievance Portal</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form */}
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Email *</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Enrollment Number *</label>
                                <div className="relative">
                                    <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="enrollmentNumber"
                                        value={formData.enrollmentNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="Enrollment Number"
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Course</label>
                                <div className="relative">
                                    <FaGraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="Course Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="" className="bg-white dark:bg-slate-800">Select Year</option>
                                    <option value="1" className="bg-white dark:bg-slate-800">1st Year</option>
                                    <option value="2" className="bg-white dark:bg-slate-800">2nd Year</option>
                                    <option value="3" className="bg-white dark:bg-slate-800">3rd Year</option>
                                    <option value="4" className="bg-white dark:bg-slate-800">4th Year</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Password *</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Confirm Password *</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6">
                        <p className="text-slate-600 dark:text-gray-300 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                                Login here
                            </Link>
                        </p>
                        <Link href="/" className="block mt-4 text-slate-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-semibold">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
