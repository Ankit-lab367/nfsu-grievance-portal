'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaLock, FaPhone } from 'react-icons/fa';

function SSOLoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');
    
    const [showModal, setShowModal] = useState(false);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageStatus, setPageStatus] = useState('Verifying Your ForenSync Account');
    
    const routeToDashboard = (user) => {
        const role = user.role;
        if (role === 'student') {
            router.push('/dashboard/student');
        } else if (role === 'admin' || role === 'staff') {
            router.push('/dashboard/admin');
        } else if (role === 'super-admin') {
            router.push('/dashboard/super-admin');
        } else {
            router.push('/dashboard');
        }
    };

    useEffect(() => {
        const verifySSO = async () => {
            if (!code) {
                console.error('No SSO code found in URL');
                router.push('/login');
                return;
            }

            try {
                // Task 1: POST request to /api/auth/forensync with the code
                const response = await axios.post('/api/auth/forensync', { code });

                if (response.data.success) {
                    const { token, user, isProfileComplete } = response.data;

                    // Save token as requested: grievance_token
                    localStorage.setItem('grievance_token', token);
                    
                    // Also save as standard 'token' and 'user' for app compatibility
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    if (!isProfileComplete) {
                        setShowModal(true);
                    } else {
                        routeToDashboard(user);
                    }
                } else {
                    throw new Error(response.data.error || 'SSO Verification failed');
                }
            } catch (err) {
                console.error('SSO Login Error:', err.message);
                alert('SSO Verification Failed. Please log in manually.');
                router.push('/login');
            }
        };

        verifySSO();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch('/api/user/profile', { phone }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                // Update local storage user
                const updatedUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setShowModal(false);
                setPageStatus('Redirecting to Dashboard...');
                routeToDashboard(updatedUser);
            }
        } catch (err) {
            console.error('Phone update error:', err);
            alert('Failed to update phone number. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 z-10"
            >
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full border-t-4 border-red-600 animate-spin absolute inset-0 mb-8" />
                    <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center mb-8">
                        <FaLock className="text-3xl text-red-500" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                        {pageStatus === 'Verifying Your ForenSync Account' ? (
                            <>Verifying Your <span className="text-red-600">ForenSync</span> Account</>
                        ) : (
                            <>{pageStatus}</>
                        )}
                    </h1>
                    <p className="text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">
                        Please wait...
                    </p>
                </div>

                {!showModal && (
                    <div className="w-64 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-full bg-red-600 shadow-[0_0_15px_rgba(225,29,72,0.8)]"
                        />
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed z-50 w-full max-w-md p-6"
                        >
                            <div className="glass-card-theme p-8 bg-slate-900 border border-white/10 shadow-2xl rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-800" />
                                
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
                                    <p className="text-gray-400 text-sm">Please finalize your profile by adding your phone number.</p>
                                </div>

                                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-300 mb-2 font-bold text-sm">Phone Number</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-600/50 transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {loading ? <FaSpinner className="animate-spin" /> : 'Complete Profile'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SSOLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold uppercase tracking-widest">
                Loading...
            </div>
        }>
            <SSOLoginContent />
        </Suspense>
    );
}
