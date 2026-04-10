'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

export default function GlobalBackground() {
    const [renderParticles, setRenderParticles] = useState(false);
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        setRenderParticles(true);
        const handleGlobalClick = (e) => {
            const id = Date.now() + Math.random();
            setClicks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => {
                setClicks((prev) => prev.filter(c => c.id !== id));
            }, 800);
        };

        const disableRightClick = (e) => {
            e.preventDefault();
        };

        const disableDevToolsKeys = (e) => {
            if (e.key === 'F12') e.preventDefault();
            if (e.ctrlKey && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key)) e.preventDefault();
            if (e.metaKey && e.altKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key)) e.preventDefault();
            if (e.ctrlKey && ['U', 'u'].includes(e.key)) e.preventDefault();
            if (e.metaKey && e.altKey && ['U', 'u'].includes(e.key)) e.preventDefault();
        };

        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('contextmenu', disableRightClick);
        window.addEventListener('keydown', disableDevToolsKeys);

        return () => {
            window.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('contextmenu', disableRightClick);
            window.removeEventListener('keydown', disableDevToolsKeys);
        };
    }, []);

    const particles = useMemo(() => [...Array(140)].map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 1.5,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * -20,
        color: Math.random() > 0.6 ? '#f43f5e' : '#ffffff',
        opacity: Math.random() * 0.4 + 0.1,
        moveX: Math.random() * 30 - 15,
    })), []);

    if (!renderParticles) return null;

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-[-1]" aria-hidden="true">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40 grayscale-[20%]"
                    style={{ backgroundImage: 'url(/background.jpeg)' }}
                />

                <div className="absolute inset-0 dark:bg-[#050101]/60 transition-colors duration-500 backdrop-blur-[2px]" />

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-800/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-red-900/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                </div>

                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full"
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            left: `${p.initialX}%`,
                            top: `${p.initialY}%`,
                            opacity: p.opacity,
                            filter: `blur(${p.size > 2 ? '1px' : '0px'})`,
                        }}
                        animate={{
                            y: [0, -80, 0],
                            x: [0, p.moveX, 0],
                            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "linear"
                        }}
                    />
                ))}

                <div className="absolute inset-0 bg-radial-vignette" />
                
                <style jsx>{`
                    .bg-radial-vignette {
                        background: radial-gradient(circle at center, transparent 0%, rgba(5, 1, 1, 0.5) 100%);
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0) scale(1); }
                        51% { transform: translateY(-30px) scale(1.05); }
                    }
                    .animate-float {
                        animation: float 8s ease-in-out infinite;
                    }
                `}</style>
            </div>

            <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
                <AnimatePresence>
                    {clicks.map((click) => (
                        <motion.div
                            key={click.id}
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 3, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute rounded-full border border-red-500 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            style={{
                                left: click.x,
                                top: click.y,
                                width: 20,
                                height: 20,
                                marginTop: -10,
                                marginLeft: -10,
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}