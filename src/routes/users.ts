import { Hono } from 'hono';
import { getPublicUser } from '../lib/auth';
import { users, findUserById } from '../data/users';

const usersRouter = new Hono();

usersRouter.get('/profile', async (c) => {
  // 获取当前用户信息 - 在实际项目中应该从认证中间件获取
  const { profilePage } = await import('../views/auth');
  
  // 临时演示 - 在实际项目中应该从认证状态获取用户
  const user = users[0]; // 默认取第一个用户作为演示
  
  if (!user) {
    return c.redirect('/login');
  }
  
  return c.html(profilePage(getPublicUser(user)));
});

export default usersRouter;
