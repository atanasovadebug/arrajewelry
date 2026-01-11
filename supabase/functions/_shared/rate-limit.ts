/**
 * Simple in-memory rate limiter for Edge Functions
 * 
 * Note: This is per-function-instance rate limiting. Each cold start resets the state.
 * For production applications with high traffic, consider using Redis/Upstash for
 * distributed rate limiting.
 * 
 * This still provides meaningful protection against:
 * - Rapid-fire requests from the same IP during warm periods
 * - Basic abuse attempts and bot attacks
 * - Accidental client-side loops
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Prefix for the rate limit key (to separate different endpoints) */
  keyPrefix?: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Unix timestamp when the rate limit resets */
  resetTime: number;
  /** Number of seconds until the rate limit resets */
  retryAfter: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (usually IP address)
 * @param config - Rate limiting configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  // Run cleanup occasionally
  cleanupExpiredEntries();
  
  const now = Date.now();
  const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
  const entry = rateLimitStore.get(key);
  
  // If no entry exists or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
      retryAfter: 0,
    };
  }
  
  // Increment count and check if over limit
  entry.count++;
  
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    retryAfter: 0,
  };
}

/**
 * Get the client IP address from the request
 * Handles various proxy headers commonly used in production
 */
export function getClientIP(req: Request): string {
  // Check common proxy headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }
  
  // Cloudflare
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback - use a hash of user agent as partial identifier
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `ua-${hashString(userAgent)}`;
}

/**
 * Simple string hash function for fallback identification
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": result.retryAfter.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.resetTime.toString(),
      },
    }
  );
}
