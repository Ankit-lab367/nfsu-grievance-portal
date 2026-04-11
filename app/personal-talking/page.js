'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
    FaSearch, FaCommentDots, FaUser, FaGraduationCap,
    FaChalkboardTeacher, FaUserShield, FaStar, FaTimes,
    FaPaperPlane, FaCircle, FaArrowLeft, FaUsers, FaPlus,
    FaCheckSquare, FaRegSquare, FaPaperclip, FaFileAlt, FaImage, FaDownload
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
    const meta = ROLE_META[user?.role] || ROLE_META.student;
    if (user?.avatar && !user.avatar.includes('default-avatar')) {
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
            {user?.name?.charAt(0).toUpperCase()}
        </div>
    );
}

function GroupAvatar({ group, size = 44 }) {
    if (group?.avatar) {
        return (
            <img 
                src={group.avatar} 
                alt={group.name} 
                style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(245,158,11,0.3)', flexShrink: 0 }}
            />
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2))',
            border: '2px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: 800, color: '#f59e0b',
            flexShrink: 0,
        }}>
            {group?.name?.charAt(0).toUpperCase()}
        </div>
    );
}

function ContextMenu({ x, y, userId, onClose }) {
    const router = useRouter();
    return (
        <div 
            style={{
                position: 'fixed', top: y, left: x, zIndex: 1000,
                background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 4, minWidth: 160,
                boxShadow: '0 10px 15px -3px rgba(0, 7, 20, 0.4)',
                animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={() => { router.push(`/profile/${userId}`); onClose(); }}
                style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '10px 12px', color: '#f1f5f9', fontSize: 13, fontWeight: 600,
                    borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.2s'
                }}
                onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
                onMouseOut={e => e.target.style.background = 'none'}
            >
                <FaUser style={{ color: '#94a3b8' }} /> Visit Profile
            </button>
        </div>
    );
}

// Actual 1-ON-1 chat panel
function ChatPanel({ contact, currentUser, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/messages/${contact._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const isFirstLoad = messages.length === 0;
                setMessages(data.messages);
                if (isFirstLoad) {
                    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
                }
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!contact?._id) return;
        setLoading(true);
        fetchMessages();
        
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [contact?._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        const text = input.trim();
        if (!text || !contact?._id) return;
        
        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId, sender: currentUser.id, receiver: contact._id,
            content: text, createdAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ receiverId: contact._id, content: text })
            });
            const data = await res.json();
            if (!data.success) {
                setMessages(prev => prev.filter(m => m._id !== tempId));
            } else {
                fetchMessages();
            }
        } catch (err) {
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15,15,30,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', flexShrink: 0,
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', flexShrink: 0,
                    }}
                >
                    <FaArrowLeft style={{ fontSize: 13 }} />
                </button>
                <Avatar user={contact} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 15, lineHeight: 1.2 }}>{contact.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}><RoleBadge role={contact.role} /></div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading && messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 40, color: '#475569', fontSize: 13 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 60 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                            <FaCommentDots style={{ fontSize: 24, color: '#38bdf8' }} />
                        </div>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Start a secure conversation with <strong style={{ color: '#94a3b8' }}>{contact.name}</strong></p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender === currentUser.id;
                        return (
                            <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '72%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: isMe ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(255,255,255,0.07)',
                                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, lineHeight: 1.5,
                                }}>
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: 10, color: isMe ? 'rgba(255,255,255,0.55)' : '#475569', textAlign: 'right' }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                <input
                    value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={`Message ${contact.name}…`}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '10px 18px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                />
                <button
                    onClick={send}
                    style={{
                        width: 42, height: 42, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg,#e11d48,#be123c)' : 'rgba(255,255,255,0.06)',
                        border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: input.trim() ? 'white' : '#475569', flexShrink: 0, transition: 'all 0.2s',
                    }}
                >
                    <FaPaperPlane style={{ fontSize: 14 }} />
                </button>
            </div>
        </motion.div>
    );
}

