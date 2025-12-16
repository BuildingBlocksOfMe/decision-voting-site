import { NextRequest, NextResponse } from 'next/server';
import { addOption } from '@/lib/data';
import { AddOptionRequest } from '@/types';

// POST /api/options - Add a new option to a post
export async function POST(request: NextRequest) {
  try {
    const body: AddOptionRequest = await request.json();
    
    // Validation
    if (!body.postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.optionText || body.optionText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Option text is required' },
        { status: 400 }
      );
    }
    
    if (body.optionText.length > 100) {
      return NextResponse.json(
        { error: 'Option text is too long (max 100 characters)' },
        { status: 400 }
      );
    }
    
    const post = addOption(body.postId, body.optionText.trim());
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error adding option:', error);
    
    if (error.message?.includes('closed')) {
      return NextResponse.json(
        { error: 'Cannot add options to a closed poll' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'This option already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add option' },
      { status: 500 }
    );
  }
}

