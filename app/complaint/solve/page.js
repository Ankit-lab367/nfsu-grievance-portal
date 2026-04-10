'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaTools, FaSearch, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';
export default function SolvePortalPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin' && parsedUser.role !== 'super-admin') {
                router.push('/dashboard/student');
                return;
            }
            setUser(parsedUser);
            fetchInProgressComplaints(token);
        } else {
            router.push('/login');
        }
    }, [router]);
    const fetchInProgressComplaints = async (token) => {
        try {
            const response = await axios.get('/api/complaints/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const inProgress = response.data.complaints.filter(c => c.status === 'In Progress');
                setComplaints(inProgress);
            }
        } catch (error) {
            console.error('Fetch in-progress complaints error:', error);
        } finally {
            setLoading(false);
        }
    };
    const filteredComplaints = complaints.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaintId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="min-h-screen relative transition-colors duration-500 overflow-hidden">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
                    >
                        <div>
                            <Link
                                href="/dashboard/admin"
                                className="inline-flex items-center text-red-500 hover:text-red-400 font-medium transition-colors mb-2"
                            >
                                <FaArrowLeft className="mr-2 text-sm" /> Back to Staff Dashboard
                            </Link>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-4">
                                <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl border border-blue-500/30">
                                    <FaTools className="text-2xl" />
                                </div>
                                Solve Complaints
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                Manage and resolve grievances currently "In Progress"
                            </p>
                        </div>
                        <div className="relative group w-full md:w-80">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search active tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium backdrop-blur-md"
                            />
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
                                className="glass-card-theme p-20 text-center border-slate-200 dark:border-white/10 shadow-2xl"
                            >
                                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaCheckCircle className="text-4xl text-green-500/50" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Crystal Clear!</h3>
                                <p className="text-gray-400">There are no "In Progress" complaints waiting for resolution right now.</p>
                                <Link
                                    href="/dashboard/admin"
                                    className="inline-block mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                >
                                    Go to Pending Tasks
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredComplaints.map((complaint, index) => (
                                    <motion.div
                                        key={complaint._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card-theme p-6 group hover:bg-white/10 dark:hover:bg-white/10 transition-all border-slate-200 dark:border-white/10 shadow-xl overflow-hidden relative"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-orange-500/10 text-orange-500 rounded-md border border-orange-500/20 flex items-center gap-1.5">
                                                        <FaExclamationCircle className="text-[8px]" /> {complaint.priority} Priority
                                                    </span>
                                                    <StatusBadge status={complaint.status} />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-500 transition-colors mb-2">
                                                    {complaint.title}
                                                </h2>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                                    {complaint.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    <span>ID: {complaint.complaintId}</span>
                                                    <span>•</span>
                                                    <span>{complaint.department}</span>
                                                    <span>•</span>
                                                    <span>Started {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/complaint/${complaint.complaintId}/resolve`)}
                                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <span>Resolve Now</span>
                                                <FaArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                            </button>
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