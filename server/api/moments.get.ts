import { Buffer } from 'node:buffer'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { defineEventHandler, defineLazyEventHandler, createError } from 'h3'

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

const missingEnvVars: string[] = []
if (!R2_BUCKET_NAME) {
  missingEnvVars.push('R2_BUCKET_NAME')
}
if (!R2_ACCOUNT_ID) {
  missingEnvVars.push('CLOUDFLARE_ACCOUNT_ID')
}
if (!R2_ACCESS_KEY_ID) {
  missingEnvVars.push('CLOUDFLARE_R2_ACCESS_KEY_ID')
}
if (!R2_SECRET_ACCESS_KEY) {
  missingEnvVars.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
}
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Please set them.`)
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

export default defineLazyEventHandler(async () => {
  const r2Client = initR2Client()
  const fileName = 'config/moment.json'

  return defineEventHandler(async (event) => {
    if (event.method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: `Method ${event.method} not allowed`,
      })
    }

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
  })
})

async function streamToString(stream: any): Promise<string> {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf-8')
}