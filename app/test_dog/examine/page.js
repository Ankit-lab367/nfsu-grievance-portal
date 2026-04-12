'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaUser, FaPhone, FaExclamationCircle, FaArrowLeft, FaSkull, FaTimes } from 'react-icons/fa';
import MatrixParticleBackground from '@/components/GodMode/MatrixParticleBackground';
import DataStream from '@/components/GodMode/DataStream';
export default function ExamineAccountsPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
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
        if (activeTab !== 'all') {
            result = result.filter(user => user.role === activeTab);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.enrollmentNumber && user.enrollmentNumber.toLowerCase().includes(query))
            );
        }
        setFilteredUsers(result);
    }, [searchQuery, activeTab, users]);
    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setDetailsLoading(true);
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');
        const authToken = godToken || token;
        try {
            const res = await axios.get(`/api/admin/users/${user._id}/detailed`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.data.success) {
                setUserDetails(res.data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setDetailsLoading(false);
        }
    };
    const tabs = [
        { id: 'all', label: 'All Accounts' },
        { id: 'student', label: 'Students' },
        { id: 'teacher', label: 'Teachers' },
        { id: 'admin', label: 'Administrators' },
    ];
    return (
        <div className="min-h-screen bg-black text-[#00ff00] font-mono p-4 md:p-8 relative overflow-hidden">
            {}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MatrixParticleBackground color="0, 255, 0" />
            </div>
            {}
            <div className="fixed top-0 left-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={2} color="#00ff00" />
            </div>
            <div className="fixed top-0 right-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={3} reverse color="#00ff00" />
            </div>
            {}
            <div className="absolute inset-0 bg-[#00ff00]/5 pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10">
                {}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-[#00ff00]/30 pb-4 gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/test_dog')}
                            className="p-2 hover:bg-[#00ff00]/10 rounded-full transition-colors"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase">
                            Account Scrutiny
                        </h1>
                    </div>
                    {}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME/EMAIL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-[#00ff00]/30 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[#00ff00] transition-colors placeholder-[#00ff00]/30"
                        />
                    </div>
                </div>
                {}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-[#00ff00]/10 pb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded ${activeTab === tab.id
                                ? 'bg-[#00ff00] text-black shadow-[0_0_15px_#00ff00]'
                                : 'border border-[#00ff00]/20 text-[#00ff00]/60 hover:border-[#00ff00]/60 hover:text-[#00ff00]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
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
                        <div className="mb-4 text-[10px] opacity-40 uppercase">
                            Found {filteredUsers.length} total units matching parameters
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user, index) => (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    key={user._id}
                                    onClick={() => handleUserClick(user)}
                                    className="group relative bg-zinc-900/30 border border-[#00ff00]/10 p-4 rounded-lg flex items-center space-x-4 hover:border-[#00ff00]/50 hover:bg-[#00ff00]/5 transition-all text-left"
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border border-[#00ff00]/20 overflow-hidden flex items-center justify-center bg-black group-hover:border-[#00ff00]/60 transition-colors">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-80" />
                                            ) : (
                                                <FaUser className="text-[#00ff00]/30" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-bold truncate group-hover:text-white transition-colors uppercase tracking-tight">{user.name}</div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase ${user.role === 'student' ? 'border-blue-500/50 text-blue-400' :
                                                user.role === 'teacher' ? 'border-green-500/50 text-green-400' :
                                                    'border-purple-500/50 text-purple-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <span className="text-[10px] opacity-30 truncate">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-[#00ff00]/10 rounded-lg">
                                <p className="text-xs opacity-50 uppercase italic">No records found matching current filters</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            {}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-[#00ff00]/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-[0_0_50px_rgba(0,255,0,0.1)]"
                        >
                            {}
                            <div className="p-6 border-b border-[#00ff00]/30 flex items-center justify-between bg-black">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-[#00ff00] overflow-hidden bg-zinc-800">
                                        {selectedUser.avatar ? (
                                            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><FaUser className="text-2xl" /></div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-widest">{selectedUser.name}</h2>
                                        <p className="text-xs opacity-50 font-bold">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setUserDetails(null);
                                    }}
                                    className="p-2 hover:bg-[#ff0000]/10 hover:text-red-500 rounded-full transition-all"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                            {}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {detailsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-12 h-1 bg-[#00ff00]/20 relative overflow-hidden mb-4">
                                            <motion.div
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-0 bottom-0 w-1/2 bg-[#00ff00]"
                                            />
                                        </div>
                                        <p className="text-xs animate-pulse italic">DECRYPTING USER DATA...</p>
                                    </div>
                                ) : userDetails ? (
                                    <div className="space-y-8">
                                        {}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-black/40 border border-[#00ff00]/10 p-4 rounded-lg">
                                                <div className="text-[10px] opacity-40 uppercase mb-1">Phone Number</div>
                                                <div className="flex items-center space-x-2 font-bold">
                                                    <FaPhone className="text-xs" />
                                                    <span>{userDetails.user.phone || 'NO_RECORD'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-black/40 border border-[#00ff00]/10 p-4 rounded-lg">
                                                <div className="text-[10px] opacity-40 uppercase mb-1">Department</div>
                                                <div className="font-bold">
                                                    {userDetails.user.departmentId?.name || 'GENERIC_SECTOR'}
                                                </div>
                                            </div>
                                            <div className="bg-black/40 border border-[#00ff00]/10 p-4 rounded-lg">
                                                <div className="text-[10px] opacity-40 uppercase mb-1">Role</div>
                                                <div className="font-bold uppercase">{userDetails.user.role}</div>
                                            </div>
                                            <div className="bg-black/40 border border-[#00ff00]/10 p-4 rounded-lg">
                                                <div className="text-[10px] opacity-40 uppercase mb-1">Account Status</div>
                                                <div className={`font-bold uppercase ${userDetails.user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {userDetails.user.isActive ? 'ACTIVE_BYPASS' : 'REVOKED'}
                                                </div>
                                            </div>
                                        </div>
                                        {}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-black uppercase tracking-tighter flex items-center space-x-2">
                                                    <span>Registered Complaints</span>
                                                    <span className="bg-[#00ff00] text-black px-2 text-xs rounded-full">
                                                        {userDetails.complaints.length}
                                                    </span>
                                                </h3>
                                            </div>
                                            {userDetails.complaints.length > 0 ? (
                                                <div className="space-y-3">
                                                    {userDetails.complaints.map((complaint) => (
                                                        <div
                                                            key={complaint._id}
                                                            className="bg-black/60 border border-[#00ff00]/20 p-4 rounded-lg hover:border-[#00ff00]/50 transition-all group"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="font-bold text-white mb-1 group-hover:text-[#00ff00] transition-colors">
                                                                        {complaint.title}
                                                                    </div>
                                                                    <div className="text-xs opacity-50 mb-2 truncate max-w-md">
                                                                        {complaint.description}
                                                                    </div>
                                                                    <div className="flex items-center space-x-3 text-[10px]">
                                                                        <span className="px-1.5 py-0.5 border border-[#00ff00]/30 rounded uppercase">
                                                                            {complaint.category}
                                                                        </span>
                                                                        <span className={`px-1.5 py-0.5 border rounded uppercase ${complaint.status === 'Resolved' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                                                                            }`}>
                                                                            {complaint.status}
                                                                        </span>
                                                                        <span className="opacity-40 italic">
                                                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] opacity-30 font-mono">
                                                                    #{complaint.complaintId || 'REF_NULL'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 border border-dashed border-[#00ff00]/20 rounded-lg bg-black/20">
                                                    <FaExclamationCircle className="mx-auto text-2xl mb-2 opacity-30" />
                                                    <p className="text-xs opacity-50 uppercase italic">No registered complaints found in database</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-red-500">FAILED TO LOAD TERMINAL DATA</div>
                                )}
                            </div>
                            {}
                            <div className="p-4 border-t border-[#00ff00]/30 bg-black flex justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setUserDetails(null);
                                    }}
                                    className="px-6 py-2 border border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all font-bold text-xs uppercase"
                                >
                                    Close Terminal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style jsx global>{`
                @keyframes scanline {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(100vh); }
                }
                .animate-scanline {
                    animation: scanline 8s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #00ff0033;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #00ff0066;
                }
            `}</style>
        </div>
    );
}