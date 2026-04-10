'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import NoticeList from '@/components/NoticeList';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import ChatbotWidget from '@/components/ChatbotWidget';
export default function StudentNoticesPage() {
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
                    <Link
                        href="/dashboard/student"
                        className="inline-flex items-center text-slate-600 dark:text-gray-400 hover:text-red-500 mb-6 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <div className="glass-card-theme p-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">School Notices</h1>
                        <p className="text-slate-600 dark:text-gray-400 mb-8">
                            Stay updated with the latest announcements.
                        </p>
                        <NoticeList />
                    </div>
                </motion.div>
            </div>
            <ChatbotWidget />
        </div>
    );
}