// GROUP CHAT PANEL
function GroupChatPanel({ group, currentUser, onClose, onDeleted, onUpdate }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fullGroup, setFullGroup] = useState(group);
    const fileInputRef = useRef(null);
    const groupAvatarInputRef = useRef(null);
    const bottomRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/messages/${group._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const isFirstLoad = messages.length === 0;
                setMessages(data.messages);
                if (data.group) setFullGroup(data.group);
                if (isFirstLoad) {
                    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
                }
            }
        } catch (err) {
            console.error('Failed to fetch groups messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!group?._id) return;
        setLoading(true);
        fetchMessages();
        
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [group?._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (attachments = []) => {
        const text = input.trim();
        if (!text && attachments.length === 0) return;
        if (!group?._id) return;
        
        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId, sender: { _id: currentUser.id, name: currentUser.name, role: currentUser.role, avatar: currentUser.avatar },
            content: text, attachments: attachments, createdAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/messages/${group._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: text, attachments })
            });
            const data = await res.json();
            if (!data.success) {
                setMessages(prev => prev.filter(m => m._id !== tempId));
            } else {
                fetchMessages();
            }
        } catch (err) {
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/groups/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                await send([data.attachment]);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            alert('Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/${group._id}/remove-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ memberId })
            });
            const data = await res.json();
            if (data.success) {
                setFullGroup(data.group);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Failed to remove member:', err);
            alert('Failed to remove member');
        }
    };

    const handleGroupAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/${group._id}/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setFullGroup(data.group);
                if (onUpdate) onUpdate();
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Failed to upload group avatar:', error);
            alert('Upload failed');
        } finally {
            if (groupAvatarInputRef.current) groupAvatarInputRef.current.value = '';
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm('WARNING: This will permanently delete the group and ALL messages. This cannot be undone. Area you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/${group._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                if (onDeleted) onDeleted();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Failed to delete group:', err);
            alert('Failed to delete group');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15,15,30,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', flexShrink: 0,
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', flexShrink: 0,
                    }}
                >
                    <FaArrowLeft style={{ fontSize: 13 }} />
                </button>
                <div 
                    onClick={() => setShowInfo(true)}
                    style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                >
                    <GroupAvatar group={fullGroup} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 15, lineHeight: 1.2 }}>{fullGroup.name}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>{fullGroup.members?.length || 0} members</p>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading && messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 40, color: '#475569', fontSize: 13 }}>Loading group messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 60 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                            <FaUsers style={{ fontSize: 24, color: '#f59e0b' }} />
                        </div>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Start chatting in <strong style={{ color: '#94a3b8' }}>{group.name}</strong></p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const senderId = msg.sender?._id;
                        const isMe = senderId === currentUser.id;
                        const prevSenderId = idx > 0 ? messages[idx-1].sender?._id : null;
                        const showName = !isMe && (idx === 0 || prevSenderId !== senderId);

                        return (
                            <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: showName ? 6 : 0 }}>
                                {!isMe && (
                                    <div style={{ marginRight: 8, marginTop: showName ? 18 : 0 }}>
                                         {showName ? <Avatar user={msg.sender} size={28} /> : <div style={{width: 28}}/>}
                                    </div>
                                )}
                                <div style={{ maxWidth: '72%' }}>
                                    {showName && (
                                        <p style={{ margin: '0 0 4px 6px', fontSize: 11, fontWeight: 700, color: '#cbd5e1' }}>{msg.sender?.name || 'Deleted User'}</p>
                                    )}
                                    <div style={{
                                        padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        background: isMe ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.07)',
                                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, lineHeight: 1.5,
                                    }}>
                                        {msg.content && <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>}
                                        
                                        {msg.attachments?.map((att, attIdx) => (
                                            <div key={attIdx} style={{ marginTop: msg.content ? 8 : 0 }}>
                                                {att.type === 'image' ? (
                                                    <img 
                                                        src={att.url} 
                                                        alt="attachment" 
                                                        style={{ maxWidth: '100%', borderRadius: 8, cursor: 'pointer', display: 'block' }}
                                                        onClick={() => window.open(att.url, '_blank')}
                                                    />
                                                ) : (
                                                    <a 
                                                        href={att.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', 
                                                            borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 13
                                                        }}
                                                    >
                                                        <FaFileAlt style={{ flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                                                        <FaDownload style={{ fontSize: 11, marginLeft: 'auto' }} />
                                                    </a>
                                                )}
                                            </div>
                                        ))}

                                        <p style={{ margin: '4px 0 0', fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : '#475569', textAlign: 'right' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{
                        width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#94a3b8', flexShrink: 0, transition: 'all 0.2s',
                    }}
                >
                    {isUploading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <FaPaperclip style={{ fontSize: 14 }} />}
                </button>

                <input
                    value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Message group…"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '10px 18px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                />
                <button
                    onClick={() => send()}
                    style={{
                        width: 42, height: 42, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)',
                        border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: input.trim() ? 'white' : '#475569', flexShrink: 0, transition: 'all 0.2s',
                    }}
                >
                    <FaPaperPlane style={{ fontSize: 14 }} />
                </button>
            </div>

            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        style={{ position: 'absolute', inset: 0, background: '#0f172a', zIndex: 50, display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}><FaArrowLeft /></button>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 18 }}>Group Info</h3>
                        </div>
                        
                        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ position: 'relative' }}>
                                    <GroupAvatar group={fullGroup} size={88} />
                                    {fullGroup.admin === currentUser.id && (
                                        <>
                                            <input 
                                                type="file" 
                                                ref={groupAvatarInputRef} 
                                                onChange={handleGroupAvatarUpload} 
                                                style={{ display: 'none' }} 
                                                accept="image/*"
                                            />
                                            <button 
                                                onClick={() => groupAvatarInputRef.current?.click()}
                                                style={{ 
                                                    position: 'absolute', bottom: 0, right: 0, 
                                                    width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', 
                                                    border: '2px solid #0f172a', color: '#000', display: 'flex', 
                                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                    fontSize: 12
                                                }}
                                                title="Change Group Picture"
                                            >
                                                <FaImage />
                                            </button>
                                        </>
                                    )}
                                </div>
                                <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>{fullGroup.name}</h2>
                                <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Group • {fullGroup.members?.length || 0} Members</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h4 style={{ margin: 0, color: '#94a3b8', textTransform: 'uppercase', fontSize: 12, tracking: '0.05em' }}>Members ({fullGroup.members?.length || 0})</h4>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {fullGroup.admin === currentUser.id && (
                                        <>
                                            <button 
                                                onClick={() => setShowAddMember(true)}
                                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Add Members
                                            </button>
                                            <button 
                                                onClick={handleDeleteGroup}
                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Delete Group
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {fullGroup.members?.filter(m => m !== null).map(member => (
                                    <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                        <Avatar user={member} size={36} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{member.name} {member._id === fullGroup.admin && <span style={{ color: '#f59e0b', fontSize: 10, background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>ADMIN</span>}</p>
                                            <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>{member.role}</p>
                                        </div>
                                        {fullGroup.admin === currentUser.id && member._id !== currentUser.id && (
                                            <button 
                                                onClick={() => handleRemoveMember(member._id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s' }}
                                                className="hover:bg-red-500/10"
                                                title="Remove Member"
                                            >
                                                <FaTimes style={{ fontSize: 12 }} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {showAddMember && (
                             <AddMemberOverlay 
                                group={fullGroup} 
                                onClose={() => setShowAddMember(false)} 
                                onAdded={(updatedGroup) => { setFullGroup(updatedGroup); setShowAddMember(false); }} 
                             />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function AddMemberOverlay({ group, onClose, onAdded }) {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers('');
    }, []);

    const fetchUsers = async (q) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/user/list?search=${encodeURIComponent(q || '')}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                // Filter out existing members
                const existingIds = group.members.map(m => m._id);
                setUsers(data.users.filter(u => !existingIds.includes(u._id)));
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (selectedIds.length === 0) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/${group._id}/add-members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ memberIds: selectedIds })
            });
            const data = await res.json();
            if (data.success) {
                onAdded(data.group);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to add members');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'absolute', inset: 0, background: '#111827', zIndex: 60, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}><FaArrowLeft /></button>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 18 }}>Add Members</h3>
            </div>
            
            <div style={{ padding: 20, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
                    <FaSearch style={{ color: '#475569', fontSize: 13 }} />
                    <input 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); fetchUsers(e.target.value); }} 
                        placeholder="Search users..." 
                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 14 }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#475569', marginTop: 20 }}>Loading...</p>
                ) : users.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#475569', marginTop: 20 }}>No users found</p>
                ) : (
                    users.map(u => {
                        const isSelected = selectedIds.includes(u._id);
                        return (
                            <div 
                                key={u._id} 
                                onClick={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', 
                                    cursor: 'pointer', background: isSelected ? 'rgba(245,158,11,0.08)' : 'transparent', borderRadius: 12
                                }}
                            >
                                {isSelected ? <FaCheckSquare style={{ color: '#f59e0b', fontSize: 18 }} /> : <FaRegSquare style={{ color: '#475569', fontSize: 18 }} />}
                                <Avatar user={u} size={32} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{u.name}</p>
                                    <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>{u.role}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button 
                  onClick={onClose} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button
                    disabled={selectedIds.length === 0 || isSubmitting}
                    onClick={handleAdd}
                    style={{
                        background: selectedIds.length === 0 ? 'rgba(255,255,255,0.1)' : '#f59e0b',
                        color: selectedIds.length === 0 ? '#64748b' : '#080c14',
                        border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 800, cursor: 'pointer'
                    }}
                >
                    {isSubmitting ? 'Adding...' : `Add ${selectedIds.length} Members`}
                </button>
            </div>
        </div>
    );
}

export default function PersonalTalkingPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('members'); // 'members' or 'groups'

    // Members state
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    // Groups state
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    
    // Create Group state
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]); // array of user objects
    const [isCreating, setIsCreating] = useState(false);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, userId: null });

    const searchTimeout = useRef(null);

    useEffect(() => {
        const handleClick = () => setContextMenu(prev => prev.show ? { ...prev, show: false } : prev);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e, userId) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            userId: userId
        });
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!userData || !token) {
            router.push('/login');
            return;
        }
        setCurrentUser(JSON.parse(userData));
        fetchUsers('', token);
        fetchGroups(token);
    }, []);

    const fetchUsers = async (q, token) => {
        setLoadingUsers(true);
        try {
            const res = await fetch(`/api/user/list?search=${encodeURIComponent(q || '')}`, {
                headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
            });
            const data = await res.json();
            if (data.success) {
                // exclude current user from the list locally
                const me = JSON.parse(localStorage.getItem('user'));
                setUsers(data.users.filter(u => u._id !== me.id));
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchGroups = async (token) => {
        setLoadingGroups(true);
        try {
            const res = await fetch(`/api/groups/list`, {
                headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
            });
            const data = await res.json();
            if (data.success) {
                setGroups(data.groups);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchUsers(val), 350);
    };

    const createGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length === 0) return;
        setIsCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/groups/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newGroupName.trim(), memberIds: selectedMembers.map(u => u._id) })
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateGroupModal(false);
                setNewGroupName('');
                setSelectedMembers([]);
                fetchGroups();
                setSelectedGroup(data.group);
                setActiveTab('groups');
                setSelectedUser(null);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Failed to create group');
        } finally {
            setIsCreating(false);
        }
    };

    const toggleMemberSelection = (user) => {
        if (selectedMembers.find(m => m._id === user._id)) {
            setSelectedMembers(prev => prev.filter(m => m._id !== user._id));
        } else {
            setSelectedMembers(prev => [...prev, user]);
        }
    };

    // Grouping for members tab
    const grouped = users.reduce((acc, u) => {
        const key = u.role;
        if (!acc[key]) acc[key] = [];
        acc[key].push(u);
        return acc;
    }, {});
    const roleOrder = ['super-admin', 'admin', 'staff', 'teacher', 'student'];
    const sortedGroups = roleOrder.filter(r => grouped[r]);

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {showCreateGroupModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{
                            width: 480, background: '#111827', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>Create Group</h2>
                            <button onClick={() => setShowCreateGroupModal(false)} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer' }}><FaTimes/></button>
                        </div>
                        
                        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>Group Name</label>
                                <input
                                    value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                                    placeholder="e.g. History Project"
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none'
                                    }}
                                />
                            </div>

                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                                Invite Members ({selectedMembers.length})
                            </label>
                            
                            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', maxHeight: 300, overflowY: 'auto' }}>
                                {sortedGroups.map(role => (
                                    <div key={role}>
                                        <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                            {role}
                                        </div>
                                        {grouped[role].map(u => {
                                            const isSelected = selectedMembers.find(m => m._id === u._id);
                                            return (
                                                <div key={u._id} onClick={() => toggleMemberSelection(u)} style={{
                                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.2s', background: isSelected ? 'rgba(245,158,11,0.08)' : 'transparent'
                                                }}>
                                                    {isSelected ? <FaCheckSquare style={{ color: '#f59e0b', fontSize: 18 }} /> : <FaRegSquare style={{ color: '#475569', fontSize: 18 }} />}
                                                    <Avatar user={u} size={32} />
                                                    <span style={{ color: isSelected ? '#f8fafc' : '#cbd5e1', fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>{u.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button onClick={() => setShowCreateGroupModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', padding: '10px 16px' }}>Cancel</button>
                            <button
                                onClick={createGroup} disabled={isCreating || !newGroupName.trim() || selectedMembers.length === 0}
                                style={{
                                    background: (isCreating || !newGroupName.trim() || selectedMembers.length === 0) ? 'rgba(255,255,255,0.1)' : '#f59e0b',
                                    color: (isCreating || !newGroupName.trim() || selectedMembers.length === 0) ? '#64748b' : '#080c14',
                                    border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {isCreating ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div style={{ height: 'calc(100vh - 73px)', display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{
                    width: (selectedUser || selectedGroup) ? 340 : '100%', maxWidth: (selectedUser || selectedGroup) ? 340 : undefined,
                    flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.015)', transition: 'width 0.3s', overflow: 'hidden',
                }}>
                    <div style={{ padding: '28px 24px 20px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, rgba(225,29,72,0.25), rgba(190,18,60,0.15))',
                                    border: '1px solid rgba(225,29,72,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <FaCommentDots style={{ color: '#e11d48', fontSize: 18 }} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                                    Personal Talking
                                </h1>
                            </div>
                            <button
                                onClick={() => {
                                    const role = currentUser?.role;
                                    if (role === 'student') router.push('/dashboard/student');
                                    else if (role === 'super-admin') router.push('/dashboard/super-admin');
                                    else router.push('/dashboard/admin'); // handles staff, admin, teacher
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12, color: '#cbd5e1', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                                }}
                            >
                                <FaArrowLeft style={{ fontSize: 10 }} /> Dashboard
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
                            <button
                                onClick={() => setActiveTab('members')}
                                style={{
                                    flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeTab === 'members' ? '#e11d48' : 'transparent', color: activeTab === 'members' ? '#fff' : '#94a3b8'
                                }}
                            >
                                Members
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                style={{
                                    flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeTab === 'groups' ? '#f59e0b' : 'transparent', color: activeTab === 'groups' ? '#fff' : '#94a3b8'
                                }}
                            >
                                Groups
                            </button>
                        </div>

                        {activeTab === 'members' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
                                <FaSearch style={{ color: '#475569', fontSize: 13, flexShrink: 0 }} />
                                <input
                                    value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search members…"
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 14 }}
                                />
                                {search && <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><FaTimes style={{ fontSize: 12 }} /></button>}
                            </div>
                        )}
                        
                        {activeTab === 'groups' && (
                            <button
                                onClick={() => setShowCreateGroupModal(true)}
                                style={{
                                    width: '100%', padding: '12px', background: 'rgba(245,158,11,0.1)', border: '1px dashed rgba(245,158,11,0.4)', borderRadius: 12,
                                    color: '#f59e0b', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
                                }}
                            >
                                <FaPlus /> Create New Group
                            </button>
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
                        {activeTab === 'members' && (
                            loadingUsers ? (
                                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                                    <p style={{ color: '#475569', fontSize: 13 }}>Loading members…</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                                    <p style={{ color: '#475569', fontSize: 14 }}>No members found</p>
                                </div>
                            ) : (
                                sortedGroups.map(role => (
                                    <div key={role}>
                                        <div style={{ padding: '10px 24px 6px', display: 'flex', alignItems: 'center', gap: 8 }}><RoleBadge role={role} /></div>
                                        {grouped[role].map(u => (
                                            <motion.button
                                                key={u._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }} whileTap={{ scale: 0.98 }}
                                                onClick={() => { setSelectedGroup(null); setSelectedUser(u); }}
                                                onContextMenu={(e) => handleContextMenu(e, u._id)}
                                                style={{
                                                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px',
                                                    background: selectedUser?._id === u._id ? 'rgba(225,29,72,0.08)' : 'transparent', border: 'none', cursor: 'pointer',
                                                    borderLeft: selectedUser?._id === u._id ? '3px solid #e11d48' : '3px solid transparent', transition: 'all 0.15s',
                                                }}
                                            >
                                                <Avatar user={u} size={44} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: selectedUser?._id === u._id ? '#f1f5f9' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                ))
                            )
                        )}

                        {activeTab === 'groups' && (
                            loadingGroups ? (
                                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                                    <p style={{ color: '#475569', fontSize: 13 }}>Loading groups…</p>
                                </div>
                            ) : groups.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                                    <FaUsers style={{ fontSize: 32, color: '#475569', marginBottom: 12 }} />
                                    <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>No groups yet. Create one!</p>
                                </div>
                            ) : (
                                groups.map(g => (
                                    <motion.button
                                        key={g._id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }} whileTap={{ scale: 0.98 }}
                                        onClick={() => { setSelectedUser(null); setSelectedGroup(g); }}
                                        style={{
                                            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px',
                                            background: selectedGroup?._id === g._id ? 'rgba(245,158,11,0.08)' : 'transparent', border: 'none', cursor: 'pointer',
                                            borderLeft: selectedGroup?._id === g._id ? '3px solid #f59e0b' : '3px solid transparent', transition: 'all 0.15s',
                                        }}
                                    >
                                        <GroupAvatar group={g} size={44} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: selectedGroup?._id === g._id ? '#f1f5f9' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.members.length} members</p>
                                        </div>
                                    </motion.button>
                                ))
                            )
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {selectedUser && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <ChatPanel contact={selectedUser} currentUser={currentUser} onClose={() => setSelectedUser(null)} />
                        </div>
                    )}
                    {selectedGroup && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <GroupChatPanel 
                                group={selectedGroup} 
                                currentUser={currentUser} 
                                onClose={() => setSelectedGroup(null)}
                                onDeleted={() => { setSelectedGroup(null); fetchGroups(); }}
                                onUpdate={() => fetchGroups()}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {contextMenu.show && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    userId={contextMenu.userId} 
                    onClose={() => setContextMenu({ ...contextMenu, show: false })} 
                />
            )}
        </div>
    );
}
