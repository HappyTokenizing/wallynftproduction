import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const productionSubscribeEndpoint = 'https://www.rwaf.xyz/api/subscribe';

function json(message: string, status: number, success = false) {
  return NextResponse.json(
    { success, message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

export async function POST(request: Request) {
  let email = '';

  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email !== 'string') {
      return json('Please enter a valid email.', 400);
    }
    email = body.email.trim().toLowerCase().slice(0, 254);
  } catch {
    return json('Please enter a valid email.', 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json('Please enter a valid email.', 400);
  }

  const beehiivKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  try {
    const response =
      beehiivKey && publicationId
        ? await fetch(
            `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${beehiivKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                reactivate_existing: true,
                send_welcome_email: true,
                utm_source: 'wally-nft',
                utm_medium: 'website',
                utm_campaign: 'heard_from_the_herd',
                referring_site: 'https://wallynftstaging4.vercel.app',
              }),
              cache: 'no-store',
            },
          )
        : await fetch(productionSubscribeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            cache: 'no-store',
          });

    if (!response.ok) {
      console.error('Newsletter subscription failed:', response.status);
      return json('Unable to subscribe. Please try again.', 502);
    }

    return json('Welcome to the Herd.', 200, true);
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return json('Something went wrong. Please try again.', 500);
  }
}
