'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaArrowLeft, FaSearch, FaFilter, FaUserGraduate, FaChevronRight, FaClock } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function ApplicationsReceivedPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin' && parsedUser.role !== 'super-admin') {
            router.push('/dashboard/student');
            return;
        }
        setUser(parsedUser);

        // Load applications from localStorage
        const savedApps = localStorage.getItem('applications');
        if (savedApps) {
            const allApps = JSON.parse(savedApps);
            // Only show Pending applications in the new applications list
            const pendingApps = allApps.filter(app => app.status === 'Pending');
            setApplications(pendingApps);
        }
        setLoading(false);
    }, [router]);

    const filteredApps = applications.filter(app =>
        app?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />
            <Navbar />

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <button
                                onClick={() => router.push('/dashboard/admin')}
                                className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-bold mb-4"
                            >
                                <FaArrowLeft />
                                <span>Back to Staff Portal</span>
                            </button>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                                <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-xl shadow-purple-500/20">
                                    <FaClipboardList />
                                </div>
                                Applications Received
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="relative flex-1 md:w-80">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by student or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                                />
                            </div>
                            <button className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 dark:text-gray-400 hover:text-purple-500 transition-all shadow-lg">
                                <FaFilter />
                            </button>
                        </motion.div>
                    </div>

                    {/* Applications List */}
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredApps.length > 0 ? (
                                filteredApps.map((app, index) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => router.push(`/dashboard/admin/applications/${app.id}`)}
                                        className="glass-card-theme p-5 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all cursor-pointer group border-slate-200 dark:border-white/10 shadow-md hover:shadow-xl"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-5">
                                                {/* Student Profile Pic */}
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-lg group-hover:border-purple-500/50 transition-colors">
                                                        {app?.student?.avatar ? (
                                                            <img src={app.student.avatar} alt={app.student.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                                                {app?.student?.name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-[#1e293b] rounded-full shadow-lg" title="Active Student" />
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                                                        {app?.student?.name || 'Anonymous Student'}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-gray-300 font-bold text-sm tracking-tight line-clamp-1">
                                                        {app?.subject || 'No Subject'}
                                                    </p>
                                                </div>
                                            </div>

                                            <FaChevronRight className="text-gray-300 dark:text-white/20 group-hover:text-purple-500 transition-all group-hover:translate-x-1" />
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 glass-card-theme"
                                >
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FaClipboardList className="text-4xl text-slate-300 dark:text-white/10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No applications found</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Applications submitted by students will appear here.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
