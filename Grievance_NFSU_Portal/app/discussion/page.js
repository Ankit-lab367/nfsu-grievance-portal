'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaUserCircle, FaCircle, FaUsers, FaArrowLeft } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function DiscussionPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [messagesLoaded, setMessagesLoaded] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Load role-specific messages
        const storageKey = parsedUser.role === 'student' ? 'messages_student' : 'messages_admin';
        const savedMessages = localStorage.getItem(storageKey);

        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        } else {
            // Default welcome message
            const welcomeMsg = {
                id: 1,
                sender: 'NFSU Bot',
                text: `Welcome to the ${parsedUser.role === 'student' ? 'Student' : 'Staff'} Discussion Forum! Feel free to share your thoughts.`,
                role: 'other',
                time: 'System',
                isSystem: true
            };
            setMessages([welcomeMsg]);
        }
        setMessagesLoaded(true);
    }, [router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const newMessage = {
            id: Date.now(),
            sender: user.name || 'You',
            avatar: user.avatar,
            text: input,
            role: 'self',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput('');

        // Persist to role-specific storage
        const storageKey = user.role === 'student' ? 'messages_student' : 'messages_admin';
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    };

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 flex flex-col">
            {/* Background Decorations */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-20"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            <Navbar />

            {/* Chat Container */}
            <div className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-theme p-4 mb-4 flex items-center justify-between shadow-lg"
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push(user?.role === 'student' ? '/dashboard/student' : '/dashboard/admin')}
                            className="p-2 text-slate-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500/10 p-2 rounded-xl">
                                <FaUsers className="text-blue-600 dark:text-blue-400 text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {user?.role === 'student' ? 'Student Discussion' : 'Staff Discussion'}
                                </h1>
                                <div className="flex items-center space-x-1.5">
                                    <FaCircle className="text-green-500 text-[8px]" />
                                    <span className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        {user?.role === 'student' ? '24 Students Online' : '8 Staff Online'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Messages Area */}
                <div className="flex-1 glass-card-theme mb-4 overflow-hidden flex flex-col shadow-xl">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex items-end space-x-3 ${msg.role === 'self' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mb-1">
                                        {msg.isSystem ? (
                                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                                <FaCircle className="text-[10px] animate-pulse" />
                                            </div>
                                        ) : msg.avatar ? (
                                            <img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-200 dark:border-white/10 shadow-md" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${msg.role === 'self' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                                                {msg.sender?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex flex-col ${msg.role === 'self' ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                        <div className="flex items-center space-x-2 mb-1 px-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'self' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {msg.sender === 'You' && user ? user.name : msg.sender}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                                                {msg.time}
                                            </span>
                                        </div>

                                        <div
                                            className={`px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm transition-all
                                                ${msg.role === 'self'
                                                    ? 'bg-transparent border-2 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white backdrop-blur-md'
                                                    : 'bg-white dark:bg-slate-900/80 text-slate-800 dark:text-gray-100 border border-slate-100 dark:border-white/5 shadow-lg dark:shadow-black/20'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900/5 dark:bg-black/20 border-t border-slate-200 dark:border-white/10">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Share your thoughts with the community..."
                                className="flex-1 px-5 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/40 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane className="text-lg" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
}
