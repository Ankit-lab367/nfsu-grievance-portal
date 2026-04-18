'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFileAlt,
    FaChartLine,
    FaShieldAlt,
    FaUsers,
    FaBell,
    FaClock,
    FaCheckCircle
} from 'react-icons/fa';

export default function HomePage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [ripple, setRipple] = useState({ x: 0, y: 0 });
    const [showAboutDev, setShowAboutDev] = useState(false);
    const btnRef = useRef(null);

    const handleLoginClick = (e) => {
        e.preventDefault();
        const rect = btnRef.current?.getBoundingClientRect();
        setRipple({
            x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
            y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        });
        setTransitioning(true);
        setTimeout(() => router.push('/login'), 2200);
    };

    useEffect(() => {
        setIsLoaded(true);
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);

    const features = [
        {
            icon: <FaFileAlt className="text-4xl" />,
            title: 'Easy Complaint Filing',
            description: 'Register complaints quickly with our user-friendly interface',
        },
        {
            icon: <FaChartLine className="text-4xl" />,
            title: 'Real-time Tracking',
            description: 'Track your complaint status with detailed timeline updates',
        },
        {
            icon: <FaShieldAlt className="text-4xl" />,
            title: 'Secure & Anonymous',
            description: 'Option to file anonymous complaints with complete privacy',
        },
        {
            icon: <FaBell className="text-4xl" />,
            title: 'Instant Notifications',
            description: 'Get email and in-app alerts for every status update',
        },
        {
            icon: <FaClock className="text-4xl" />,
            title: 'SLA Monitoring',
            description: 'Automatic escalation when resolution time exceeds limits',
        },
        {
            icon: <FaCheckCircle className="text-4xl" />,
            title: 'Transparent Process',
            description: 'Complete visibility of complaint resolution journey',
        },
    ];

    const departments = [
        'Hostel', 'IT', 'Library',
        'Admin', 'Finance', 'Exam', 'Security', 'Others'
    ];

    return (
        <div className="min-h-screen relative overflow-hidden dark:bg-background-dark transition-colors duration-500">
            <AnimatePresence>
                {transitioning && (
                    <>
                        <motion.div
                            key="ripple"
                            initial={{ scale: 0, opacity: 0.9 }}
                            animate={{ scale: 60, opacity: 0 }}
                            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'fixed',
                                left: ripple.x,
                                top: ripple.y,
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(220,38,38,0.9) 0%, rgba(136,19,55,0.6) 60%, transparent 100%)',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 9998,
                                pointerEvents: 'none',
                            }}
                        />

                        <motion.div
                            key="curtain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.15 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'linear-gradient(135deg, #0a0505 0%, #1a0505 50%, #0a0505 100%)',
                                zIndex: 9997,
                                pointerEvents: 'none',
                            }}
                        />

                        <motion.div
                            key="blur-overlay"
                            initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
                            animate={{ backdropFilter: 'blur(20px)', opacity: 1 }}
                            transition={{ duration: 1.0, ease: 'easeInOut' }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 9996,
                                pointerEvents: 'none',
                            }}
                        />

                        <motion.div
                            key="logo-flash"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.05, 1, 0.95] }}
                            transition={{ duration: 1.3, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                                pointerEvents: 'none',
                            }}
                        >
                            <img src="/logo.png" alt="NFSU" style={{ width: 80, height: 80, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            <p style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: 8, marginTop: 16, textTransform: 'uppercase', opacity: 0.9 }}>NFSU Portal</p>
                            <div style={{ width: 60, height: 2, background: 'linear-gradient(to right, transparent, #e11d48, transparent)', marginTop: 10, borderRadius: 2 }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10">
                <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 transition-colors duration-500">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src="/logo.png"
                                    alt="NFSU Logo"
                                    className="w-12 h-12 object-contain"
                                />
                                <div>
                                    <h1 className="text-white font-bold text-xl">NFSU</h1>
                                    <p className="text-gray-400 text-xs">Grievance Portal</p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    id="navbar-login-btn"
                                    ref={btnRef}
                                    onClick={handleLoginClick}
                                    className="px-6 py-2 text-gray-300 hover:text-white transition-colors font-semibold relative overflow-hidden group"
                                >
                                    <span className="relative z-10">Login</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-700 group-hover:w-full transition-all duration-500 rounded-full" />
                                </button>
                                <Link
                                    id="navbar-register-btn"
                                    href="/register-selection"
                                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all font-medium"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <section className="container mx-auto px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-6xl mx-auto"
                    >
                        <div className="mb-2 py-6 px-4">
                            <h2 className="text-xl sm:text-5xl md:text-6xl font-bold font-serif leading-tight">
                                <motion.span
                                    className="bg-[length:200%_auto] bg-gradient-to-r from-red-600 via-white to-rose-400 dark:from-red-400 dark:via-white dark:to-rose-300 text-transparent bg-clip-text"
                                    animate={{
                                        backgroundPosition: ["0% center", "100% center", "0% center"],
                                        filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    National Forensic Sciences University
                                </motion.span>
                            </h2>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold dark:text-white mb-6 leading-tight">
                            Grievance Redressal
                            <span className="block mt-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-800 dark:from-red-400 dark:via-rose-400 dark:to-red-600 text-transparent bg-clip-text">
                                Made Simple
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                            A transparent, efficient, and secure platform for students and staff to voice their concerns
                            and track resolutions in real-time with AI-powered assistance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/register-selection"
                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-xl hover:shadow-2xl hover:shadow-red-600/50 transition-all font-semibold text-lg w-full sm:w-auto"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/complaint/track"
                                className="px-8 py-4 glass-dark text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg w-full sm:w-auto border border-white/10"
                            >
                                Track Complaint
                            </Link>
                        </div>
                        <button
                            id="about-developer-btn"
                            onClick={() => setShowAboutDev(true)}
                            className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300 underline underline-offset-4 decoration-dotted cursor-pointer tracking-wide"
                        >
                            About Developers
                        </button>
                    </motion.div>
                </section>


                <section className="container mx-auto px-6 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold dark:text-white mb-4">Why Choose NFSU Portal?</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Experience a modern, intelligent complaint management system built for transparency and efficiency
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="glass-card-theme p-8 shadow-xl border-white/10"
                            >
                                <div className="text-red-400 mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="container mx-auto px-6 py-20">
                    <div className="glass-card-theme p-12">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Departments We Serve</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {departments.map((dept, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-center text-white font-bold transition-all cursor-pointer border border-white/10 hover:border-red-500/50"
                                >
                                    {dept}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-20">
                    <div className="glass-card-theme p-12 text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of students using NFSU Grievance Portal for quick and transparent complaint resolution
                        </p>
                        <Link
                            href="/register-selection"
                            className="inline-block px-10 py-4 bg-gradient-to-r from-red-600 to-rose-800 text-white rounded-xl hover:shadow-2xl hover:shadow-red-600/50 transition-all font-bold text-lg"
                        >
                            Create Your Account
                        </Link>
                    </div>
                </section>

                <footer className="glass-dark border-t border-white/10 py-8 mt-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center text-gray-400">
                            <p>&copy; 2024 National Forensic Sciences University. All rights reserved.</p>
                            <p className="mt-2 text-sm select-none">
                                Built with ❤️ for better student services
                            </p>
                        </div>
                    </div>
                </footer>

                {/* About Developer Modal */}
                <AnimatePresence>
                    {showAboutDev && (
                        <motion.div
                            key="about-dev-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center"
                            style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.65)' }}
                            onClick={() => setShowAboutDev(false)}
                        >
                            <motion.div
                                key="about-dev-card"
                                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 30 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                onClick={e => e.stopPropagation()}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20,5,5,0.95) 0%, rgba(30,10,10,0.97) 100%)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 24,
                                    padding: '36px 28px 32px',
                                    maxWidth: 1000,
                                    width: '95%',
                                    textAlign: 'center',
                                    boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(220,38,38,0.15)',
                                }}
                            >
                                {/* Heading */}
                                <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 6, letterSpacing: '-0.3px' }}>
                                    About Developers
                                </h3>
                                <div style={{
                                    width: 40, height: 2,
                                    background: 'linear-gradient(to right, transparent, #e11d48, transparent)',
                                    margin: '0 auto 28px', borderRadius: 2
                                }} />

                                {/* Developer cards — single horizontal row */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    flexWrap: 'nowrap', 
                                    gap: 14, 
                                    justifyContent: 'flex-start', 
                                    alignItems: 'stretch', 
                                    marginBottom: 24, 
                                    overflowX: 'auto',
                                    paddingLeft: '16px',
                                    paddingRight: '16px',
                                    paddingBottom: '12px',
                                    width: '100%',
                                    WebkitOverflowScrolling: 'touch',
                                }}>

                                    {/* Ankit Card */}
                                    {[
                                        {
                                            img: '/ankit-profile.png',
                                            name: 'Ankit',
                                            role: 'Developer & Creator',
                                            linkedin: 'https://www.linkedin.com/in/ankit-153533391?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                                        },
                                        {
                                            img: '/om-profile.png',
                                            name: 'Om Prakash',
                                            role: 'Developer & Creator',
                                            linkedin: 'https://www.linkedin.com/in/om-prakash-3286a8389?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                                        },
                                        {
                                            img: '/raju-profile.png',
                                            name: 'Raju Ranjan',
                                            role: 'Developer & Creator',
                                            linkedin: 'https://www.linkedin.com/in/raju-ranjan-925233391',
                                        },
                                        {
                                            img: '/sidhant-profile.png',
                                            name: 'Sidhant Singh Gaur',
                                            role: 'Developer & Creator',
                                            linkedin: 'https://www.linkedin.com/in/sidhant-singh-gaur-688396207?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                                        },
                                        {
                                            img: '/rajat-profile.png',
                                            name: 'Rajat P',
                                            role: 'Developer & Creator',
                                            linkedin: 'https://www.linkedin.com/in/rajat-p-b63b64378?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                                        },
                                    ].map((dev) => (
                                        <div key={dev.name} style={{
                                            flex: '0 0 auto',
                                            width: 170,
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: 18,
                                            padding: '20px 14px 18px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}>
                                            {/* Photo */}
                                            <div style={{
                                                width: 80, height: 80,
                                                borderRadius: '50%',
                                                padding: 3,
                                                background: 'linear-gradient(135deg, #dc2626, #9f1239)',
                                                boxShadow: '0 0 20px rgba(220,38,38,0.4)',
                                                marginBottom: 12,
                                                flexShrink: 0,
                                            }}>
                                                <img
                                                    src={dev.img}
                                                    alt={dev.name}
                                                    style={{
                                                        width: '100%', height: '100%',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'center top',
                                                        display: 'block',
                                                    }}
                                                />
                                            </div>
                                            {/* Name */}
                                            <p style={{ 
                                                color: 'white', 
                                                fontWeight: 800, 
                                                fontSize: 15, 
                                                marginBottom: 3,
                                                whiteSpace: 'nowrap',
                                                width: '100%',
                                                textAlign: 'center'
                                            }}>
                                                {dev.name}
                                            </p>
                                            {/* Role */}
                                            <p style={{ color: '#6b7280', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>
                                                {dev.role}
                                            </p>
                                            {/* LinkedIn */}
                                            <a
                                                href={dev.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    padding: '8px 18px',
                                                    background: 'linear-gradient(135deg, #0077b5, #005983)',
                                                    color: 'white', textDecoration: 'none',
                                                    borderRadius: 10, fontWeight: 700, fontSize: 13,
                                                    boxShadow: '0 4px 16px rgba(0,119,181,0.35)',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,119,181,0.55)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,119,181,0.35)';
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                                LinkedIn
                                            </a>
                                        </div>
                                    ))}
                                </div>

                                {/* Close */}
                                <button
                                    onClick={() => setShowAboutDev(false)}
                                    style={{
                                        background: 'transparent',
                                        color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 10, padding: '7px 28px',
                                        fontWeight: 500, fontSize: 13, cursor: 'pointer',
                                        transition: 'color 0.2s, border-color 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = '#d1d5db';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = '#6b7280';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}