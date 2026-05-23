import { Hono } from 'hono';
import { users } from '../data/users';
import { getPublicUser } from '../lib/auth';

const adminUsers = new Hono();

adminUsers.get('/', async (c) => {
  const { usersListPage } = await import('../views/admin');
  const publicUsers = users.map(getPublicUser);
  return c.html(usersListPage(publicUsers));
});

export default adminUsers;
