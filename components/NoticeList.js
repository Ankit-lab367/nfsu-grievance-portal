'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaChevronDown, FaChevronUp, FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
export default function NoticeList() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedNoticeId, setExpandedNoticeId] = useState(null);
    useEffect(() => {
        fetchNotices();
    }, []);
    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/notices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setNotices(response.data.notices);
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleDismiss = async (id, e) => {
        e.stopPropagation(); 
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/notices/${id}/dismiss`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotices(notices.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error dismissing notice:', error);
            alert('Failed to remove notice');
        }
    };
    const toggleExpand = (id) => {
        setExpandedNoticeId(expandedNoticeId === id ? null : id);
    };
    if (loading) {
        return <div className="text-center py-8 text-gray-400">Loading notices...</div>;
    }
    if (notices.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <FaBell className="mx-auto text-4xl text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No New Notices</h3>
                <p className="text-gray-400">You're all caught up!</p>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            {notices.map((notice) => (
                <motion.div
                    key={notice._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors"
                >
                    <div
                        onClick={() => toggleExpand(notice._id)}
                        className="p-4 cursor-pointer flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${notice.targetAudience === 'staff' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                                <FaBell />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{notice.title}</h3>
                                <p className="text-sm text-gray-400">
                                    {new Date(notice.createdAt).toLocaleDateString()} • {notice.targetAudience.charAt(0).toUpperCase() + notice.targetAudience.slice(1)}
                                </p>
                            </div>
                        </div>
                        <div className="text-gray-400">
                            {expandedNoticeId === notice._id ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedNoticeId === notice._id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-4 pb-4 border-t border-white/10"
                            >
                                <div className="pt-4 text-gray-300 whitespace-pre-wrap">
                                    {notice.content}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={(e) => handleDismiss(notice._id, e)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <FaTrash />
                                        Remove Notice
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}