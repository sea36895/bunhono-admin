import type { Movie } from '../data/types';

export function layout(content: string, title: string = '影视系统', user: any = null): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .star-rating { color: #fbbf24; }
  </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <nav class="bg-gray-800 shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <a href="/" class="text-2xl font-bold text-red-500">🎬 影视系统</a>
        <div class="flex items-center gap-4">
          ${user ? `
            <span class="text-gray-300">欢迎, ${user.username}</span>
            ${user.role === 'admin' ? `<a href="/admin" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition">管理后台</a>` : ''}
            <a href="/profile" class="px-4 py-2 text-gray-300 hover:text-white transition">个人中心</a>
            <a href="/api/auth/logout" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition">退出</a>
          ` : `
            <a href="/login" class="px-4 py-2 text-gray-300 hover:text-white transition">登录</a>
            <a href="/register" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition">注册</a>
          `}
        </div>
      </div>
    </div>
  </nav>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    ${content}
  </main>
  <footer class="bg-gray-800 mt-12 py-6">
    <div class="max-w-7xl mx-auto px-4 text-center text-gray-400">
      <p>© 2024 影视系统. 基于 Bun + Hono 开发</p>
    </div>
  </footer>
</body>
</html>`;
}

export function movieCard(movie: Movie): string {
  const stars = '★'.repeat(Math.floor(movie.rating / 2)) + '☆'.repeat(5 - Math.floor(movie.rating / 2));
  return `
    <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer"
         onclick="location.href='/movie/${movie.id}'">
      <div class="h-64 overflow-hidden">
        <img src="${movie.poster}" alt="${movie.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-bold mb-1">${movie.title}</h3>
        <p class="text-gray-400 text-sm mb-2">${movie.year} • ${movie.duration}分钟</p>
        <div class="flex flex-wrap gap-1 mb-2">
          ${movie.genre.map(g => `<span class="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">${g}</span>`).join('')}
        </div>
        <div class="flex items-center">
          <span class="star-rating text-lg">${stars}</span>
          <span class="ml-2 text-yellow-400 font-semibold">${movie.rating}</span>
        </div>
      </div>
    </div>`;
}

export function homePage(movies: Movie[], user: any = null): string {
  const allGenres = [...new Set(movies.flatMap(m => m.genre))];
  const content = `
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">🎥 热门影视</h1>
      <p class="text-gray-400">发现精彩电影，享受美好时光</p>
    </div>
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">分类浏览</h2>
      <div class="flex flex-wrap gap-2">
        <a href="/" class="px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition">全部</a>
        ${allGenres.map(g => `<a href="/category/${encodeURIComponent(g)}" class="px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition">${g}</a>`).join('')}
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      ${movies.map(movieCard).join('')}
    </div>`;
  return layout(content, '影视系统 - 首页', user);
}

export function movieDetailPage(movie: Movie, user: any = null): string {
  const stars = '★'.repeat(Math.floor(movie.rating / 2)) + '☆'.repeat(5 - Math.floor(movie.rating / 2));
  const content = `
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/3">
        <div class="rounded-xl overflow-hidden shadow-2xl">
          <img src="${movie.poster}" alt="${movie.title}" class="w-full">
        </div>
      </div>
      <div class="lg:w-2/3">
        <a href="/" class="inline-flex items-center text-red-500 hover:text-red-400 mb-4">← 返回列表</a>
        <h1 class="text-4xl font-bold mb-2">${movie.title}</h1>
        <div class="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
          <span>${movie.year}</span>
          <span>•</span>
          <span>${movie.duration}分钟</span>
          <span>•</span>
          <div class="flex items-center">
            <span class="star-rating text-xl">${stars}</span>
            <span class="ml-2 text-yellow-400 font-semibold text-xl">${movie.rating}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-6">
          ${movie.genre.map(g => `<span class="px-3 py-1 bg-red-900/50 text-red-300 rounded-full text-sm">${g}</span>`).join('')}
        </div>
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">剧情简介</h3>
          <p class="text-gray-300 leading-relaxed">${movie.description}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">导演</h3>
            <p class="text-gray-300">${movie.director}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-2">主演</h3>
            <p class="text-gray-300">${movie.cast.join('，')}</p>
          </div>
        </div>
        <button class="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2">
          ▶ 立即播放
        </button>
      </div>
    </div>`;
  return layout(content, `${movie.title} - 影视详情`, user);
}

export function searchPage(movies: Movie[], query: string, user: any = null): string {
  const content = `
    <div class="mb-8">
      <a href="/" class="inline-flex items-center text-red-500 hover:text-red-400 mb-4">← 返回首页</a>
      <h1 class="text-3xl font-bold mb-2">搜索结果: "${query}"</h1>
      <p class="text-gray-400">找到 ${movies.length} 部相关影视</p>
    </div>
    ${movies.length > 0 ? `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${movies.map(movieCard).join('')}
      </div>` : `
      <div class="text-center py-16">
        <div class="text-6xl mb-4">🎬</div>
        <h2 class="text-2xl font-semibold mb-2">未找到相关影视</h2>
        <p class="text-gray-400">尝试其他关键词搜索</p>
      </div>`}`;
  return layout(content, `搜索: ${query} - 影视系统`, user);
}

export function categoryPage(movies: Movie[], category: string, user: any = null): string {
  const content = `
    <div class="mb-8">
      <a href="/" class="inline-flex items-center text-red-500 hover:text-red-400 mb-4">← 返回首页</a>
      <h1 class="text-3xl font-bold mb-2">分类: ${category}</h1>
      <p class="text-gray-400">共 ${movies.length} 部影视</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      ${movies.map(movieCard).join('')}
    </div>`;
  return layout(content, `${category} - 影视系统`, user);
}

export function notFoundPage(user: any = null): string {
  const content = `
    <div class="text-center py-20">
      <div class="text-8xl mb-4">🎭</div>
      <h1 class="text-4xl font-bold mb-2">404 - 页面未找到</h1>
      <p class="text-gray-400 mb-6">抱歉，您访问的页面不存在</p>
      <a href="/" class="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
        返回首页
      </a>
    </div>`;
  return layout(content, '404 - 影视系统', user);
}
