import { createHash, randomBytes } from 'crypto';
import type { User } from './users';

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

const adminSalt = generateSalt();
const userSalt = generateSalt();

export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@movie.com',
    password: hashPassword('admin123', adminSalt) + ':' + adminSalt,
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-15')
  },
  {
    id: '2',
    username: 'user',
    email: 'user@movie.com',
    password: hashPassword('user123', userSalt) + ':' + userSalt,
    role: 'user',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-14')
  }
];

export function verifyPassword(user: User, password: string): boolean {
  const [hash, salt] = user.password.split(':');
  return hash === hashPassword(password, salt);
}

export function hashNewPassword(password: string): string {
  const salt = generateSalt();
  return hashPassword(password, salt) + ':' + salt;
}

export function createUser(username: string, email: string, password: string, role: 'admin' | 'user' = 'user'): User {
  const id = (users.length + 1).toString();
  const hashedPassword = hashNewPassword(password);
  
  const newUser: User = {
    id,
    username,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date()
  };
  
  users.push(newUser);
  return newUser;
}

export function findUserByUsername(username: string): User | undefined {
  return users.find(u => u.username === username);
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function updateLastLogin(userId: string): void {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.lastLogin = new Date();
  }
}
