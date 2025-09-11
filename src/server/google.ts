import { importPKCS8, SignJWT } from 'jose'

type ServiceAccount = {
  client_email: string
  private_key: string
  token_uri?: string
}

const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token'

function getServiceAccount(): ServiceAccount {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64
  if (!b64) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON_B64 env var')
  }
  const json = Buffer.from(b64, 'base64').toString('utf8')
  const parsed = JSON.parse(json)
  const { client_email, private_key, token_uri } = parsed
  if (!client_email || !private_key) {
    throw new Error('Invalid service account JSON: missing client_email/private_key')
  }
  return { client_email, private_key, token_uri }
}

export async function getGoogleAccessToken(scopes: string | string[]): Promise<string> {
  const sa = getServiceAccount()
  const scope = Array.isArray(scopes) ? scopes.join(' ') : scopes
  const aud = sa.token_uri || DEFAULT_TOKEN_URI

  const privateKey = await importPKCS8(sa.private_key, 'RS256')
  const jwt = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey)

  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  })

  const res = await fetch(aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google OAuth token exchange failed: ${res.status} ${text}`)
  }

  const data = await res.json() as { access_token: string }
  if (!data.access_token) {
    throw new Error('No access_token in Google token response')
  }
  return data.access_token
}

export async function getSearchConsoleAccessToken(readWrite = false): Promise<string> {
  const scope = readWrite
    ? 'https://www.googleapis.com/auth/webmasters'
    : 'https://www.googleapis.com/auth/webmasters.readonly'
  return getGoogleAccessToken(scope)
}

