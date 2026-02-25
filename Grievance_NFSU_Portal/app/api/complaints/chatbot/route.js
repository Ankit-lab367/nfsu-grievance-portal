import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/dbConnect';
import ChatLog from '@/models/ChatLog';
import Complaint from '@/models/Complaint';
import { verifyToken, extractToken } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an AI assistant for the NFSU (National Forensic Sciences University) Grievance Redressal Portal. Your role is to help students and staff with:

1. **Filing Complaints**: Explain how to register a complaint, what information is needed, and which department to choose.

2. **Department Selection**: Help users choose the right department for their complaint:
   - Academics: Course/exam issues, faculty concerns, curriculum
   - Hostel: Accommodation, facilities, hostel rules
   - IT: Computer lab, Wi-Fi, software issues
   - Library: Book availability, library hours, study spaces
   - Admin: General administrative matters
   - Finance: Fee payments, scholarships, refunds
   - Exam: Examination schedules, results, hall tickets
   - Security: Campus security, lost items
   - Others: Issues not covered above

3. **Tracking Complaints**: Explain how to track complaint status using their Complaint ID.

4. **Complaint Process**: Explain the complaint lifecycle - Pending → In Progress → Resolved.

5. **Escalation**: Guide users on when and how complaints get escalated if SLA is breached.

6. **General Help**: Answer questions about the portal features and NFSU policies.

Be helpful, professional, and concise. If you don't know something specific to NFSU, acknowledge it and suggest contacting the admin.

For guest users (not logged in), provide general information. For authenticated users, you can offer more personalized assistance.`;

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { message, sessionId, complaintId } = body;

        if (!message || !sessionId) {
            return NextResponse.json(
                { error: 'Message and sessionId are required' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const token = extractToken(request.headers.get('authorization'));
        let userId = null;
        let isGuest = true;
        let userContext = '';

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                userId = decoded.id;
                isGuest = false;
                userContext = `User is logged in as a ${decoded.role}. `;
            }
        }

        // If complaint ID is provided in the conversation, fetch complaint details
        let complaintContext = '';
        if (complaintId) {
            const complaint = await Complaint.findOne({ complaintId });
            if (complaint) {
                complaintContext = `\n\nCOMPLAINT DETAILS:\nID: ${complaint.complaintId}\nDepartment: ${complaint.department}\nStatus: ${complaint.status}\nPriority: ${complaint.priority}\nCreated: ${complaint.createdAt.toDateString()}\nDescription: ${complaint.description.substring(0, 200)}\n`;
            }
        }

        // Get or create chat log
        let chatLog = await ChatLog.findOne({ sessionId });
        if (!chatLog) {
            chatLog = await ChatLog.create({
                sessionId,
                userId,
                isGuest,
                messages: [],
            });
        }

        // Prepare context for Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert history for Gemini
        const history = chatLog.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: history,
            systemInstruction: SYSTEM_PROMPT + userContext + complaintContext,
        });

        const result = await chat.sendMessage(message);
        const assistantMessage = result.response.text();

        // Update chat log with user message
        chatLog.messages.push({
            role: 'user',
            content: message,
        });

        // Add assistant message to chat log
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
                error: 'Failed to process chatbot request',
                message: 'I apologize, but I\'m having trouble connecting to my systems right now. Please try again in a moment or contact support if the issue persists.',
            },
            { status: 500 }
        );
    }
}

// Get chat history
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
