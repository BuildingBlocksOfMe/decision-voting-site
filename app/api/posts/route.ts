import { NextRequest, NextResponse } from 'next/server';
import { readPosts, createPost, generateAuthorToken } from '@/lib/data';
import { CreatePostRequest, CreatePostResponse } from '@/types';

// GET /api/posts - Get all posts
export async function GET() {
  try {
    const posts = await readPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body: CreatePostRequest = await request.json();
    
    // Validation
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!body.description || body.description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }
    
    if (!body.options || body.options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      );
    }
    
    if (body.options.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 options allowed' },
        { status: 400 }
      );
    }
    
    // Check if all options have text
    const hasEmptyOption = body.options.some(opt => !opt || opt.trim().length === 0);
    if (hasEmptyOption) {
      return NextResponse.json(
        { error: 'All options must have text' },
        { status: 400 }
      );
    }
    
    // Generate author token
    const authorToken = generateAuthorToken();
    
    // Create the post
    const post = await createPost(
      body.title.trim(),
      body.description.trim(),
      body.options.map(opt => opt.trim()),
      authorToken
    );
    
    const response: CreatePostResponse = {
      post,
      authorToken,
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

