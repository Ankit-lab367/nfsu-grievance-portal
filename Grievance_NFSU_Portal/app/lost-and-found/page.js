'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaChevronRight, FaImage, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';

export default function LostAndFoundPage() {
    const router = useRouter();
    const [items, setItems] = useState([]);

    useEffect(() => {
        const storedItems = localStorage.getItem('lost_and_found_items');
        if (storedItems) {
            setItems(JSON.parse(storedItems));
        }
    }, []);

    return (
        <div className="min-h-screen relative bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 overflow-x-hidden">
            {/* Background Effects */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40"
                style={{ backgroundImage: 'url(/background.jpeg)' }}
            />
            <div className="fixed inset-0 bg-white/40 dark:bg-black/45 transition-colors duration-500" />

            <Navbar />

            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* Header with Stylish Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Lost & Found</h1>
                        <p className="text-slate-500 dark:text-gray-400">Help the community by reported lost or found items.</p>
                    </motion.div>

                    <Link href="/lost-and-found/publish" className="group">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl shadow-xl transition-all group-hover:shadow-blue-500/20"
                        >
                            <div className="px-8 py-4 bg-slate-900 dark:bg-white/5 rounded-xl flex items-center gap-3 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-500 text-white font-bold text-lg">
                                <FaPlus className="text-xl transition-transform group-hover:rotate-90" />
                                <span>Want to publish?</span>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Items Listing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/lost-and-found/${item.id}`} className="block group">
                                <div className="glass-card-theme p-0 overflow-hidden border-slate-200 dark:border-white/10 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:border-blue-500/30 group-hover:-translate-y-1 h-full flex">
                                    {/* Content (Left) */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type === 'found'
                                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-500 border border-red-500/30'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <FaClock className="text-[8px]" /> {item.time}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-500 transition-colors">
                                                {item.subject}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <FaMapMarkerAlt className="text-blue-500" /> {item.location}
                                            </span>
                                            <div className="flex items-center text-blue-500 font-bold text-xs group-hover:translate-x-1 transition-transform">
                                                View Details <FaChevronRight className="ml-1 text-[8px]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image (Right) */}
                                    <div className="w-1/3 min-h-full relative overflow-hidden bg-slate-100 dark:bg-white/5 border-l border-slate-100 dark:border-white/5">
                                        <img
                                            src={item.image}
                                            alt={item.subject}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State Mock */}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                            <FaSearch className="text-5xl text-blue-500/40" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">No items reported yet</h3>
                        <p className="text-gray-400 mt-2">Be the first to help out!</p>
                    </div>
                )}
            </div>

            <ChatbotWidget />
        </div>
    );
}
