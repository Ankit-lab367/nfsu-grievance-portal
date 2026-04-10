import './globals.css';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import Script from 'next/script';

const GlobalBackground = dynamic(() => import('@/components/GlobalBackground'), { ssr: false });
const ChatbotWidget = dynamic(() => import('@/components/ChatbotWidget'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    title: 'NFSU Grievance Portal',
    description: 'National Forensic Sciences University - Grievance Redressal Portal for Students and Staff',
    keywords: 'NFSU, grievance, complaint, redressal, university, student portal',
};
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>
                <GlobalBackground />
                <div className="relative z-10">
                    {children}
                </div>
                <ChatbotWidget />
                {}
                <Script id="warmup" strategy="afterInteractive">{`
                    fetch('/api/ping').catch(()=>{});
                `}</Script>
            </body>
        </html>
    );
}