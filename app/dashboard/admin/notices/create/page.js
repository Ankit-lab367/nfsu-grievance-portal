'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CreateNoticeForm from '@/components/CreateNoticeForm';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import ChatbotWidget from '@/components/ChatbotWidget';
export default function CreateNoticePage() {
    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <Link
                        href="/dashboard/admin"
                        className="inline-flex items-center dark:text-gray-400 hover:text-red-500 mb-6 transition-colors font-bold"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <div className="glass-card-theme p-8 border-white/10 shadow-2xl">
                        <h1 className="text-3xl font-bold dark:text-white mb-2">Create New Notice</h1>
                        <p className="text-slate-600 dark:text-gray-400 mb-8">
                            Publish announcements for students, staff, or both.
                        </p>
                        <CreateNoticeForm />
                    </div>
                </motion.div>
            </div>
            <ChatbotWidget />
        </div>
    );
}