import dbConnect from '@/lib/dbConnect';
import RateLimit from '@/models/RateLimit';

/**
 * Basic MongoDB-based Rate Limiter for Serverless Environments
 * @param {string} ip - User IP address
 * @param {string} endpoint - The API endpoint being accessed
 * @param {number} limit - Max requests per minute
 * @returns {Promise<{success: boolean, current: number}>}
 */
export async function rateLimit(ip, endpoint, limit = 5) {
    await dbConnect();

    // Find and update the request count for this IP and endpoint
    // If it doesn't exist, it will be created with count 1
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
