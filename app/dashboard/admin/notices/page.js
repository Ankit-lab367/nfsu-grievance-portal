'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import NoticeList from '@/components/NoticeList';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import ChatbotWidget from '@/components/ChatbotWidget';
export default function AdminNoticesPage() {
    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href="/dashboard/admin"
                            className="inline-flex items-center dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Dashboard
                        </Link>
                        <Link
                            href="/dashboard/admin/notices/create"
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                        >
                            <FaPlus />
                            Create Notice
                        </Link>
                    </div>
                    <div className="glass-card-theme p-8 border-white/10 shadow-lg">
                        <h1 className="text-3xl font-bold dark:text-white mb-2">Notice Board</h1>
                        <p className="text-slate-600 dark:text-gray-400 mb-8">
                            View and manage all active notices.
                        </p>
                        <NoticeList />
                    </div>
                </motion.div>
            </div>
            <ChatbotWidget />
        </div>
    );
}