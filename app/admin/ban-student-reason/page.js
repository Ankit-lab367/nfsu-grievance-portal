'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBan, FaPaperPlane, FaImage, FaTimes, FaExclamationTriangle, FaUser } from 'react-icons/fa';
import axios from 'axios';

function BanReasonContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get('userId');
    
    const [student, setStudent] = useState(null);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!token || !userData) {
            alert('Please log in as an administrator first.');
            router.push('/login');
            return;
        }

        const userObj = JSON.parse(userData);
        if (userObj.role !== 'super-admin') {
            alert('Access Denied: Super-Administrator role required.');
            router.push('/');
            return;
        }

        if (!userId) {
            router.push('/');
            return;
        }

        const fetchStudent = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/admin/student-info?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setStudent(response.data.user);
                } else {
                    alert('Student not found');
                    router.push('/dashboard/admin');
                }
            } catch (err) {
                console.error(err);
                alert('Error loading student info');
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [userId, router]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('comment', comment);
            images.forEach((img, i) => {
                formData.append(`images`, img.file);
            });

            const response = await axios.post('/api/admin/ban-student', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/admin');
                }, 3000);
            }
        } catch (err) {
            console.error('Full Error:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to ban student';
            const errorDetail = err.response?.data?.details || '';
            alert(`ERROR: ${errorMsg}\n\n${errorDetail.substring(0, 200)}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#00ff00] font-mono">
            <div className="text-2xl animate-pulse tracking-[0.5em]">LOADING SECURITY SECTOR...</div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#00ff00] font-mono p-6">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card-theme p-12 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center max-w-md"
            >
                <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <FaBan className="text-5xl text-red-600" />
                </div>
                <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">PROTOCOL EXECUTED</h2>
                <p className="text-gray-400 mb-8">The user has been terminated. Ban notice with your comment has been dispatched to their Gmail.</p>
                <div className="text-xs opacity-50">REDIRECTING TO COMMAND CENTER...</div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050202] text-white p-6 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-900/10 blur-[150px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl glass-card-theme p-8 relative z-10 border border-white/10"
            >
                <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-white/5">
                    <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center">
                        <FaExclamationTriangle className="text-3xl text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Ban Protocol</h1>
                        <p className="text-gray-400">Specify reason for termination and notify the user.</p>
                    </div>
                </div>

                <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 mb-8 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg">
                        {student?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold">{student?.name}</p>
                        <p className="text-xs text-gray-400">{student?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Reason / Comment to User</label>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            placeholder="Write the reason why this user is being banned. This will be sent to their email..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-white placeholder-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Evidence / Attachments (Optional)</label>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                    <img src={img.preview} alt="Evidence" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all text-gray-500 hover:text-white">
                                <FaImage className="text-2xl mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Add Pic</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${
                                submitting 
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]'
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Executing...</span>
                                </>
                            ) : (
                                <>
                                    <FaBan />
                                    <span>Confirm Ban & Notify User</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function BanReasonPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <BanReasonContent />
        </Suspense>
    );
}
