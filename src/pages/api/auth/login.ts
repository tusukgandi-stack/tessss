import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    const validUser = import.meta.env.ADMIN_USER || 'admin';
    const validPass = import.meta.env.ADMIN_PASS || 'avorix2026';

    if (username === validUser && password === validPass) {
      const token = btoa(`${username}:${Date.now()}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      });
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Username atau password salah.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid request body.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
