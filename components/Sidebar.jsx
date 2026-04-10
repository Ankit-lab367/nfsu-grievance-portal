'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FaHome,
    FaFileAlt,
    FaChartLine,
    FaUsers,
    FaBuilding,
    FaHistory,
    FaCog
} from 'react-icons/fa';
export default function Sidebar({ role = 'student' }) {
    const pathname = usePathname();
    const studentLinks = [
        { href: '/dashboard/student', icon: <FaHome />, label: 'Dashboard' },
        { href: '/complaint/create', icon: <FaFileAlt />, label: 'New Complaint' },
        { href: '/complaint/track', icon: <FaChartLine />, label: 'Track' },
        { href: '/complaints/history', icon: <FaHistory />, label: 'History' },
    ];
    const adminLinks = [
        { href: '/dashboard/admin', icon: <FaHome />, label: 'Dashboard' },
        { href: '/admin/complaints', icon: <FaFileAlt />, label: 'Complaints' },
        { href: '/admin/analytics', icon: <FaChartLine />, label: 'Analytics' },
    ];
    const superAdminLinks = [
        { href: '/dashboard/super-admin', icon: <FaHome />, label: 'Dashboard' },
        { href: '/admin/users', icon: <FaUsers />, label: 'Users' },
        { href: '/admin/departments', icon: <FaBuilding />, label: 'Departments' },
        { href: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    ];
    const links = role === 'super-admin' ? superAdminLinks : role === 'admin' ? adminLinks : studentLinks;
    return (
        <aside className="w-64 glass-dark border-r border-white/10 min-h-screen p-6">
            <nav className="space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${pathname === link.href
                                ? 'bg-gradient-to-r from-red-600 to-rose-800 text-white'
                                : 'text-gray-300 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-medium">{link.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}