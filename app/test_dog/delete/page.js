'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    FaUser, 
    FaPhone, 
    FaExclamationCircle, 
    FaArrowLeft, 
    FaSkull, 
    FaTimes, 
    FaTrash, 
    FaIdCard, 
    FaGraduationCap, 
    FaEnvelope, 
    FaCalendarAlt, 
    FaSpinner 
} from 'react-icons/fa';
import MatrixParticleBackground from '@/components/GodMode/MatrixParticleBackground';
import DataStream from '@/components/GodMode/DataStream';

export default function DeleteAccountsPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isDeleting, setIsDeleting] = useState(false);

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
        setLoading(true);
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
        setUserDetails(null);
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

    const handleDeleteAccount = async (userId) => {
        const confirmMsg =
            `⚠️ PURGE PROTOCOL INITIATED\n\n` +
            `Are you absolutely sure you want to PERMANENTLY DELETE this account?\n\n` +
            `This action is IRREVERSIBLE and will:\n` +
            `  • Delete the user's account from the mainframe\n` +
            `  • Erase all their associated complaints\n` +
            `  • Revoke all access tokens\n\n` +
            `Proceed with account purge?`;

        if (!confirm(confirmMsg)) return;

        setIsDeleting(true);
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');
        const authToken = godToken || token;

        try {
            const res = await axios.delete(`/api/admin/users?id=${userId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (res.data.success) {
                setSelectedUser(null);
                setUserDetails(null);
                await fetchUsers(authToken);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert(error.response?.data?.error || 'DELETION ABORTED: Failed to purge account.');
        } finally {
            setIsDeleting(false);
        }
    };

    const tabs = [
        { id: 'all', label: 'All Accounts' },
        { id: 'student', label: 'Students' },
        { id: 'staff', label: 'Staff' },
        { id: 'teacher', label: 'Teachers' },
        { id: 'admin', label: 'Admins' },
    ];

    const roleColor = (role) => {
        switch (role) {
            case 'student': return 'border-blue-500/50 text-blue-400';
            case 'staff': return 'border-amber-500/50 text-amber-400';
            case 'teacher': return 'border-green-500/50 text-green-400';
            default: return 'border-purple-500/50 text-purple-400';
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#00ff00] font-mono p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MatrixParticleBackground color="255, 0, 0" />
            </div>
            <div className="fixed top-0 left-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={2} color="#ff0000" />
            </div>
            <div className="fixed top-0 right-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={3} reverse color="#ff0000" />
            </div>
            <div className="absolute inset-0 bg-red-900/5 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-red-500/30 pb-4 gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/test_dog')}
                            className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                                ☠ PURGE TERMINAL
                            </h1>
                            <p className="text-[10px] text-red-500/50 uppercase tracking-widest mt-0.5">
                                Destructive Access — Account Elimination Protocol
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="SCAN TARGET BY NAME / EMAIL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-red-500/30 text-red-400 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-red-500 transition-colors placeholder-red-500/20 font-mono"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-red-500/10 pb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded ${
                                activeTab === tab.id
                                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : 'border border-red-500/20 text-red-500/60 hover:border-red-500/60 hover:text-red-500'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* User list */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-4xl mb-4 text-red-500"
                        >
                            <FaSkull />
                        </motion.div>
                        <p className="animate-pulse text-red-500 text-xs uppercase tracking-widest">
                            PENETRATING DATABASE... ACQUIRING TARGETS...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-[10px] text-red-500/50 uppercase tracking-widest">
                            [!] TARGET LIST: {filteredUsers.length} UNIT(S) IDENTIFIED
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map((user, index) => (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    key={user._id}
                                    onClick={() => handleUserClick(user)}
                                    className="group relative bg-zinc-950/80 border border-red-500/10 p-4 rounded-lg flex items-center space-x-4 hover:border-red-500/60 hover:bg-red-500/5 transition-all text-left"
                                >
                                    {/* Scan-line effect on hover */}
                                    <motion.div
                                        className="absolute top-0 left-0 right-0 h-[1px] bg-red-500/50 opacity-0 group-hover:opacity-100"
                                        animate={{ left: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />

                                    <div className="w-12 h-12 rounded-full border border-red-500/20 overflow-hidden flex items-center justify-center bg-black group-hover:border-red-500/60 transition-colors flex-shrink-0">
                                        {user.avatar && user.avatar !== '/assets/default-avatar.png' ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <FaUser className="text-red-500/30" />
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-bold truncate group-hover:text-red-400 transition-colors uppercase tracking-tight text-white text-sm">
                                            {user.name}
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-bold ${roleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                            <span className="text-[10px] text-red-500/30 truncate">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-red-500/10 rounded-lg mt-4">
                                <FaSkull className="mx-auto text-3xl text-red-500/30 mb-3" />
                                <p className="text-xs text-red-500/50 uppercase italic tracking-widest">
                                    No records found matching target parameters
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ====== DETAILS MODAL ====== */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-950 border border-red-500/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-[0_0_60px_rgba(239,68,68,0.2)]"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-red-500/30 flex items-center justify-between bg-black/80">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-full border-2 border-red-500 overflow-hidden bg-zinc-900 flex items-center justify-center flex-shrink-0">
                                        {selectedUser.avatar && selectedUser.avatar !== '/assets/default-avatar.png' ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <FaUser className="text-2xl text-red-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-white">
                                            {selectedUser.name}
                                        </h2>
                                        <p className="text-xs font-bold text-red-400">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                                    className="p-2 hover:bg-red-500/10 text-red-500/70 hover:text-red-400 rounded-full transition-all"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                {detailsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-48 h-0.5 bg-red-500/20 relative overflow-hidden mb-4">
                                            <motion.div
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-0 bottom-0 w-1/2 bg-red-500"
                                            />
                                        </div>
                                        <p className="text-xs animate-pulse text-red-500 italic uppercase tracking-widest">
                                            DECRYPTING REGISTRATION RECORDS...
                                        </p>
                                    </div>
                                ) : userDetails ? (
                                    <div className="space-y-5">

                                        {/* Role badge */}
                                        <div className="text-xs border border-red-500/20 bg-red-500/5 p-3 rounded font-bold uppercase tracking-widest flex items-center gap-2 text-red-400">
                                            <FaExclamationCircle />
                                            Target Classification: {userDetails.user.role.toUpperCase()}
                                        </div>

                                        {/* Core Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                            <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                <div className="text-[10px] text-red-500/50 uppercase mb-1 flex items-center gap-1 font-bold">
                                                    <FaEnvelope className="text-[8px]" /> Email Address
                                                </div>
                                                <div className="font-bold text-white text-sm break-all">{userDetails.user.email}</div>
                                            </div>

                                            <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                <div className="text-[10px] text-red-500/50 uppercase mb-1 flex items-center gap-1 font-bold">
                                                    <FaPhone className="text-[8px]" /> Phone Number
                                                </div>
                                                <div className="font-bold text-white text-sm">{userDetails.user.phone || 'N/A'}</div>
                                            </div>

                                            {/* Student-specific fields */}
                                            {userDetails.user.role === 'student' && (<>
                                                <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                    <div className="text-[10px] text-red-500/50 uppercase mb-1 flex items-center gap-1 font-bold">
                                                        <FaIdCard className="text-[8px]" /> Enrollment Number
                                                    </div>
                                                    <div className="font-bold text-white text-sm">{userDetails.user.enrollmentNumber || 'N/A'}</div>
                                                </div>

                                                <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                    <div className="text-[10px] text-red-500/50 uppercase mb-1 flex items-center gap-1 font-bold">
                                                        <FaGraduationCap className="text-[8px]" /> Course / Programme
                                                    </div>
                                                    <div className="font-bold text-white text-sm">{userDetails.user.course || 'N/A'}</div>
                                                </div>

                                                <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                    <div className="text-[10px] text-red-500/50 uppercase mb-1 flex items-center gap-1 font-bold">
                                                        <FaCalendarAlt className="text-[8px]" /> Current Year
                                                    </div>
                                                    <div className="font-bold text-white text-sm">
                                                        {userDetails.user.year ? `Year ${userDetails.user.year}` : 'N/A'}
                                                    </div>
                                                </div>

                                                <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                    <div className="text-[10px] text-red-500/50 uppercase mb-1 font-bold">ID Verification</div>
                                                    <div className={`font-bold text-sm uppercase ${userDetails.user.isVerifiedID ? 'text-green-400' : 'text-yellow-500'}`}>
                                                        {userDetails.user.isVerifiedID ? '✓ VERIFIED' : '⏳ PENDING'}
                                                    </div>
                                                </div>
                                            </>)}

                                            {/* Staff-specific fields */}
                                            {userDetails.user.role === 'staff' && (<>
                                                <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                    <div className="text-[10px] text-red-500/50 uppercase mb-1 font-bold">Account Status</div>
                                                    <div className={`font-bold text-sm uppercase ${userDetails.user.isActive ? 'text-green-400' : 'text-red-500'}`}>
                                                        {userDetails.user.isActive ? '✓ ACTIVE' : '✗ DEACTIVATED / PENDING'}
                                                    </div>
                                                </div>
                                                <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg">
                                                    <div className="text-[10px] text-red-500/50 uppercase mb-1 font-bold">Department</div>
                                                    <div className="font-bold text-white text-sm">
                                                        {userDetails.user.departmentId?.name || 'NOT ASSIGNED'}
                                                    </div>
                                                </div>
                                            </>)}

                                            <div className="bg-black/80 border border-red-500/10 p-4 rounded-lg md:col-span-2">
                                                <div className="text-[10px] text-red-500/50 uppercase mb-1 font-bold">Database Unit ID</div>
                                                <div className="font-mono text-[#00ff00] text-xs select-all">{userDetails.user._id}</div>
                                            </div>
                                        </div>

                                        {/* ===== SECRET ID CARD PHOTO (Students only) ===== */}
                                        {userDetails.user.role === 'student' && (
                                            <div className="mt-2">
                                                <div className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block"></span>
                                                    [CLASSIFIED] SECRET CAPTURE — STEP-2 ID VERIFICATION PHOTO
                                                </div>
                                                {userDetails.user.idCardPhoto ? (
                                                    <div className="border border-red-500/40 rounded-lg overflow-hidden bg-black">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={userDetails.user.idCardPhoto}
                                                            alt="Secretly captured ID verification photo"
                                                            className="w-full max-h-[320px] object-contain bg-zinc-950"
                                                        />
                                                        <div className="p-2 text-center text-[9px] text-red-500/40 uppercase tracking-widest border-t border-red-500/10">
                                                            Captured Silently During Step-2 Verification • CLASSIFIED ARCHIVE
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border border-red-500/20 rounded-lg p-6 text-center bg-red-950/10">
                                                        <FaExclamationCircle className="mx-auto text-2xl text-red-500/40 mb-2" />
                                                        <p className="text-[10px] text-red-500/50 italic uppercase tracking-wider">
                                                            No secret photo on file — student registered before photo capture system was deployed
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Complaints count */}
                                        {userDetails.complaints && (
                                            <div className="bg-black/60 border border-[#00ff00]/10 p-4 rounded-lg">
                                                <div className="text-[10px] text-[#00ff00]/50 uppercase mb-1 font-bold">
                                                    Associated Complaints (will be purged)
                                                </div>
                                                <div className="font-bold text-lg text-[#00ff00]">
                                                    {userDetails.complaints.length} complaint{userDetails.complaints.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-red-500 font-bold uppercase tracking-widest animate-pulse">
                                        MAINFRAME REJECTED CONNECTION. RECORD DECRYPTION FAILED.
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-red-500/30 bg-black/80 flex justify-between items-center gap-4">
                                <button
                                    onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                                    className="px-5 py-2 border border-red-500/20 hover:border-red-500/50 text-red-500/60 hover:text-red-400 transition-all font-bold text-xs uppercase rounded"
                                >
                                    Abort
                                </button>

                                {userDetails && (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleDeleteAccount(userDetails.user._id)}
                                        disabled={isDeleting}
                                        className="px-6 py-2.5 bg-red-600 border border-red-500 text-white hover:bg-red-500 font-black text-sm uppercase tracking-widest transition-all rounded flex items-center space-x-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                <span>PURGING DATA...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaTrash />
                                                <span>PURGE ACCOUNT</span>
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef444433; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef444466; }
            `}</style>
        </div>
    );
}
