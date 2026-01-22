import { createPool } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import { Post, Option, Comment } from '@/types';

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  '';

const pool = createPool(
  connectionString
    ? { connectionString }
    : undefined
);

const sql = pool.sql;

async function ensureSchema() {
  if (!connectionString) {
    throw new Error(
      'Database connection is not configured. Set POSTGRES_URL (recommended) or DATABASE_URL in Vercel Environment Variables.'
    );
  }

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      author_token TEXT NOT NULL,
      is_closed BOOLEAN NOT NULL DEFAULT FALSE,
      closed_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS options (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      votes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      supported_option_id TEXT NULL REFERENCES options(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS options_post_id_idx ON options(post_id);`;
  await sql`CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);`;
  await sql`CREATE INDEX IF NOT EXISTS comments_supported_option_id_idx ON comments(supported_option_id);`;
}

function rowToPostBase(row: any): Omit<Post, 'options' | 'comments'> {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    authorToken: row.author_token,
    isClosed: row.is_closed,
    closedAt: row.closed_at ? new Date(row.closed_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function rowToOption(row: any): Option {
  return {
    id: row.id,
    text: row.text,
    votes: Number(row.votes ?? 0),
  };
}

function rowToComment(row: any): Comment {
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    supportedOptionId: row.supported_option_id ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function assemblePosts(postRows: any[]): Promise<Post[]> {
  if (postRows.length === 0) return [];

  const result: Post[] = [];
  for (const row of postRows) {
    const postId = row.id as string;

    const [optionsRes, commentsRes] = await Promise.all([
      sql`SELECT id, post_id, text, votes, created_at FROM options WHERE post_id = ${postId} ORDER BY created_at ASC`,
      sql`SELECT id, post_id, author, text, supported_option_id, created_at FROM comments WHERE post_id = ${postId} ORDER BY created_at ASC`,
    ]);

    result.push({
      ...rowToPostBase(row),
      options: optionsRes.rows.map(rowToOption),
      comments: commentsRes.rows.map(rowToComment),
    });
  }

  return result;
}

export async function readPosts(): Promise<Post[]> {
  await ensureSchema();
  const res = await sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT 100`;
  return assemblePosts(res.rows);
}

export async function getPostById(id: string): Promise<Post | null> {
  await ensureSchema();
  const res = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  if (res.rows.length === 0) return null;
  const posts = await assemblePosts(res.rows);
  return posts[0] ?? null;
}

export async function createPost(
  title: string,
  description: string,
  optionTexts: string[],
  authorToken: string
): Promise<Post> {
  await ensureSchema();

  const postId = randomUUID();
  await sql`
    INSERT INTO posts (id, title, description, author_token)
    VALUES (${postId}, ${title}, ${description}, ${authorToken})
  `;

  for (const text of optionTexts) {
    const optionId = randomUUID();
    await sql`
      INSERT INTO options (id, post_id, text, votes)
      VALUES (${optionId}, ${postId}, ${text}, 0)
    `;
  }

  const post = await getPostById(postId);
  if (!post) throw new Error('Failed to create post (not found after insert)');
  return post;
}

export async function addVote(postId: string, optionId: string): Promise<Post | null> {
  await ensureSchema();

  const postRes = await sql`SELECT is_closed FROM posts WHERE id = ${postId} LIMIT 1`;
  if (postRes.rows.length === 0) return null;
  if (postRes.rows[0].is_closed) throw new Error('This poll is closed');

  const updated = await sql`
    UPDATE options
    SET votes = votes + 1
    WHERE id = ${optionId} AND post_id = ${postId}
    RETURNING id
  `;
  if (updated.rows.length === 0) return null;

  return getPostById(postId);
}

export async function addComment(
  postId: string,
  author: string,
  text: string,
  supportedOptionId?: string
): Promise<Post | null> {
  await ensureSchema();

  const postRes = await sql`SELECT id FROM posts WHERE id = ${postId} LIMIT 1`;
  if (postRes.rows.length === 0) return null;

  const commentId = randomUUID();
  await sql`
    INSERT INTO comments (id, post_id, author, text, supported_option_id)
    VALUES (${commentId}, ${postId}, ${author}, ${text}, ${supportedOptionId ?? null})
  `;

  return getPostById(postId);
}

export async function closePost(postId: string, authorToken: string): Promise<Post | null> {
  await ensureSchema();

  const postRes = await sql`SELECT id, author_token, is_closed FROM posts WHERE id = ${postId} LIMIT 1`;
  if (postRes.rows.length === 0) return null;

  if (postRes.rows[0].author_token !== authorToken) {
    throw new Error('Unauthorized: Invalid author token');
  }
  if (postRes.rows[0].is_closed) {
    throw new Error('This poll is already closed');
  }

  await sql`UPDATE posts SET is_closed = TRUE, closed_at = NOW() WHERE id = ${postId}`;
  return getPostById(postId);
}

export async function addOption(postId: string, optionText: string): Promise<Post | null> {
  await ensureSchema();

  const postRes = await sql`SELECT id, is_closed FROM posts WHERE id = ${postId} LIMIT 1`;
  if (postRes.rows.length === 0) return null;
  if (postRes.rows[0].is_closed) throw new Error('Cannot add options to a closed poll');

  const exists = await sql`
    SELECT 1 FROM options
    WHERE post_id = ${postId} AND LOWER(text) = LOWER(${optionText})
    LIMIT 1
  `;
  if (exists.rows.length > 0) throw new Error('This option already exists');

  const optionId = randomUUID();
  await sql`
    INSERT INTO options (id, post_id, text, votes)
    VALUES (${optionId}, ${postId}, ${optionText}, 0)
  `;

  return getPostById(postId);
}

export function generateAuthorToken(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
}
