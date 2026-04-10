'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import StatusBadge from '@/components/StatusBadge';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowLeft, FaComments, FaChevronRight, FaCheck, FaTimes, FaPaperPlane, FaTimesCircle } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
export default function ComplaintDetailsPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userVote, setUserVote] = useState(null);
    const [voting, setVoting] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([
        {
            id: 1,
            user: "Official Dept",
            avatar: null,
            text: "We are currently reviewing the description provided.",
            timestamp: new Date().toISOString(),
            upvotes: 2,
            downvotes: 0
        }
    ]);
    const [newComment, setNewComment] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }, []);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchComplaint(token);
    }, [id, router]);
    const fetchComplaint = async (token) => {
        try {
            const response = await axios.get(`/api/complaints/get?complaintId=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success && response.data.complaints.length > 0) {
                const data = response.data.complaints[0];
                setComplaint(data);
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (data.votes && data.votes.votedBy) {
                    const vote = data.votes.votedBy.find(v => v.userId === currentUser.id);
                    if (vote) setUserVote(vote.voteType);
                }
            } else {
                setError('Complaint not found');
            }
        } catch (err) {
            setError('Failed to fetch complaint details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleVote = async (type) => {
        if (voting || !currentUser) return;
        setVoting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/complaints/vote', {
                complaintId: complaint._id,
                voteType: type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setComplaint(prev => ({
                    ...prev,
                    votes: {
                        ...prev.votes,
                        upvotes: response.data.votes.upvotes,
                        downvotes: response.data.votes.downvotes
                    }
                }));
                setUserVote(response.data.votes.userVote);
            }
        } catch (err) {
            console.error('Voting failed:', err);
            alert('Failed to register vote');
        } finally {
            setVoting(false);
        }
    };
    const handleUpdateStatus = async (newStatus, remarks) => {
        if (updatingStatus || !currentUser) return;
        setUpdatingStatus(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch('/api/complaints/update', {
                complaintId: complaint._id,
                status: newStatus,
                remarks: remarks
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setComplaint(response.data.complaint);
                alert(`Complaint status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error('Status update failed:', err);
            alert(err.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };
    const handleSendComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now(),
            user: currentUser?.name || "Anonymous",
            avatar: currentUser?.avatar,
            text: newComment,
            timestamp: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0
        };
        setComments([...comments, comment]);
        setNewComment("");
    };
    const handleCommentVote = (commentId, type) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const isSameVote = c.userVote === type;
                let upChange = 0;
                let downChange = 0;
                if (isSameVote) {
                    if (type === 'up') upChange = -1;
                    else downChange = -1;
                    return { ...c, upvotes: c.upvotes + upChange, downvotes: c.downvotes + downChange, userVote: null };
                } else {
                    if (c.userVote === 'up') upChange = -1;
                    if (c.userVote === 'down') downChange = -1;
                    if (type === 'up') upChange += 1;
                    else downChange += 1;
                    return { ...c, upvotes: c.upvotes + upChange, downvotes: c.downvotes + downChange, userVote: type };
                }
            }
            return c;
        }));
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-background-dark">
                <FaSpinner className="animate-spin text-4xl text-red-500" />
            </div>
        );
    }
    if (error || !complaint) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-background-dark text-white">
                <p>{error || 'Complaint not found'}</p>
            </div>
        );
    }
    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto glass-card-theme p-8 border-white/10 shadow-2xl"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <Link
                                href={(currentUser?.role === 'admin' || currentUser?.role === 'super-admin' || currentUser?.role === 'staff') ? "/dashboard/admin" : "/dashboard/student"}
                                className="inline-flex items-center text-red-400 hover:text-blue-300 mb-4 transition-colors font-bold"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back to {(currentUser?.role === 'admin' || currentUser?.role === 'super-admin' || currentUser?.role === 'staff') ? "Staff Portal" : "Dashboard"}
                            </Link>
                            <h1 className="text-3xl font-bold dark:text-white mb-3 text-shadow">{complaint.title}</h1>
                            <div className="flex items-center space-x-4 text-sm dark:text-gray-400">
                                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">ID: {complaint.complaintId}</span>
                                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold border border-red-500/30">{complaint.department}</span>
                            </div>
                        </div>
                        <StatusBadge status={complaint.status} />
                    </div>
                    <div className="dark:bg-white/5 rounded-2xl p-6 mb-8 dark:text-gray-300 border border-white/5 leading-relaxed shadow-inner">
                        <h3 className="text-lg font-bold dark:text-white mb-2">Description</h3>
                        <p>{complaint.description}</p>
                    </div>
                    {}
                    {complaint.attachments && complaint.attachments.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Attachments</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {complaint.attachments.map((file, index) => (
                                    <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                        {file.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
                                                <img
                                                    src={file.url}
                                                    alt={file.filename}
                                                    className="w-full h-48 object-cover rounded-md hover:opacity-90 transition-opacity"
                                                />
                                                <p className="text-sm text-gray-400 mt-2 truncate">{file.filename}</p>
                                            </a>
                                        ) : (
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded transition-colors"
                                            >
                                                <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
                                                    <FaPlus />
                                                </div>
                                                <span className="text-red-400 hover:text-blue-300 truncate">{file.filename}</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {}
                    {complaint.status === 'Resolved' && complaint.resolutionDetails && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-2xl"
                        >
                            <div className="flex items-center space-x-2 mb-4 text-green-600 dark:text-green-400">
                                <FaCheckCircle className="text-xl" />
                                <h3 className="text-lg font-bold">Resolution Details</h3>
                            </div>
                            <p className="text-slate-700 dark:text-gray-300 mb-6 leading-relaxed">
                                {complaint.resolutionDetails.description}
                            </p>
                            {complaint.resolutionDetails.proof && complaint.resolutionDetails.proof.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Proof of Resolution</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {complaint.resolutionDetails.proof.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative aspect-square rounded-xl overflow-hidden border border-green-500/20 group"
                                            >
                                                <img
                                                    src={file.url}
                                                    alt={`Proof ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 pt-4 border-t border-green-500/10 flex justify-between items-center text-xs text-slate-400 dark:text-gray-500">
                                <span>Resolved on {new Date(complaint.resolutionDetails.resolvedAt).toLocaleDateString()}</span>
                                <span className="font-bold uppercase">Official Solution</span>
                            </div>
                        </motion.div>
                    )}
                    {}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                        <div className="space-y-4">
                            {complaint.timeline.map((entry, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                        {index !== complaint.timeline.length - 1 && (
                                            <div className="w-0.5 h-full bg-white/10 my-1"></div>
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-white font-bold">{entry.status}</p>
                                        <p className="text-sm text-gray-400">{entry.remarks}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {}
                    <div className="border-t border-slate-200 dark:border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center space-x-3">
                                <p className="text-slate-600 dark:text-gray-400 font-medium">Is this complaint valid?</p>
                                <button
                                    onClick={() => setShowComments(true)}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors group"
                                >
                                    <FaComments className="text-sm" />
                                    <span className="text-sm font-bold">Comments</span>
                                    <FaChevronRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                            {}
                            {(currentUser?.role === 'admin' || currentUser?.role === 'super-admin' || currentUser?.role === 'staff') && (
                                <div className="flex gap-3">
                                    {complaint.status !== 'Resolved' && (
                                        <Link
                                            href={`/complaint/${complaint.complaintId}/resolve`}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all active:scale-95 text-xs"
                                        >
                                            <FaCheckCircle />
                                            <span>Problem Solved</span>
                                        </Link>
                                    )}
                                    {complaint.status === 'Pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus('In Progress', 'Staff is currently working on this issue.')}
                                            disabled={updatingStatus}
                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95 text-xs disabled:opacity-50"
                                        >
                                            <FaExclamationCircle />
                                            <span>{updatingStatus ? 'Updating...' : 'Problem in Progress'}</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            {currentUser?.role === 'student' ? (
                                <>
                                    <button
                                        onClick={() => handleVote('up')}
                                        disabled={voting}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${userVote === 'up'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <FaCheckCircle className="text-xl" />
                                        <span className="font-bold">{complaint.votes?.upvotes || 0}</span>
                                        <span>Correct</span>
                                    </button>
                                    <button
                                        onClick={() => handleVote('down')}
                                        disabled={voting}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${userVote === 'down'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <FaExclamationCircle className="text-xl" />
                                        <span className="font-bold">{complaint.votes?.downvotes || 0}</span>
                                        <span>Wrong</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex space-x-4">
                                    <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg border border-white/5 opacity-80">
                                        <FaCheckCircle className="text-xl" />
                                        <span className="font-bold">{complaint.votes?.upvotes || 0}</span>
                                        <span>Correct Votes</span>
                                    </div>
                                    <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg border border-white/5 opacity-80">
                                        <FaExclamationCircle className="text-xl" />
                                        <span className="font-bold">{complaint.votes?.downvotes || 0}</span>
                                        <span>Wrong Votes</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
            {}
            <AnimatePresence>
                {showComments && (
                    <>
                        {}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowComments(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                        />
                        {}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-card-theme border-l border-white/10 z-[100] flex flex-col shadow-2xl"
                        >
                            {}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                        <FaComments />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Discussions</h2>
                                </div>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FaTimesCircle className="text-2xl" />
                                </button>
                            </div>
                            {}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm border-2 border-white/10 shadow-lg shrink-0 overflow-hidden">
                                                {comment.avatar ? (
                                                    <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" />
                                                ) : comment.user.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline justify-between mb-1">
                                                    <span className="text-sm font-bold text-white">{comment.user}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                                    <p className="text-sm text-gray-200">{comment.text}</p>
                                                </div>
                                                {}
                                                <div className="flex items-center space-x-4 mt-2 ml-1">
                                                    <button
                                                        onClick={() => handleCommentVote(comment.id, 'up')}
                                                        className={`flex items-center space-x-1.5 text-xs font-semibold transition-colors ${comment.userVote === 'up' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                                                            }`}
                                                    >
                                                        <FaCheck className="text-sm" />
                                                        <span>{comment.upvotes}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCommentVote(comment.id, 'down')}
                                                        className={`flex items-center space-x-1.5 text-xs font-semibold transition-colors ${comment.userVote === 'down' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                                                            }`}
                                                    >
                                                        <FaTimes className="text-sm" />
                                                        <span>{comment.downvotes}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {}
                            <form onSubmit={handleSendComment} className="p-6 border-t border-white/10 bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <ChatbotWidget />
        </div >
    );
}