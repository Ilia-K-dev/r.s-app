import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './utils/firebase'; // Assuming firebase.ts is in utils

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/']; // Add other protected routes here

  // Check if the user is authenticated (this is a simplified check, actual implementation might vary)
  // In a real application, you would verify the user's token or session
  const isAuthenticated = auth.currentUser !== null;

  // If accessing a protected route and not authenticated, redirect to login
  if (protectedRoutes.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to other routes
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Apply middleware to all paths except API routes and static files
};
