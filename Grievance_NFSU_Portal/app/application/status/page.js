'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileInvoice, FaArrowLeft, FaSearch, FaClock, FaCheckCircle, FaExclamationCircle, FaPlus, FaChevronRight } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';

export default function ApplicationStatusPage() {
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
        setUser(parsedUser);

        // Load applications from localStorage
        const savedApps = localStorage.getItem('applications');
        if (savedApps) {
            const allApps = JSON.parse(savedApps);
            // Filter for student's own applications
            const ownApps = allApps.filter(app =>
                app.student?.id === parsedUser.id || app.student?.id === parsedUser._id
            );
            setApplications(ownApps);
        }
        setLoading(false);
    }, [router]);

    const filteredApps = applications.filter(app =>
        app.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
                                onClick={() => router.push('/dashboard/student')}
                                className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold mb-4"
                            >
                                <FaArrowLeft />
                                <span>Back to Dashboard</span>
                            </button>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                                    <FaFileInvoice />
                                </div>
                                My Applications
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
                                    placeholder="Search applications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                                />
                            </div>
                            <button
                                onClick={() => router.push('/application/write')}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                            >
                                <FaPlus />
                                <span className="hidden sm:inline">New Application</span>
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
                                        className="glass-card-theme p-5 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all group border-slate-200 dark:border-white/10 shadow-md hover:shadow-xl"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-5">
                                                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                                                    <FaFileInvoice className="text-2xl" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                                                        {app.subject}
                                                    </h3>
                                                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                                        <FaClock className="text-[10px]" />
                                                        <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>ID: {app.id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6">
                                                <div className="flex flex-col items-end">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.status === 'Pending'
                                                            ? 'text-orange-500 border-orange-500/20 bg-orange-500/5'
                                                            : app.status === 'Approved'
                                                                ? 'text-green-500 border-green-500/20 bg-green-500/5'
                                                                : 'text-red-500 border-red-500/20 bg-red-500/5'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <FaChevronRight className="text-gray-300 dark:text-white/20 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                                            </div>
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
                                        <FaFileInvoice className="text-4xl text-slate-300 dark:text-white/10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No applications found</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't submitted any applications yet.</p>
                                    <button
                                        onClick={() => router.push('/application/write')}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        Write Your First Application
                                    </button>
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
