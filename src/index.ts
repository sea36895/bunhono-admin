import { Hono } from 'hono';
import { movies } from './data/movies';
import { 
  homePage, 
  movieDetailPage, 
  searchPage, 
  categoryPage, 
  notFoundPage 
} from './views/templates';
import { loginPage, registerPage, profilePage } from './views/auth';
import { dashboardPage, moviesListPage, movieFormPage, usersListPage } from './views/admin';
import { rateLimitMiddleware, sanitizeInput, validateEmail, validatePassword, validateUsername } from './middleware/security';
import { generateToken, verifyToken, getPublicUser } from './lib/auth';
import { users, findUserByUsername, findUserByEmail, createUser, verifyPassword, updateLastLogin, hashNewPassword } from './data/users';
import type { Movie } from './data/types';

const app = new Hono();

app.use('*', rateLimitMiddleware);

function getTokenFromCookie(c: any): string | null {
  const cookie = c.req.header('cookie');
  if (!cookie) return null;
  
  const tokenMatch = cookie.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

function checkAuth(c: any): { isAuthenticated: boolean; user: any } {
  const token = getTokenFromCookie(c);
  if (!token) {
    return { isAuthenticated: false, user: null };
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return { isAuthenticated: false, user: null };
  }
  
  const user = users.find(u => u.id === payload.userId);
  if (!user) {
    return { isAuthenticated: false, user: null };
  }
  
  return { isAuthenticated: true, user };
}

app.get('/', (c) => {
  return c.html(homePage(movies));
});

app.get('/movie/:id', (c) => {
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  
  if (!movie) {
    return c.html(notFoundPage(), 404);
  }
  
  return c.html(movieDetailPage(movie));
});

app.get('/search', (c) => {
  const query = c.req.query('q') || '';
  const searchQuery = query.toLowerCase();
  
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery) ||
    movie.description.toLowerCase().includes(searchQuery) ||
    movie.genre.some(g => g.toLowerCase().includes(searchQuery)) ||
    movie.director.toLowerCase().includes(searchQuery) ||
    movie.cast.some(actor => actor.toLowerCase().includes(searchQuery))
  );
  
  return c.html(searchPage(filteredMovies, query));
});

app.get('/category/:genre', (c) => {
  const genre = decodeURIComponent(c.req.param('genre'));
  
  const filteredMovies = movies.filter(movie => 
    movie.genre.includes(genre)
  );
  
  return c.html(categoryPage(filteredMovies, genre));
});

app.get('/login', (c) => {
  return c.html(loginPage());
});

app.get('/register', (c) => {
  return c.html(registerPage());
});

app.get('/profile', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  return c.html(profilePage(getPublicUser(user)));
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.parseBody();
    const username = sanitizeInput(body.username as string);
    const password = body.password as string;
    
    if (!username || !password) {
      return c.html(loginPage('用户名和密码都是必填的'));
    }
    
    const user = findUserByUsername(username);
    
    if (!user || !verifyPassword(user, password)) {
      return c.html(loginPage('用户名或密码错误'));
    }
    
    updateLastLogin(user.id);
    const token = generateToken(user);
    
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
    
    return c.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    return c.html(loginPage('登录失败，请稍后重试'));
  }
});

app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.parseBody();
    const username = sanitizeInput(body.username as string);
    const email = sanitizeInput(body.email as string);
    const password = body.password as string;
    const confirmPassword = body.confirmPassword as string;
    
    if (!username || !email || !password) {
      return c.html(registerPage('所有字段都是必填的'));
    }
    
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return c.html(registerPage(usernameValidation.message));
    }
    
    if (!validateEmail(email)) {
      return c.html(registerPage('请输入有效的邮箱地址'));
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.html(registerPage(passwordValidation.message));
    }
    
    if (password !== confirmPassword) {
      return c.html(registerPage('两次输入的密码不一致'));
    }
    
    if (findUserByUsername(username)) {
      return c.html(registerPage('用户名已存在'));
    }
    
    if (findUserByEmail(email)) {
      return c.html(registerPage('邮箱已被注册'));
    }
    
    const newUser = createUser(username, email, password, 'user');
    const token = generateToken(newUser);
    
    c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
    
    return c.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    return c.html(registerPage('注册失败，请稍后重试'));
  }
});

app.get('/api/auth/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  return c.redirect('/');
});

app.get('/admin', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
  }
  
  const stats = {
    totalMovies: movies.length,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    recentMovies: movies
  };
  
  return c.html(dashboardPage(stats));
});

app.get('/admin/movies', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
  }
  
  return c.html(moviesListPage(movies));
});

app.get('/admin/movies/create', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
  }
  
  return c.html(movieFormPage());
});

app.post('/admin/movies/create', async (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
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
      return c.html(movieFormPage(undefined, '请填写所有必填字段'));
    }
    
    const newMovie: Movie = {
      id: (movies.length + 1).toString(),
      title,
      year,
      duration,
      rating,
      genre,
      director,
      cast,
      poster,
      description
    };
    
    movies.push(newMovie);
    return c.redirect('/admin/movies');
  } catch (error) {
    console.error('Create movie error:', error);
    return c.html(movieFormPage(undefined, '创建失败，请稍后重试'));
  }
});

app.get('/admin/movies/edit/:id', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
  }
  
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  
  if (!movie) {
    return c.redirect('/admin/movies');
  }
  
  return c.html(movieFormPage(movie));
});

app.post('/admin/movies/update', async (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
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
      return c.html(movieFormPage(movies[movieIndex], '请填写所有必填字段'));
    }
    
    movies[movieIndex] = {
      id,
      title,
      year,
      duration,
      rating,
      genre,
      director,
      cast,
      poster,
      description
    };
    
    return c.redirect('/admin/movies');
  } catch (error) {
    console.error('Update movie error:', error);
    return c.redirect('/admin/movies');
  }
});

app.get('/admin/movies/delete/:id', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
  }
  
  const id = c.req.param('id');
  const movieIndex = movies.findIndex(m => m.id === id);
  
  if (movieIndex !== -1) {
    movies.splice(movieIndex, 1);
  }
  
  return c.redirect('/admin/movies');
});

app.get('/admin/users', (c) => {
  const { isAuthenticated, user } = checkAuth(c);
  if (!isAuthenticated) {
    return c.redirect('/login');
  }
  if (user.role !== 'admin') {
    return c.html(notFoundPage(), 404);
  }
  
  const publicUsers = users.map(getPublicUser);
  return c.html(usersListPage(publicUsers));
});

app.notFound((c) => {
  return c.html(notFoundPage(), 404);
});

const port = parseInt(process.env.PORT || '3000');

console.log(`🎬 影视系统服务器启动中...`);
console.log(`🚀 服务运行在 http://localhost:${port}`);
console.log(`📋 默认账号:`);
console.log(`   管理员: admin / admin123`);
console.log(`   普通用户: user / user123`);

export default {
  port,
  fetch: app.fetch
};
