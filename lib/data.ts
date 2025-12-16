import fs from 'fs';
import path from 'path';
import { Post, PostsData, Option, Comment } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Ensure data directory and file exist
function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(DATA_FILE)) {
    const initialData: PostsData = { posts: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Read all posts from the data file
export function readPosts(): Post[] {
  ensureDataFile();
  
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const data: PostsData = JSON.parse(fileContent);
    return data.posts || [];
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

// Write posts to the data file
function writePosts(posts: Post[]): void {
  ensureDataFile();
  
  const data: PostsData = { posts };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Get a single post by ID
export function getPostById(id: string): Post | null {
  const posts = readPosts();
  return posts.find(post => post.id === id) || null;
}

// Create a new post
export function createPost(
  title: string,
  description: string,
  optionTexts: string[],
  authorToken: string
): Post {
  const posts = readPosts();
  
  const newPost: Post = {
    id: generateId(),
    title,
    description,
    authorToken,
    options: optionTexts.map((text, index) => ({
      id: `option-${index + 1}`,
      text,
      votes: 0,
    })),
    comments: [],
    isClosed: false,
    closedAt: null,
    createdAt: new Date().toISOString(),
  };
  
  posts.unshift(newPost); // Add to the beginning
  writePosts(posts);
  
  return newPost;
}

// Add a vote to an option
export function addVote(postId: string, optionId: string): Post | null {
  const posts = readPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  
  // Check if poll is closed
  if (post.isClosed) {
    throw new Error('This poll is closed');
  }
  
  const option = post.options.find(opt => opt.id === optionId);
  if (!option) return null;
  
  option.votes += 1;
  writePosts(posts);
  
  return post;
}

// Add a comment to a post
export function addComment(
  postId: string,
  author: string,
  text: string,
  supportedOptionId?: string
): Post | null {
  const posts = readPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  
  const newComment: Comment = {
    id: generateId(),
    author,
    text,
    supportedOptionId,
    createdAt: new Date().toISOString(),
  };
  
  post.comments.push(newComment);
  writePosts(posts);
  
  return post;
}

// Close a poll (only the author can do this)
export function closePost(postId: string, authorToken: string): Post | null {
  const posts = readPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  
  // Verify author token
  if (post.authorToken !== authorToken) {
    throw new Error('Unauthorized: Invalid author token');
  }
  
  // Check if already closed
  if (post.isClosed) {
    throw new Error('This poll is already closed');
  }
  
  post.isClosed = true;
  post.closedAt = new Date().toISOString();
  writePosts(posts);
  
  return post;
}

// Add a new option to a post
export function addOption(postId: string, optionText: string): Post | null {
  const posts = readPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  
  // Check if poll is closed
  if (post.isClosed) {
    throw new Error('Cannot add options to a closed poll');
  }
  
  // Check if option already exists (case-insensitive)
  const optionExists = post.options.some(
    opt => opt.text.toLowerCase() === optionText.toLowerCase()
  );
  
  if (optionExists) {
    throw new Error('This option already exists');
  }
  
  // Generate a new option ID
  const maxOptionNumber = post.options.reduce((max, opt) => {
    const match = opt.id.match(/option-(\d+)/);
    if (match) {
      return Math.max(max, parseInt(match[1]));
    }
    return max;
  }, 0);
  
  const newOption: Option = {
    id: `option-${maxOptionNumber + 1}`,
    text: optionText,
    votes: 0,
  };
  
  post.options.push(newOption);
  writePosts(posts);
  
  return post;
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate an author token
export function generateAuthorToken(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
}

