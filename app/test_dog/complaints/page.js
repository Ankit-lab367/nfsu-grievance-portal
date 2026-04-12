'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaArrowLeft, FaSkull, FaTrash, FaEye, FaExclamationCircle } from 'react-icons/fa';
import MatrixParticleBackground from '@/components/GodMode/MatrixParticleBackground';
import DataStream from '@/components/GodMode/DataStream';
export default function SeeComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');
        if (!token && !godToken) {
            router.push('/login');
            return;
        }
        fetchComplaints(godToken || token);
    }, [router]);
    const fetchComplaints = async (authToken) => {
        try {
            const res = await axios.get('/api/complaints/get', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.data.success) {
                setComplaints(res.data.complaints);
                setFilteredComplaints(res.data.complaints);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        let result = complaints;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(query) ||
                (c.userId && c.userId.name.toLowerCase().includes(query)) ||
                (c.complaintId && c.complaintId.toLowerCase().includes(query))
            );
        }
        setFilteredComplaints(result);
    }, [searchQuery, complaints]);
    const handleRemoveComplaint = async (e, complaint) => {
        e.stopPropagation();
        if (!confirm(`PERMANENTLY DELETE COMPLAINT: "${complaint.title}"? THIS ACTION CANNOT BE UNDONE.`)) return;
        setProcessingId(complaint._id);
        const token = localStorage.getItem('token');
        const godToken = localStorage.getItem('god-mode-token');
        const authToken = godToken || token;
        try {
            const res = await axios.delete(`/api/complaints/delete?id=${complaint._id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.data.success) {
                setComplaints(prev => prev.filter(c => c._id !== complaint._id));
                if (selectedComplaint && selectedComplaint._id === complaint._id) {
                    setSelectedComplaint(null);
                }
            }
        } catch (error) {
            console.error('Error deleting complaint:', error);
            alert('DELETION SEQUENCE FAILED');
        } finally {
            setProcessingId(null);
        }
    };
    return (
        <div className="min-h-screen bg-black text-[#00ff00] font-mono p-4 md:p-8 relative overflow-hidden">
            {}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <MatrixParticleBackground color="255, 255, 0" />
            </div>
            {}
            <div className="fixed top-0 left-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={2} color="#ffff00" />
            </div>
            <div className="fixed top-0 right-0 bottom-0 w-32 pointer-events-none overflow-hidden hidden lg:block opacity-20">
                <DataStream speed={3} reverse color="#ffff00" />
            </div>
            {}
            <div className="absolute inset-0 bg-yellow-900/5 pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10">
                {}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-yellow-500/30 pb-4 gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/test_dog')}
                            className="p-2 hover:bg-yellow-500/10 rounded-full transition-colors text-yellow-500"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase text-yellow-500">
                            Complaint Oversight
                        </h1>
                    </div>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="SEARCH COMPLAINTS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-yellow-500/30 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-yellow-500 transition-colors placeholder-yellow-500/30 text-yellow-500"
                        />
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-yellow-500">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-4xl mb-4"
                        >
                            <FaSkull />
                        </motion.div>
                        <p className="animate-pulse">SCANNING GRIEVANCES...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-[10px] opacity-40 uppercase text-yellow-500">
                            Found {filteredComplaints.length} active records
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {filteredComplaints.map((complaint, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={complaint._id}
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className="group relative bg-zinc-900/30 border border-yellow-500/10 p-4 rounded-lg flex items-center justify-between hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className={`w-2 h-2 rounded-full ${complaint.status === 'Solved' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <h3 className="font-bold text-yellow-500 uppercase tracking-wider text-sm md:text-base">
                                                {complaint.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center space-x-4 text-[10px] opacity-50 uppercase">
                                            <span>ID: {complaint.complaintId || 'N/A'}</span>
                                            <span>•</span>
                                            <span>{complaint.userId?.name || 'Unknown User'}</span>
                                            <span>•</span>
                                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <FaEye className="text-yellow-500/30 group-hover:text-yellow-500 transition-colors" />
                                        <button
                                            disabled={processingId === complaint._id}
                                            onClick={(e) => handleRemoveComplaint(e, complaint)}
                                            className="px-3 py-1.5 bg-red-900/20 border border-red-500/30 text-red-500 rounded text-[10px] font-black hover:bg-red-500 hover:text-black transition-all uppercase flex items-center space-x-1 z-10"
                                        >
                                            {processingId === complaint._id ? (
                                                <span className="animate-pulse">Purging...</span>
                                            ) : (
                                                <>
                                                    <FaTrash className="text-[10px]" />
                                                    <span>Remove</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {filteredComplaints.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-yellow-500/10 rounded-lg">
                                <p className="text-xs opacity-50 uppercase italic text-yellow-500">No grievance records found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            {}
            <AnimatePresence>
                {selectedComplaint && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedComplaint(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black border border-yellow-500 max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg shadow-[0_0_50px_rgba(255,255,0,0.1)] p-6 md:p-8 relative"
                        >
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="absolute top-4 right-4 text-yellow-500/50 hover:text-yellow-500 transition-colors text-xl"
                            >
                                ×
                            </button>
                            <div className="mb-6 pb-6 border-b border-yellow-500/20">
                                <div className="text-[10px] text-yellow-500/50 uppercase tracking-[0.2em] mb-2">Complaint Detail Record</div>
                                <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-wide mb-2">{selectedComplaint.title}</h2>
                                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                    <span className="bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 text-yellow-500">
                                        ID: {selectedComplaint.complaintId}
                                    </span>
                                    <span className={`px-2 py-1 rounded border ${selectedComplaint.status === 'Solved' ? 'bg-green-900/20 border-green-500/30 text-green-500' : 'bg-red-900/20 border-red-500/30 text-red-500'}`}>
                                        STATUS: {selectedComplaint.status}
                                    </span>
                                    <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-700 text-zinc-400">
                                        PRIORITY: {selectedComplaint.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <div className="text-[10px] text-yellow-500/50 uppercase tracking-[0.2em] mb-2">User Information</div>
                                    <div className="bg-zinc-900/30 p-4 rounded border border-yellow-500/10 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="opacity-50">Name:</span>
                                            <span className="font-bold">{selectedComplaint.userId?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="opacity-50">Email:</span>
                                            <span>{selectedComplaint.userId?.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="opacity-50">Role:</span>
                                            <span className="uppercase">{selectedComplaint.userId?.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-yellow-500/50 uppercase tracking-[0.2em] mb-2">Metadata</div>
                                    <div className="bg-zinc-900/30 p-4 rounded border border-yellow-500/10 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="opacity-50">Department:</span>
                                            <span>{selectedComplaint.department}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="opacity-50">Submitted:</span>
                                            <span>{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="opacity-50">Votes:</span>
                                            <span>{selectedComplaint.votes?.upvotes || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <div className="text-[10px] text-yellow-500/50 uppercase tracking-[0.2em] mb-2">Description</div>
                                <div className="bg-zinc-900/30 p-4 rounded border border-yellow-500/10 text-sm leading-relaxed opacity-80 whitespace-pre-wrap">
                                    {selectedComplaint.description}
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t border-yellow-500/20">
                                <button
                                    onClick={(e) => handleRemoveComplaint(e, selectedComplaint)}
                                    className="px-6 py-3 bg-red-600 text-black font-black uppercase tracking-wider hover:bg-red-500 hover:shadow-[0_0_20px_#ff0000] transition-all rounded flex items-center space-x-2"
                                >
                                    <FaTrash />
                                    <span>Purge Record</span>
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
            `}</style>
        </div>
    );
}