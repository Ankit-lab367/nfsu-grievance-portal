'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { FaCheckCircle, FaArrowLeft, FaFileUpload, FaTimes, FaSpinner, FaImage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResolveComplaintPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [complaint, setComplaint] = useState(null);
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin' && parsedUser.role !== 'super-admin') {
                router.push('/dashboard/student');
                return;
            }
            setCurrentUser(parsedUser);
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/complaints/get?complaintId=${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success && response.data.complaints.length > 0) {
                    setComplaint(response.data.complaints[0]);
                } else {
                    setError('Complaint not found');
                }
            } catch (err) {
                setError('Failed to fetch complaint details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchComplaint();
    }, [id]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);

        // Generate previews
        const newPreviews = selectedFiles.map(file => {
            const reader = new FileReader();
            return new Promise(resolve => {
                reader.onloadend = () => resolve({ url: reader.result, name: file.name });
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviews).then(resolvedPreviews => {
            setPreviews(prev => [...prev, ...resolvedPreviews]);
        });
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please provide a resolution description');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('complaintId', complaint._id);
            formData.append('status', 'Resolved');
            formData.append('remarks', 'Complaint has been officially resolved.');
            formData.append('resolutionDescription', description);

            files.forEach(file => {
                formData.append('proof', file);
            });

            const response = await axios.patch('/api/complaints/update', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert('Complaint resolved successfully!');
                router.push(`/complaint/${id}`);
            }
        } catch (err) {
            console.error('Resolution failed:', err);
            setError(err.response?.data?.error || 'Failed to resolve complaint');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (error && !complaint) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-white">
                <p className="text-xl font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-inter">
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
                    className="max-w-3xl mx-auto glass-card-theme p-8 border-slate-200 dark:border-white/10 shadow-2xl"
                >
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors font-bold"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Complaint Details
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Resolve Complaint</h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium tracking-tight">
                            Document the solution and provide proof for Complaint <span className="text-blue-400 font-bold">#{complaint.complaintId}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Resolution Description */}
                        <div>
                            <label className="block text-slate-700 dark:text-gray-300 mb-2 font-bold text-sm tracking-wide uppercase">
                                Solution Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={8}
                                placeholder="Detail exactly how the problem was solved..."
                                className="w-full px-5 py-4 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium resize-none leading-relaxed"
                            />
                        </div>

                        {/* Multi-Image Upload */}
                        <div>
                            <label className="block text-slate-700 dark:text-gray-300 mb-4 font-bold text-sm tracking-wide uppercase">
                                Proof of Resolution (Images/Optional)
                            </label>

                            <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all group cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <FaFileUpload className="text-4xl text-slate-400 dark:text-gray-500 mb-3 group-hover:scale-110 transition-transform duration-200" />
                                    <p className="text-slate-600 dark:text-gray-300 font-bold uppercase tracking-wider text-sm">Click to upload pictures</p>
                                    <p className="text-slate-400 dark:text-gray-500 text-xs mt-2 font-medium">PNG, JPG up to 10MB per file</p>
                                </div>
                            </div>

                            {/* Image Previews */}
                            <AnimatePresence>
                                {previews.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4"
                                    >
                                        {previews.map((preview, index) => (
                                            <motion.div
                                                key={index}
                                                layout
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group shadow-lg"
                                            >
                                                <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-xl"
                                                    >
                                                        <FaTimes size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 hover:shadow-green-600/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
                            >
                                {submitting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>Saving Resolution...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle />
                                        <span>Submit Resolution</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-4 bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-white rounded-2xl font-bold hover:bg-slate-900/10 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
