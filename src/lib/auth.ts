import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { User, UserPublic } from '../data/users';

const JWT_SECRET = process.env.JWT_SECRET || 'movie-system-secret-key-2024';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

interface TokenPayload {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  exp: number;
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString();
}

function createSignature(header: string, payload: string): string {
  return createHmac('sha256', JWT_SECRET)
    .update(header + '.' + payload)
    .digest('base64url');
}

export function generateToken(user: User): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + TOKEN_EXPIRY
  };
  
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(header, payloadEncoded);
  
  return `${header}.${payloadEncoded}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      return null;
    }
    
    const expectedSignature = createSignature(header, payload);
    
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }
    
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }
    
    const payloadData: TokenPayload = JSON.parse(base64UrlDecode(payload));
    
    if (payloadData.exp < Date.now()) {
      return null;
    }
    
    return payloadData;
  } catch (error) {
    return null;
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return null;
}

export function getPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
