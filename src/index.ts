import { Hono } from 'hono';
import { movies } from './data/movies';
import { homePage, movieDetailPage, searchPage, categoryPage, notFoundPage } from './views/templates';
import { loginPage, registerPage, profilePage } from './views/auth';
import { dashboardPage, moviesListPage, movieFormPage, usersListPage } from './views/admin';
import { rateLimitMiddleware, sanitizeInput, validateEmail, validatePassword, validateUsername } from './middleware/security';
import { generateToken, verifyToken, getPublicUser } from './lib/auth';
import { users, findUserByUsername, findUserByEmail, createUser, verifyPassword, updateLastLogin } from './data/users';
import type { Movie } from './data/types';

const app = new Hono();
app.use('*', rateLimitMiddleware);

function getToken(c: any): string | null {
  const cookie = c.req.header('cookie');
  if (!cookie) return null;
  const match = cookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

function getAuthUser(c: any): any {
  const token = getToken(c);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return users.find(u => u.id === payload.userId) || null;
}

app.get('/', (c) => {
  const user = getAuthUser(c);
  return c.html(homePage(movies, user));
});

app.get('/movie/:id', (c) => {
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  if (!movie) return c.html(notFoundPage(), 404);
  const user = getAuthUser(c);
  return c.html(movieDetailPage(movie, user));
});

app.get('/search', (c) => {
  const query = c.req.query('q') || '';
  const searchQuery = query.toLowerCase();
  const filtered = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery) ||
    m.description.toLowerCase().includes(searchQuery) ||
    m.genre.some(g => g.toLowerCase().includes(searchQuery)) ||
    m.director.toLowerCase().includes(searchQuery) ||
    m.cast.some(a => a.toLowerCase().includes(searchQuery))
  );
  const user = getAuthUser(c);
  return c.html(searchPage(filtered, query, user));
});

app.get('/category/:genre', (c) => {
  const genre = decodeURIComponent(c.req.param('genre'));
  const filtered = movies.filter(m => m.genre.includes(genre));
  const user = getAuthUser(c);
  return c.html(categoryPage(filtered, genre, user));
});

app.get('/login', (c) => {
  if (getAuthUser(c)) return c.redirect('/');
  return c.html(loginPage());
});

app.get('/register', (c) => {
  if (getAuthUser(c)) return c.redirect('/');
  return c.html(registerPage());
});

app.get('/profile', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  return c.html(profilePage(getPublicUser(user)));
});

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
  } catch (e) {
    console.error('Login error:', e);
    return c.html(loginPage('登录失败，请稍后重试'));
  }
});

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
    if (!userVal.valid) return c.html(registerPage(userVal.message));
    
    if (!validateEmail(email)) return c.html(registerPage('请输入有效邮箱'));
    
    const passVal = validatePassword(password);
    if (!passVal.valid) return c.html(registerPage(passVal.message));
    
    if (password !== confirm) return c.html(registerPage('两次密码不一致'));
    
    if (findUserByUsername(username)) return c.html(registerPage('用户名已存在'));
    if (findUserByEmail(email)) return c.html(registerPage('邮箱已被注册'));
    
    const user = createUser(username, email, password, 'user');
    const token = generateToken(user);
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax`);
    return c.redirect('/');
  } catch (e) {
    console.error('Register error:', e);
    return c.html(registerPage('注册失败，请稍后重试'));
  }
});

app.get('/api/auth/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  return c.redirect('/');
});

app.get('/admin', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  return c.html(dashboardPage({
    totalMovies: movies.length,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    recentMovies: movies
  }));
});

app.get('/admin/movies', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  return c.html(moviesListPage(movies));
});

app.get('/admin/movies/create', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  return c.html(movieFormPage());
});

app.post('/admin/movies/create', async (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  
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
      return c.html(movieFormPage(undefined, '请填写所有必填字段'));
    }
    
    const newMovie: Movie = {
      id: (movies.length + 1).toString(),
      title, year, duration, rating, genre, director, cast, poster, description
    };
    movies.push(newMovie);
    return c.redirect('/admin/movies');
  } catch (e) {
    console.error('Create movie error:', e);
    return c.html(movieFormPage(undefined, '创建失败'));
  }
});

app.get('/admin/movies/edit/:id', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  if (!movie) return c.redirect('/admin/movies');
  return c.html(movieFormPage(movie));
});

app.post('/admin/movies/update', async (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  
  try {
    const body = await c.req.parseBody();
    const id = body.id as string;
    const index = movies.findIndex(m => m.id === id);
    
    if (index === -1) return c.redirect('/admin/movies');
    
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
      return c.html(movieFormPage(movies[index], '请填写所有必填字段'));
    }
    
    movies[index] = { id, title, year, duration, rating, genre, director, cast, poster, description };
    return c.redirect('/admin/movies');
  } catch (e) {
    console.error('Update movie error:', e);
    return c.redirect('/admin/movies');
  }
});

app.get('/admin/movies/delete/:id', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  
  const id = c.req.param('id');
  const index = movies.findIndex(m => m.id === id);
  if (index !== -1) movies.splice(index, 1);
  return c.redirect('/admin/movies');
});

app.get('/admin/users', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');
  if (user.role !== 'admin') return c.html(notFoundPage(), 404);
  
  return c.html(usersListPage(users.map(getPublicUser)));
});

app.notFound((c) => c.html(notFoundPage(), 404));

const port = parseInt(process.env.PORT || '3000');
console.log('🎬 影视系统启动中...');
console.log('🚀 http://localhost:' + port);
console.log('📋 管理员: admin/admin123');
console.log('📋 普通用户: user/user123');

export default { port, fetch: app.fetch };
