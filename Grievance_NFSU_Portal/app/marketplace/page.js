'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
import { motion } from 'framer-motion';
import { FaPlus, FaShoppingCart, FaTag, FaMapMarkerAlt, FaChevronRight, FaBoxOpen } from 'react-icons/fa';
import Link from 'next/link';

export default function MarketplacePage() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const storedItems = localStorage.getItem('marketplace_items');
        if (storedItems) {
            setItems(JSON.parse(storedItems));
        }
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            NFSU Marketplace <FaShoppingCart className="text-blue-500 text-2xl" />
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium">Trade books, lab coats, electronics, and more with fellow students.</p>
                    </motion.div>

                    <Link href="/marketplace/sell" className="group">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl shadow-xl transition-all group-hover:shadow-green-500/20"
                        >
                            <div className="px-8 py-4 bg-slate-900 dark:bg-white/5 rounded-xl flex items-center gap-3 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:via-blue-600 group-hover:to-green-500 text-white font-bold text-lg">
                                <FaPlus className="text-xl transition-transform group-hover:rotate-90" />
                                <span>Post an Item</span>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/marketplace/${item.id}`} className="block group">
                                <div className="glass-card-theme p-0 overflow-hidden border-slate-200 dark:border-white/10 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:border-blue-500/30 group-hover:-translate-y-2 h-full flex flex-col">
                                    {/* Image Section */}
                                    <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-white/5">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.subject}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <FaTag className="text-4xl opacity-20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Row */}
                                    <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 border-y border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-extrabold text-xl">
                                            <FaTag className="text-sm opacity-50" />
                                            {formatPrice(item.price)}
                                        </div>
                                        <div className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-500/20">
                                            Good Deal
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors italic">
                                                {item.subject}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]">
                                                <FaMapMarkerAlt className="text-blue-500" /> {item.location || 'Campus'}
                                            </span>
                                            <div className="text-blue-500 font-black text-xs flex items-center gap-1 group-hover:gap-2 transition-all uppercase italic">
                                                Details <FaChevronRight className="text-[8px]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="w-40 h-40 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 relative">
                            <FaBoxOpen className="text-6xl text-blue-500/40" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 border-2 border-blue-500/20 rounded-full"
                            />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic">The Market is Quiet...</h3>
                        <p className="text-slate-500 dark:text-gray-400 max-w-sm font-medium">
                            No items listed yet. Be the first to sell something and earn some extra cash!
                        </p>
                        <Link href="/marketplace/sell" className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform">
                            Start Selling Now
                        </Link>
                    </motion.div>
                )}
            </div>

            <ChatbotWidget />
        </div>
    );
}
