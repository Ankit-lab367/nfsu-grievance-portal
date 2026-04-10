'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FaUserShield,
    FaTools,
    FaArrowLeft,
    FaChartPie,
    FaClipboardList,
    FaUsers,
    FaBell,
    FaComments,
    FaHistory,
    FaPlus,
    FaChartLine,
    FaCheckCircle,
    FaExclamationCircle,
    FaClock,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';
export default function StaffDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
    });
    const [complaints, setComplaints] = useState([]);
    const [hasNotices, setHasNotices] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin' && parsedUser.role !== 'super-admin' && parsedUser.role !== 'staff') {
            router.push('/dashboard/student');
            return;
        }
        setUser(parsedUser);
        fetchComplaints(token);
        checkNotices(token);
    }, [router]);
    const checkNotices = async (token) => {
        try {
            const response = await axios.get('/api/notices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success && response.data.notices.length > 0) {
                setHasNotices(true);
            }
        } catch (error) {
            console.error('Error checking notices:', error);
        }
    };
    const fetchComplaints = async (token) => {
        try {
            const response = await axios.get('/api/complaints/get', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                const data = response.data.complaints.filter(c => c.userId?.role === 'student');
                setComplaints(data);
                setStats({
                    total: data.length,
                    pending: data.filter((c) => c.status === 'Pending').length,
                    inProgress: data.filter((c) => c.status === 'In Progress').length,
                    resolved: data.filter((c) => c.status === 'Resolved').length,
                });
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative dark:bg-background-dark transition-colors duration-500">

            {}
            <Navbar />
            <div className="container mx-auto px-6 py-8 relative z-10">
                {}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="hidden md:block">
                        {}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/dashboard/admin/notices"
                            className="relative flex items-center space-x-2 px-6 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-md dark:text-white border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95"
                        >
                            <FaClipboardList className="text-red-500" />
                            <span>Notices</span>
                            {hasNotices && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/dashboard/admin/notices/create"
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-red-600/30 transition-all active:scale-95"
                        >
                            <FaBell />
                            <span>Upload Notice</span>
                        </Link>
                    </div>
                </motion.div>
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'Total Complaints', value: stats.total, icon: <FaClipboardList className="text-3xl" />, color: 'from-red-600 to-red-700' },
                        { title: 'Pending', value: stats.pending, icon: <FaClock className="text-3xl" />, color: 'from-yellow-500 to-yellow-600' },
                        { title: 'In Progress', value: stats.inProgress, icon: <FaExclamationCircle className="text-3xl" />, color: 'from-orange-500 to-orange-600' },
                        { title: 'Resolved', value: stats.resolved, icon: <FaCheckCircle className="text-3xl" />, color: 'from-green-500 to-green-600' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card-theme p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                                    <p className="text-3xl font-bold dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-lg text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/complaint/solve"
                        className="glass-card-theme p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all card-hover group border-white/10 shadow-lg text-left"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-800 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg">
                                <FaPlus className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="dark:text-white font-semibold text-lg">Upload Solved Complaint</h3>
                                <p className="text-gray-400 text-sm">Post a resolution document</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/complaint/track"
                        className="glass-card-theme p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all card-hover group border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg">
                                <FaChartLine className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="dark:text-white font-semibold text-lg">Track Complaint</h3>
                                <p className="text-gray-400 text-sm">Monitor system response</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/complaint/history"
                        className="glass-card-theme p-6 hover:bg-white/10 dark:hover:bg-white/10 transition-all card-hover group cursor-pointer border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg">
                                <FaHistory className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="dark:text-white font-semibold text-lg">History</h3>
                                <p className="text-gray-400 text-sm">Review all records</p>
                            </div>
                        </div>
                    </Link>
                </div>
                {}
                <div className="glass-card-theme p-6 mb-8 border-white/10">
                    <h2 className="text-2xl font-bold dark:text-white mb-6">Recent Active Complaints</h2>
                    {complaints.filter(c => c.status !== 'Resolved').length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No complaints logged in the system yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.filter(c => c.status !== 'Resolved').slice(0, 5).map((complaint) => (
                                <div
                                    key={complaint._id}
                                    onClick={() => router.push(`/complaint/${complaint.complaintId}`)}
                                    className="block bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all border border-white/10 hover:border-red-400/50 cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="dark:text-white font-semibold group-hover:text-red-400 transition-colors text-lg block mb-1">
                                                {complaint.title}
                                            </span>
                                            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-gray-400">
                                                <span>ID: {complaint.complaintId}</span>
                                                <span>•</span>
                                                <StatusBadge status={complaint.status} />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-400/10 text-green-500 rounded text-sm">
                                                <FaCheckCircle />
                                                <span className="font-bold">{complaint.votes?.upvotes || 0}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 px-2 py-1 bg-red-400/10 text-red-500 rounded text-sm">
                                                <FaExclamationCircle />
                                                <span className="font-bold">{complaint.votes?.downvotes || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
}