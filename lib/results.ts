import { Post, PostSummary, OptionResult, Comment } from '@/types';

// Generate a summary of voting results and comments
export function generateSummary(post: Post): PostSummary {
  // 1. Calculate voting results
  const totalVotes = post.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  const results: OptionResult[] = post.options.map(option => ({
    ...option,
    percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
  }));

  // Sort by votes (descending)
  results.sort((a, b) => b.votes - a.votes);

  // Find the winning option (most votes)
  const winningOption = results[0]?.votes > 0 ? results[0] : null;

  // 2. Group comments by option
  const commentsByOption: Record<string, Comment[]> = {};
  
  post.options.forEach(option => {
    commentsByOption[option.id] = post.comments.filter(
      c => c.supportedOptionId === option.id
    );
  });

  // 3. Get neutral comments (no option selected)
  const neutralComments = post.comments.filter(
    c => !c.supportedOptionId
  );

  return {
    results,
    commentsByOption,
    neutralComments,
    totalVotes,
    winningOption,
  };
}

// Check if user has voted on a post (using localStorage)
export function hasVoted(postId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const votedPosts = localStorage.getItem('votedPosts');
  if (!votedPosts) return false;
  
  const votedPostsArray: string[] = JSON.parse(votedPosts);
  return votedPostsArray.includes(postId);
}

// Mark a post as voted (in localStorage)
export function markAsVoted(postId: string): void {
  if (typeof window === 'undefined') return;
  
  const votedPosts = localStorage.getItem('votedPosts');
  const votedPostsArray: string[] = votedPosts ? JSON.parse(votedPosts) : [];
  
  if (!votedPostsArray.includes(postId)) {
    votedPostsArray.push(postId);
    localStorage.setItem('votedPosts', JSON.stringify(votedPostsArray));
  }
}

// Get author token from localStorage
export function getAuthorToken(postId: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const key = `authorToken-${postId}`;
  return localStorage.getItem(key);
}

// Save author token to localStorage
export function saveAuthorToken(postId: string, token: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `authorToken-${postId}`;
  localStorage.setItem(key, token);
}

// Check if user is the author of a post
export function isAuthor(post: Post): boolean {
  const token = getAuthorToken(post.id);
  return token !== null && token === post.authorToken;
}

// Format date for display
export function formatDate(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString);
  
  if (locale === 'ja') {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return locale === 'ja' ? 'たった今' : 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return locale === 'ja' ? `${diffInMinutes}分前` : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return locale === 'ja' ? `${diffInHours}時間前` : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return locale === 'ja' ? `${diffInDays}日前` : `${diffInDays} days ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return locale === 'ja' ? `${diffInMonths}ヶ月前` : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return locale === 'ja' ? `${diffInYears}年前` : `${diffInYears} years ago`;
}

