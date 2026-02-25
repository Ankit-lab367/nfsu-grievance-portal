'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

export default function PublishItemPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        type: 'lost',
        location: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newItem = {
            id: Date.now().toString(),
            ...formData,
            image: imagePreview, // Save base64 for demo persistence
            time: 'Just now',
            timestamp: new Date().toISOString(),
            uploaderId: storedUser.email || 'anonymous'
        };

        // Simulate API call and persist to localStorage
        setTimeout(() => {
            const existingItems = JSON.parse(localStorage.getItem('lost_and_found_items') || '[]');
            localStorage.setItem('lost_and_found_items', JSON.stringify([newItem, ...existingItems]));

            alert('Submitted successfully!');
            router.push('/lost-and-found');
        }, 1500);
    };

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            {/* Background Effects */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            <Navbar />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-2xl mx-auto">
                    <Link href="/lost-and-found" className="inline-flex items-center text-blue-500 hover:text-blue-400 font-medium transition-colors mb-6 group">
                        <FaArrowLeft className="mr-2 text-sm transition-transform group-hover:-translate-x-1" /> Back to Listing
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-theme p-8 md:p-10 border-slate-200 dark:border-white/10 shadow-2xl"
                    >
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Publish an Item</h1>
                        <p className="text-slate-500 dark:text-gray-400 mb-8">Fill in the details below to report a lost or found item.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Lost/Found Toggle */}
                            <div className="flex gap-4 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'lost' })}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${formData.type === 'lost'
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Report Lost
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'found' })}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${formData.type === 'found'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Report Found
                                </button>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Lost Blue Milton Bottle"
                                    className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Location Found/Lost</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cafeteria, Block C, Library"
                                    className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Item Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl cursor-pointer hover:border-blue-500 transition-all bg-white/5 group-hover:bg-blue-500/5"
                                    >
                                        {imagePreview ? (
                                            <div className="relative w-full h-full p-2">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                    <span className="text-white font-bold text-sm">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                                                <p className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors font-medium">Click to upload or drag & drop</p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Image only (Max 5MB)</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Provide more details about the item..."
                                    className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-xl shadow-blue-500/20 transition-all ${loading
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Publishing...</span>
                                    </div>
                                ) : (
                                    "Submit Publication"
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
