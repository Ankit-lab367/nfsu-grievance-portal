import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/dbConnect';
import ChatLog from '@/models/ChatLog';
import Complaint from '@/models/Complaint';
import { verifyToken, extractToken } from '@/lib/auth';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `You are an AI assistant for the NFSU (National Forensic Sciences University) Portal. Your role is to help students, staff, and admins navigate the website and use its features. You are knowledgeable about all modules of this portal. Here is a breakdown of the website's features:
1. **Grievance/Complaints**: Users can file complaints (Academics, Hostel, IT, Finance, Security, etc), track status using a Complaint ID, and view history. The process is Pending -> In Progress -> Resolved.
2. **Marketplace**: A feature where students can buy and sell items (electronics, books, vehicles, etc). Users can view item details, contact sellers, and mark items as sold.
3. **Lost & Found**: Users can report items they have lost, or publish items they have found on campus, facilitating easy recovery.
4. **Academic Manager**: A repository where users can upload and download Previous Year Question Papers (PYQs), study notes, and assignments organized by Degree, Semester, and Course Type.
5. **Applications**: Students can submit formal applications (Leave, Bona-fide Certificate, Fee Concession, etc) which are reviewed, approved, or rejected by Staff/Admins.
6. **Notice Board**: Contains official school announcements and updates. Staff/Admins can create new notices.
7. **Discussions**: Real-time chat forums separated by role (Student Discussion vs Staff Discussion) for peer communication.
8. **God Mode / Admin Panel**: The Super Admin dashboard has a "God Mode" for overriding settings, unblocking accounts, and managing the core database.
9. **Visual Identity**: The website uses a cinematic, premium Crimson/Red-Black theme with slow-motion ripple animations and a global backdrop.
Be helpful, professional, and concise. If you don't know something specific to NFSU, acknowledge it and suggest contacting the admin.
For guest users (not logged in), provide general information. For authenticated users, you can offer more personalized assistance.
**SPECIAL COMMANDS**:
- If the user asks how to login, where to login, or anything about logging in, you MUST include the exact text [ACTION:LOGIN_DEMO] somewhere in your response. This signals the UI to safely guide the user to the login button.`;
function getCommandResponse(message, history = [], currentTheme = 'dark', isGuest = true, userRole = null) {
    const msg = message.toLowerCase().trim();
    const guestCommands = "- How to login\n- How to register\n- Dark mode\n- Light mode";
    const authCommands = "- Dashboard\n- How to upload lost item\n- How to upload found item\n- Dark mode\n- Light mode";
    const availableCommands = isGuest ? guestCommands : authCommands;
    const defaultReply = "Hello! Please choose a command:\n" + availableCommands;
    const errorReply = "You wrote the wrong command. Please choose from the below commands:\n" + availableCommands;
    if (!message) return defaultReply;
    const lastAssistantMsg = history.length > 0 
        ? history.filter(m => m.role === 'assistant').pop()?.content || '' 
        : '';
    if (msg === 'dark mode' || msg === 'dark theme') {
        if (currentTheme === 'dark') return "You are already in dark mode.";
        return "Switching to dark mode! [ACTION:SET_DARK_MODE]";
    }
    if (msg === 'light mode' || msg === 'light theme') {
        if (currentTheme === 'light') return "You are already in light mode.";
        return "Switching to light mode! [ACTION:SET_LIGHT_MODE]";
    }
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
        return defaultReply;
    }
    if (isGuest) {
        if (lastAssistantMsg.includes("What are you?")) {
            if (msg === 'student') return "Starting Student Registration workflow... [ACTION:REGISTER_STUDENT]";
            if (msg === 'staff') return "Starting Staff Registration workflow... [ACTION:REGISTER_STAFF]";
            return "Invalid answer. What are you? Please type 'student' or 'staff'.";
        }
        if (msg.includes('register')) {
            return "What are you? (Please type 'student' or 'staff').";
        }
        if (msg.includes('login') || msg.includes('log in') || msg.includes('sign in')) {
            return "Starting Login Demo... [ACTION:LOGIN_DEMO]";
        }
        return errorReply;
    }
    if (!isGuest) {
        if (msg === 'dashboard' || msg === 'go to dashboard') {
            let targetPath = '/dashboard/student';
            if (userRole === 'staff' || userRole === 'admin' || userRole === 'super-admin') targetPath = '/dashboard/admin';
            return `Teleporting instantly to your Dashboard... [ACTION:NAVIGATE:${targetPath}]`;
        }
        if (msg.includes('found')) {
            return "Starting Found Item Guided Tour... [ACTION:FOUND_ITEM_TOUR]";
        }
        if (msg.includes('lost')) {
            return "Starting Lost Item Guided Tour... [ACTION:LOST_ITEM_TOUR]";
        }
        return errorReply;
    }
    return errorReply;
}
export async function POST(request) {
    let userMsg = '';
    try {
        await dbConnect();
        const body = await request.json();
        const { message, sessionId, complaintId, currentTheme } = body;
        userMsg = message;
        if (!message || !sessionId) {
            return NextResponse.json(
                { error: 'Message and sessionId are required' },
                { status: 400 }
            );
        }
        const authHeader = request.headers.get('authorization');
        const token = extractToken(authHeader);
        let userId = null;
        let isGuest = true;
        let userRole = null;
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                userId = decoded.id;
                isGuest = false;
                userRole = decoded.role;
            }
        }
        let chatLog = await ChatLog.findOne({ sessionId });
        if (!chatLog) {
            chatLog = await ChatLog.create({
                sessionId,
                userId: userId || undefined,
                isGuest,
                messages: [],
            });
        }
        const assistantMessage = getCommandResponse(message, chatLog.messages, currentTheme, isGuest, userRole);
        chatLog.messages.push({
            role: 'user',
            content: message,
        });
        chatLog.messages.push({
            role: 'assistant',
            content: assistantMessage,
        });
        await chatLog.save();
        return NextResponse.json(
            {
                success: true,
                message: assistantMessage,
                sessionId,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Chatbot error:', error);
        return NextResponse.json(
            {
                success: false,
                isFallback: true,
                message: "A database error occurred while processing your command.",
            },
            { status: 200 }
        );
    }
}
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
            return NextResponse.json({ error: 'SessionId is required' }, { status: 400 });
        }
        const chatLog = await ChatLog.findOne({ sessionId });
        if (!chatLog) {
            return NextResponse.json(
                { success: true, messages: [] },
                { status: 200 }
            );
        }
        return NextResponse.json(
            {
                success: true,
                messages: chatLog.messages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get chat history error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat history' },
            { status: 500 }
        );
    }
}