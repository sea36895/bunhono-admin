import { Hono } from 'hono';
import { users, findUserByUsername, findUserByEmail, createUser, verifyPassword, updateLastLogin } from '../data/users';
import { generateToken, getPublicUser } from '../lib/auth';
import { sanitizeInput, validateEmail, validatePassword, validateUsername } from '../middleware/security';

const auth = new Hono();

auth.post('/register', async (c) => {
  try {
    const body = await c.req.parseBody();
    const username = sanitizeInput(body.username as string);
    const email = sanitizeInput(body.email as string);
    const password = body.password as string;
    const confirmPassword = body.confirmPassword as string;
    
    if (!username || !email || !password) {
      return c.html(`<script>alert('所有字段都是必填的'); window.location.href='/register';</script>`, 400);
    }
    
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return c.html(`<script>alert('${usernameValidation.message}'); window.location.href='/register';</script>`, 400);
    }
    
    if (!validateEmail(email)) {
      return c.html(`<script>alert('请输入有效的邮箱地址'); window.location.href='/register';</script>`, 400);
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.html(`<script>alert('${passwordValidation.message}'); window.location.href='/register';</script>`, 400);
    }
    
    if (password !== confirmPassword) {
      return c.html(`<script>alert('两次输入的密码不一致'); window.location.href='/register';</script>`, 400);
    }
    
    if (findUserByUsername(username)) {
      return c.html(`<script>alert('用户名已存在'); window.location.href='/register';</script>`, 400);
    }
    
    if (findUserByEmail(email)) {
      return c.html(`<script>alert('邮箱已被注册'); window.location.href='/register';</script>`, 400);
    }
    
    const newUser = createUser(username, email, password, 'user');
    const token = generateToken(newUser);
    
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
    
    return c.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    return c.html(`<script>alert('注册失败，请稍后重试'); window.location.href='/register';</script>`, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const body = await c.req.parseBody();
    const username = sanitizeInput(body.username as string);
    const password = body.password as string;
    
    if (!username || !password) {
      return c.html(`<script>alert('用户名和密码都是必填的'); window.location.href='/login';</script>`, 400);
    }
    
    const user = findUserByUsername(username);
    
    if (!user) {
      return c.html(`<script>alert('用户名或密码错误'); window.location.href='/login';</script>`, 401);
    }
    
    if (!verifyPassword(user, password)) {
      return c.html(`<script>alert('用户名或密码错误'); window.location.href='/login';</script>`, 401);
    }
    
    updateLastLogin(user.id);
    const token = generateToken(user);
    
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`);
    
    return c.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    return c.html(`<script>alert('登录失败，请稍后重试'); window.location.href='/login';</script>`, 500);
  }
});

auth.get('/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  return c.redirect('/');
});

export default auth;
