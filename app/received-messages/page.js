'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
    FaEnvelope, FaSearch, FaCommentDots, FaUser, FaGraduationCap,
    FaChalkboardTeacher, FaUserShield, FaStar, FaCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_META = {
    student: {
        label: 'Student',
        icon: FaGraduationCap,
        color: '#38bdf8',
        bg: 'rgba(56,189,248,0.12)',
        border: 'rgba(56,189,248,0.3)',
    },
    staff: {
        label: 'Staff',
        icon: FaChalkboardTeacher,
        color: '#a78bfa',
        bg: 'rgba(167,139,250,0.12)',
        border: 'rgba(167,139,250,0.3)',
    },
    teacher: {
        label: 'Teacher',
        icon: FaChalkboardTeacher,
        color: '#a78bfa',
        bg: 'rgba(167,139,250,0.12)',
        border: 'rgba(167,139,250,0.3)',
    },
    admin: {
        label: 'Admin',
        icon: FaUserShield,
        color: '#f472b6',
        bg: 'rgba(244,114,182,0.12)',
        border: 'rgba(244,114,182,0.3)',
    },
    'super-admin': {
        label: 'Super Admin',
        icon: FaStar,
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.12)',
        border: 'rgba(251,191,36,0.3)',
    },
};

function RoleBadge({ role }) {
    const meta = ROLE_META[role] || ROLE_META.student;
    const Icon = meta.icon;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.color,
                letterSpacing: '0.04em',
                textTransform: 'capitalize',
            }}
        >
            <Icon style={{ fontSize: 9 }} />
            {meta.label}
        </span>
    );
}

function Avatar({ user, size = 44 }) {
    const meta = ROLE_META[user.role] || ROLE_META.student;
    if (user.avatar && !user.avatar.includes('default-avatar')) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${meta.color}40` }}
            />
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}66)`,
            border: `2px solid ${meta.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 800, color: meta.color,
            flexShrink: 0,
        }}>
            {user.name?.charAt(0).toUpperCase()}
        </div>
    );
}

export default function ReceivedMessagesPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!userData || !token) {
            router.push('/login');
            return;
        }
        setCurrentUser(JSON.parse(userData));
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/messages/conversations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
                setError('');
            } else {
                setError(data.error || 'Failed to load conversations');
            }
        } catch {
            setError('Network error — please try again');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        fetchConversations();
        
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Go to Personal Talking page and auto-select user
    // We do this by navigating to /personal-talking, 
    // and storing a temp flag in localStorage to auto-open if we want.
    // For simplicity, we just redirect to the general page.
    // The user can find them there easily, but let's improve it.
    // Let's implement local logic in the future. For now, redirect.
    const openConversation = (userId) => {
        router.push(`/personal-talking`);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(225,29,72,0.25), rgba(190,18,60,0.15))',
                        border: '1px solid rgba(225,29,72,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaEnvelope style={{ color: '#e11d48', fontSize: 22 }} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                            Received Messages
                        </h1>
                        <p style={{ margin: 0, fontSize: 14, color: '#475569', marginTop: 4 }}>
                            {conversations.length} Unread {conversations.length === 1 ? 'Conversation' : 'Conversations'}
                        </p>
                    </div>
                </div>

                {/* List */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    overflow: 'hidden',
                }}>
                    {loading && conversations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%',
                                border: '3px solid rgba(225,29,72,0.3)',
                                borderTopColor: '#e11d48',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 16px',
                            }} />
                            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Loading your conversations…</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                            <p style={{ color: '#ef4444', fontSize: 15, margin: 0 }}>{error}</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}>
                                <FaCommentDots style={{ fontSize: 28, color: '#475569' }} />
                            </div>
                            <h2 style={{ color: '#cbd5e1', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No new messages</h2>
                            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                                You're all caught up! Head over to <strong style={{ color: '#94a3b8' }}>Personal Talking</strong> to chat.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {conversations.map((conv, idx) => {
                                const { contact, latestMessage, unreadCount } = conv;
                                const isUnread = unreadCount > 0;
                                
                                return (
                                    <motion.button
                                        key={contact._id}
                                        onClick={() => openConversation(contact._id)}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                                        whileTap={{ scale: 0.99 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 16,
                                            padding: '20px 24px',
                                            border: 'none', background: 'transparent',
                                            borderBottom: idx < conversations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                            borderLeft: isUnread ? '3px solid #ef4444' : '3px solid transparent',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <Avatar user={contact} size={50} />
                                            {isUnread && (
                                                <span style={{
                                                    position: 'absolute', top: -2, right: -2,
                                                    width: 14, height: 14, background: '#ef4444',
                                                    border: '2px solid #080c14', borderRadius: '50%',
                                                }} />
                                            )}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <p style={{
                                                        margin: 0, fontWeight: isUnread ? 800 : 700, fontSize: 16,
                                                        color: isUnread ? '#f8fafc' : '#cbd5e1',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                    }}>
                                                        {contact.name}
                                                    </p>
                                                    <RoleBadge role={contact.role} />
                                                </div>
                                                <span style={{ color: isUnread ? '#ef4444' : '#64748b', fontSize: 12, fontWeight: isUnread ? 700 : 500, flexShrink: 0 }}>
                                                    {new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <p style={{
                                                    margin: 0, fontSize: 14,
                                                    color: isUnread ? '#f1f5f9' : '#64748b',
                                                    fontWeight: isUnread ? 600 : 400,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    flex: 1,
                                                }}>
                                                    {latestMessage.sender === currentUser?.id ? 'You: ' : ''}{latestMessage.content}
                                                </p>
                                                
                                                {isUnread && (
                                                    <span style={{
                                                        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800,
                                                        marginLeft: 12, flexShrink: 0,
                                                        border: '1px solid rgba(239,68,68,0.3)',
                                                    }}>
                                                        + {unreadCount} New
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
