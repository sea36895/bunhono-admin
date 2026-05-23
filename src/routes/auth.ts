import { Hono } from 'hono';
import { loginPage, registerPage } from '../views/auth';
import { sanitizeInput, validateEmail, validatePassword, validateUsername } from '../middleware/security';
import { generateToken, getPublicUser } from '../lib/auth';
import { users, findUserByUsername, findUserByEmail, createUser, verifyPassword, updateLastLogin } from '../data/users';

const authRouter = new Hono();

authRouter.get('/login', (c) => {
  return c.html(loginPage());
});

authRouter.get('/register', (c) => {
  return c.html(registerPage());
});

authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.parseBody();
    const username = sanitizeInput(body.username as string);
    const password = body.password as string;
    
    if (!username || !password) {
      return c.html(loginPage('请输入用户名和密码'));
    }
    
    const user = findUserByUsername(username);
    if (!user || !verifyPassword(user, password)) {
      return c.html(loginPage('用户名或密码错误'));
    }
    
    updateLastLogin(user.id);
    const token = generateToken(user);
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`);
    return c.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    return c.html(loginPage('登录失败，请稍后重试'));
  }
});

authRouter.post('/register', async (c) => {
  try {
    const body = await c.req.parseBody();
    const username = sanitizeInput(body.username as string);
    const email = sanitizeInput(body.email as string);
    const password = body.password as string;
    const confirm = body.confirmPassword as string;
    
    if (!username || !email || !password) {
      return c.html(registerPage('请填写所有字段'));
    }
    
    const userVal = validateUsername(username);
    if (!userVal.valid) {
      return c.html(registerPage(userVal.message));
    }
    
    if (!validateEmail(email)) {
      return c.html(registerPage('请输入有效邮箱'));
    }
    
    const passVal = validatePassword(password);
    if (!passVal.valid) {
      return c.html(registerPage(passVal.message));
    }
    
    if (password !== confirm) {
      return c.html(registerPage('两次密码不一致'));
    }
    
    if (findUserByUsername(username)) {
      return c.html(registerPage('用户名已存在'));
    }
    if (findUserByEmail(email)) {
      return c.html(registerPage('邮箱已被注册'));
    }
    
    const user = createUser(username, email, password, 'user');
    const token = generateToken(user);
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`);
    return c.redirect('/');
  } catch (error) {
    console.error('Register error:', error);
    return c.html(registerPage('注册失败，请稍后重试'));
  }
});

authRouter.get('/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  return c.redirect('/');
});

export default authRouter;
