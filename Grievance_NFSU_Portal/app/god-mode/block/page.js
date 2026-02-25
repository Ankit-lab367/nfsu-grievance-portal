'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaUser, FaArrowLeft, FaSkull, FaLock } from 'react-icons/fa';

export default function BlockAccountPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
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
                // Only show users that can be blocked (non super-admins and currently active)
                setUsers(res.data.users);
                setFilteredUsers(res.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = users;

        // Role Filter
        if (activeTab !== 'all') {
            result = result.filter(user => user.role === activeTab);
        }

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(result);
    }, [searchQuery, activeTab, users]);

    const handleBlockUser = async (user) => {
        if (!confirm(`ARE YOU SURE YOU WANT TO REVOKE ACCESS FOR ${user.name.toUpperCase()}?`)) return;

        setProcessingId(user._id);
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');
        const authToken = godToken || token;

        try {
            const res = await axios.patch('/api/admin/users', {
                userId: user._id,
                isActive: false
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (res.data.success) {
                // Update local state
                setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: false } : u));
            }
        } catch (error) {
            console.error('Error blocking user:', error);
            alert('BLOCKING SEQUENCE FAILED');
        } finally {
            setProcessingId(null);
        }
    };

    const tabs = [
        { id: 'all', label: 'All Units' },
        { id: 'student', label: 'Students' },
        { id: 'teacher', label: 'Teachers' },
        { id: 'admin', label: 'Administrators' },
    ];

    return (
        <div className="min-h-screen bg-black text-[#00ff00] font-mono p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-red-900/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_10px_#ff0000/10] animate-scanline" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-red-500/30 pb-4 gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/god-mode')}
                            className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase text-red-500">
                            Access Revocation
                        </h1>
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="SEARCH UNIT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-red-500/30 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-red-500 transition-colors placeholder-red-500/30 text-red-500"
                        />
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-red-500/10 pb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded ${activeTab === tab.id
                                ? 'bg-red-600 text-black shadow-[0_0_15px_#ff0000]'
                                : 'border border-red-500/20 text-red-500/60 hover:border-red-500/60 hover:text-red-500'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-500">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user, index) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    key={user._id}
                                    className="group relative bg-zinc-900/30 border border-red-500/10 p-4 rounded-lg flex items-center justify-between hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-10 h-10 rounded-full border border-red-500/20 overflow-hidden flex items-center justify-center bg-black">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-60" />
                                            ) : (
                                                <FaUser className="text-red-500/30" />
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold truncate text-red-500 uppercase tracking-tight text-sm">{user.name}</div>
                                            <div className="text-[8px] opacity-40 truncate">{user.email}</div>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        {!user.isActive ? (
                                            <div className="text-[10px] font-black text-red-600 border border-red-600 px-2 py-1 rounded bg-red-600/10 uppercase italic">
                                                Blocked
                                            </div>
                                        ) : (
                                            <button
                                                disabled={processingId === user._id || user.role === 'super-admin'}
                                                onClick={() => handleBlockUser(user)}
                                                className={`px-3 py-1.5 rounded text-[10px] font-black transition-all uppercase flex items-center space-x-1 ${user.role === 'super-admin'
                                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                                    : 'bg-red-600 text-black hover:bg-red-500 hover:shadow-[0_0_10px_#ff0000]'
                                                    }`}
                                            >
                                                {processingId === user._id ? (
                                                    <span className="animate-pulse">Revoking...</span>
                                                ) : (
                                                    <>
                                                        <FaLock className="text-[8px]" />
                                                        <span>Block</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-red-500/10 rounded-lg">
                                <p className="text-xs opacity-50 uppercase italic text-red-500">No records found matching current target parameters</p>
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
