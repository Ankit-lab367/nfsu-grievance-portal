'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
    FaUniversity, 
    FaGraduationCap, 
    FaUserTie, 
    FaRunning, 
    FaCalendarAlt, 
    FaChalkboardTeacher,
    FaArrowLeft,
    FaChevronRight,
    FaStar,
    FaLock
} from 'react-icons/fa';
import GlobalBackground from '@/components/GlobalBackground';
import Navbar from '@/components/Navbar';

const collegeCategories = [
    {
        title: "Campus Vision",
        subtitle: "College Core",
        description: "Explore our institutional legacy, mission statements, and future roadmaps.",
        icon: FaUniversity,
        color: "from-blue-600 to-indigo-700",
        href: "/college/general",
        glow: "rgba(37, 99, 235, 0.3)"
    },
    {
        title: "Admin Hub",
        subtitle: "Governance",
        description: "Streamlined administrative support, official rules, and departmental guidelines.",
        icon: FaUserTie,
        color: "from-amber-500 to-orange-600",
        href: "/college/administrative",
        glow: "rgba(245, 158, 11, 0.3)"
    },
    {
        title: "Sports Arena",
        subtitle: "Athletics",
        description: "Track match schedules, team registrations, and elite sports facility data.",
        icon: FaRunning,
        color: "from-emerald-500 to-teal-700",
        href: "/college/sports",
        glow: "rgba(16, 185, 129, 0.3)"
    },
    {
        title: "Event Pulse",
        subtitle: "Life at NFSU",
        description: "Never miss a beat. Workshops, fests, and cultural ceremonies updated live.",
        icon: FaCalendarAlt,
        color: "from-fuchsia-600 to-purple-800",
        href: "/college/events",
        glow: "rgba(192, 38, 211, 0.3)"
    },
    {
        title: "Faculty Circle",
        subtitle: "Expertise",
        description: "Connect with world-class mentors, research leads, and academic advisors.",
        icon: FaChalkboardTeacher,
        color: "from-rose-500 to-red-700",
        href: "/college/teachers",
        glow: "rgba(225, 29, 72, 0.3)"
    },
    {
        title: "Academic Vault",
        subtitle: "Resources",
        description: "Digital libraries, research papers, and exclusive study materials.",
        icon: FaGraduationCap,
        color: "from-violet-600 to-blue-800",
        href: "/college/academic",
        glow: "rgba(124, 58, 237, 0.3)"
    }
];

function CategoryCard({ category, index, onNotify }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setMousePos({ x: 0, y: 0 });
            }}
            style={{ 
                perspective: 1000,
                rotateX: isHovered ? mousePos.y * -15 : 0,
                rotateY: isHovered ? mousePos.x * 15 : 0,
                transition: 'all 0.1s ease'
            }}
            className="group relative cursor-pointer"
            onClick={onNotify}
        >
            {/* Glow Effect */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] blur-[30px]"
                style={{ 
                    background: category.glow,
                    transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` 
                }}
            />

            <div className="relative h-[340px] rounded-[2rem] p-8 overflow-hidden bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300 shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/[0.05] to-transparent rounded-full -mr-20 -mt-20 blur-2xl" />
                
                <div className="h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} p-3.5 shadow-lg group-hover:scale-110 transition-transform duration-500 relative`}>
                            <category.icon className="w-full h-full text-white" />
                            <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white/40 transition-colors">Locked</span>
                            <FaLock className="text-gray-600 group-hover:text-white/20 text-xs" />
                        </div>
                    </div>

                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 block bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                            {category.subtitle}
                        </span>
                        <h2 className="text-2xl font-black mb-3 text-white tracking-tight group-hover:translate-x-1 transition-transform">
                            {category.title}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium group-hover:text-gray-400 transition-colors">
                            {category.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/[0.05]">
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-red-500/80">Coming Soon</span>
                        </div>
                        <FaChevronRight className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                </div>

                {/* Animated Inner Glow */}
                <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr ${category.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`} />
            </div>
        </motion.div>
    );
}

export default function CollegeHub() {
    const [notification, setNotification] = useState(null);

    const triggerNotify = (title) => {
        setNotification(`Synchronizing ${title}... Feature arriving in the next cycle.`);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-blue-500/30 font-sans">
            <GlobalBackground />
            <Navbar />

            {/* Premium Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 glass-card-theme border-white/20 shadow-2xl rounded-2xl flex items-center space-x-4 min-w-[320px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <FaStar className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] font-black text-blue-400 mb-1">System Update</p>
                            <p className="text-sm font-bold text-white/90">{notification}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative pt-32 pb-32 px-6 max-w-7xl mx-auto z-10">
                {/* Header Section */}
                <div className="text-center mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
                            <FaUniversity className="text-blue-500 text-[10px]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">NFSU Institutional Core</span>
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">
                            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">College</span>
                            <span className="text-white">Hub</span>
                        </h1>
                        
                        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            A centralized ecosystem for institutional research, administrative governance, and student life. 
                            <span className="block mt-2 text-white/20">Version 2.0 Integration Pending</span>
                        </p>
                    </motion.div>

                    {/* Decorative Blurs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {collegeCategories.map((category, index) => (
                        <CategoryCard 
                            key={category.title} 
                            category={category} 
                            index={index} 
                            onNotify={() => triggerNotify(category.title)}
                        />
                    ))}
                </div>

                {/* Back Button */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-24 text-center"
                >
                    <Link 
                        href="/dashboard/student"
                        className="group relative inline-flex items-center space-x-3 text-gray-400 hover:text-white transition-all font-black uppercase tracking-[0.4em] text-[10px] py-5 px-10 rounded-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 border border-white/10 group-hover:border-white/20 transition-colors" />
                        <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Ops</span>
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
