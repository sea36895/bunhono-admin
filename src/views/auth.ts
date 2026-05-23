import type { UserPublic } from '../data/users';

export function loginPage(error?: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - 影视系统</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
  <div class="max-w-md w-full mx-4">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-red-500 mb-2">🎬 影视系统</h1>
      <p class="text-gray-400">登录您的账户</p>
    </div>
    
    ${error ? `
      <div class="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
        ${error}
      </div>
    ` : ''}
    
    <form action="/api/auth/login" method="POST" class="bg-gray-800 rounded-xl p-8 shadow-2xl">
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="username">用户名</label>
        <input type="text" name="username" id="username" required
               class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
               placeholder="请输入用户名">
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="password">密码</label>
        <input type="password" name="password" id="password" required
               class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
               placeholder="请输入密码">
      </div>
      
      <button type="submit" class="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
        登录
      </button>
      
      <p class="text-center mt-6 text-gray-400">
        还没有账户? 
        <a href="/register" class="text-red-500 hover:text-red-400">立即注册</a>
      </p>
    </form>
    
    <div class="text-center mt-6 text-gray-500 text-sm">
      <p>测试账号: admin / admin123</p>
      <p>普通用户: user / user123</p>
    </div>
  </div>
</body>
</html>
`;
}

export function registerPage(error?: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注册 - 影视系统</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
  <div class="max-w-md w-full mx-4">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-red-500 mb-2">🎬 影视系统</h1>
      <p class="text-gray-400">创建新账户</p>
    </div>
    
    ${error ? `
      <div class="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
        ${error}
      </div>
    ` : ''}
    
    <form action="/api/auth/register" method="POST" class="bg-gray-800 rounded-xl p-8 shadow-2xl">
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="username">用户名</label>
        <input type="text" name="username" id="username" required minlength="3"
               class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
               placeholder="至少3个字符">
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="email">邮箱</label>
        <input type="email" name="email" id="email" required
               class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
               placeholder="your@email.com">
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="password">密码</label>
        <input type="password" name="password" id="password" required minlength="6"
               class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
               placeholder="至少6个字符">
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-300 mb-2" for="confirmPassword">确认密码</label>
        <input type="password" name="confirmPassword" id="confirmPassword" required
               class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
               placeholder="再次输入密码">
      </div>
      
      <button type="submit" class="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
        注册
      </button>
      
      <p class="text-center mt-6 text-gray-400">
        已有账户? 
        <a href="/login" class="text-red-500 hover:text-red-400">立即登录</a>
      </p>
    </form>
  </div>
</body>
</html>
`;
}

export function profilePage(user: UserPublic): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>个人中心 - 影视系统</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <nav class="bg-gray-800 shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="/" class="text-2xl font-bold text-red-500">🎬 影视系统</a>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/admin" class="px-4 py-2 hover:text-red-400 transition">管理后台</a>
          <span class="text-gray-400">|</span>
          <a href="/profile" class="px-4 py-2 text-red-500 font-semibold">个人中心</a>
          <a href="/api/auth/logout" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition">退出</a>
        </div>
      </div>
    </div>
  </nav>
  
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-8">个人中心</h1>
    
    <div class="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 class="text-xl font-semibold mb-4">账户信息</h2>
      
      <div class="space-y-4">
        <div class="flex items-center border-b border-gray-700 pb-4">
          <span class="text-gray-400 w-24">用户名:</span>
          <span class="font-semibold">${user.username}</span>
        </div>
        
        <div class="flex items-center border-b border-gray-700 pb-4">
          <span class="text-gray-400 w-24">邮箱:</span>
          <span class="font-semibold">${user.email}</span>
        </div>
        
        <div class="flex items-center border-b border-gray-700 pb-4">
          <span class="text-gray-400 w-24">角色:</span>
          <span class="px-3 py-1 rounded ${user.role === 'admin' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}">
            ${user.role === 'admin' ? '管理员' : '普通用户'}
          </span>
        </div>
        
        <div class="flex items-center border-b border-gray-700 pb-4">
          <span class="text-gray-400 w-24">注册时间:</span>
          <span class="font-semibold">${user.createdAt.toLocaleDateString('zh-CN')}</span>
        </div>
        
        <div class="flex items-center">
          <span class="text-gray-400 w-24">最后登录:</span>
          <span class="font-semibold">${user.lastLogin ? user.lastLogin.toLocaleString('zh-CN') : '从未登录'}</span>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
`;
}
