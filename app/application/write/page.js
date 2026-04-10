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
        if (!subject.trim() || !body.trim()) {
            alert('Please fill in both the subject and the application body.');
            return;
        }
        setIsSubmitting(true);
        try {
            const compressedImages = await Promise.all(
                previews.map(p => compressImage(p))
            );
            const applicationData = {
                id: 'APP-' + Date.now(),
                subject,
                body,
                images: compressedImages,
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
            const existingApplications = JSON.parse(localStorage.getItem('applications') || '[]');
            localStorage.setItem('applications', JSON.stringify([applicationData, ...existingApplications]));
            alert('Your application got submitted');
            setIsSubmitting(false);
            router.push('/dashboard/student');
        } catch (error) {
            console.error('Application submit error:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Upload failed: The images are too large even after compression. Please try smaller photos or remove some attachments.');
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
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
                            className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
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
                            {}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm tracking-wide uppercase">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Brief title of your application..."
                                    className="w-full px-5 py-4 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-medium"
                                />
                            </div>
                            {}
                            <div>
                                <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm tracking-wide uppercase">
                                    Full Application Body
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={15}
                                    placeholder="Write your detailed application here..."
                                    className="w-full px-5 py-4 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-medium resize-none leading-relaxed"
                                />
                                <div className="mt-2 text-xs text-slate-400 dark:text-gray-500 flex items-center font-medium">
                                    <FaInfoCircle className="mr-1" />
                                    <span>Provide all necessary details for faster processing.</span>
                                </div>
                            </div>
                            {}
                            <div className="pt-4">
                                <label className="block dark:text-gray-300 mb-4 font-bold text-sm tracking-wide uppercase">
                                    Attachments (Optional)
                                </label>
                                <label className="flex flex-col items-center justify-center h-48 w-full border-2 border-dashed border-white/10 rounded-2xl cursor-pointer dark:hover:bg-white/5 transition-all group relative">
                                    <div className="flex flex-col items-center justify-center p-6 dark:text-gray-500 group-hover:text-red-500 transition-colors">
                                        <FaImage className="text-4xl mb-3" />
                                        <p className="font-bold text-sm mb-1 uppercase tracking-wider text-center px-4">Click to upload pictures</p>
                                        <p className="text-xs">PNG, JPG up to 10MB each</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                        multiple
                                        accept="image/*"
                                    />
                                </label>
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {previews.map((preview, index) => (
                                        <div 
                                            key={index} 
                                            className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group shadow-lg"
                                        >
                                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg active:scale-90 transition-transform"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-8 text-center">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-12 py-4 bg-gradient-to-r from-red-700 to-rose-800 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-red-500/40 transition-all disabled:opacity-50 flex items-center justify-center mx-auto space-x-3 active:scale-95"
                                >
                                    <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                                    <FaPaperPlane className={isSubmitting ? 'animate-pulse' : ''} />
                                </button>
                                <p className="mt-4 text-xs dark:text-gray-400 font-medium">
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