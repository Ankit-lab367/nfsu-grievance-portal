'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaHospital, FaArrowLeft, FaExclamationTriangle, FaShieldAlt, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function EmergencyContacts() {
    const router = useRouter();
    const [dashboardLink, setDashboardLink] = useState('/');
    
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            const role = user.role;
            if (role === 'student') {
                setDashboardLink('/dashboard/student');
            } else if (role === 'admin' || role === 'staff') {
                setDashboardLink('/dashboard/admin');
            } else if (role === 'super-admin') {
                setDashboardLink('/dashboard/super-admin');
            }
        }
    }, []);

    const contacts = [
        {
            name: "Govind Ballav Pant Hospital",
            service: "Nearest Hospital / Emergency",
            number: "0381-235-6288",
            location: "Agartala, Tripura",
            type: "Emergency"
        },
        {
            name: "Nearest Police Station",
            service: "Women's Help Line / Police",
            number: "6009306729",
            location: "Agartala, Tripura",
            type: "Police"
        },
        {
            name: "Anti Ragging Squad (Dr. Arpan)",
            service: "NFSU Tripura Campus Support",
            number: "6009368628",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Anti Ragging Squad (Dr. Monisha)",
            service: "NFSU Tripura Campus Support",
            number: "8178349678",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Internal Complaint Committee (Dr. Monisha Samuel)",
            service: "Sexual Harassment Committee",
            number: "8178349678",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Internal Complaint Committee (Deputy Registrar I/C)",
            service: "Sexual Harassment Committee",
            number: "9165319983",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Internal Complaint Committee (Dr. Arpan Datta Roy)",
            service: "Sexual Harassment Committee",
            number: "6009368628",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Student's Grievance Committee (Dr. Arpan Datta Roy)",
            service: "Redressal Committee",
            number: "6009368628",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Student's Grievance Committee (Dr. Panem Charanarur)",
            service: "Redressal Committee",
            number: "8999377519",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Student's Grievance Committee (Dr. Monisha Samuel)",
            service: "Redressal Committee",
            number: "8178349678",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "Student's Grievance Committee (Dr. Jyoti Roy Chodhuri)",
            service: "Redressal Committee",
            number: "8296799794",
            location: "NFSU Tripura",
            type: "Support"
        },
        {
            name: "District Disaster Management Authority",
            service: "Disaster Management",
            number: "0381-232297 / 1077",
            location: "Tripura",
            type: "Emergency"
        },
        {
            name: "Ambulance service (24 hours)",
            service: "Medical Emergency",
            number: "0381-2325685",
            location: "Tripura",
            type: "Emergency"
        },
        {
            name: "Student Co-ordinator (NFSU Tripura)",
            service: "Campus Support",
            number: "9863598004",
            location: "NFSU Tripura",
            type: "Support"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050202] transition-colors duration-500">
            <Navbar />
            
            <main className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Emergency Contacts</h1>
                            <p className="text-slate-600 dark:text-gray-400">Essential contact information for immediate assistance.</p>
                        </div>
                        <Link 
                            href={dashboardLink}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <FaArrowLeft className="text-sm" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-8">


                        {/* Contacts Table */}
                        <div className="overflow-hidden rounded-2xl border border-white/10 glass-card-theme shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Facility / Service</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Number</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {contacts.map((contact, index) => (
                                        <motion.tr 
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="px-6 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3 rounded-xl transition-colors ${
                                                        contact.type === 'Emergency' ? 'bg-red-500/10 group-hover:bg-red-500/20' :
                                                        contact.type === 'Police' ? 'bg-blue-500/10 group-hover:bg-blue-500/20' :
                                                        'bg-green-500/10 group-hover:bg-green-500/20'
                                                    }`}>
                                                        {contact.type === 'Emergency' && <FaHospital className="text-red-400 text-xl" />}
                                                        {contact.type === 'Police' && <FaShieldAlt className="text-blue-400 text-xl" />}
                                                        {contact.type === 'Support' && <FaUsers className="text-green-400 text-xl" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold text-lg">{contact.name}</div>
                                                        <div className="text-gray-400 text-sm">{contact.service}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center space-x-2 text-red-400 font-mono text-lg font-bold">
                                                    <FaPhoneAlt className="text-sm" />
                                                    <span>{contact.number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20">
                                                    {contact.type}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-2xl glass-card-theme border border-white/10 hover:border-blue-500/30 transition-all group">
                                <h4 className="text-white font-bold text-xl mb-3 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    <span>Hospital Address</span>
                                </h4>
                                <p className="text-gray-400 leading-relaxed">
                                    Govind Ballav Pant (GBP) Hospital, <br />
                                    Kunjaban, Agartala, <br />
                                    Tripura West, Pin - 799006
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl glass-card-theme border border-white/10 hover:border-red-500/30 transition-all">
                                <h4 className="text-white font-bold text-xl mb-3 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    <span>Emergency Services</span>
                                </h4>
                                <p className="text-gray-400 leading-relaxed">
                                    The hospital provides 24/7 emergency medical care, 
                                    ambulance services, and specialized trauma units 
                                    for critical cases.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <style jsx global>{`
                .glass-card-theme {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
            `}</style>
        </div>
    );
}
