import { prisma } from './prisma';
import { Post, Option, Comment } from '@/types';
import fs from 'fs';
import path from 'path';

// Fallback to JSON storage
const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');
const USE_JSON_STORAGE = true; // Always use JSON storage for now

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

// Convert Prisma Post to our Post type
function toPrismaPost(prismaPost: any): Post {
  return {
    id: prismaPost.id,
    title: prismaPost.title,
    description: prismaPost.description,
    authorToken: prismaPost.authorToken,
    options: prismaPost.options.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
    })),
    comments: prismaPost.comments.map((comment: any) => ({
      id: comment.id,
      author: comment.author,
      text: comment.text,
      supportedOptionId: comment.supportedOptionId,
      createdAt: comment.createdAt.toISOString(),
    })),
    isClosed: prismaPost.isClosed,
    closedAt: prismaPost.closedAt ? prismaPost.closedAt.toISOString() : null,
    createdAt: prismaPost.createdAt.toISOString(),
  };
}

// Read all posts
export async function readPosts(): Promise<Post[]> {
  if (USE_JSON_STORAGE) {
    return readFromJson();
  }

  try {
    // Dynamically import prisma to avoid initialization in development
    const { prisma } = await import('./prisma');
    const posts = await prisma.post.findMany({
      include: {
        options: {
          orderBy: { id: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map(toPrismaPost);
  } catch (error) {
    console.error('Error reading posts from database, falling back to JSON:', error);
    return readFromJson();
  }
}

// Get a single post by ID
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { id: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) return null;

    return toPrismaPost(post);
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
}

// Create a new post
export async function createPost(
  title: string,
  description: string,
  optionTexts: string[],
  authorToken: string
): Promise<Post> {
  if (USE_JSON_STORAGE) {
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

  try {
    // Dynamically import prisma to avoid initialization in development
    const { prisma } = await import('./prisma');
    const post = await prisma.post.create({
      data: {
        title,
        description,
        authorToken,
        options: {
          create: optionTexts.map((text, index) => ({
            id: `option-${Date.now()}-${index}`,
            text,
            votes: 0,
          })),
        },
      },
      include: {
        options: true,
        comments: true,
      },
    });

    return toPrismaPost(post);
  } catch (error) {
    console.error('Error creating post in database, falling back to JSON:', error);
    // Fallback to JSON storage - recursive call will use JSON storage
    const USE_JSON_STORAGE_BACKUP = true;
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
}

// Add a vote to an option
export async function addVote(postId: string, optionId: string): Promise<Post | null> {
  try {
    // Check if poll is closed
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return null;

    if (post.isClosed) {
      throw new Error('This poll is closed');
    }

    // Increment vote count
    await prisma.option.update({
      where: { id: optionId },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    // Return updated post
    return await getPostById(postId);
  } catch (error) {
    console.error('Error adding vote:', error);
    throw error;
  }
}

// Add a comment to a post
export async function addComment(
  postId: string,
  author: string,
  text: string,
  supportedOptionId?: string
): Promise<Post | null> {
  try {
    await prisma.comment.create({
      data: {
        author,
        text,
        supportedOptionId,
        postId,
      },
    });

    return await getPostById(postId);
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

// Close a poll (only the author can do this)
export async function closePost(postId: string, authorToken: string): Promise<Post | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return null;

    // Verify author token
    if (post.authorToken !== authorToken) {
      throw new Error('Unauthorized: Invalid author token');
    }

    // Check if already closed
    if (post.isClosed) {
      throw new Error('This poll is already closed');
    }

    // Close the poll
    await prisma.post.update({
      where: { id: postId },
      data: {
        isClosed: true,
        closedAt: new Date(),
      },
    });

    return await getPostById(postId);
  } catch (error) {
    console.error('Error closing post:', error);
    throw error;
  }
}

// Add a new option to a post
export async function addOption(postId: string, optionText: string): Promise<Post | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        options: true,
      },
    });

    if (!post) return null;

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
    await prisma.option.create({
      data: {
        text: optionText,
        votes: 0,
        postId,
      },
    });

    return await getPostById(postId);
  } catch (error) {
    console.error('Error adding option:', error);
    throw error;
  }
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate an author token
export function generateAuthorToken(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
}
