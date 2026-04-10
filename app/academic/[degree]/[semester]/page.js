'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBook, FaFileAlt, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import ChatbotWidget from '@/components/ChatbotWidget';
export default function SemesterResourcesPage() {
    const params = useParams();
    const router = useRouter();
    const { degree, semester } = params;
    const resourceTypes = [
        {
            id: 'notes',
            title: 'Notes',
            description: 'Lecture notes and study materials',
            icon: <FaFileAlt className="text-4xl mb-4 text-red-400" />,
            color: 'from-red-500/20 to-red-600/20',
            borderColor: 'border-red-500/30',
        },
        {
            id: 'pyq',
            title: 'Previous Year Questions',
            description: 'Past exam papers for practice',
            icon: <FaQuestionCircle className="text-4xl mb-4 text-rose-400" />,
            color: 'from-rose-500/20 to-rose-600/20',
            borderColor: 'border-rose-500/30',
        },
        {
            id: 'books',
            title: 'Books & References',
            description: 'Recommended textbooks and guides',
            icon: <FaBook className="text-4xl mb-4 text-red-500" />,
            color: 'from-red-600/20 to-rose-700/20',
            borderColor: 'border-red-600/30',
        },
    ];
    return (
        <div className="min-h-screen relative transition-colors duration-500">
            {}
            <Navbar />
            <div className="container mx-auto px-6 py-8 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {degree?.toUpperCase()} - Semester {semester}
                    </h1>
                    <p className="text-gray-300 text-lg">Select a category to view resources</p>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {resourceTypes.map((type, index) => (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={`/academic/${degree}/${semester}/${type.id}`}
                                className={`block h-full p-8 rounded-2xl bg-gradient-to-br ${type.color} backdrop-blur-md border ${type.borderColor} hover:scale-105 transition-all duration-300 group cursor-pointer`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="group-hover:scale-110 transition-transform duration-300">
                                        {type.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-3">{type.title}</h2>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                        {type.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
            <ChatbotWidget />
        </div>
    );
}