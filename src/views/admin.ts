import type { Movie } from '../data/types';
import type { UserPublic } from '../data/users';

export function adminLayout(content: string, title: string = '管理后台'): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 影视系统</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <nav class="bg-gray-800 shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center gap-4">
          <a href="/" class="text-2xl font-bold text-red-500">🎬 影视系统</a>
          <span class="px-3 py-1 bg-red-900/50 text-red-300 rounded-full text-sm">管理后台</span>
        </div>
        <div class="flex items-center gap-4">
          <a href="/" class="px-4 py-2 text-gray-300 hover:text-white transition">返回前台</a>
          <a href="/profile" class="px-4 py-2 text-gray-300 hover:text-white transition">个人中心</a>
          <a href="/api/auth/logout" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition">退出</a>
        </div>
      </div>
    </div>
  </nav>
  <div class="flex">
    <aside class="w-64 bg-gray-800 min-h-screen p-6">
      <nav class="space-y-2">
        <a href="/admin" class="block px-4 py-3 rounded-lg hover:bg-gray-700 transition ${title === '仪表盘' ? 'bg-red-600' : ''}">📊 仪表盘</a>
        <a href="/admin/movies" class="block px-4 py-3 rounded-lg hover:bg-gray-700 transition ${title === '影视管理' ? 'bg-red-600' : ''}">🎬 影视管理</a>
        <a href="/admin/users" class="block px-4 py-3 rounded-lg hover:bg-gray-700 transition ${title === '用户管理' ? 'bg-red-600' : ''}">👥 用户管理</a>
      </nav>
    </aside>
    <main class="flex-1 p-8">${content}</main>
  </div>
</body>
</html>`;
}

export function dashboardPage(stats: { totalMovies: number; totalUsers: number; adminCount: number; recentMovies: Movie[] }): string {
  const content = `
    <h1 class="text-3xl font-bold mb-8">仪表盘</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-300">影视总数</h3>
          <span class="text-4xl">🎬</span>
        </div>
        <p class="text-3xl font-bold">${stats.totalMovies}</p>
      </div>
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-300">用户总数</h3>
          <span class="text-4xl">👥</span>
        </div>
        <p class="text-3xl font-bold">${stats.totalUsers}</p>
      </div>
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-300">管理员</h3>
          <span class="text-4xl">🛡️</span>
        </div>
        <p class="text-3xl font-bold">${stats.adminCount}</p>
      </div>
    </div>
    <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 class="text-xl font-semibold mb-4">最近添加的影视</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 px-4">标题</th>
              <th class="text-left py-3 px-4">年份</th>
              <th class="text-left py-3 px-4">评分</th>
              <th class="text-left py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            ${stats.recentMovies.slice(0, 5).map(m => `
              <tr class="border-b border-gray-700/50 hover:bg-gray-700/50">
                <td class="py-3 px-4">${m.title}</td>
                <td class="py-3 px-4">${m.year}</td>
                <td class="py-3 px-4 text-yellow-400">★ ${m.rating}</td>
                <td class="py-3 px-4">
                  <a href="/admin/movies/edit/${m.id}" class="text-red-500 hover:text-red-400">编辑</a>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  return adminLayout(content, '仪表盘');
}

