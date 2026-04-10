'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TourCursor = ({ targetSelector, onComplete }) => {
    const selectors = Array.isArray(targetSelector) ? targetSelector : [targetSelector];
    const [step, setStep] = useState(0);
    const [pos, setPos] = useState(null);
    const currentSelector = selectors[step];

    useEffect(() => {
        let attempts = 0;
        const findTarget = () => {
            const el = document.querySelector(currentSelector);
            if (el) {
                const rect = el.getBoundingClientRect();
                setPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            } else if (attempts < 20) {
                attempts++;
                setTimeout(findTarget, 150);
            } else {
                onComplete();
            }
        };
        setPos(null);
        setTimeout(findTarget, 100);
    }, [currentSelector, onComplete]);

    if (!pos) return null;

    return (
        <motion.div
            key={currentSelector} 
            initial={{ opacity: 0, left: '90%', top: '90%', scale: 0.5 }}
            animate={{ opacity: 1, left: pos.x, top: pos.y, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            onAnimationComplete={() => {
                const el = document.querySelector(currentSelector);
                if (el) {
                    setTimeout(() => {
                        el.click();
                        if (step < selectors.length - 1) {
                            setTimeout(() => setStep(step + 1), 600); 
                        } else {
                            setTimeout(onComplete, 1000);
                        }
                    }, 400); 
                } else {
                    onComplete();
                }
            }}
            className="fixed z-[99999] pointer-events-none -translate-x-[12px] -translate-y-[12px]"
        >
            <div className="relative flex items-center justify-center">
                <span className="text-5xl filter drop-shadow-2xl">👆</span>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 4], opacity: [0.8, 0] }}
                    transition={{ delay: 2.5, duration: 0.6, ease: "easeOut" }}
                    className="absolute w-12 h-12 bg-red-400 rounded-full"
                />
            </div>
        </motion.div>
    );
};

export default TourCursor;
