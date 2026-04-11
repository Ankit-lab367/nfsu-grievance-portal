'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FaBuilding,
    FaUsers,
    FaChartBar,
    FaExclamationTriangle,
    FaUserPlus,
    FaCommentDots,
    FaEnvelope,
    FaSkull,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
export default function SuperAdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleGodMode = () => {
        const code = prompt('Enter Safety Code:');
        if (code === 'everythingdarkhere') {
            router.push('/test_dog');
        } else {
            alert('Access Denied: Incorrect safety code.');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'super-admin') {
            router.push('/login');
            return;
        }
        setUser(parsedUser);
        fetchData(token);
    }, [router]);
    const fetchData = async (token) => {
        try {
            const [statsRes, deptsRes] = await Promise.all([
                axios.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('/api/departments', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
            if (deptsRes.data.success) {
                setDepartments(deptsRes.data.departments);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-slate-900 overflow-hidden transition-colors duration-500">
            {/* Premium Background Image */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/background.jpeg" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900/80 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10">
                <Navbar />
                <div className="container mx-auto px-6 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Super Admin Dashboard</h1>
                            <p className="text-slate-300 font-medium">University-wide Overview & Management</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleGodMode}
                                className="flex items-center space-x-2 px-6 py-3 bg-slate-900/40 backdrop-blur-md text-red-500 rounded-xl font-black border-2 border-red-500/30 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-95 group"
                            >
                                <FaSkull className="group-hover:animate-pulse" />
                                <span>GOD MODE</span>
                            </button>
                            <button
                                onClick={() => alert('Personal Talking feature is under development.')}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95"
                            >
                                <FaCommentDots />
                                <span>Personal Talking</span>
                            </button>
                            <button
                                onClick={() => alert('Received Messages feature is under development.')}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold shadow-lg hover:shadow-red-600/30 transition-all active:scale-95"
                            >
                                <FaEnvelope />
                                <span>Received Messages</span>
                            </button>
                        </div>
                    </motion.div>
                {}
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-2">Total Complaints</p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalComplaints}</p>
                                        <p className="text-green-500 dark:text-green-400 text-sm mt-1 font-bold">
                                            {stats.resolutionRate}% resolved
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                        <FaChartBar className="text-3xl" />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-2">Active Students</p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white shadow-lg shadow-purple-500/20">
                                        <FaUsers className="text-3xl" />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-2">Departments</p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalDepartments}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white shadow-lg shadow-green-500/20">
                                        <FaBuilding className="text-3xl" />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-2">Avg Resolution Time</p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgResolutionTime}h</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white shadow-lg shadow-orange-500/20">
                                        <FaExclamationTriangle className="text-3xl" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        {}
                        <div className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-bold">Department Performance</h2>
                            <div className="space-y-4">
                                {stats.complaintsByDepartment?.map((dept, index) => (
                                    <div
                                        key={index}
                                        className="bg-slate-900/5 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-slate-900 dark:text-white font-bold">{dept._id}</h3>
                                            <span className="text-slate-500 dark:text-gray-400 text-sm font-bold">{dept.count} complaints</span>
                                        </div>
                                        <div className="w-full bg-slate-900/10 dark:bg-white/10 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-red-700 to-rose-800 h-2 rounded-full"
                                                style={{
                                                    width: `${(dept.count / stats.totalComplaints) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <button
                        onClick={() => {
                            const name = prompt('Admin name:');
                            const email = prompt('Admin email:');
                            const password = prompt('Password:');
                            if (name && email && password) {
                                alert('Admin creation feature - implement full form');
                            }
                        }}
                        className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group text-left"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-800 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <FaUserPlus className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg">Create Admin User</h3>
                                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Add new department administrator</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => alert('Department management feature - implement full interface')}
                        className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all card-hover group text-left"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                                <FaBuilding className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg">Manage Departments</h3>
                                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Add or edit departments</p>
                            </div>
                        </div>
                    </button>
                </div>
                {}
                <div className="glass-card-theme p-6 border-slate-200 dark:border-white/10 shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-bold">All Departments</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departments.map((dept) => (
                            <div
                                key={dept._id}
                                className="bg-slate-900/5 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:border-red-500/50"
                            >
                                <h3 className="text-slate-900 dark:text-white font-bold mb-2">{dept.name}</h3>
                                <p className="text-slate-500 dark:text-gray-400 text-sm mb-3 font-bold">{dept.email}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-500 font-bold border-t border-slate-200 dark:border-white/10 pt-3">
                                    <span>Total: {dept.complaintCount?.total || 0}</span>
                                    <span>Pending: {dept.complaintCount?.pending || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
}