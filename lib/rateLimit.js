import dbConnect from '@/lib/dbConnect';
import RateLimit from '@/models/RateLimit';


export async function rateLimit(ip, endpoint, limit = 5) {
    await dbConnect();

    
    
    const record = await RateLimit.findOneAndUpdate(
        { ip, endpoint },
        { $inc: { count: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (record.count > limit) {
        return { success: false, current: record.count };
    }

    return { success: true, current: record.count };
}
