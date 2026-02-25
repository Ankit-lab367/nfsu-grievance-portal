'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCloudUploadAlt, FaTag, FaRupeeSign } from 'react-icons/fa';
import Link from 'next/link';

export default function SellItemPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        price: '',
        description: '',
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

    const compressImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Compress image if exists
            let finalImage = imagePreview;
            if (imagePreview) {
                finalImage = await compressImage(imagePreview);
            }

            // Create a clean object without the File object for storage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const newItem = {
                id: Date.now().toString(),
                subject: formData.subject,
                price: formData.price,
                description: formData.description,
                location: formData.location,
                image: finalImage,
                time: 'Just now',
                timestamp: new Date().toISOString(),
                uploaderId: storedUser.email || 'anonymous'
            };

            // Persist to localStorage with error handling
            const existingItems = JSON.parse(localStorage.getItem('marketplace_items') || '[]');
            localStorage.setItem('marketplace_items', JSON.stringify([newItem, ...existingItems]));

            setTimeout(() => {
                alert('Item listed for sale successfully!');
                router.push('/marketplace');
            }, 500);
        } catch (error) {
            console.error('Marketplace upload error:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Upload failed: Even with compression, the image is too big. Please try a different photo.');
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
            setLoading(false);
        }
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
                    <Link href="/marketplace" className="inline-flex items-center text-blue-500 hover:text-blue-400 font-medium transition-colors mb-6 group">
                        <FaArrowLeft className="mr-2 text-sm transition-transform group-hover:-translate-x-1" /> Back to Marketplace
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-theme p-8 md:p-10 border-slate-200 dark:border-white/10 shadow-2xl"
                    >
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic">Sell Something</h1>
                        <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium">Turn your unused campus gear into cash. Set a fair price and start selling!</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-black text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-widest text-[10px]">What are you selling?</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Engineering Graphics Kit, Lab Coat (Size L)"
                                    className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-medium"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            {/* Price & Location Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-widest text-[10px]">Asking Price (₹)</label>
                                    <div className="relative">
                                        <FaRupeeSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="number"
                                            required
                                            placeholder="500"
                                            className="w-full pl-12 pr-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-black"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-widest text-[10px]">Pickup Location</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Hostel A, Library Entrance"
                                        className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-black text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-widest text-[10px]">Product Photo</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="marketplace-image-upload"
                                    />
                                    <label
                                        htmlFor="marketplace-image-upload"
                                        className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl cursor-pointer hover:border-green-500 transition-all bg-white/5 group-hover:bg-green-500/5 overflow-hidden"
                                    >
                                        {imagePreview ? (
                                            <div className="relative w-full h-full p-2">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                    <span className="text-white font-black text-sm uppercase tracking-widest">Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FaCloudUploadAlt className="text-5xl text-gray-400 group-hover:text-green-500 transition-colors mb-3" />
                                                <p className="text-sm text-gray-400 group-hover:text-green-400 transition-colors font-black uppercase tracking-widest">Click to upload photo</p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Show buyers what you've got!</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-black text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-widest text-[10px]">Item Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Condition, age, why you're selling, etc."
                                    className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition-all ${loading
                                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 shadow-green-500/20'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Listing Item...</span>
                                    </div>
                                ) : (
                                    "Launch into Marketplace 🚀"
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