export function moviesListPage(movies: Movie[]): string {
  const content = `
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">影视管理</h1>
      <a href="/admin/movies/create" class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition">+ 添加新影视</a>
    </div>
    <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700 bg-gray-700/50">
              <th class="text-left py-4 px-6">ID</th>
              <th class="text-left py-4 px-6">标题</th>
              <th class="text-left py-4 px-6">年份</th>
              <th class="text-left py-4 px-6">类型</th>
              <th class="text-left py-4 px-6">评分</th>
              <th class="text-left py-4 px-6">时长</th>
              <th class="text-left py-4 px-6">操作</th>
            </tr>
          </thead>
          <tbody>
            ${movies.map(m => `
              <tr class="border-b border-gray-700/50 hover:bg-gray-700/50 transition">
                <td class="py-4 px-6 text-gray-400">${m.id}</td>
                <td class="py-4 px-6 font-semibold">${m.title}</td>
                <td class="py-4 px-6">${m.year}</td>
                <td class="py-4 px-6">
                  <div class="flex flex-wrap gap-1">
                    ${m.genre.slice(0, 2).map(g => `<span class="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">${g}</span>`).join('')}
                  </div>
                </td>
                <td class="py-4 px-6 text-yellow-400">★ ${m.rating}</td>
                <td class="py-4 px-6">${m.duration}分钟</td>
                <td class="py-4 px-6">
                  <a href="/admin/movies/edit/${m.id}" class="text-blue-400 hover:text-blue-300 mr-3">编辑</a>
                  <button onclick="confirmDelete('${m.id}', '${m.title}')" class="text-red-400 hover:text-red-300">删除</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <script>
      function confirmDelete(id, title) {
        if (confirm('确定要删除电影 "' + title + '" 吗？此操作不可撤销。')) {
          window.location.href = '/admin/movies/delete/' + id;
        }
      }
    </script>`;
  return adminLayout(content, '影视管理');
}

export function movieFormPage(movie?: Movie, error?: string): string {
  const isEdit = !!movie;
  const content = `
    <div class="max-w-4xl">
      <div class="flex items-center mb-8">
        <a href="/admin/movies" class="text-red-500 hover:text-red-400 mr-4">← 返回列表</a>
        <h1 class="text-3xl font-bold">${isEdit ? '编辑影视' : '添加新影视'}</h1>
      </div>
      ${error ? `
        <div class="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">${error}</div>` : ''}
      <form action="/admin/movies/${isEdit ? 'update' : 'create'}" method="POST" class="bg-gray-800 rounded-xl p-8 shadow-lg">
        ${isEdit ? `<input type="hidden" name="id" value="${movie.id}">` : ''}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-gray-300 mb-2" for="title">电影标题 *</label>
            <input type="text" name="title" id="title" required value="${movie?.title || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div>
            <label class="block text-gray-300 mb-2" for="year">上映年份 *</label>
            <input type="number" name="year" id="year" required min="1900" max="2030" value="${movie?.year || new Date().getFullYear()}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div>
            <label class="block text-gray-300 mb-2" for="duration">时长（分钟）*</label>
            <input type="number" name="duration" id="duration" required min="1" value="${movie?.duration || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div>
            <label class="block text-gray-300 mb-2" for="rating">评分 *</label>
            <input type="number" name="rating" id="rating" required min="0" max="10" step="0.1" value="${movie?.rating || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div>
            <label class="block text-gray-300 mb-2" for="genre">类型（逗号分隔）*</label>
            <input type="text" name="genre" id="genre" required placeholder="科幻, 动作, 冒险" value="${movie?.genre.join(', ') || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-300 mb-2" for="director">导演 *</label>
            <input type="text" name="director" id="director" required value="${movie?.director || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-300 mb-2" for="cast">主演（逗号分隔）*</label>
            <input type="text" name="cast" id="cast" required placeholder="演员1, 演员2" value="${movie?.cast.join(', ') || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-300 mb-2" for="poster">海报URL *</label>
            <input type="url" name="poster" id="poster" required value="${movie?.poster || ''}"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-300 mb-2" for="description">剧情简介 *</label>
            <textarea name="description" id="description" required rows="5"
              class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">${movie?.description || ''}</textarea>
          </div>
        </div>
        <div class="flex justify-end gap-4 mt-8">
          <a href="/admin/movies" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">取消</a>
          <button type="submit" class="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
            ${isEdit ? '保存修改' : '创建影视'}
          </button>
        </div>
      </form>
    </div>`;
  return adminLayout(content, isEdit ? '编辑影视' : '添加新影视');
}

export function usersListPage(users: UserPublic[]): string {
  const content = `
    <h1 class="text-3xl font-bold mb-8">用户管理</h1>
    <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700 bg-gray-700/50">
              <th class="text-left py-4 px-6">ID</th>
              <th class="text-left py-4 px-6">用户名</th>
              <th class="text-left py-4 px-6">邮箱</th>
              <th class="text-left py-4 px-6">角色</th>
              <th class="text-left py-4 px-6">注册时间</th>
              <th class="text-left py-4 px-6">最后登录</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr class="border-b border-gray-700/50 hover:bg-gray-700/50 transition">
                <td class="py-4 px-6 text-gray-400">${u.id}</td>
                <td class="py-4 px-6 font-semibold">${u.username}</td>
                <td class="py-4 px-6">${u.email}</td>
                <td class="py-4 px-6">
                  <span class="px-3 py-1 rounded ${u.role === 'admin' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}">
                    ${u.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td class="py-4 px-6">${u.createdAt.toLocaleDateString('zh-CN')}</td>
                <td class="py-4 px-6">${u.lastLogin ? u.lastLogin.toLocaleDateString('zh-CN') : '从未登录'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  return adminLayout(content, '用户管理');
}
