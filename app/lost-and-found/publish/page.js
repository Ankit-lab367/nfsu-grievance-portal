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
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalImage = imagePreview;
            if (imagePreview) {
                finalImage = await compressImage(imagePreview);
            }

            const token = localStorage.getItem('token');
            const res = await fetch('/api/lost-and-found', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: formData.subject,
                    description: formData.description,
                    type: formData.type,
                    location: formData.location,
                    image: finalImage
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Submitted successfully!');
                router.push('/lost-and-found');
            } else {
                alert(data.message || 'Failed to submit item');
                setLoading(false);
            }
        } catch (error) {
            console.error('Lost & Found upload error:', error);
            if (error.name === 'QuotaExceededError' || error.message.includes('413')) {
                alert('Upload failed: The image is too large even after compression. Please try a smaller photo.');
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-2xl mx-auto">
                    <Link href="/lost-and-found" className="inline-flex items-center text-red-500 hover:text-red-400 font-medium transition-colors mb-6 group">
                        <FaArrowLeft className="mr-2 text-sm transition-transform group-hover:-translate-x-1" /> Back to Listing
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-theme p-8 md:p-10 border-white/10 shadow-2xl"
                    >
                        <h1 className="text-3xl font-bold dark:text-white mb-2">Publish an Item</h1>
                        <p className="dark:text-gray-400 mb-8">Fill in the details below to report a lost or found item.</p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {}
                            <div className="flex gap-4 p-1.5 dark:bg-white/5 rounded-2xl border border-white/10">
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
                                    id="lf-toggle-found"
                                    onClick={() => setFormData({ ...formData, type: 'found' })}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${formData.type === 'found'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Report Found
                                </button>
                            </div>
                            {}
                            <div>
                                <label className="block text-sm font-bold dark:text-gray-300 mb-2">Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Lost Blue Milton Bottle"
                                    className="w-full px-5 py-4 dark:bg-white/5 border border-white/10 rounded-2xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-inner"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            {}
                            <div>
                                <label className="block text-sm font-bold dark:text-gray-300 mb-2">Location Found/Lost</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cafeteria, Block C, Library"
                                    className="w-full px-5 py-4 dark:bg-white/5 border border-white/10 rounded-2xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-inner"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            {}
                            <div>
                                <label className="block text-sm font-bold dark:text-gray-300 mb-2">Item Image</label>
                                <div className="dark:bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all cursor-pointer relative group">
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    {imagePreview ? (
                                        <div className="relative h-48 w-full">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                <FaCloudUploadAlt className="text-white text-3xl" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <FaCloudUploadAlt className="text-4xl text-gray-500 mb-2 group-hover:text-red-500 transition-colors" />
                                            <p className="text-sm font-bold dark:text-gray-400">Click or drag photo here</p>
                                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest text-[10px]">JPG, PNG up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Provide more details about the item..."
                                    className="w-full px-5 py-4 dark:bg-white/5 border border-white/10 rounded-2xl dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-inner resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            {}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-xl shadow-red-500/20 transition-all ${loading
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-500 hover:to-rose-700'
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