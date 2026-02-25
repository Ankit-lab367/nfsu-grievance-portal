'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaUser, FaArrowLeft, FaSkull, FaUnlock } from 'react-icons/fa';

export default function UnblockAccountPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');

        if (!token && !godToken) {
            router.push('/login');
            return;
        }
        fetchUsers(godToken || token);
    }, [router]);

    const fetchUsers = async (authToken) => {
        try {
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.data.success) {
                // Only show users that are currently BLOCKED
                const blockedUsers = res.data.users.filter(u => !u.isActive);
                setUsers(blockedUsers);
                setFilteredUsers(blockedUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = users;

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(result);
    }, [searchQuery, users]);

    const handleUnblockUser = async (user) => {
        if (!confirm(`RESTORE SYSTEM ACCESS FOR ${user.name.toUpperCase()}?`)) return;

        setProcessingId(user._id);
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');
        const authToken = godToken || token;

        try {
            const res = await axios.patch('/api/admin/users', {
                userId: user._id,
                isActive: true
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (res.data.success) {
                // Remove from local list as it's no longer blocked
                setUsers(prev => prev.filter(u => u._id !== user._id));
            }
        } catch (error) {
            console.error('Error unblocking user:', error);
            alert('RESTORATION SEQUENCE FAILED');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#00ff00] font-mono p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-blue-900/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/20 shadow-[0_0_10px_#0000ff/10] animate-scanline" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-blue-500/30 pb-4 gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/god-mode')}
                            className="p-2 hover:bg-blue-500/10 rounded-full transition-colors text-blue-400"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase text-blue-400">
                            Access Restoration
                        </h1>
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="SEARCH RESTRICTED UNIT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-blue-500/30 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-blue-400 transition-colors placeholder-blue-400/30 text-blue-400"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-blue-400">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-4xl mb-4"
                        >
                            <FaSkull />
                        </motion.div>
                        <p className="animate-pulse">PENETRATING DATABASE...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-[10px] opacity-40 uppercase text-blue-400">
                            Found {filteredUsers.length} restricted units in mainframe
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user, index) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    key={user._id}
                                    className="group relative bg-zinc-900/30 border border-blue-500/10 p-4 rounded-lg flex items-center justify-between hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-10 h-10 rounded-full border border-blue-500/20 overflow-hidden flex items-center justify-center bg-black">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-60" />
                                            ) : (
                                                <FaUser className="text-blue-500/30" />
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold truncate text-blue-400 uppercase tracking-tight text-sm">{user.name}</div>
                                            <div className="text-[8px] opacity-40 truncate">{user.email}</div>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <button
                                            disabled={processingId === user._id}
                                            onClick={() => handleUnblockUser(user)}
                                            className="px-3 py-1.5 bg-blue-600 text-black rounded text-[10px] font-black hover:bg-blue-500 hover:shadow-[0_0_10px_#0000ff] transition-all uppercase flex items-center space-x-1"
                                        >
                                            {processingId === user._id ? (
                                                <span className="animate-pulse">Restoring...</span>
                                            ) : (
                                                <>
                                                    <FaUnlock className="text-[8px]" />
                                                    <span>Unblock</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-blue-500/10 rounded-lg">
                                <p className="text-xs opacity-50 uppercase italic text-blue-400">No restricted units found in current sector</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style jsx global>{`
                @keyframes scanline {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(100vh); }
                }
                .animate-scanline {
                    animation: scanline 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
