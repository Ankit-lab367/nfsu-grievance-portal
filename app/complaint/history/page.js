'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory, FaArrowLeft, FaCheckCircle, FaSearch, FaFilter, FaImages } from 'react-icons/fa';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';
export default function HistoryPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            fetchHistory(token);
        } else {
            router.push('/login');
        }
    }, [router]);
    const fetchHistory = async (token) => {
        try {
            const response = await axios.get('/api/complaints/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const resolved = response.data.complaints
                    .filter(c => c.status === 'Resolved')
                    .sort((a, b) => {
                        const dateA = new Date(a.resolutionDetails?.resolvedAt || 0);
                        const dateB = new Date(b.resolutionDetails?.resolvedAt || 0);
                        return dateB - dateA;
                    });
                setComplaints(resolved);
            }
        } catch (error) {
            console.error('Fetch history error:', error);
        } finally {
            setLoading(false);
        }
    };
    const filteredComplaints = complaints.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const getDashboardLink = () => {
        if (!user) return '/';
        return user.role === 'student' ? '/dashboard/student' : '/dashboard/admin';
    };
    return (
        <div className="min-h-screen relative transition-colors duration-500 overflow-hidden">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
                    >
                        <div>
                            <Link
                                href={getDashboardLink()}
                                className="inline-flex items-center text-red-500 hover:text-red-400 font-medium transition-colors mb-2"
                            >
                                <FaArrowLeft className="mr-2 text-sm" /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-extrabold dark:text-white flex items-center gap-4">
                                <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl border border-red-500/30">
                                    <FaHistory className="text-2xl" />
                                </div>
                                Resolution History
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative group flex-1 md:w-80">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search resolved complaints..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 dark:bg-white/5 border border-white/10 rounded-2xl dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium backdrop-blur-md"
                                />
                            </div>
                        </div>
                    </motion.div>
                    {}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="spinner" />
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card-theme p-20 text-center border-white/10 shadow-2xl"
                            >
                                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaHistory className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold dark:text-white mb-2">No Records Found</h3>
                                <p className="text-gray-400">We couldn't find any resolved complaints matching your criteria.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredComplaints.map((complaint, index) => (
                                    <motion.div
                                        key={complaint._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => router.push(`/complaint/${complaint.complaintId}`)}
                                        className="glass-card-theme p-6 group hover:bg-white/10 dark:hover:bg-white/10 transition-all cursor-pointer border-white/10 shadow-xl overflow-hidden relative"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
                                                        {complaint.department}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-red-800/10 text-red-500 rounded-md border border-red-500/20">
                                                        {complaint.category}
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-bold dark:text-white group-hover:text-red-500 transition-colors mb-1">
                                                    {complaint.title}
                                                </h2>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                                    <span>ID: {complaint.complaintId}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1.5 text-green-500">
                                                        <FaCheckCircle /> Resolved
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(complaint.resolutionDetails?.resolvedAt || complaint.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                {complaint.resolutionDetails?.proof?.length > 0 && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20">
                                                        <FaImages />
                                                        <span>{complaint.resolutionDetails.proof.length} Proof Pics</span>
                                                    </div>
                                                )}
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Resolved On</p>
                                                    <p className="text-sm font-bold dark:text-white">
                                                        {new Date(complaint.resolutionDetails?.resolvedAt || complaint.updatedAt).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
}