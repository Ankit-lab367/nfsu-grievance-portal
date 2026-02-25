
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { FaCamera, FaSpinner, FaUser, FaEnvelope, FaIdCard, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await axios.get('/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setUser(response.data.user);
                    // Update local storage to keep navbar in sync
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.response?.status === 401) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.put('/api/user/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Force a page refresh or event to update navbar avatar if needed, 
                // but Navbar reads from localStorage on mount so a reload might be needed to see changes there immediately
                // For now, state update is enough for this page.
                window.dispatchEvent(new Event('storage')); // Trigger storage event for other tabs/components
                // Reload window to update Navbar
                window.location.reload();
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
                <div className="spinner border-slate-300 dark:border-white/10 border-t-blue-500" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />
            <Navbar />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <h1 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">My Profile</h1>

                    <div className="glass-card-theme p-8 md:p-12 border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

                        <div className="relative flex flex-col items-center">
                            {/* Avatar Upload */}
                            <div className="relative mb-6 group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative bg-slate-200 dark:bg-slate-800">
                                    <img
                                        src={user.avatar || '/assets/default-avatar.png'}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay for upload */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                                    >
                                        <FaCamera className="text-2xl mb-1" />
                                        <span className="text-xs font-medium">Change Photo</span>
                                    </div>

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                                            <FaSpinner className="animate-spin text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {user.role && (
                                    <div className="absolute bottom-2 right-2 px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-white/20">
                                        {user.role}
                                    </div>
                                )}
                            </div>

                            {/* User Name */}
                            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-slate-900 dark:text-white">{user.name}</h2>
                            <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium">{user.email}</p>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="bg-slate-900/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center space-x-4">
                                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                        <FaIdCard className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Enrollment No</p>
                                        <p className="font-semibold">{user.enrollmentNumber || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center space-x-4">
                                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                                        <FaGraduationCap className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Course / Year</p>
                                        <p className="font-semibold">
                                            {user.course ? `${user.course} ${user.year ? `(${user.year})` : ''}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center space-x-4 md:col-span-2">
                                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                        <FaEnvelope className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Contact Email</p>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
