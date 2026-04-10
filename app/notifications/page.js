'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaArrowLeft, FaInbox, FaCircle } from 'react-icons/fa';
import Link from 'next/link';
export default function NotificationsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            fetchNotifications(token);
        } else {
            router.push('/login');
        }
    }, [router]);
    const fetchNotifications = async (token) => {
        try {
            const res = await axios.get('/api/notifications/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (err) {
            console.error('Fetch notifs error:', err);
        } finally {
            setLoading(false);
        }
    };
    const markAllAsRead = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch('/api/notifications/delete', { notificationId: 'all' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Mark read error:', err);
        }
    };
    const clearAll = async () => {
        if (window.confirm("Clear all notifications?")) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete('/api/notifications/delete?all=true', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications([]);
            } catch (err) {
                console.error('Clear notifs error:', err);
            }
        }
    };
    const handleNotificationClick = async (notif) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/notifications/delete?id=${notif._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (notif.link) {
                router.push(notif.link);
            } else {
                setNotifications(notifications.filter(n => n._id !== notif._id));
            }
        } catch (err) {
            console.error('Click notif error:', err);
        }
    };
    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'student': return '/dashboard/student';
            case 'admin':
            case 'staff': return '/dashboard/admin';
            case 'super-admin': return '/dashboard/super-admin';
            default: return '/';
        }
    };
    return (
        <div className="min-h-screen relative transition-colors duration-500 overflow-hidden">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {}
                    <div className="flex items-center justify-between mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Link
                                href={getDashboardLink()}
                                className="inline-flex items-center text-red-500 hover:text-red-400 font-medium transition-colors mb-2"
                            >
                                <FaArrowLeft className="mr-2 text-sm" /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-extrabold dark:text-white text-shadow-sm flex items-center gap-4">
                                Notifications
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="text-xs font-bold px-3 py-1 bg-red-500/20 text-red-500 rounded-full border border-red-500/30">
                                        {notifications.filter(n => !n.isRead).length} New
                                    </span>
                                )}
                            </h1>
                        </motion.div>
                        <div className="flex gap-3">
                            {notifications.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={clearAll}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all text-sm font-medium"
                                >
                                    Clear All
                                </motion.button>
                            )}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 dark:text-gray-300 border border-white/10 rounded-xl transition-all text-sm font-medium"
                            >
                                Mark all as read
                            </motion.button>
                        </div>
                    </div>
                    {}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-theme p-6 border-white/10 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="spinner" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-64 h-64 border-2 border-red-500/20 rounded-full"
                                        />
                                    </div>
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative p-10 bg-gradient-to-tr from-red-500/10 to-rose-800/10 rounded-full border border-white/10 shadow-inner mb-8"
                                    >
                                        <FaBell className="text-7xl text-red-500/40" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold dark:text-white mb-3">All Caught Up!</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                                        You don't have any new notifications at the moment.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((notif) => (
                                        <motion.div
                                            key={notif._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-5 rounded-2xl border transition-all cursor-pointer group ${notif.isRead
                                                ? 'bg-transparent border-white/5 opacity-60'
                                                : 'bg-red-500/5 border-red-500/20 dark:border-red-500/30'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl transition-colors ${notif.type === 'resolution' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                    <FaInbox className="text-xl group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold dark:text-white group-hover:text-red-400 transition-colors">{notif.title}</h4>
                                                        <span className="text-[10px] uppercase tracking-widest dark:text-gray-500 font-bold">
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="dark:text-gray-400 text-sm leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    {}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-8 text-slate-400 dark:text-gray-500 text-sm"
                    >
                        Notifications are synced across all your devices in real-time.
                    </motion.p>
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
}