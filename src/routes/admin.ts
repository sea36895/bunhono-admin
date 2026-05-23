import { Hono } from 'hono';
import { dashboardPage, moviesListPage, movieFormPage, usersListPage } from '../views/admin';
import { movies } from '../data/movies';
import { users, getPublicUser } from '../data/users';
import { sanitizeInput } from '../middleware/security';
import type { Movie } from '../data/types';

const adminRouter = new Hono();

// 仪表盘
adminRouter.get('/', (c) => {
  return c.html(dashboardPage({
    totalMovies: movies.length,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    recentMovies: movies
  }));
});

// 影视管理
adminRouter.get('/movies', (c) => {
  return c.html(moviesListPage(movies));
});

adminRouter.get('/movies/create', (c) => {
  return c.html(movieFormPage());
});

adminRouter.post('/movies/create', async (c) => {
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
    return c.html(movieFormPage(undefined, '创建失败，请稍后重试'), 500);
  }
});

adminRouter.get('/movies/edit/:id', (c) => {
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  
  if (!movie) {
    return c.redirect('/admin/movies');
  }
  
  return c.html(movieFormPage(movie));
});

adminRouter.post('/movies/update', async (c) => {
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

adminRouter.get('/movies/delete/:id', (c) => {
  const id = c.req.param('id');
  const movieIndex = movies.findIndex(m => m.id === id);
  
  if (movieIndex !== -1) {
    movies.splice(movieIndex, 1);
  }
  
  return c.redirect('/admin/movies');
});

// 用户管理
adminRouter.get('/users', (c) => {
  return c.html(usersListPage(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }))));
});

export default adminRouter;
