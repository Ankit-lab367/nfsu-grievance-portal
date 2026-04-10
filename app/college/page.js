'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
    FaUniversity, 
    FaGraduationCap, 
    FaUserTie, 
    FaRunning, 
    FaCalendarAlt, 
    FaChalkboardTeacher,
    FaArrowLeft,
    FaChevronRight
} from 'react-icons/fa';
import GlobalBackground from '@/components/GlobalBackground';
import Navbar from '@/components/Navbar';

const collegeCategories = [
    {
        title: "College Related",
        description: "Official information about campus, vision, and mission.",
        icon: FaUniversity,
        color: "from-red-600 to-rose-700",
        href: "/college/general",
        shadow: "shadow-red-900/40"
    },
    {
        title: "Academic Related",
        description: "Course structures, syllabus, and academic calendars.",
        icon: FaGraduationCap,
        color: "from-blue-600 to-cyan-700",
        href: "/college/academic",
        shadow: "shadow-blue-900/40"
    },
    {
        title: "Administrative Related",
        description: "Rules, regulations, departments, and administrative support.",
        icon: FaUserTie,
        color: "from-amber-600 to-orange-700",
        href: "/college/administrative",
        shadow: "shadow-orange-900/40"
    },
    {
        title: "Sports Related",
        description: "Information about teams, matches, and sports facilities.",
        icon: FaRunning,
        color: "from-green-600 to-emerald-700",
        href: "/college/sports",
        shadow: "shadow-green-900/40"
    },
    {
        title: "Events Related",
        description: "Upcoming college fests, workshops, and ceremonies.",
        icon: FaCalendarAlt,
        color: "from-purple-600 to-indigo-700",
        href: "/college/events",
        shadow: "shadow-purple-900/40"
    },
    {
        title: "Teachers Related",
        description: "Faculty directory, research specializations, and office hours.",
        icon: FaChalkboardTeacher,
        color: "from-pink-600 to-rose-700",
        href: "/college/teachers",
        shadow: "shadow-rose-900/40"
    }
];

export default function CollegeHub() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-red-500/30">
            <GlobalBackground />
            <Navbar />

            <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto z-10">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent italic">
                            College Hub
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                            Explore every dimension of our institution. From academic excellence to vibrant events, find everything you need right here.
                        </p>
                    </motion.div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {collegeCategories.map((category, index) => (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <button 
                                onClick={() => alert(`${category.title} feature is currently under development.`)}
                                className="w-full text-left"
                            >
                                <motion.div
                                    whileHover={{ 
                                        y: -10,
                                        scale: 1.02,
                                        transition: { type: "spring", stiffness: 300 }
                                    }}
                                    className={`group relative h-72 rounded-3xl p-8 overflow-hidden glass-card-theme border-white/10 hover:border-white/20 transition-all duration-300 ${category.shadow} hover:shadow-2xl`}
                                >
                                    {/* Background Accent */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity`} />
                                    
                                    <div className="h-full flex flex-col justify-between relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <category.icon className="w-full h-full text-white" />
                                            </div>
                                            <FaChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-black mb-3 text-white tracking-tight">
                                                {category.title}
                                            </h2>
                                            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom Decorative Bar */}
                                    <div className={`absolute bottom-0 left-0 h-1.5 bg-gradient-to-r ${category.color} w-0 group-hover:w-full transition-all duration-500 ease-in-out`} />
                                </motion.div>
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Back Button */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <Link 
                        href="/dashboard/student"
                        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs py-4 px-8 border border-white/5 rounded-full hover:bg-white/5"
                    >
                        <FaArrowLeft className="text-[10px]" />
                        <span>Return to Dashboard</span>
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
