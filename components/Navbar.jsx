'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBell, FaMoon, FaSun, FaSignOutAlt, FaUser, FaSearch, FaFileInvoice, FaUniversity, FaChevronDown, FaPhone, FaBook, FaShoppingCart, FaComments, FaCommentDots, FaEnvelope, FaChevronRight, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [academicSubmenu, setAcademicSubmenu] = useState(null); 
    const [activeDegree, setActiveDegree] = useState(null); 
    const [unreadCount, setUnreadCount] = useState(0);
    const [globalUnreadMessages, setGlobalUnreadMessages] = useState(0);
    const [hasPendingApps, setHasPendingApps] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutRipple, setLogoutRipple] = useState({ x: 0, y: 0 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);
    const logoutBtnRef = useRef(null);
    const moreMenuRef = useRef(null);
    useEffect(() => {
        const checkApps = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                if (['admin', 'super-admin', 'staff'].includes(parsedUser.role)) {
                    const apps = JSON.parse(localStorage.getItem('applications') || '[]');
                    const pending = apps.some(app => app.status === 'Pending');
                    setHasPendingApps(pending);
                } else {
                    setHasPendingApps(false);
                }
            }
        };
        checkApps();
        const interval = setInterval(checkApps, 5000); 
        return () => clearInterval(interval);
    }, []);
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
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);
    const handleLogout = () => {
        const rect = logoutBtnRef.current?.getBoundingClientRect();
        setLogoutRipple({
            x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
            y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        });
        setShowUserMenu(false);
        setLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/');
        }, 2400);
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
        const interval = setInterval(fetchUnread, 30000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('/api/messages/unread', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setGlobalUnreadMessages(data.count);
                }
            } catch (err) {
                console.error('Navbar msg unread err:', err);
            }
        };
        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <>
        {}
        <AnimatePresence>
            {loggingOut && (
                <>
                    {}
                    <motion.div
                        key="logout-ripple"
                        initial={{ scale: 0, opacity: 0.95 }}
                        animate={{ scale: 70, opacity: 0 }}
                        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'fixed',
                            left: logoutRipple.x,
                            top: logoutRipple.y,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(220,38,38,0.95) 0%, rgba(136,19,55,0.7) 55%, transparent 100%)',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 99998,
                            pointerEvents: 'none',
                        }}
                    />
                    {}
                    <motion.div
                        key="logout-curtain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.2 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'linear-gradient(135deg, #050202 0%, #140505 50%, #050202 100%)',
                            zIndex: 99997,
                            pointerEvents: 'all',
                        }}
                    />
                    {}
                    <motion.div
                        key="logout-blur"
                        initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
                        animate={{ backdropFilter: 'blur(24px)', opacity: 1 }}
                        transition={{ duration: 1.1, ease: 'easeInOut' }}
                        style={{ position: 'fixed', inset: 0, zIndex: 99996, pointerEvents: 'none' }}
                    />
                    {}
                    <motion.div
                        key="logout-card"
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 99999,
                            pointerEvents: 'none',
                            gap: 16,
                        }}
                    >
                        {}
                        <motion.img
                            src="/logo.png"
                            alt="NFSU"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: 'backOut' }}
                            style={{ width: 72, height: 72, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                        />
                        {}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 80 }}
                            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
                            style={{ height: 2, background: 'linear-gradient(to right, transparent, #e11d48, transparent)', borderRadius: 2 }}
                        />
                        {}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.85, ease: 'easeOut' }}
                            style={{ color: 'white', fontWeight: 900, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' }}
                        >
                            Thank You <span style={{ color: '#e11d48' }}>for visiting</span>
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 0.6, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
                            style={{ color: '#fca5a5', fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}
                        >
                            NFSU PORTAL EXPERIENCED
                        </motion.p>
                        {}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 120, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
                            style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(225,29,72,0.5), transparent)', borderRadius: 1 }}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        <nav className="glass-dark border-b border-white/10 sticky top-0 z-40 transition-colors duration-300">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {}
                        <Link href="/" className="flex items-center space-x-3">
                            <img
                                src="/logo.png"
                                alt="NFSU Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <h1 className="text-white font-bold text-lg leading-tight uppercase tracking-wider">NFSU Portal</h1>
                                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Grievance System</p>
                            </div>
                        </Link>
                        {}
                        <div className="hidden lg:flex items-center ml-12 space-x-8 border-l border-white/10 pl-12">
                            <Link
                                id="nav-lost-found"
                                href="/lost-and-found"
                                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 group"
                            >
                                <FaSearch className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-semibold tracking-tight">Lost & Found</span>
                            </Link>
                            <Link
                                href="/discussion"
                                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 group"
                            >
                                <FaComments className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-semibold tracking-tight">
                                    {(user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'staff') ? 'Faculty Discussion' : 'Discussion'}
                                </span>
                            </Link>
                            <Link
                                href="/emergency-contacts"
                                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 group"
                            >
                                <FaPhone className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-semibold tracking-tight">Emergency Contacts</span>
                            </Link>

                            <Link
                                href="/college"
                                className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-all duration-200 group"
                            >
                                <FaUniversity className="text-sm group-hover:scale-110" />
                                <span className="text-sm font-medium">College Details</span>
                            </Link>
                            {}
                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`relative p-1.5 rounded-full transition-all duration-200 ${showMoreMenu ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <FaChevronDown className={`text-xs transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
                                    {globalUnreadMessages > 0 && !showMoreMenu && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-gray-900" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showMoreMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute left-0 mt-2 w-56 glass-card-theme shadow-2xl py-2 border border-slate-200 dark:border-white/10 z-50 origin-top-left"
                                        >
                                            {/* Academic Dropdown */}
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
                                                        <FaBook className="text-red-400 text-sm" />
                                                        <span className="text-sm font-medium">Academic Materials</span>
                                                    </div>
                                                    <FaChevronRight className={`text-[10px] transition-transform ${academicSubmenu === 'degrees' ? 'rotate-90 md:rotate-0' : ''}`} />
                                                </button>
                                            )}
                                            {}
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
                                                        {}
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
                                            <Link
                                                href="/personal-talking"
                                                onClick={() => setShowMoreMenu(false)}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                                            >
                                                <FaCommentDots className="text-red-400 text-sm" />
                                                <span className="text-sm font-medium">Personal Talking</span>
                                            </Link>
                                            <Link
                                                href="/received-messages"
                                                onClick={() => setShowMoreMenu(false)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FaEnvelope className="text-rose-400 text-sm" />
                                                    <span className="text-sm font-medium">Received Messages</span>
                                                </div>
                                                {globalUnreadMessages > 0 && (
                                                    <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                                                        {globalUnreadMessages > 99 ? '99+' : globalUnreadMessages}
                                                    </span>
                                                )}
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    {}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                        {/* Desktop & Mobile Top Right Buttons */}
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
                        {}
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
                                            <div className="w-full h-full bg-gradient-to-r from-red-600 to-rose-800 flex items-center justify-center text-white text-sm font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-white text-sm font-bold">{user.name}</p>
                                        <p className="text-gray-400 text-xs capitalize font-medium">{user.role}</p>
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
                                                ref={logoutBtnRef}
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
            
            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-slate-900 border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col space-y-4">
                            <Link href="/lost-and-found" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 text-gray-300 hover:text-white">
                                <FaSearch className="text-sm" /><span>Lost & Found</span>
                            </Link>
                            <Link href="/discussion" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 text-gray-300 hover:text-white">
                                <FaComments className="text-sm" />
                                <span>{(user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'staff') ? 'Faculty Discussion' : 'Discussion'}</span>
                            </Link>
                            <Link href="/emergency-contacts" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 text-gray-300 hover:text-white">
                                <FaPhone className="text-sm" /><span>Emergency Contacts</span>
                            </Link>
                            <Link href="/college" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 text-gray-300 hover:text-red-400">
                                <FaUniversity className="text-sm" /><span>College Details</span>
                            </Link>
                            
                            {(user?.role === 'student' || user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'staff') && (
                                <div className="flex flex-col space-y-2">
                                    <button 
                                        onClick={() => setMobileAcademicOpen(!mobileAcademicOpen)}
                                        className="flex items-center justify-between text-gray-300 w-full"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <FaBook className="text-sm text-red-400" /><span>Academic Materials</span>
                                        </div>
                                        <FaChevronDown className={`text-xs transition-transform ${mobileAcademicOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {mobileAcademicOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="pl-7 flex flex-col space-y-2"
                                            >
                                                {['B.Tech', 'B.Sc', 'M.Sc'].map((degree) => (
                                                    <div key={degree} className="flex flex-col space-y-1">
                                                        <span className="text-xs font-bold text-gray-500 uppercase mt-2">{degree}</span>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {Array.from({ length: degree === 'M.Sc' ? 4 : 8 }).map((_, i) => (
                                                                <Link
                                                                    key={i}
                                                                    href={`/academic/${degree.toLowerCase().replace('.', '')}/${i + 1}/notes`}
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                    className="bg-white/5 text-gray-300 text-xs text-center py-1.5 rounded border border-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                                                                >
                                                                    S{i + 1}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 text-gray-300 hover:text-white">
                                <FaShoppingCart className="text-sm text-green-400" /><span>Buy and Sell</span>
                            </Link>
                            <Link href="/personal-talking" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 text-gray-300 hover:text-white">
                                <FaCommentDots className="text-sm text-red-400" /><span>Personal Talking</span>
                            </Link>
                            <Link href="/received-messages" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between text-gray-300 hover:text-white">
                                <div className="flex items-center space-x-3">
                                    <FaEnvelope className="text-sm text-rose-400" /><span>Received Messages</span>
                                </div>
                                {globalUnreadMessages > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                                        {globalUnreadMessages > 99 ? '99+' : globalUnreadMessages}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
        </>
    );
}