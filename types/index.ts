// Option for a poll
export interface Option {
  id: string;
  text: string;
  votes: number;
}

// Comment on a post
export interface Comment {
  id: string;
  author: string;
  text: string;
  supportedOptionId?: string; // Which option this comment supports
  createdAt: string;
}

// Post/Poll data structure
export interface Post {
  id: string;
  title: string;
  description: string;
  authorToken: string; // Token to identify the author
  options: Option[];
  comments: Comment[];
  isClosed: boolean;
  closedAt: string | null;
  createdAt: string;
}

// Data structure for the posts.json file
export interface PostsData {
  posts: Post[];
}

// Request body for creating a new post
export interface CreatePostRequest {
  title: string;
  description: string;
  options: string[]; // Just the text for each option
}

// Response when creating a post
export interface CreatePostResponse {
  post: Post;
  authorToken: string; // Return the token to store in localStorage
}

// Request body for voting
export interface VoteRequest {
  postId: string;
  optionId: string;
}

// Request body for adding a comment
export interface AddCommentRequest {
  postId: string;
  author: string;
  text: string;
  supportedOptionId?: string;
}

// Request body for closing a poll
export interface ClosePostRequest {
  postId: string;
  authorToken: string;
}

// Request body for adding a new option to a post
export interface AddOptionRequest {
  postId: string;
  optionText: string;
}

// Result data for displaying voting results
export interface OptionResult extends Option {
  percentage: number;
}

// Summary data for results display
export interface PostSummary {
  results: OptionResult[];
  commentsByOption: Record<string, Comment[]>;
  neutralComments: Comment[];
  totalVotes: number;
  winningOption: OptionResult | null;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
}

