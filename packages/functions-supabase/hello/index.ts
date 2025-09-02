// Deno-style handler (Web Fetch API)
export default async (req: Request) => {
  const name = new URL(req.url).searchParams.get('name') ?? 'world';
  return new Response(JSON.stringify({ hello: name }), {
    headers: { 'content-type': 'application/json' },
  });
};
