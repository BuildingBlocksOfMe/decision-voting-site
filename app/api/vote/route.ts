import { NextRequest, NextResponse } from 'next/server';
import { addVote } from '@/lib/data';
import { VoteRequest } from '@/types';

// POST /api/vote - Add a vote to an option
export async function POST(request: NextRequest) {
  try {
    const body: VoteRequest = await request.json();
    
    if (!body.postId || !body.optionId) {
      return NextResponse.json(
        { error: 'Post ID and Option ID are required' },
        { status: 400 }
      );
    }
    
    const post = addVote(body.postId, body.optionId);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post or option not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error adding vote:', error);
    
    if (error.message?.includes('closed')) {
      return NextResponse.json(
        { error: 'This poll is closed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add vote' },
      { status: 500 }
    );
  }
}

