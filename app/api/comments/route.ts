import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/lib/data';
import { AddCommentRequest } from '@/types';

// POST /api/comments - Add a comment to a post
export async function POST(request: NextRequest) {
  try {
    const body: AddCommentRequest = await request.json();
    
    // Validation
    if (!body.postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }
    
    if (body.text.length > 1000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }
    
    const author = body.author?.trim() || 'Anonymous';
    
    const post = await addComment(
      body.postId,
      author,
      body.text.trim(),
      body.supportedOptionId
    );
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

