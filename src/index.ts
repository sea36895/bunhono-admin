import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimitMiddleware } from './middleware/security';
import { verifyToken } from './lib/auth';
import { users } from './data/users';
import { homePage, movieDetailPage, searchPage, categoryPage, notFoundPage } from './views/templates';
import { loginPage, registerPage, profilePage } from './views/auth';
import { dashboardPage, moviesListPage, movieFormPage, usersListPage } from './views/admin';
import { sanitizeInput, validateEmail, validatePassword, validateUsername } from './middleware/security';
import { generateToken, getPublicUser } from './lib/auth';
import { findUserByUsername, findUserByEmail, createUser, verifyPassword, updateLastLogin } from './data/users';
import { movies } from './data/movies';
import type { Movie } from './data/types';

const app = new Hono();

// 全局中间件
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', rateLimitMiddleware);

// 辅助函数 - 从 Cookie 中获取用户
function getAuthUser(c: any): any {
  const cookie = c.req.header('cookie');
  if (!cookie) return null;
  
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  
  const payload = verifyToken(tokenMatch[1]);
  if (!payload) return null;
  
  return users.find(u => u.id === payload.userId) || null;
}

// ==================== 公开路由 ====================

// 首页
app.get('/', (c) => {
  const user = getAuthUser(c);
  return c.html(homePage(movies, user));
});

// 影视详情页
app.get('/movie/:id', (c) => {
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  const user = getAuthUser(c);
  
  if (!movie) {
    return c.html(notFoundPage(user), 404);
  }
  
  return c.html(movieDetailPage(movie, user));
});

// 搜索
app.get('/search', (c) => {
  const query = c.req.query('q') || '';
  const searchQuery = query.toLowerCase();
  const user = getAuthUser(c);
  
  const filtered = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery) ||
    m.description.toLowerCase().includes(searchQuery) ||
    m.genre.some(g => g.toLowerCase().includes(searchQuery)) ||
    m.director.toLowerCase().includes(searchQuery) ||
    m.cast.some(a => a.toLowerCase().includes(searchQuery))
  );
  
  return c.html(searchPage(filtered, query, user));
});

// 分类浏览
app.get('/category/:genre', (c) => {
  const genre = decodeURIComponent(c.req.param('genre'));
  const filtered = movies.filter(m => m.genre.includes(genre));
  const user = getAuthUser(c);
  
  return c.html(categoryPage(filtered, genre, user));
});

// ==================== 认证路由 ====================

// 登录页面
app.get('/login', (c) => {
  const user = getAuthUser(c);
  if (user) {
    return c.redirect('/');
  }
  return c.html(loginPage());
});

// 注册页面
app.get('/register', (c) => {
  const user = getAuthUser(c);
  if (user) {
    return c.redirect('/');
  }
  return c.html(registerPage());
});

// 登录处理
app.post('/api/auth/login', async (c) => {
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

// 注册处理
app.post('/api/auth/register', async (c) => {
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

// 登出
app.get('/api/auth/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  return c.redirect('/');
});

// 个人中心
app.get('/profile', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  return c.html(profilePage(getPublicUser(user)));
});

// ==================== 管理后台路由 ====================

// 管理后台 - 仪表盘
app.get('/admin', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  return c.html(dashboardPage({
    totalMovies: movies.length,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    recentMovies: movies
  }));
});

// 影视管理 - 列表
app.get('/admin/movies', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  return c.html(moviesListPage(movies));
});

// 影视管理 - 创建页面
app.get('/admin/movies/create', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  return c.html(movieFormPage());
});

// 影视管理 - 创建处理
app.post('/admin/movies/create', async (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  try {
    const body = await c.req.parseBody();
    const title = sanitizeInput(body.title as string);
    const year = parseInt(body.year as string);
    const duration = parseInt(body.duration as string);
    const rating = parseFloat(body.rating as string);
    const genre = (body.genre as string).split(',').map(g => sanitizeInput(g.trim()));
    const director = sanitizeInput(body.director as string);
    const cast = (body.cast as string).split(',').map(a => sanitizeInput(a.trim()));
    const poster = sanitizeInput(body.poster as string);
    const description = sanitizeInput(body.description as string);
    
    if (!title || isNaN(year) || isNaN(duration) || isNaN(rating)) {
      return c.html(movieFormPage(undefined, '请填写所有必填字段'), 400);
    }
    
    const newMovie: Movie = {
      id: (movies.length + 1).toString(),
      title, year, duration, rating, genre, director, cast, poster, description
    };
    movies.push(newMovie);
    return c.redirect('/admin/movies');
  } catch (error) {
    console.error('Create movie error:', error);
    return c.html(movieFormPage(undefined, '创建失败，请稍后重试'), 500);
  }
});

// 影视管理 - 编辑页面
app.get('/admin/movies/edit/:id', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  if (!movie) {
    return c.redirect('/admin/movies');
  }
  return c.html(movieFormPage(movie));
});

// 影视管理 - 更新处理
app.post('/admin/movies/update', async (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  try {
    const body = await c.req.parseBody();
    const id = body.id as string;
    const movieIndex = movies.findIndex(m => m.id === id);
    
    if (movieIndex === -1) {
      return c.redirect('/admin/movies');
    }
    
    const title = sanitizeInput(body.title as string);
    const year = parseInt(body.year as string);
    const duration = parseInt(body.duration as string);
    const rating = parseFloat(body.rating as string);
    const genre = (body.genre as string).split(',').map(g => sanitizeInput(g.trim()));
    const director = sanitizeInput(body.director as string);
    const cast = (body.cast as string).split(',').map(a => sanitizeInput(a.trim()));
    const poster = sanitizeInput(body.poster as string);
    const description = sanitizeInput(body.description as string);
    
    if (!title || isNaN(year) || isNaN(duration) || isNaN(rating)) {
      return c.html(movieFormPage(movies[movieIndex], '请填写所有必填字段'), 400);
    }
    
    movies[movieIndex] = { id, title, year, duration, rating, genre, director, cast, poster, description };
    return c.redirect('/admin/movies');
  } catch (error) {
    console.error('Update movie error:', error);
    return c.redirect('/admin/movies');
  }
});

// 影视管理 - 删除
app.get('/admin/movies/delete/:id', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  const id = c.req.param('id');
  const movieIndex = movies.findIndex(m => m.id === id);
  if (movieIndex !== -1) {
    movies.splice(movieIndex, 1);
  }
  return c.redirect('/admin/movies');
});

// 用户管理 - 列表
app.get('/admin/users', (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(user), 404);
  }
  
  return c.html(usersListPage(users.map(getPublicUser)));
});

// ==================== 404 处理 ====================
app.notFound((c) => {
  const user = getAuthUser(c);
  return c.html(notFoundPage(user), 404);
});

// ==================== 启动服务器 ====================
const port = parseInt(process.env.PORT || '3000');
console.log('🎬 影视系统启动中...');
console.log('🚀 服务运行在 http://localhost:' + port);
console.log('📋 管理员账号: admin / admin123');
console.log('📋 普通用户: user / user123');

export default { port, fetch: app.fetch };
