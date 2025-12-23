import { Post, Option, Comment } from '@/types';
import fs from 'fs';
import path from 'path';

// JSON storage
const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Ensure data directory and file exist
function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialData = { posts: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Read from JSON file
function readFromJson(): Post[] {
  ensureDataFile();

  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.posts || [];
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return [];
  }
}

// Write to JSON file
function writeToJson(posts: Post[]): void {
  ensureDataFile();

  const data = { posts };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}


// Read all posts
export async function readPosts(): Promise<Post[]> {
  return readFromJson();
}

// Get a single post by ID
export async function getPostById(id: string): Promise<Post | null> {
  const posts = readFromJson();
  return posts.find(post => post.id === id) || null;
}

// Create a new post
export async function createPost(
  title: string,
  description: string,
  optionTexts: string[],
  authorToken: string
): Promise<Post> {
  const posts = readFromJson();

  const newPost: Post = {
    id: generateId(),
    title,
    description,
    authorToken,
    options: optionTexts.map((text, index) => ({
      id: `option-${Date.now()}-${index}`,
      text,
      votes: 0,
    })),
    comments: [],
    isClosed: false,
    closedAt: null,
    createdAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  writeToJson(posts);

  return newPost;
}

// Add a vote to an option
export async function addVote(postId: string, optionId: string): Promise<Post | null> {
  const posts = readFromJson();
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
  writeToJson(posts);

  return post;
}

// Add a comment to a post
export async function addComment(
  postId: string,
  author: string,
  text: string,
  supportedOptionId?: string
): Promise<Post | null> {
  const posts = readFromJson();
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
  writeToJson(posts);

  return post;
}

// Close a poll (only the author can do this)
export async function closePost(postId: string, authorToken: string): Promise<Post | null> {
  const posts = readFromJson();
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
  writeToJson(posts);

  return post;
}

// Add a new option to a post
export async function addOption(postId: string, optionText: string): Promise<Post | null> {
  const posts = readFromJson();
  const postIndex = posts.findIndex(p => p.id === postId);

  if (postIndex === -1) return null;

  const post = posts[postIndex];

  // Check if poll is closed
  if (post.isClosed) {
    throw new Error('Cannot add options to a closed poll');
  }

  // Check if option already exists (case-insensitive)
  const optionExists = post.options.some(
    (opt: Option) => opt.text.toLowerCase() === optionText.toLowerCase()
  );

  if (optionExists) {
    throw new Error('This option already exists');
  }

  // Create new option
  const newOption: Option = {
    id: `option-${Date.now()}-${post.options.length}`,
    text: optionText,
    votes: 0,
  };

  post.options.push(newOption);
  writeToJson(posts);

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
