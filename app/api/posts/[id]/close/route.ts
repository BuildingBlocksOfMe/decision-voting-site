import { NextRequest, NextResponse } from 'next/server';
import { closePost } from '@/lib/data';
import { ClosePostRequest } from '@/types';

// POST /api/posts/[id]/close - Close a poll
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: ClosePostRequest = await request.json();
    
    if (!body.authorToken) {
      return NextResponse.json(
        { error: 'Author token is required' },
        { status: 400 }
      );
    }
    
    const post = await closePost(id, body.authorToken);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error closing post:', error);
    
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    if (error.message?.includes('already closed')) {
      return NextResponse.json(
        { error: 'Poll is already closed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to close post' },
      { status: 500 }
    );
  }
}

