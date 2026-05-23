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
import { authMiddleware, adminMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/security';
import { verifyToken, extractToken, getPublicUser } from './lib/auth';
import { findUserById } from './data/users';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import adminMovieRoutes from './routes/movies';
import adminUserRoutes from './routes/users';

const app = new Hono();

app.use('*', rateLimitMiddleware);

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

app.get('/profile', async (c) => {
  const token = extractToken(c.req.header('Authorization'));
  
  if (!token) {
    return c.redirect('/login');
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return c.redirect('/login');
  }
  
  const user = findUserById(payload.userId);
  
  if (!user) {
    return c.redirect('/login');
  }
  
  return c.html(profilePage(getPublicUser(user)));
});

app.route('/api/auth', authRoutes);

app.use('/admin/*', async (c, next) => {
  await authMiddleware(c, next);
});

app.use('/admin/*', async (c, next) => {
  await adminMiddleware(c, next);
});

app.route('/admin', adminRoutes);
app.route('/admin/movies', adminMovieRoutes);
app.route('/admin/users', adminUserRoutes);

app.notFound((c) => {
  return c.html(notFoundPage(), 404);
});

app.onError((c, err) => {
  console.error('Server error:', err);
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>错误 - 影视系统</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold mb-4">500</h1>
        <p class="text-2xl mb-6">服务器内部错误</p>
        <a href="/" class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition">返回首页</a>
      </div>
    </body>
    </html>
  `, 500);
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
