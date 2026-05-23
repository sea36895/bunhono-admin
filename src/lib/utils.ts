import type { Movie } from '../data/types';

export function sortMovies(movies: Movie[], sortBy: string, order: 'asc' | 'desc' = 'asc'): Movie[] {
  const sorted = [...movies];
  
  switch (sortBy) {
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'year':
      sorted.sort((a, b) => a.year - b.year);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating); // 评分默认降序
      break;
    case 'duration':
      sorted.sort((a, b) => a.duration - b.duration);
      break;
    default:
      break;
  }
  
  return order === 'desc' ? sorted.reverse() : sorted;
}

export function paginateMovies(movies: Movie[], page: number, pageSize: number = 12): {
  movies: Movie[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
} {
  const totalItems = movies.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMovies = movies.slice(startIndex, endIndex);
  
  return {
    movies: paginatedMovies,
    currentPage: safePage,
    totalPages,
    totalItems
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}
