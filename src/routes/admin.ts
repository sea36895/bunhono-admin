import { Hono } from 'hono';
import { movies } from '../data/movies';
import { users } from '../data/users';
import { dashboardPage } from '../views/admin';

const admin = new Hono();

admin.get('/', async (c) => {
  const stats = {
    totalMovies: movies.length,
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === 'admin').length,
    recentMovies: movies
  };
  
  return c.html(dashboardPage(stats));
});

export default admin;
