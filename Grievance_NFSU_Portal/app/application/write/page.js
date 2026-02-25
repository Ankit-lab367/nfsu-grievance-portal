'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaImage, FaTimes, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function WriteApplicationPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
    }, [router]);

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setImages(prev => [...prev, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => {
            const reader = new FileReader();
            return new Promise(resolve => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviews).then(resolved => {
            setPreviews(prev => [...prev, ...resolved]);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) {
            alert('Please fill in both the subject and the application body.');
            return;
        }

        setIsSubmitting(true);

        const applicationData = {
            id: 'APP-' + Date.now(),
            subject,
            body,
            images: previews, // Store all preview strings
            submittedAt: new Date().toISOString(),
            status: 'Pending',
            student: {
                id: user?.id || user?._id || 'unknown',
                name: user?.name || 'Anonymous',
                email: user?.email || '',
                enrollmentNumber: user?.enrollmentNumber || '',
                phone: user?.phone || '',
                avatar: user?.avatar || ''
            }
        };

        // Persist to localStorage
        const existingApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        localStorage.setItem('applications', JSON.stringify([applicationData, ...existingApplications]));

        setTimeout(() => {
            alert('Your application got submitted');
            setIsSubmitting(false);
            router.push('/dashboard/student');
        }, 1500);
    };

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            {/* Background Decorations */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            <Navbar />

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 flex items-center justify-between"
                    >
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
                        >
                            <FaArrowLeft />
                            <span>Back</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-theme p-8 border border-slate-200 dark:border-white/10 shadow-2xl"
                    >
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Write New Application</h1>
                            <p className="text-slate-500 dark:text-gray-400 font-medium font-bold">Compose a formal application for university administration.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject Field */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm tracking-wide uppercase">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief title of your application..."
                                    className="w-full px-5 py-4 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                                />
                            </div>

                            {/* Body Field */}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm tracking-wide uppercase">
                                    Full Application Body
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={15}
                                    placeholder="Write your detailed application here..."
                                    className="w-full px-5 py-4 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium resize-none leading-relaxed"
                                />
                                <div className="mt-2 text-xs text-slate-400 dark:text-gray-500 flex items-center font-medium">
                                    <FaInfoCircle className="mr-1" />
                                    <span>Provide all necessary details for faster processing.</span>
                                </div>
                            </div>

                            {/* Optional Image Upload */}
                            <div className="pt-4">
                                <label className="block text-slate-700 dark:text-gray-300 mb-4 font-bold text-sm tracking-wide uppercase">
                                    Attachments (Optional)
                                </label>

                                <label className="flex flex-col items-center justify-center h-48 w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all group relative">
                                    <div className="flex flex-col items-center justify-center p-6 text-slate-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                                        <FaImage className="text-4xl mb-3" />
                                        <p className="font-bold text-sm mb-1 uppercase tracking-wider text-center px-4">Click to upload pictures</p>
                                        <p className="text-xs">PNG, JPG up to 10MB each</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                </label>

                                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                        {previews.map((preview, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group shadow-lg"
                                            >
                                                <img src={preview} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all transform hover:scale-110"
                                                    >
                                                        <FaTimes className="text-sm" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-8 text-center">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center mx-auto space-x-3 active:scale-95"
                                >
                                    <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                                    <FaPaperPlane className={isSubmitting ? 'animate-pulse' : ''} />
                                </button>
                                <p className="mt-4 text-xs text-slate-500 dark:text-gray-400 font-medium">
                                    Once submitted, you can track the status in your dashboard.
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
