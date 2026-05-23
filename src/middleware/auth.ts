import type { Context, Next } from 'hono';
import { verifyToken, extractToken } from '../lib/auth';
import { findUserById } from '../data/users';

export async function authMiddleware(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));
  
  if (!token) {
    return c.json({ error: '未授权访问，请先登录' }, 401);
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return c.json({ error: '无效或过期的token' }, 401);
  }
  
  const user = findUserById(payload.userId);
  
  if (!user) {
    return c.json({ error: '用户不存在' }, 401);
  }
  
  c.set('user', payload);
  c.set('userId', payload.userId);
  
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: '未授权访问' }, 401);
  }
  
  if (user.role !== 'admin') {
    return c.json({ error: '需要管理员权限' }, 403);
  }
  
  await next();
}

export async function optionalAuth(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      c.set('user', payload);
      c.set('userId', payload.userId);
    }
  }
  
  await next();
}
