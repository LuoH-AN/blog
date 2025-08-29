import type { H3Event } from 'h3'
import { Buffer } from 'node:buffer'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { setCookie, readBody, getQuery, defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const MOMENT_API_AUTH_KEY = process.env.MOMENT_API_AUTH_KEY
const JWT_SECRET = process.env.JWT_SECRET

const missingEnvVars: string[] = [];
if (!JWT_SECRET) {
    missingEnvVars.push('JWT_SECRET');
}
if (!R2_BUCKET_NAME) {
    missingEnvVars.push('R2_BUCKET_NAME');
}
if (!R2_ACCOUNT_ID) {
    missingEnvVars.push('CLOUDFLARE_ACCOUNT_ID');
}
if (!R2_ACCESS_KEY_ID) {
    missingEnvVars.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
}
if (!R2_SECRET_ACCESS_KEY) {
    missingEnvVars.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
}
if (!MOMENT_API_AUTH_KEY) {
    missingEnvVars.push('MOMENT_API_AUTH_KEY');
}
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Please set them.`);
}

function initR2Client() {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID!,
            secretAccessKey: R2_SECRET_ACCESS_KEY!,
        },
    })
}

function authenticate(event: H3Event) {
    const token = getCookie(event, 'auth_token');

    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    try {
        jwt.verify(token, JWT_SECRET!);
    } catch (error: any) {
        throw new Error(`Unauthorized: Invalid token. ${error.message}`);
    }
}

async function authenticateLogin(event: H3Event) {
    const body = await readBody(event)
    const { authKey: providedKey } = body

    if (!providedKey || providedKey !== MOMENT_API_AUTH_KEY!) {
        throw new Error('Invalid authentication key')
    }

    const payload = {
        userId: 'admin',
        role: 'editor'
    };

    const token = jwt.sign(payload, JWT_SECRET!, {
        expiresIn: '7d'
    });

    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    });

    return { success: true };
}

export default defineEventHandler(async (event) => {
    if (getQuery(event).login !== undefined) {
        return await authenticateLogin(event)
    }

    const r2Client = initR2Client()
    const fileName = 'config/moment.json'

    if (event.method === 'GET') {
        authenticate(event);

        try {
            const command = new GetObjectCommand({
                Bucket: R2_BUCKET_NAME!,
                Key: fileName,
            })

            const response = await r2Client.send(command)
            const data = await streamToString(response.Body)
            return JSON.parse(data)
        }
        catch (error: any) {
            if (error.name === 'NoSuchKey') {
                return []
            }
            throw error
        }
    }
    else if (event.method === 'POST') {
        authenticate(event)

        const body = await readBody(event)
        const jsonData = JSON.stringify(body, null, 2)

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME!,
            Key: fileName,
            Body: jsonData,
            ContentType: 'application/json',
        })

        await r2Client.send(command)
        return { success: true, message: 'Data saved successfully' }
    }
    else {
        throw new Error(`Method ${event.method} not allowed`)
    }
})

async function streamToString(stream: any): Promise<string> {
    const chunks = []
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    return Buffer.concat(chunks).toString('utf-8')
}
