'use client';
import { useState, useEffect } from 'react';
export default function DataStream({ speed = 1, reverse = false, color = '#00ff00' }) {
    const [data, setData] = useState([]);
    useEffect(() => {
        const chars = "01ABCDEF";
        const generateLine = () => {
            let line = "";
            for (let i = 0; i < 20; i++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            return line;
        };
        setData(Array.from({ length: 40 }, () => generateLine()));
        const interval = setInterval(() => {
            setData(prev => {
                const newData = [...prev];
                if (reverse) {
                    newData.push(generateLine());
                    newData.shift();
                } else {
                    newData.unshift(generateLine());
                    newData.pop();
                }
                return newData;
            });
        }, 100 / speed);
        return () => clearInterval(interval);
    }, [speed, reverse]);
    return (
        <div className="flex flex-col h-full text-[8px] leading-tight select-none pointer-events-none" style={{ color }}>
            {data.map((line, i) => (
                <div key={i} className="whitespace-nowrap opacity-50 font-mono">
                    {line}
                </div>
            ))}
        </div>
    );
}