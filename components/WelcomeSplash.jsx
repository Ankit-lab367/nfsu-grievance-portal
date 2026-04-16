'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const ROLE_LABELS = {
    student: 'Student',
    staff: 'Staff Member',
    admin: 'Administrator',
    'super-admin': 'Super Admin',
};
const ROLE_COLORS = {
    student: '#f43f5e',
    staff: '#e11d48',
    admin: '#be123c',
    'super-admin': '#9f1239',
};
function Particle({ x, y, delay, size }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], y: -120, scale: [0, 1, 0.5] }}
            transition={{ duration: 2.5, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: Math.random() * 2 }}
            style={{
                position: 'absolute',
                left: `${x}%`,
                bottom: '10%',
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(244,63,94,0.8), rgba(190,18,60,0.3))',
                filter: 'blur(1px)',
                pointerEvents: 'none',
            }}
        />
    );
}
export default function WelcomeSplash({ user, show, onDone }) {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (!show && user) {
            const t = setTimeout(() => {
                setVisible(false);
                setTimeout(() => onDone?.(), 700); 
            }, 800); 
            return () => clearTimeout(t);
        }
    }, [show, user]);
    const name = user?.name?.split(' ')[0] || 'Welcome';
    const role = user?.role || 'student';
    const roleLabel = ROLE_LABELS[role] || role;
    const roleColor = ROLE_COLORS[role] || '#e11d48';
    const particles = [
        { x: 10, delay: 0, size: 6 },
        { x: 25, delay: 0.4, size: 4 },
        { x: 40, delay: 0.8, size: 8 },
        { x: 55, delay: 0.2, size: 5 },
        { x: 70, delay: 0.6, size: 7 },
        { x: 82, delay: 1.0, size: 4 },
        { x: 92, delay: 0.3, size: 6 },
        { x: 60, delay: 1.2, size: 5 },
        { x: 18, delay: 1.5, size: 4 },
        { x: 48, delay: 0.9, size: 6 },
    ];
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="welcome-splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(160deg, #050101 0%, #130303 40%, #0a0202 70%, #050101 100%)',
                        overflow: 'hidden',
                    }}
                >
                    {}
                    <div style={{
                        position: 'absolute', top: '-10%', left: '-5%',
                        width: '50%', height: '50%', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(190,18,60,0.12) 0%, transparent 70%)',
                        filter: 'blur(60px)', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '-10%', right: '-5%',
                        width: '60%', height: '60%', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)',
                        filter: 'blur(80px)', pointerEvents: 'none',
                    }} />
                    {}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        {particles.map((p, i) => (
                            <Particle key={i} x={p.x} delay={p.delay} size={p.size} />
                        ))}
                    </div>
                    {}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative' }}>
                        {}
                        <motion.img
                            src="/logo.png"
                            alt="NFSU"
                            initial={{ opacity: 0, scale: 0.5, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: 'backOut', delay: 0.1 }}
                            style={{ width: 80, height: 80, objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: 20 }}
                        />
                        {}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.55, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                            style={{
                                color: '#fca5a5', fontSize: 13, fontWeight: 600,
                                letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6,
                            }}
                        >
                            Welcome back
                        </motion.p>
                        {}
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.85, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                fontSize: 'clamp(32px, 6vw, 58px)',
                                fontWeight: 900,
                                background: 'linear-gradient(90deg, #fff 0%, #fca5a5 40%, #f43f5e 70%, #fff 100%)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: 2,
                                textAlign: 'center',
                                animation: 'welcomeShimmer 3s linear infinite',
                                marginBottom: 14,
                            }}
                        >
                            {name}
                        </motion.h1>
                        {}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.45, delay: 0.75, ease: 'backOut' }}
                            style={{
                                background: `rgba(${roleColor === '#f43f5e' ? '244,63,94' : roleColor === '#e11d48' ? '225,29,72' : roleColor === '#be123c' ? '190,18,60' : '159,18,57'}, 0.15)`,
                                border: `1px solid ${roleColor}40`,
                                color: roleColor,
                                borderRadius: 999,
                                padding: '4px 16px',
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 3,
                                textTransform: 'uppercase',
                                marginBottom: 30,
                            }}
                        >
                            {roleLabel}
                        </motion.div>
                        {}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 100, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.85, ease: 'easeOut' }}
                            style={{
                                height: 2,
                                background: 'linear-gradient(to right, transparent, #e11d48, transparent)',
                                borderRadius: 2,
                                marginBottom: 24,
                            }}
                        />
                        {}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            style={{ width: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                        >
                            <div style={{
                                width: '100%', height: 3, borderRadius: 99,
                                background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                            }}>
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: show ? '80%' : '100%' }}
                                    transition={{
                                        duration: show ? 2.0 : 0.4,
                                        ease: show ? 'easeInOut' : 'easeOut',
                                    }}
                                    style={{
                                        height: '100%', borderRadius: 99,
                                        background: 'linear-gradient(to right, #e11d48, #f43f5e, #fda4af)',
                                        boxShadow: '0 0 8px rgba(244,63,94,0.6)',
                                    }}
                                />
                            </div>
                            <motion.p
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}
                            >
                                {show ? 'Loading portal...' : 'Ready'}
                            </motion.p>
                        </motion.div>
                    </div>
                    {}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ delay: 1.1 }}
                        className="px-6 text-center"
                        style={{
                            position: 'absolute', bottom: 28,
                            color: 'white', fontSize: 'min(10px, 3vw)', letterSpacing: 5,
                            textTransform: 'uppercase', fontWeight: 700,
                        }}
                    >
                        National Forensic Sciences University
                    </motion.p>
                    {}
                    <style>{`
                        @keyframes welcomeShimmer {
                            0%   { background-position: 0% center; }
                            100% { background-position: 200% center; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}