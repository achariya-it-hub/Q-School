import { NextResponse } from "next/server";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control",
};

export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export function jsonWithCors(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  return NextResponse.json(data, {
    ...init,
    headers,
  });
}
