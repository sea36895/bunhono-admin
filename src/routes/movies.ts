import { Hono } from 'hono';
import { homePage, movieDetailPage, searchPage, categoryPage, notFoundPage } from '../views/templates';
import { movies } from '../data/movies';

const moviesRouter = new Hono();

moviesRouter.get('/', (c) => {
  // 简单的用户获取 - 在实际项目中应该从认证中间件获取
  return c.html(homePage(movies));
});

moviesRouter.get('/movie/:id', (c) => {
  const id = c.req.param('id');
  const movie = movies.find(m => m.id === id);
  
  if (!movie) {
    return c.html(notFoundPage(), 404);
  }
  
  return c.html(movieDetailPage(movie));
});

moviesRouter.get('/search', (c) => {
  const query = c.req.query('q') || '';
  const searchQuery = query.toLowerCase();
  
  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery) ||
    m.description.toLowerCase().includes(searchQuery) ||
    m.genre.some(g => g.toLowerCase().includes(searchQuery)) ||
    m.director.toLowerCase().includes(searchQuery) ||
    m.cast.some(a => a.toLowerCase().includes(searchQuery))
  );
  
  return c.html(searchPage(filteredMovies, query));
});

moviesRouter.get('/category/:genre', (c) => {
  const genre = decodeURIComponent(c.req.param('genre'));
  const filteredMovies = movies.filter(m => m.genre.includes(genre));
  
  return c.html(categoryPage(filteredMovies, genre));
});

export default moviesRouter;
