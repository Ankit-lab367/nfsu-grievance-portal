'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeadset, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import axios from 'axios';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m the NFSU Grievance Assistant. How can I help you today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/complaints/chatbot',
                {
                    message: userMessage,
                    sessionId,
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: response.data.message,
                },
            ]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'I apologize, but I\'m having trouble connecting right now. Please try again later.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        'How do I file a complaint?',
        'Which department should I choose?',
        'How can I track my complaint?',
        'What is the complaint process?',
    ];

    const handleQuickAction = (action) => {
        setInput(action);
    };

    return (
        <>
            {/* Chatbot Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center text-white text-3xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                    boxShadow: isOpen
                        ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                        : [
                            "0 0 0 0px rgba(59, 130, 246, 0.4)",
                            "0 0 0 15px rgba(59, 130, 246, 0)",
                            "0 0 0 0px rgba(59, 130, 246, 0)"
                        ]
                }}
                transition={isOpen ? {} : {
                    boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                    }
                }}
            >
                {isOpen ? <FaTimes /> : (
                    <div className="relative">
                        <FaHeadset />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-blue-600 animate-pulse" />
                    </div>
                )}
            </motion.button>

            {/* Chatbot Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] glass-card-theme flex flex-col overflow-hidden border border-slate-200 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                                    <FaHeadset className="text-white text-xl" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold flex items-center">
                                        Support Agent
                                        <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Online" />
                                    </h3>
                                    <p className="text-blue-100 text-xs text-opacity-80">Online | Always active</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl font-medium ${message.role === 'user'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-slate-900/5 dark:bg-white/10 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-white/5'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-900/5 dark:bg-white/10 px-4 py-2 rounded-xl">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length === 1 && (
                            <div className="px-4 pb-2">
                                <p className="text-gray-400 text-xs mb-2">Quick Actions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickAction(action)}
                                            className="text-xs px-3 py-1 bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 rounded-full transition-colors border border-slate-200 dark:border-white/5 font-medium"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={sendMessage} className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
