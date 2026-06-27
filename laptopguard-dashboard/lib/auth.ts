import { verifySync } from "otplib";
import fs from "fs";

const SECRET_PATH = "C:\\ProgramData\\LaptopGuard\\otp.secret";

export function verifyOtp(code: string): boolean {
    try {
        const secret = fs.readFileSync(SECRET_PATH, "utf8").trim();

        return verifySync({
            token: code,
            secret,
        }).success;
    } catch {
        return false;
    }
}