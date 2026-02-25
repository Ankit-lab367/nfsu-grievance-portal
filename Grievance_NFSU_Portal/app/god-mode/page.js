'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSkull } from 'react-icons/fa';

export default function GodModeDashboard() {
    const router = useRouter();
    const [showIntro, setShowIntro] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 4500); // 4.5 seconds for the cinematic sequence
        return () => clearTimeout(timer);
    }, []);

    const handleNavigation = (path) => {
        setIsTransitioning(true);
        setTimeout(() => {
            router.push(path);
        }, 1500);
    };

    const buttons = [
        { label: 'BACK', action: () => router.push('/') },
        { label: 'EXAMINE ACCOUNTS', action: () => handleNavigation('/god-mode/examine') },
        { label: 'BLOCK ACCOUNT', action: () => handleNavigation('/god-mode/block') },
        { label: 'UNBLOCK ACCOUNT', action: () => handleNavigation('/god-mode/unblock') },
        { label: 'SEE COMPLAINTS', action: () => handleNavigation('/god-mode/complaints') },
        { label: 'ACADEMIC MATERIAL MANAGER', action: () => handleNavigation('/god-mode/academic') },
    ];

    return (
        <div className="min-h-screen bg-black overflow-hidden font-mono text-[#00ff00]">
            <AnimatePresence mode="wait">
                {showIntro ? (
                    <IntroSequence key="intro" />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "brightness(2) contrast(2)" }}
                        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
                    >
                        {/* Transition Overlay */}
                        <AnimatePresence>
                            {isTransitioning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
                                >
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "100%" }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 bg-gradient-to-b from-[#00ff00]/20 via-transparent to-[#00ff00]/20 pointer-events-none"
                                    />
                                    <motion.div
                                        animate={{
                                            opacity: [1, 0, 1],
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{ duration: 0.1, repeat: Infinity }}
                                        className="text-2xl font-black tracking-[0.5em] z-10"
                                    >
                                        SCANNING DATABASE...
                                    </motion.div>
                                    <div className="mt-4 w-64 h-1 bg-[#00ff00]/20 relative overflow-hidden">
                                        <motion.div
                                            initial={{ left: "-100%" }}
                                            animate={{ left: "100%" }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-0 bottom-0 w-1/2 bg-[#00ff00] shadow-[0_0_15px_#00ff00]"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Background Ambient Glow */}
                        <div className="absolute inset-0 bg-[#00ff00]/5 blur-[120px] pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="z-10 w-full max-w-xl space-y-8"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-bold text-[#00ff00] tracking-[0.2em] animate-pulse">
                                    GOD MODE ACCESS
                                </h1>
                                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00ff00] to-transparent mt-2 shadow-[0_0_10px_#00ff00]" />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {buttons.map((btn, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={btn.action}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative group w-full bg-black border border-[#00ff00]/30 py-6 px-8 rounded-lg overflow-hidden transition-all hover:border-[#00ff00]"
                                    >
                                        <motion.div
                                            className="absolute top-0 left-0 h-[2px] bg-[#00ff00] shadow-[0_0_15px_#00ff00]"
                                            animate={{
                                                left: ["0%", "100%", "0%"],
                                                width: ["0%", "50%", "0%"]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "linear",
                                                delay: index * 0.5
                                            }}
                                        />
                                        <motion.div
                                            className="absolute bottom-0 right-0 h-[2px] bg-[#00ff00] shadow-[0_0_15px_#00ff00]"
                                            animate={{
                                                right: ["0%", "100%", "0%"],
                                                width: ["0%", "50%", "0%"]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "linear",
                                                delay: index * 0.5
                                            }}
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <span className="relative z-10 text-[#00ff00] font-black tracking-[0.3em] text-lg group-hover:drop-shadow-[0_0_8px_#00ff00] transition-all">
                                            {btn.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-12 text-center">
                                <p className="text-[#00ff00]/40 text-[10px] tracking-[0.5em] uppercase">
                                    System authorized • protocol 7 active
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                body {
                    background-color: black !important;
                    margin: 0;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

function IntroSequence() {
    const [messages, setMessages] = useState([]);
    const logs = [
        "INITIALIZING SYSTEM BYPASS...",
        "DECRYPTING CORE FILES...",
        "ACCESSING ENCRYPTED SECTOR 7...",
        "ESTABLISHING PROTOCOL G-MODE...",
        "OVERRIDING SECURITY PROTOCOLS...",
        "BYPASSING FIREWALL...",
        "CONNECTING TO GLOBAL NODE...",
        "IDENTITY VERIFIED: GOD_MODE",
    ];

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setMessages(prev => [...prev, logs[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 z-[100]"
        >
            {/* Glitchy Skull */}
            <motion.div
                animate={{
                    x: [0, -5, 5, -2, 2, 0],
                    y: [0, 2, -2, 4, -4, 0],
                    opacity: [1, 0.8, 1, 0.5, 1],
                    filter: ["brightness(1)", "brightness(2)", "brightness(1)", "hue-rotate(90deg)", "brightness(1)"]
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                className="text-white text-9xl mb-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
            >
                <FaSkull />
            </motion.div>

            {/* Scrolling Logs */}
            <div className="max-w-md w-full h-48 overflow-hidden font-mono text-xs md:text-sm">
                <div className="space-y-1">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[#00ff00] border-l-2 border-[#00ff00] pl-3 py-1 bg-[#00ff00]/5"
                        >
                            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {msg}
                        </motion.div>
                    ))}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="h-0.5 bg-[#00ff00] shadow-[0_0_10px_#00ff00]"
                    />
                </div>
            </div>

            {/* Random Matrix-like bits */}
            <div className="absolute inset-0 pointer-events-none opacity-20 text-[10px] text-[#00ff00] overflow-hidden whitespace-nowrap leading-none break-all select-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -100 }}
                        animate={{ y: 1000 }}
                        transition={{
                            duration: Math.random() * 2 + 1,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 2
                        }}
                        style={{ left: `${i * 5}%` }}
                        className="absolute"
                    >
                        {Math.random().toString(16).repeat(10)}
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
                className="mt-8 text-white font-black tracking-[1em] animate-pulse"
            >
                ACCESS GRANTED
            </motion.div>
        </motion.div>
    );
}
