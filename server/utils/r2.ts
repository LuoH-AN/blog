import { S3Client } from '@aws-sdk/client-s3'

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

const missingEnvVars: string[] = []
if (!R2_BUCKET_NAME) {
  missingEnvVars.push('R2_BUCKET_NAME')
}
if (!R2_ACCOUNT_ID) {
  missingEnvVars.push('R2_ACCOUNT_ID')
}
if (!R2_ACCESS_KEY_ID) {
  missingEnvVars.push('R2_ACCESS_KEY_ID')
}
if (!R2_SECRET_ACCESS_KEY) {
  missingEnvVars.push('R2_SECRET_ACCESS_KEY')
}
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Please set them.`)
}

export function initR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  })
}

export const R2_FILE_NAME = 'config/moment.json'