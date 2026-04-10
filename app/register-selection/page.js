'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaUserShield, FaArrowLeft, FaSun, FaMoon } from 'react-icons/fa';

export default function RegisterSelectionPage() {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const roles = [
        {
            id: 'student',
            title: 'Student',
            description: 'Register as a student to file and track your grievances.',
            icon: <FaGraduationCap className="text-4xl text-red-400" />,
            href: '/register',
            color: 'from-red-500 to-rose-600'
        },
        {
            id: 'staff',
            title: 'Staff',
            description: 'Register as a staff member (Faculty, Admin, Teachers).',
            icon: <FaUserShield className="text-4xl text-rose-400" />,
            href: '/register/staff',
            color: 'from-red-600 to-rose-800'
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-500">
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 glass-theme rounded-full dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all z-50 border border-white/10 shadow-lg"
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="relative z-10 w-full max-w-4xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <img src="/logo.png" alt="NFSU Logo" className="w-20 h-20 object-contain mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-bold dark:text-white mb-4">Choose Your Role</h1>
                    <p className="dark:text-gray-300 text-lg font-medium">Select the type of account you want to create</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                        >
                            <Link href={role.href} id={`register-role-${role.id}`} className="block group">
                                <div className="glass-card-theme p-10 h-full border border-white/10 shadow-xl hover:shadow-2xl hover:border-red-500/50 transition-all cursor-pointer relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                                    
                                    <div className="mb-6 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {role.icon}
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold dark:text-white mb-3">{role.title}</h2>
                                    
                                    <p className="dark:text-gray-300 leading-relaxed font-medium">
                                        {role.description}
                                    </p>
                                    
                                    <div className="mt-8 flex items-center text-red-600 dark:text-red-400 font-bold group-hover:translate-x-2 transition-transform">
                                        Continue as {role.title} <span className="ml-2">→</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-12"
                >
                    <Link href="/" className="inline-flex items-center dark:text-gray-400 hover:text-red-500 font-bold transition-colors">
                        <FaArrowLeft className="mr-2" /> Back to Home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}