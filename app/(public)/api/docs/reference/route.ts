import { ApiReference } from "@scalar/nextjs-api-reference"
import { openapi } from "./openapi"

/**
 * The full interactive reference: every documented endpoint with its
 * request and response schemas and Scalar's send-request panel, so a
 * visitor with a key can fire real calls from the page. Swagger on the
 * API origin stays debug-only; this serves only the curated public
 * surface.
 */
export const GET = ApiReference({
  spec: { content: openapi as unknown as Record<string, unknown> },
  theme: "default",
  hideClientButton: false,
  authentication: {
    preferredSecurityScheme: "bearerAuth",
  },
})
