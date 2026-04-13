'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    FaUniversity, 
    FaGraduationCap, 
    FaUserTie, 
    FaRunning, 
    FaCalendarAlt, 
    FaChalkboardTeacher,
    FaArrowLeft,
    FaInfoCircle,
    FaClock
} from 'react-icons/fa';
import GlobalBackground from '@/components/GlobalBackground';
import Navbar from '@/components/Navbar';

const categoryData = {
    general: {
        title: "College Related",
        icon: FaUniversity,
        color: "text-red-500",
        description: "Official information about the National Forensic Sciences University.",
        stats: [
            { label: "Established", value: "2020" },
            { label: "Campuses", value: "8+" },
            { label: "Recognition", value: "INIs" }
        ]
    },
    administrative: {
        title: "Administrative Related",
        icon: FaUserTie,
        color: "text-amber-500",
        description: "Administrative support, rules, and departmental guidelines.",
        stats: [
            { label: "Offices", value: "Available" },
            { label: "Response", value: "24-48h" },
            { label: "Process", value: "Digital" }
        ]
    },
    sports: {
        title: "Sports Related",
        icon: FaRunning,
        color: "text-green-500",
        description: "Sports activities, teams, and campus athletic facilities.",
        stats: [
            { label: "Teams", value: "15+" },
            { label: "Grounds", value: "3" },
            { label: "Events", value: "Annual" }
        ]
    },
    events: {
        title: "Events Related",
        icon: FaCalendarAlt,
        color: "text-purple-500",
        description: "Upcoming fests, technical workshops, and campus ceremonies.",
        stats: [
            { label: "Next Event", value: "Coming Soon" },
            { label: "Annual Fest", value: "Vasant" },
            { label: "Workshops", value: "Weekly" }
        ]
    },
    teachers: {
        title: "Teachers Related",
        icon: FaChalkboardTeacher,
        color: "text-pink-500",
        description: "Faculty portal, directory, and professional specializations.",
        stats: [
            { label: "Faculty", value: "200+" },
            { label: "PhDs", value: "85%" },
            { label: "Mentors", value: "Assigned" }
        ]
    }
};

export default function CategoryPage() {
    const { category } = useParams();
    const data = categoryData[category] || categoryData.general;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <GlobalBackground />
            <Navbar />

            <main className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto z-10">
                {/* Navigation Breadcrumb */}
                <div className="mb-12">
                    <Link 
                        href="/college"
                        className="flex items-center space-x-2 text-gray-500 hover:text-white transition-all group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Back to Hub</span>
                    </Link>
                </div>

                {/* Content Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card-theme p-8 md:p-12 border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-12">
                        <div className={`w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center ${data.color} text-4xl shadow-inner border border-white/5`}>
                            <data.icon />
                        </div>
                        <div className="mt-6 md:mt-0">
                            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                                {data.title}
                            </h1>
                            <div className="flex items-center space-x-3 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                <span className={data.color}>Information Section</span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                    <FaClock />
                                    <span>Last updated: Recently</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-300 text-lg leading-relaxed mb-12 max-w-3xl">
                        {data.description} This section is currently being updated with the latest details and resources from the administration to provide you with a comprehensive experience.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {data.stats.map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder Info Box */}
                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl flex items-start space-x-4">
                        <FaInfoCircle className="text-red-500 mt-1 flex-shrink-0" />
                        <p className="text-gray-400 text-sm italic">
                            Official data for this category is currently being migrated. Please check back soon for interactive features, downloadable resources, and detailed directories.
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
