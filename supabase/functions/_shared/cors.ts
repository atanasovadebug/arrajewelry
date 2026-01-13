// Allowed origins for CORS - restrict API access to known domains
const ALLOWED_ORIGINS = [
  "https://arrajewelery.com",
  "https://www.arrajewelery.com",
  "https://zfgafewkcrvkfvofttud.lovableproject.com",
  "http://localhost:5173", // Development
  "http://localhost:8080", // Alternative dev port
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Allow all lovableproject.com subdomains and lovable.app subdomains
  const isAllowed = origin && (
    ALLOWED_ORIGINS.some(allowed => origin === allowed) ||
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app')
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed && origin ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleCorsPrelight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new Response(null, { 
      headers: {
        ...getCorsHeaders(origin),
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      status: 204 
    });
  }
  return null;
}
