import { authenticator } from 'otplib';
import fs from 'fs';

const SECRET_PATH = 'C:\\ProgramData\\LaptopGuard\\otp.secret';

export function verifyOtp(code: string): boolean {
    try {
        const secret = fs.readFileSync(SECRET_PATH, 'utf-8').trim();
        authenticator.options = { window: 1 };
        return authenticator.verify({ token: code, secret });
    } catch {
        return false;
    }
}