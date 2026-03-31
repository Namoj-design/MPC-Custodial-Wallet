import { prisma } from '../db/postgres';

export async function generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.upsert({
        where: { email },
        update: { otp, expires_at },
        create: { email, otp, expires_at }
    });

    return otp;
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
    const record = await prisma.otp.findUnique({ where: { email } });
    if (!record) return false;
    if (record.otp !== otp) return false;
    if (record.expires_at < new Date()) {
        return false; // Expired
    }

    // Delete after successful validation
    await prisma.otp.delete({ where: { email } });
    return true;
}
