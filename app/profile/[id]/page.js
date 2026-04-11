'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { FaUser, FaEnvelope, FaIdCard, FaGraduationCap, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const response = await axios.get(`/api/user/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setError('User not found');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to fetch profile information');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchProfile();
    }, [params.id, router]);

    const getYearDisplay = (year) => {
        if (!year) return '';
        const y = parseInt(year);
        if (y === 1) return '1st Year';
        if (y === 2) return '2nd Year';
        if (y === 3) return '3rd Year';
        return `${y}th Year`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner border-t-red-600" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <FaUser className="text-6xl text-gray-600 mb-4 opacity-20" />
                <h2 className="text-2xl font-bold mb-2">{error || 'User not found'}</h2>
                <button 
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-red-600 rounded-lg font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative dark:text-white transition-colors duration-500 overflow-hidden">
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="flex items-center mb-8">
                        <button 
                            onClick={() => router.back()}
                            className="mr-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-3xl font-bold">User Profile</h1>
                    </div>

                    <div className="glass-card-theme p-8 md:p-12 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-red-600/20 to-rose-900/20" />
                        <div className="relative flex flex-col items-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl mb-6 bg-white/5 dark:bg-slate-800">
                                <img
                                    src={user.avatar || '/assets/default-avatar.png'}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">{user.name}</h2>
                            <p className="dark:text-gray-400 mb-8 font-medium uppercase tracking-widest text-xs">{user.role}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center space-x-4">
                                    <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
                                        <FaIdCard className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Enrollment No</p>
                                        <p className="font-semibold">{user.enrollmentNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center space-x-4">
                                    <div className="p-3 bg-red-700/20 rounded-lg text-red-400">
                                        <FaGraduationCap className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Course / Year</p>
                                        <p className="font-semibold">
                                            {user.course ? `${user.course} ${user.year ? `- ${getYearDisplay(user.year)}` : ''}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center space-x-4 md:col-span-2">
                                    <div className="p-3 bg-red-500/20 rounded-lg text-red-500">
                                        <FaEnvelope className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Contact Email</p>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-12 text-xs text-gray-500 font-medium tracking-wider uppercase">
                                Member Since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
