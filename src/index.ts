import { Hono } from 'hono';
import { movies } from './data/movies';
import { 
  homePage, 
  movieDetailPage, 
  searchPage, 
  categoryPage, 
  notFoundPage 
} from './views/templates';

const app = new Hono();

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

app.notFound((c) => {
  return c.html(notFoundPage(), 404);
});

const port = parseInt(process.env.PORT || '3000');

console.log(`🎬 影视系统服务器启动中...`);
console.log(`🚀 服务运行在 http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch
};
