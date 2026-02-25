'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCloudUploadAlt, FaFilePdf, FaImage, FaFileAlt, FaDownload, FaTimes, FaSpinner } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function ResourceListPage() {
    const params = useParams();
    const router = useRouter();
    const { degree, semester, type } = params;

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        file: null
    });

    const typeLabels = {
        notes: 'Notes',
        pyq: 'Previous Year Questions',
        books: 'Books & References'
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await axios.get(`/api/academic/get?degree=${degree}&semester=${semester}&type=${type}`);
            if (response.data.success) {
                setResources(response.data.resources);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadForm({ ...uploadForm, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file || !uploadForm.title) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', uploadForm.file);
        formData.append('title', uploadForm.title);
        formData.append('degree', degree);
        formData.append('semester', semester);
        formData.append('type', type);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/academic/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUploadForm({ title: '', file: null });
                setShowUploadModal(false);
                fetchResources(); // Refresh list
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500 text-3xl" />;
        if (fileType?.includes('image')) return <FaImage className="text-blue-500 text-3xl" />;
        return <FaFileAlt className="text-gray-500 text-3xl" />;
    };

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />
            <Navbar />

            <div className="container mx-auto px-6 py-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                    >
                        <FaCloudUploadAlt />
                        <span>Upload Material</span>
                    </button>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{typeLabels[type]}</h1>
                    <p className="text-gray-300">
                        {degree?.toUpperCase()} • Semester {semester}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <FaSpinner className="animate-spin text-white text-3xl" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <FaFileAlt className="text-6xl text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
                        <p className="text-gray-400">Be the first to upload {typeLabels[type].toLowerCase()} for this semester!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource) => (
                            <motion.div
                                key={resource._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-white/10 rounded-lg">
                                        {getFileIcon(resource.fileType)}
                                    </div>
                                    <a
                                        href={resource.fileUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                        title="Download"
                                    >
                                        <FaDownload />
                                    </a>
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-1 truncate" title={resource.title}>
                                    {resource.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
                                    <span>By {resource.uploadedBy?.name || 'Unknown'}</span>
                                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUploadModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6">Upload Material</h2>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Subject / Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="e.g., Mathematics, Physics Notes"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        File (PDF, Image)
                                    </label>
                                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer group relative">
                                        <input
                                            type="file"
                                            required
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <FaCloudUploadAlt className="text-4xl text-gray-500 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                            {uploadForm.file ? uploadForm.file.name : 'Click to select or drag file here'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {uploading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <span>Submit Upload</span>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ChatbotWidget />
        </div>
    );
}
