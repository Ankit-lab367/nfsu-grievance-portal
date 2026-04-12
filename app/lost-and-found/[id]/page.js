'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaComments, FaTimesCircle, FaCheck, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import Link from 'next/link';
export default function ItemDetailsPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/lost-and-found/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setItem(data.item);
                    if (data.item?.comments && data.item.comments.length > 0) {
                        const mappedComments = data.item.comments.map(c => ({
                            id: c._id,
                            user: c.user,
                            avatar: c.avatar,
                            text: c.text,
                            timestamp: c.timestamp,
                            upvotes: c.upvotes || 0,
                            downvotes: c.downvotes || 0,
                            userVote: null
                        }));
                        setComments(mappedComments);
                    }
                }
            } catch (error) {
                console.error("Error fetching item:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([
        {
            id: 1,
            user: "Security Office",
            avatar: null,
            text: "This item has been officially logged in our system.",
            timestamp: new Date().toISOString(),
            upvotes: 1,
            downvotes: 0
        }
    ]);
    const [newComment, setNewComment] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }, []);
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        
        const text = newComment;
        setNewComment("");

        const optimisticComment = {
            id: Date.now().toString(),
            user: currentUser.name || "Anonymous",
            avatar: currentUser.avatar || null,
            text,
            timestamp: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0
        };
        setComments(prev => [...prev, optimisticComment]);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/lost-and-found/comment', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ itemId: id, text })
            });

            const data = await res.json();
            if (!data.success) {
                console.error("Failed to post comment:", data.message);
            }
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };
    const handleReceived = async () => {
        const receivedBy = window.prompt("Mark as received? Please enter who received this item:");
        if (receivedBy !== null) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`/api/lost-and-found/${id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` 
                    },
                    body: JSON.stringify({ status: 'resolved' })
                });
            } catch (err) {
                console.error("Failed to update status:", err);
            }
            try {
                const token = localStorage.getItem('token');
                await axios.post('/api/notifications/broadcast', {
                    type: 'resolution',
                    title: 'Item Received',
                    message: `${item.subject} has been received by ${receivedBy || 'someone'}!`,
                    link: '/lost-and-found'
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error("Failed to broadcast notification:", error);
            }
            alert("Item marked as received and community notified.");
            router.push('/lost-and-found');
        }
    };
    return (
        <div className="min-h-screen relative transition-colors duration-500 overflow-x-hidden">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <Link href="/lost-and-found" className="inline-flex items-center text-red-500 hover:text-red-400 font-medium transition-colors mb-6 group">
                        <FaArrowLeft className="mr-2 text-sm transition-transform group-hover:-translate-x-1" /> Back to Listing
                    </Link>
                    {item ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card-theme p-0 overflow-hidden border-white/10 shadow-2xl"
                        >
                            {}
                            <div className="p-8 border-b border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type === 'found'
                                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-500 border border-red-500/30'
                                        }`}>
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-2">
                                        <FaClock /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.time}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-2 border-l border-white/10 pl-3">
                                        <FaMapMarkerAlt className="text-red-500" /> {item.location}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold dark:text-white leading-tight">
                                    {item.subject}
                                </h1>
                            </div>
                            {}
                            <div className="relative w-full h-[400px] bg-white/5 dark:bg-white/5 overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.subject}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        No image provided
                                    </div>
                                )}
                            </div>
                            {}
                            <div className="p-8 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                                        Description
                                    </h3>
                                    <p className="text-lg dark:text-gray-300 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowComments(true)}
                                        className="flex items-center gap-3 px-8 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all font-bold"
                                    >
                                        <FaComments className="text-xl" />
                                        <span>Open Discussions</span>
                                    </motion.button>
                                    {currentUser && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleReceived}
                                            className="flex items-center gap-3 px-8 py-4 bg-green-600/20 text-green-500 border border-green-500/30 rounded-2xl shadow-xl hover:bg-green-600 hover:text-white transition-all font-bold"
                                        >
                                            <FaCheck className="text-xl" />
                                            <span>Received?</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : loading ? (
                        <div className="text-center py-20 flex justify-center items-center">
                            <div className="w-8 h-8 rounded-full border-t-2 border-red-500 animate-spin"></div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-white">Item not found</h2>
                        </div>
                    )}
                </div>
            </div>
            {}
            <AnimatePresence>
                {showComments && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowComments(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-card-theme border-l border-white/10 z-[100] flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                        <FaComments />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Item Discussion</h2>
                                </div>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FaTimesCircle className="text-2xl" />
                                </button>
                            </div>
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendComment} className="p-6 border-t border-white/10 bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ask a question about this item..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-shadow-sm"
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
        </div>
    );
}