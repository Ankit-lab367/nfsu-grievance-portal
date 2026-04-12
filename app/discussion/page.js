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
        const fetchMessages = async (currentUser) => {
            try {
                const token = localStorage.getItem('token');
                const roleType = currentUser.role === 'student' ? 'student' : 'admin';
                const res = await fetch(`/api/discussion?type=${roleType}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store'
                });
                const data = await res.json();
                if (data.success) {
                    const welcomeMsg = {
                        id: 'welcome_msg',
                        sender: 'NFSU Bot',
                        text: `Welcome to the ${currentUser.role === 'student' ? 'Student' : 'Staff'} Discussion Forum! Feel free to share your thoughts.`,
                        role: 'other',
                        time: 'System',
                        isSystem: true
                    };
                    const formatted = data.messages.map(m => ({
                        id: m._id,
                        sender: m.senderName,
                        avatar: m.senderAvatar,
                        text: m.text,
                        role: m.senderEmail === currentUser.email ? 'self' : 'other',
                        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                    setMessages([welcomeMsg, ...formatted]);
                }
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setMessagesLoaded(true);
            }
        };

        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchMessages(parsedUser);
    }, [router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;
        
        const tempId = Date.now().toString();
        const roleType = user.role === 'student' ? 'student' : 'admin';
        
        const optimisticMessage = {
            id: tempId,
            sender: user.name || 'You',
            avatar: user.avatar,
            text: input,
            role: 'self',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        const messageText = input;
        setInput('');
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/discussion', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: messageText,
                    forumType: roleType
                })
            });
            const data = await res.json();
            if (!data.success) {
                console.error(data.message);
            }
        } catch (err) {
            console.error("Failed to post message", err);
        }
    };
    return (
        <div className="min-h-screen relative transition-colors duration-500 flex flex-col">
            {}
            <Navbar />
            {}
            <div className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-5xl">
                {}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-theme p-4 mb-4 flex items-center justify-between shadow-lg"
                >
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push(user?.role === 'student' ? '/dashboard/student' : '/dashboard/admin')}
                            className="p-2 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <FaArrowLeft />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-500/10 p-2 rounded-xl">
                                <FaUsers className="text-red-600 dark:text-red-400 text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold dark:text-white leading-tight">
                                    {user?.role === 'student' ? 'Student Discussion' : 'Staff Discussion'}
                                </h1>
                                <div className="flex items-center space-x-1.5">
                                    <FaCircle className="text-green-500 text-[8px]" />
                                    <span className="dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        {user?.role === 'student' ? '24 Students Online' : '8 Staff Online'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                {}
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
                                    {}
                                    <div className="flex-shrink-0 mb-1">
                                        {msg.isSystem ? (
                                            <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                                <FaCircle className="text-[10px] animate-pulse" />
                                            </div>
                                        ) : msg.avatar ? (
                                            <img src={msg.avatar} alt={msg.sender} className="w-10 h-10 rounded-2xl object-cover border-2 border-white/10 shadow-md" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${msg.role === 'self' ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                                                {msg.sender?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`flex flex-col ${msg.role === 'self' ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                        <div className="flex items-center space-x-2 mb-1 px-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'self' ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {msg.sender === 'You' && user ? user.name : msg.sender}
                                            </span>
                                            <span className="text-[10px] dark:text-gray-500 font-medium">
                                                {msg.time}
                                            </span>
                                        </div>
                                        <div
                                            className={`px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm transition-all
                                                ${msg.role === 'self'
                                                    ? 'bg-transparent border-2 border-white/10 text-white backdrop-blur-md'
                                                    : 'bg-white/5 dark:bg-slate-900/80 text-gray-100 border border-white/5 shadow-lg dark:shadow-black/20'
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
                    {}
                    <div className="p-4 bg-black/20 border-t border-white/10">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Share your thoughts with the community..."
                                className="flex-1 px-5 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-4 bg-gradient-to-r from-red-700 to-rose-800 text-white rounded-2xl hover:shadow-lg hover:shadow-red-500/40 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
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