'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaMapMarkerAlt, FaTag, FaComments, FaTimesCircle, FaPaperPlane, FaUser, FaRupeeSign, FaShoppingCart, FaClock } from 'react-icons/fa';
import Link from 'next/link';

export default function MarketplaceItemDetailsPage({ params }) {
    const router = useRouter();
    const { id } = params;

    const [item, setItem] = useState(null);
    const [showNegotiation, setShowNegotiation] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            user: "Market Bot",
            avatar: null,
            text: "Welcome to the negotiation! Be polite and fair with your offers.",
            timestamp: new Date().toISOString()
        }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        const storedItems = JSON.parse(localStorage.getItem('marketplace_items') || '[]');
        const foundItem = storedItems.find(i => i.id === id);
        if (foundItem) {
            setItem(foundItem);
        }
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now(),
            user: currentUser?.name || "Anonymous",
            avatar: currentUser?.avatar,
            text: newMessage,
            timestamp: new Date().toISOString()
        };

        setMessages([...messages, msg]);
        setNewMessage("");
    };

    const handleSold = async () => {
        const soldTo = window.prompt("Mark as sold? Please enter who bought this item:");

        if (soldTo !== null) {
            const storedItems = JSON.parse(localStorage.getItem('marketplace_items') || '[]');
            const updatedItems = storedItems.filter(i => i.id !== id);
            localStorage.setItem('marketplace_items', JSON.stringify(updatedItems));

            try {
                const token = localStorage.getItem('token');
                await axios.post('/api/notifications/broadcast', {
                    type: 'resolution',
                    title: 'Item Sold',
                    message: `${item.subject} has been sold to ${soldTo || 'someone'}!`,
                    link: '/marketplace'
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error("Failed to broadcast notification:", error);
            }

            alert("Item marked as sold and community notified.");
            router.push('/marketplace');
        }
    };

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 overflow-x-hidden">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            <Navbar />

            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <Link href="/marketplace" className="inline-flex items-center text-blue-500 hover:text-blue-400 font-medium transition-colors mb-6 group">
                        <FaArrowLeft className="mr-2 text-sm transition-transform group-hover:-translate-x-1" /> Back to Marketplace
                    </Link>

                    {item ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card-theme p-0 overflow-hidden border-slate-200 dark:border-white/10 shadow-3xl"
                        >
                            {/* 1. Header & Subject */}
                            <div className="p-8 md:p-12 border-b border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2 block italic">NFSU Marketplace Verified</span>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight italic">
                                    {item.subject}
                                </h1>
                            </div>

                            {/* 2. Full Width Image */}
                            <div className="relative w-full h-[500px] bg-slate-100 dark:bg-white/5 overflow-hidden border-b border-white/10">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.subject}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <FaTag className="text-6xl opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* 3. Info Bar & Price */}
                            <div className="bg-slate-50 dark:bg-white/5 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        <span className="flex items-center gap-1.5 py-1.5 px-4 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
                                            <FaMapMarkerAlt /> {item.location}
                                        </span>
                                        <span className="flex items-center gap-1.5 py-1.5 px-4 bg-white/5 rounded-full border border-white/10">
                                            <FaClock /> Posted {item.time}
                                        </span>
                                    </div>
                                    <div className="text-4xl md:text-6xl font-black text-green-600 dark:text-green-400 flex items-center gap-4">
                                        <FaRupeeSign className="text-2xl opacity-50" />
                                        {formatPrice(item.price)}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowNegotiation(true)}
                                        className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all font-black text-lg uppercase tracking-wider italic"
                                    >
                                        <FaComments className="text-xl" />
                                        <span>Comments & Negotiation</span>
                                    </motion.button>

                                    {currentUser && item.uploaderId === currentUser.email && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleSold}
                                            className="flex items-center justify-center gap-3 px-10 py-5 bg-green-600 border border-green-500 text-white rounded-2xl shadow-2xl shadow-green-500/20 hover:bg-green-500 transition-all font-black text-lg uppercase tracking-wider italic"
                                        >
                                            <FaShoppingCart className="text-xl" />
                                            <span>Mark as Sold</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* 4. Description */}
                            <div className="p-8 md:p-12 space-y-6 bg-white dark:bg-transparent">
                                <h3 className="text-xs font-black text-slate-700 dark:text-gray-300 uppercase tracking-widest italic">Product Overview</h3>
                                <p className="text-xl text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-3xl font-black text-white italic">Item vanished from Market!</h2>
                            <Link href="/marketplace" className="text-blue-500 font-bold mt-4 inline-block hover:underline">Return to Marketplace</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Negotiation Side Panel */}
            <AnimatePresence>
                {showNegotiation && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNegotiation(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90]"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-card-theme border-l border-white/20 z-[100] flex flex-col shadow-3xl"
                        >
                            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl text-white shadow-lg">
                                        <FaComments />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white italic">Comments & Negotiation</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatPrice(item?.price)} Asking Price</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNegotiation(false)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FaTimesCircle className="text-3xl opacity-50 hover:opacity-100" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.user === currentUser?.name ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] space-y-2 ${msg.user === currentUser?.name ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1 px-1 text-[8px] font-black text-white/40 uppercase tracking-widest italic">
                                                <span>{msg.user}</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl border text-sm font-medium shadow-lg transition-all ${msg.user === currentUser?.name
                                                ? 'bg-blue-600 border-blue-400 text-white rounded-tr-none'
                                                : 'bg-white/10 border-white/10 text-gray-200 rounded-tl-none'
                                                }`}>
                                                <p>{msg.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-8 border-t border-white/10 bg-white/5">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Make an offer or ask a question..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        className="p-4 bg-gradient-to-tr from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center shrink-0"
                                    >
                                        <FaPaperPlane className="transform rotate-12" />
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
