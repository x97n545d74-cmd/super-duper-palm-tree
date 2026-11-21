import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

// Search engines and AI assistants are welcome on the public pages (the
// owner wants the shop found and described correctly); admin and API stay out.
const AI_AND_SEARCH = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Applebot", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: AI_AND_SEARCH, allow: ["/", "/llms.txt"], disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
