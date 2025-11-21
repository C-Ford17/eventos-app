import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Must be 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        console.error('ENCRYPTION_KEY is not set');
        return text; // Fallback (not recommended for production)
    }

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
}

export function decrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        console.error('ENCRYPTION_KEY is not set');
        return text;
    }

    try {
        const textParts = text.split(':');
        if (textParts.length < 2) return text; // Not encrypted or invalid format

        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return text; // Return original text if decryption fails (e.g. if it wasn't encrypted)
    }
}
