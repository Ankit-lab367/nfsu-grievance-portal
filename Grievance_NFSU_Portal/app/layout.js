import './globals.css';
import { Inter } from 'next/font/google';
import ChatbotWidget from '@/components/ChatbotWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'NFSU Grievance Portal',
    description: 'National Forensic Sciences University - Grievance Redressal Portal for Students and Staff',
    keywords: 'NFSU, grievance, complaint, redressal, university, student portal',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <ChatbotWidget />
            </body>
        </html>
    );
}
