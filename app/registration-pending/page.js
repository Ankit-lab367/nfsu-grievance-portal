'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaClock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function RegistrationPendingPage() {
    const router = useRouter();
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get('/api/auth/check-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.isActive) {
                    setIsApproved(true);
                    
                    // Update stored user data
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    userData.isActive = true;
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Show success message briefly then redirect
                    setTimeout(() => {
                        const role = response.data.role;
                        if (role === 'admin' || role === 'staff') {
                            router.push('/dashboard/admin');
                        } else if (role === 'super-admin') {
                            router.push('/dashboard/super-admin');
                        } else {
                            router.push('/dashboard/student');
                        }
                    }, 3000);
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        };

        const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [router]);
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-900/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="max-w-xl w-full text-center relative z-10">
                {isApproved ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card-theme p-10 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-6" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-4">Account Activated!</h2>
                        <p className="text-gray-300 text-lg mb-8">
                            Your verification is complete. We are redirecting you to your staff portal now...
                        </p>
                        <div className="flex justify-center">
                            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                        >
                            <FaClock className="text-4xl text-red-500 animate-pulse" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-white text-3xl md:text-5xl font-black mb-8 tracking-tight"
                        >
                            Verification Status
                        </motion.h1>

                        <div className="flex items-center justify-center mb-12 h-16">
                            <motion.div className="relative">
                                <motion.h2
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5, ease: "easeInOut", delay: 1 }}
                                    className="text-rose-400 text-2xl md:text-3xl font-bold whitespace-nowrap overflow-hidden border-r-4 border-rose-500 pr-2"
                                >
                                    Sorry, you need to wait for verification
                                </motion.h2>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 4 }}
                            className="space-y-6"
                        >
                            <p className="text-gray-300 max-w-md mx-auto text-lg">
                                Your staff registration is currently <span className="text-rose-500 font-bold">Pending Review</span>.
                            </p>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto italic">
                                The administrator has been notified. Please check your inbox for an activation confirmation soon.
                            </p>

                            <div className="pt-8">
                                <Link 
                                    href="/"
                                    className="inline-flex items-center space-x-2 text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-xl hover:shadow-red-600/30"
                                >
                                    <FaArrowLeft />
                                    <span>Back to Portal</span>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
