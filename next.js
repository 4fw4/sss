import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import { Analytics } from "@vercel/analytics/next"

export const config = { matcher: '/welcome' };

export async function middleware() {
  const greeting = await get('greeting');
  // NextResponse.json requires at least Next v13.1 or
  // enabling experimental.allowMiddlewareResponseBody in next.config.js
  return NextResponse.json(greeting);
}
