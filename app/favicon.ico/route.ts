export function GET() {
  // Avoid routing /favicon.ico into app/[locale] which causes 500s.
  // Returning 204 is acceptable for browsers; you can replace this with a real icon later.
  return new Response(null, {
    status: 204,
    headers: {
      // Some browsers are happier if content-type is present even with 204.
      'content-type': 'image/x-icon',
      'cache-control': 'public, max-age=86400',
    },
  });
}

