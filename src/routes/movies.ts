import { Hono } from 'hono';
import { movies } from '../data/movies';
import type { Movie } from '../data/types';
import { sanitizeInput } from '../middleware/security';

const adminMovies = new Hono();

adminMovies.get('/create', async (c) => {
  const { movieFormPage } = await import('../views/admin');
  return c.html(movieFormPage());
});

adminMovies.post('/create', async (c) => {
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
      const { movieFormPage } = await import('../views/admin');
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
    const { movieFormPage } = await import('../views/admin');
    return c.html(movieFormPage(undefined, '创建失败，请稍后重试'), 500);
  }
});

adminMovies.get('/edit/:id', async (c) => {
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  
  if (!movie) {
    return c.redirect('/admin/movies');
  }
  
  const { movieFormPage } = await import('../views/admin');
  return c.html(movieFormPage(movie));
});

adminMovies.post('/update', async (c) => {
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
      const { movieFormPage } = await import('../views/admin');
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

adminMovies.get('/delete/:id', async (c) => {
  const id = c.req.param('id');
  const movieIndex = movies.findIndex(m => m.id === id);
  
  if (movieIndex !== -1) {
    movies.splice(movieIndex, 1);
  }
  
  return c.redirect('/admin/movies');
});

export default adminMovies;
