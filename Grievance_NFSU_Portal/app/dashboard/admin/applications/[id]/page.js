'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaArrowLeft, FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaImage } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function ApplicationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);

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

        // Load specific application
        const savedApps = JSON.parse(localStorage.getItem('applications') || '[]');
        const app = savedApps.find(a => a.id === params.id);

        if (app) {
            setApplication(app);
        } else {
            router.push('/dashboard/admin/applications');
        }
        setLoading(false);
    }, [router, params.id]);

    const handleAction = async (newStatus) => {
        setIsProcessing(true);
        try {
            // Update local storage representation of the application
            const savedApps = JSON.parse(localStorage.getItem('applications') || '[]');
            const updatedApps = savedApps.map(app => {
                if (app.id === application.id) {
                    return { ...app, status: newStatus };
                }
                return app;
            });
            localStorage.setItem('applications', JSON.stringify(updatedApps));
            setApplication({ ...application, status: newStatus });

            const token = localStorage.getItem('token');
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Notify the student
            if (application.student?.id && application.student.id !== 'unknown') {
                const message = newStatus === 'Approved'
                    ? `Your application "${application.subject}" has been accepted!`
                    : `Your application "${application.subject}" has been declined.`;

                await axios.post('/api/notifications/send', {
                    targetUserId: application.student.id,
                    type: 'status_update',
                    title: `Application ${newStatus}`,
                    message: message,
                    link: '/application/status'
                }, authConfig).catch(err => console.error("Student notification failed:", err));
            }

            // 2. Notify all staff
            const staffMessage = newStatus === 'Approved'
                ? `Application "${application.subject}" by ${application.student?.name || 'a student'} was approved.`
                : `Application "${application.subject}" by ${application.student?.name || 'a student'} was rejected.`;

            await axios.post('/api/notifications/broadcast-staff', {
                type: 'resolution',
                title: `Application ${newStatus}`,
                message: staffMessage,
                link: `/dashboard/admin/applications/${application.id}`
            }, authConfig).catch(err => console.error("Staff broadcast failed:", err));

            alert(`Application has been ${newStatus.toLowerCase()}!`);

            // Redirect back to the applications list since this one is now processed
            router.push('/dashboard/admin/applications');
        } catch (error) {
            console.error("Action error:", error);
            alert("Failed to process the requested action.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !application) {
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
                <div className="max-w-5xl mx-auto">
                    {/* Back Navigation */}
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push('/dashboard/admin/applications')}
                        className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-bold mb-8 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Applications</span>
                    </motion.button>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Student Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            <div className="glass-card-theme p-8 text-center">
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-purple-500/20 shadow-2xl">
                                        {application?.student?.avatar ? (
                                            <img src={application.student.avatar} alt={application.student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl">
                                                {application?.student?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2.5 rounded-2xl shadow-xl">
                                        <FaUserGraduate className="text-xl" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                    {application?.student?.name || 'Anonymous Student'}
                                </h2>
                                <p className="text-purple-500 text-sm font-black uppercase tracking-widest mb-6">
                                    Student Profile
                                </p>

                                <div className="space-y-4 text-left">
                                    <div className="flex items-center space-x-4 p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 group hover:border-purple-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                            <FaIdCard />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Enrollment</p>
                                            <p className="text-slate-900 dark:text-white font-black">{application?.student?.enrollmentNumber || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 group hover:border-purple-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                            <FaPhone />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact</p>
                                            <p className="text-slate-900 dark:text-white font-black">{application?.student?.phone || 'Not Provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 group hover:border-purple-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                                            <p className="text-slate-900 dark:text-white font-black truncate max-w-[150px]">{application?.student?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Application Content Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            <div className="glass-card-theme p-8 md:p-10">
                                {/* Status & Date Header */}
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${application.status === 'Pending' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 'text-green-500 border-green-500/20 bg-green-500/5'
                                            }`}>
                                            Status: {application.status}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                                            <FaCalendarAlt />
                                            {new Date(application.submittedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction('Rejected')}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                            title="Reject Application"
                                            disabled={isProcessing}
                                        >
                                            <FaTimesCircle className="text-lg" />
                                            {isProcessing && <span className="text-xs">Processing...</span>}
                                        </button>
                                        <button
                                            onClick={() => handleAction('Approved')}
                                            className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                            title="Approve Application"
                                            disabled={isProcessing}
                                        >
                                            <FaCheckCircle className="text-lg" />
                                            {isProcessing && <span className="text-xs">Processing...</span>}
                                        </button>
                                    </div>
                                </div>

                                {/* Application Body */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                        <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Application Subject</h3>
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                                        {application.subject}
                                    </h1>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                        <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Detailed Content</h3>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-slate-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap font-medium font-bold">
                                            {application.body}
                                        </p>
                                    </div>
                                </div>

                                {/* Attachments */}
                                {application.images && application.images.length > 0 && (
                                    <div className="mt-12">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Attachments</h3>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {application.images.map((img, idx) => (
                                                <div key={idx} className="relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl">
                                                    <img src={img} alt={`Attachment ${idx + 1}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 text-white font-bold">
                                                            <FaImage /> Attachment {idx + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
