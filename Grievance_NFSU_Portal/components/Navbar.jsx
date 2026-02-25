'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBell, FaMoon, FaSun, FaSignOutAlt, FaUser, FaSearch, FaFileInvoice, FaUniversity, FaChevronDown, FaPhone, FaBook, FaShoppingCart, FaComments, FaCommentDots, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [academicSubmenu, setAcademicSubmenu] = useState(null); // 'degrees' or null
    const [activeDegree, setActiveDegree] = useState(null); // 'btech', 'bsc', 'msc' or null
    const [unreadCount, setUnreadCount] = useState(0);
    const moreMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
                setAcademicSubmenu(null);
                setActiveDegree(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Initialize Theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const toggleDarkMode = () => {
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

    useEffect(() => {
        const fetchUnread = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/notifications/get', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUnreadCount(data.notifications.filter(n => !n.isRead).length);
                }
            } catch (err) {
                console.error('Navbar notif fetch error:', err);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="glass-theme border-b border-black/5 dark:border-white/10 sticky top-0 z-40 transition-colors duration-300">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3">
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <h1 className="text-white font-bold text-lg leading-tight">NFSU Portal</h1>
                                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Grievance System</p>
                            </div>
                        </Link>

                        {/* Navigation Buttons */}
                        <div className="hidden lg:flex items-center ml-12 space-x-8 border-l border-white/10 pl-12">
                            <Link
                                href="/lost-and-found"
                                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group"
                            >
                                <FaSearch className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-medium">Lost & Found</span>
                            </Link>
                            <Link
                                href="/discussion"
                                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group"
                            >
                                <FaComments className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-medium">
                                    {(user?.role === 'admin' || user?.role === 'super-admin') ? 'Faculty Discussion' : 'Discussion'}
                                </span>
                            </Link>
                            <Link
                                href={(user?.role === 'admin' || user?.role === 'super-admin') ? '/dashboard/admin/applications' : '/application/write'}
                                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group"
                            >
                                <FaFileInvoice className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-medium">
                                    {(user?.role === 'admin' || user?.role === 'super-admin') ? 'Applications Received' : 'Application'}
                                </span>
                            </Link>

                            <button
                                onClick={() => alert('College Details feature is currently under development.')}
                                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group"
                            >
                                <FaUniversity className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-medium">College Details</span>
                            </button>

                            {/* More Options Dropdown */}
                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`p-1.5 rounded-full transition-all duration-200 ${showMoreMenu ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <FaChevronDown className={`text-xs transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showMoreMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute left-0 mt-2 w-56 glass-card-theme shadow-2xl py-2 border border-slate-200 dark:border-white/10 z-50 origin-top-left"
                                        >
                                            <button
                                                onClick={() => { alert('Emergency Contacts feature is under development.'); setShowMoreMenu(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                <FaPhone className="text-red-400 text-sm" />
                                                <span className="text-sm font-medium">Emergency Contacts</span>
                                            </button>
                                            {/* Submenu Level 1: Degrees - Only for Students */}
                                            {(user?.role === 'student' || user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'staff') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAcademicSubmenu(academicSubmenu === 'degrees' ? null : 'degrees');
                                                        setActiveDegree(null);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${academicSubmenu === 'degrees' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <FaBook className="text-blue-400 text-sm" />
                                                        <span className="text-sm font-medium">Academic Materials</span>
                                                    </div>
                                                    <FaChevronRight className={`text-[10px] transition-transform ${academicSubmenu === 'degrees' ? 'rotate-90 md:rotate-0' : ''}`} />
                                                </button>
                                            )}

                                            {/* Submenu Level 1: Degrees */}
                                            <AnimatePresence>
                                                {academicSubmenu === 'degrees' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        className="absolute left-full top-0 ml-1 w-48 glass-card-theme border border-slate-200 dark:border-white/10 shadow-2xl py-2 z-[60]"
                                                    >
                                                        {['B.Tech', 'B.Sc', 'M.Sc'].map((degree) => (
                                                            <button
                                                                key={degree}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const degreeKey = degree.toLowerCase().replace('.', '');
                                                                    setActiveDegree(activeDegree === degreeKey ? null : degreeKey);
                                                                }}
                                                                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${activeDegree === degree.toLowerCase().replace('.', '') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                                                            >
                                                                <span className="text-sm font-medium">{degree}</span>
                                                                <FaChevronRight className="text-[10px]" />
                                                            </button>
                                                        ))}

                                                        {/* Submenu Level 2: Semesters */}
                                                        <AnimatePresence>
                                                            {activeDegree && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: -10 }}
                                                                    className="absolute left-full top-0 ml-1 w-40 glass-card-theme border border-slate-200 dark:border-white/10 shadow-2xl py-2 overflow-y-auto max-h-[300px] z-[70]"
                                                                >
                                                                    {Array.from({ length: activeDegree === 'msc' ? 4 : 8 }).map((_, i) => (
                                                                        <Link
                                                                            key={i}
                                                                            href={`/academic/${activeDegree}/${i + 1}`}
                                                                            onClick={() => {
                                                                                setShowMoreMenu(false);
                                                                                setAcademicSubmenu(null);
                                                                                setActiveDegree(null);
                                                                            }}
                                                                            className="block w-full text-left px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                                        >
                                                                            {activeDegree.toUpperCase()} Sem {i + 1}
                                                                        </Link>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <Link
                                                href="/marketplace"
                                                onClick={() => setShowMoreMenu(false)}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                <FaShoppingCart className="text-green-400 text-sm" />
                                                <span className="text-sm font-medium">Buy and Sell</span>
                                            </Link>
                                            <button
                                                onClick={() => { alert('Personal Talking feature is under development.'); setShowMoreMenu(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                                            >
                                                <FaCommentDots className="text-purple-400 text-sm" />
                                                <span className="text-sm font-medium">Personal Talking</span>
                                            </button>
                                            <button
                                                onClick={() => { alert('Received Messages feature is under development.'); setShowMoreMenu(false); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                                            >
                                                <FaEnvelope className="text-blue-400 text-sm" />
                                                <span className="text-sm font-medium">Received Messages</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>

                        {/* Notifications */}
                        <Link href="/notifications" className="relative p-2 text-gray-300 hover:text-white transition-all hover:scale-110">
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </Link>

                        {/* User Menu */}
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-white text-sm font-medium">{user.name}</p>
                                        <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 glass-card-theme shadow-lg py-2 border border-slate-200 dark:border-white/10 overflow-hidden origin-top-right"
                                        >
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-gray-300 hover:bg-white/10 transition-colors"
                                            >
                                                <FaUser className="inline mr-2" />
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 transition-colors"
                                            >
                                                <FaSignOutAlt className="inline mr-2" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
