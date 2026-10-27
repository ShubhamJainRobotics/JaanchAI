import { Request, Response, NextFunction } from "express";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { baseSupabase, createUserSupabase } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
      supabase?: SupabaseClient;
    }
  }
}

/**
 * Middleware that extracts and verifies Supabase JWT token if provided.
 * Does not block unauthenticated users (useful for routes with optional auth).
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next();
  }

  try {
    const { data, error } = await baseSupabase.auth.getUser(token);
    if (!error && data?.user) {
      req.user = data.user;
      req.token = token;
      req.supabase = createUserSupabase(token);
    }
  } catch {
    // If token verification fails, proceed as unauthenticated guest
  }

  next();
}

/**
 * Middleware that strictly requires an authenticated Supabase user.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token is required.",
      },
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid authorization header format.",
      },
    });
    return;
  }

  try {
    const { data, error } = await baseSupabase.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Session expired or invalid credentials.",
        },
      });
      return;
    }

    req.user = data.user;
    req.token = token;
    req.supabase = createUserSupabase(token);
    next();
  } catch (err: any) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication failed.",
      },
    });
  }
}
