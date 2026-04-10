'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FaFileAlt,
    FaClock,
    FaCheckCircle,
    FaExclamationCircle,
    FaPlus,
    FaChartLine,
    FaHistory,
    FaCommentDots,
    FaEnvelope,
    FaBell,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
export default function StudentDashboard() {
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
        if (parsedUser.role !== 'student') {
            router.push('/login');
            return;
        }
        
        // Check for 2-step verification
        if (!parsedUser.isVerifiedID) {
            router.push('/verify-id');
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
    const statCards = [
        {
            title: 'Total Complaints',
            value: stats.total,
            icon: <FaFileAlt className="text-3xl" />,
            color: 'from-red-600 to-red-700',
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: <FaClock className="text-3xl" />,
            color: 'from-yellow-500 to-yellow-600',
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            icon: <FaExclamationCircle className="text-3xl" />,
            color: 'from-orange-500 to-orange-600',
        },
        {
            title: 'Resolved',
            value: stats.resolved,
            icon: <FaCheckCircle className="text-3xl" />,
            color: 'from-green-500 to-green-600',
        },
    ];

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
                            href="/dashboard/student/notices"
                            className="relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-red-600/30 transition-all active:scale-95"
                        >
                            <FaBell />
                            <span>Notices</span>
                            {hasNotices && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                </span>
                            )}
                        </Link>
                    </div>
                </motion.div>
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
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
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-lg text-white`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/complaint/create"
                        className="glass-card-theme p-6 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group border-slate-200 dark:border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-800 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <FaPlus className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg">New Complaint</h3>
                                <p className="text-gray-400 text-sm">Register a new grievance</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/complaint/track"
                        className="glass-card-theme p-6 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group border-slate-200 dark:border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <FaChartLine className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg">Track Complaint</h3>
                                <p className="text-gray-400 text-sm">Check complaint status</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/complaint/history"
                        className="glass-card-theme p-6 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group cursor-pointer border-slate-200 dark:border-white/10 shadow-lg"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <FaHistory className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg">History</h3>
                                <p className="text-gray-400 text-sm">View all complaints</p>
                            </div>
                        </div>
                    </Link>
                </div>
                {}
                <div className="glass-card-theme p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Active Complaints</h2>
                    {complaints.filter(c => c.status !== 'Resolved').length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 mb-4">No complaints yet</p>
                            <Link
                                href="/complaint/create"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-lg hover:shadow-lg transition-all"
                            >
                                Create Your First Complaint
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.filter(c => c.status !== 'Resolved').slice(0, 5).map((complaint) => (
                                <div
                                    key={complaint._id}
                                    onClick={(e) => {
                                        if (e.target.closest('button')) return;
                                        if (complaint?.complaintId) {
                                            router.push(`/complaint/${complaint.complaintId}`);
                                        }
                                    }}
                                    className="block bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all border border-white/10 hover:border-red-400/50 cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-slate-900 dark:text-white font-semibold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-lg"
                                                >
                                                    {complaint.title}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${complaint.votes?.votedBy?.some(v => v.userId === user?.id && v.voteType === 'up')
                                                            ? 'text-green-400 bg-green-400/10 shadow-[0_0_10px_rgba(74,222,128,0.3)]'
                                                            : 'text-gray-500'
                                                            }`}
                                                        title="Correct/Helpful votes"
                                                    >
                                                        <FaCheckCircle className={complaint.votes?.votedBy?.some(v => v.userId === user?.id && v.voteType === 'up') ? "animate-pulse" : ""} />
                                                        <span className="font-bold">{complaint.votes?.upvotes || 0}</span>
                                                    </div>
                                                    <div
                                                        className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${complaint.votes?.votedBy?.some(v => v.userId === user?.id && v.voteType === 'down')
                                                            ? 'text-red-400 bg-red-400/10 shadow-[0_0_10px_rgba(248,113,113,0.3)]'
                                                            : 'text-gray-500'
                                                            }`}
                                                        title="Wrong/Unhelpful votes"
                                                    >
                                                        <FaExclamationCircle className={complaint.votes?.votedBy?.some(v => v.userId === user?.id && v.voteType === 'down') ? "animate-pulse" : ""} />
                                                        <span className="font-bold">{complaint.votes?.downvotes || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}