import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function jsonError(error: unknown, fallback = 400) {
  const message = error instanceof Error ? error.message : "Request failed";
  const status = error instanceof AuthError ? error.status : fallback;
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
