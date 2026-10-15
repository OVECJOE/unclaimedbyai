/**
 * The public API contract, curated by hand: only the endpoints relevant
 * to API-key users, with request bodies, parameters, and both success
 * and error response shapes taken from the real backend models.
 */

const Error422 = {
  type: "object",
  properties: {
    detail: {
      oneOf: [
        { type: "string" },
        {
          type: "array",
          items: {
            type: "object",
            properties: {
              msg: { type: "string" },
              loc: { type: "array", items: { type: "string" } },
            },
          },
        },
      ],
    },
  },
}

const Bearer401 = {
  description: "Missing, invalid, or expired credentials.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { detail: "Not signed in" },
    },
  },
}

const Rate429 = {
  description:
    "Rate limit exceeded. The Retry-After header says when to return.",
  headers: {
    "Retry-After": {
      schema: { type: "integer" },
      description: "Seconds to wait.",
    },
  },
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { detail: "Too many requests. Slow down a little." },
    },
  },
}

function validation422(example?: Record<string, unknown>) {
  return {
    description: "Validation failed.",
    content: {
      "application/json": {
        schema: Error422,
        example: example ?? { detail: "Name cannot be blank" },
      },
    },
  }
}

const Credits402 = {
  description:
    "Your account is out of the balance this request needs. Buy a pack, then retry.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { detail: "No searches left on this account" },
    },
  },
}

const NotFound404 = {
  description: "The resource does not exist or is not yours.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { detail: "Not found" },
    },
  },
}

const AiDown502 = {
  description: "The AI providers were unavailable.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { detail: "AI checks are unavailable right now" },
    },
  },
}

export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Unclaimed by AI API",
    version: "1.0.0",
    description:
      "Generate names, check domains, social handles, and AI associations, and keep a watchlist. Every authenticated request spends your account's searches and report credits. Human verification applies to anonymous browser traffic only.",
  },
  servers: [{ url: "https://unclaimedbyai.com/api/v1" }],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Account", description: "Your balance and notification settings." },
    { name: "Generation", description: "Turning briefs into name candidates." },
    { name: "Checks", description: "The three availability checks." },
    { name: "Searches", description: "Groups of names and their results." },
    { name: "Reports", description: "Full report snapshots." },
    { name: "Watches", description: "Free rechecking while you decide." },
    { name: "Billing", description: "Packs, checkout, and orders." },
    { name: "Keys", description: "API key management. Session only." },
  ],
  paths: {
    "/me": {
      get: {
        tags: ["Account"],
        summary: "Read your balance",
        description:
          "Your profile with remaining searches and report credits. The most common first request when wiring up automation.",
        responses: {
          200: {
            description: "Your account.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Me" },
                example: {
                  id: 42,
                  email: "you@example.com",
                  full_name: "You",
                  avatar_url: null,
                  searches_left: 2,
                  credits: 5,
                },
              },
            },
          },
          401: Bearer401,
          429: Rate429,
        },
      },
      patch: {
        tags: ["Account"],
        summary: "Update your display name",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["full_name"],
                properties: {
                  full_name: { type: "string", minLength: 1, maxLength: 255 },
                },
              },
              example: { full_name: "Ada" },
            },
          },
        },
        responses: {
          200: {
            description: "The updated account.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Me" },
              },
            },
          },
          401: Bearer401,
          422: validation422(),
          429: Rate429,
        },
      },
    },
    "/preferences": {
      get: {
        tags: ["Account"],
        summary: "Read notification preferences",
        responses: {
          200: {
            description: "Your preferences.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Preferences" },
                example: {
                  report_ready: true,
                  payment_receipts: true,
                  product_updates: false,
                  watch_alerts: true,
                },
              },
            },
          },
          401: Bearer401,
        },
      },
      patch: {
        tags: ["Account"],
        summary: "Update notification preferences",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  report_ready: { type: "boolean" },
                  payment_receipts: { type: "boolean" },
                  product_updates: { type: "boolean" },
                  watch_alerts: { type: "boolean" },
                },
              },
              example: { watch_alerts: false },
            },
          },
        },
        responses: {
          200: {
            description: "The updated preferences.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Preferences" },
              },
            },
          },
          401: Bearer401,
        },
      },
    },
    "/generate": {
      post: {
        tags: ["Generation"],
        summary: "Generate name candidates from a brief",
        description:
          "Returns candidates and rationales directly, without creating a search.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenerateRequest" },
              example: { brief: "An AI note-taking app for lawyers", count: 12 },
            },
          },
        },
        responses: {
          201: {
            description: "Generated candidates.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    brief: { type: "string" },
                    candidates: {
                      type: "array",
                      items: { $ref: "#/components/schemas/NameCandidate" },
                    },
                  },
                },
                example: {
                  brief: "An AI note-taking app for lawyers",
                  candidates: [
                    {
                      name: "Lexnote",
                      rationale: "Blends legal roots with note-taking.",
                    },
                  ],
                },
              },
            },
          },
          401: Bearer401,
          422: validation422(),
          429: Rate429,
          502: AiDown502,
        },
      },
    },
    "/searches": {
      post: {
        tags: ["Searches"],
        summary: "Create an empty search",
        description:
          "Creates a search without names. Accounts spend one search. Anonymous callers supply an anon_session_id instead of credentials.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SearchCreate" },
              example: { query: "names for a law firm tool" },
            },
          },
        },
        responses: {
          201: {
            description: "The created search.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchSummary" },
                example: {
                  id: 123,
                  query: "names for a law firm tool",
                  category: "product",
                  name_count: 0,
                  created_at: "2026-10-15T09:00:00Z",
                  searches_left: 2,
                },
              },
            },
          },
          401: {
            description:
              "No credentials and no anon_session_id were provided.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  detail: "Sign in or provide an anonymous session",
                },
              },
            },
          },
          402: Credits402,
          422: validation422(),
          429: Rate429,
        },
      },
    },
    "/searches/generate": {
      post: {
        tags: ["Generation", "Searches"],
        summary: "Generate names and check them in one call",
        description:
          "The product's headline flow: sharpen the brief, run four naming studios, judge, screen the .coms, then check every name across domains, handles, and AI models. Returns 202 immediately; poll the header and results endpoints. Accounts spend one search.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenerateAndFillRequest" },
              example: { query: "a budgeting app for creatives", count: 12 },
            },
          },
        },
        responses: {
          202: {
            description: "Generation started.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    query: { type: "string" },
                    category: { type: "string" },
                    generation: { $ref: "#/components/schemas/GenerationState" },
                    created_at: { type: "string" },
                    searches_left: { type: "integer" },
                  },
                },
                example: {
                  id: 124,
                  query: "a budgeting app for creatives",
                  category: "product",
                  generation: { status: "generating", progress: 10, error: null },
                  created_at: "2026-10-15T09:00:00Z",
                  searches_left: 1,
                },
              },
            },
          },
          401: Bearer401,
          402: Credits402,
          422: validation422(),
          429: Rate429,
        },
      },
    },
    "/checks/direct": {
      post: {
        tags: ["Checks"],
        summary: "Check one exact name",
        description:
          "Builds a single-name search and queues its check, skipping generation. The first check on a name is free; accounts spend one search to open the search itself. Poll /searches/{id}/results, which streams partial data while the check runs.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DirectCheckRequest" },
              example: { name: "Nexuare" },
            },
          },
        },
        responses: {
          202: {
            description: "The check is queued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["search_id", "name_id"],
                  properties: {
                    search_id: { type: "integer" },
                    name_id: { type: "integer" },
                  },
                },
                example: { search_id: 123, name_id: 456 },
              },
            },
          },
          401: Bearer401,
          402: Credits402,
          403: {
            description: "Human verification failed for anonymous callers.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  detail: "Human verification failed. Try again in a moment.",
                },
              },
            },
          },
          422: validation422(),
          429: Rate429,
          502: AiDown502,
        },
      },
    },
    "/searches/{search_id}/names": {
      post: {
        tags: ["Searches"],
        summary: "Add a name to a search",
        parameters: [
          {
            name: "search_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 123,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NameCreate" },
              example: { name: "Vantle", about: "Suggested by my co-founder" },
            },
          },
        },
        responses: {
          201: {
            description: "The created name.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    about: { type: ["string", "null"] },
                  },
                },
                example: { id: 789, name: "Vantle", about: null },
              },
            },
          },
          401: Bearer401,
          404: NotFound404,
          422: validation422(),
          429: Rate429,
        },
      },
    },
    "/names/{name_id}/checks": {
      post: {
        tags: ["Checks"],
        summary: "Run a check on one name",
        description:
          "Free on the first attempt for any name. Re-checks cost one report credit. Returns 202; poll the search's results endpoint.",
        parameters: [
          {
            name: "name_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 789,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckCreate" },
              example: { tlds: ["com", "ai"], platforms: ["github", "x"] },
            },
          },
        },
        responses: {
          202: {
            description: "The check job was queued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    attempt_no: { type: "integer" },
                    status: { type: "string" },
                  },
                },
                example: { attempt_no: 1, status: "queued" },
              },
            },
          },
          401: Bearer401,
          402: {
            description: "Re-checks cost one report credit.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  detail: "Re-checks cost 1 credit. Top up to continue.",
                },
              },
            },
          },
          404: NotFound404,
          409: {
            description: "A check for this name is already running.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  detail: "A check for this name is already running",
                },
              },
            },
          },
          422: validation422(),
          429: Rate429,
          502: AiDown502,
        },
      },
    },
    "/searches/{search_id}/check-all": {
      post: {
        tags: ["Checks"],
        summary: "Queue checks for every unchecked name in a search",
        parameters: [
          {
            name: "search_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 123,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckAllCreate" },
              example: { tlds: ["com", "ai"], platforms: ["github", "x"] },
            },
          },
        },
        responses: {
          202: {
            description: "How many jobs were queued and skipped.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    queued: { type: "integer" },
                    skipped: { type: "integer" },
                  },
                },
                example: { queued: 5, skipped: 1 },
              },
            },
          },
          401: Bearer401,
          404: NotFound404,
          422: validation422(),
          429: Rate429,
        },
      },
    },
    "/searches/{search_id}/header": {
      get: {
        tags: ["Searches"],
        summary: "Poll generation and check progress",
        description:
          "Generation status and the sharpened brief while names are being made, and per-search check counts once they are.",
        parameters: [
          {
            name: "search_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 124,
          },
          {
            name: "anon_session_id",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description: "Required for anonymous searches.",
          },
        ],
        responses: {
          200: {
            description: "The header.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchHeader" },
                example: {
                  id: 124,
                  query: "a budgeting app for creatives",
                  category: "product",
                  name_count: 12,
                  checked_count: 3,
                  generation: { status: "ready", progress: 100, error: null },
                  brief_summary: "A budgeting tool aimed at creatives.",
                  brief_attributes: {
                    audience: "freelancers",
                    tone: "friendly",
                    category: "fintech",
                  },
                  created_at: "2026-10-15T09:00:00Z",
                },
              },
            },
          },
          401: Bearer401,
          404: NotFound404,
        },
      },
    },
    "/searches/{search_id}/results": {
      get: {
        tags: ["Searches"],
        summary: "Poll results with live partial data",
        description:
          "Checked names arrive in items, scored and ready. Names still running appear in pending, where each job carries a live snapshot of domains, handles, and per-model AI progress as it lands.",
        parameters: [
          {
            name: "search_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 124,
          },
          {
            name: "anon_session_id",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "available_only",
            in: "query",
            required: false,
            schema: { type: "boolean" },
          },
          {
            name: "sort",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: [
                "overall-score-high-to-low",
                "overall-score-low-to-high",
                "most-domains-available",
                "lowest-ai-association",
                "name-a-z",
              ],
            },
          },
          {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 120 },
            description: "Filter names by substring.",
          },
        ],
        responses: {
          200: {
            description: "Results, checked and pending.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchResults" },
              },
            },
          },
          401: Bearer401,
          404: NotFound404,
        },
      },
    },
    "/names/checked": {
      get: {
        tags: ["Checks"],
        summary: "List your checked names",
        description:
          "The newest check per name, with score and tier, filterable and paginated. Type-ahead callers narrow with q first, so latency stays flat no matter how many names the account holds.",
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string", maxLength: 120 },
          },
          {
            name: "watched",
            in: "query",
            schema: { type: "string", enum: ["0", "1"] },
            description: "0 lists unwatched names, 1 lists watched ones.",
          },
          {
            name: "tier",
            in: "query",
            schema: {
              type: "string",
              enum: ["excellent", "good", "okay", "poor"],
            },
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["recent", "score", "name"] },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "page_size",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: "A page of checked names.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckedNameList" },
                example: {
                  items: [
                    {
                      name_id: 789,
                      search_id: 123,
                      name: "Nexuare",
                      query: "Nexuare",
                      score: 82,
                      tier: "excellent",
                      checked_at: "2026-10-15T09:05:00Z",
                      search_date: "2026-10-15T09:00:00Z",
                      watch_id: 7,
                    },
                  ],
                  total: 24,
                  page: 1,
                  page_size: 12,
                },
              },
            },
          },
          401: Bearer401,
          422: validation422({
            detail: "tier must be one of: excellent, good, okay, poor",
          }),
        },
      },
    },
    "/reports/{public_id}": {
      get: {
        tags: ["Reports"],
        summary: "Fetch a full report snapshot",
        description:
          "Public by design: pillars, per-domain and per-handle statuses, and per-model AI outputs for one check.",
        security: [],
        parameters: [
          {
            name: "public_id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "The report.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckReport" },
              },
            },
          },
          404: NotFound404,
        },
      },
    },
    "/watches": {
      get: {
        tags: ["Watches"],
        summary: "List your watchlist",
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string", maxLength: 120 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["clean", "threatened"] },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "page_size",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: "Your watches, with slot usage.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WatchList" },
              },
            },
          },
          401: Bearer401,
        },
      },
      post: {
        tags: ["Watches"],
        summary: "Start watching a name",
        description:
          "Watched names are rechecked every few hours, free, and alerted by email. The name must belong to one of your searches.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WatchCreate" },
              example: { search_id: 123, name: "Nexuare" },
            },
          },
        },
        responses: {
          201: {
            description: "The watch.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WatchItem" },
              },
            },
          },
          401: Bearer401,
          402: {
            description: "All free watch slots are in use.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  detail:
                    "You are watching 1 of 1 names. Unwatch one to make room, or upgrade for more slots.",
                },
              },
            },
          },
          404: NotFound404,
          422: validation422({ detail: "Unsupported TLD: not a real tld" }),
          429: Rate429,
        },
      },
    },
    "/watches/{watch_id}": {
      patch: {
        tags: ["Watches"],
        summary: "Change what a watch tracks",
        parameters: [
          {
            name: "watch_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 7,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WatchUpdate" },
              example: { tlds: ["com", "ai"], platforms: ["github", "x"] },
            },
          },
        },
        responses: {
          200: {
            description: "The updated watch.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WatchItem" },
              },
            },
          },
          401: Bearer401,
          404: NotFound404,
          422: validation422(),
        },
      },
      delete: {
        tags: ["Watches"],
        summary: "Stop watching",
        parameters: [
          {
            name: "watch_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Removed." },
          401: Bearer401,
          404: NotFound404,
        },
      },
    },
    "/watches/{watch_id}/sweep": {
      post: {
        tags: ["Watches"],
        summary: "Recheck a watched name now",
        description:
          "Runs a sweep immediately instead of waiting for the next cycle, and reports the changes it found.",
        parameters: [
          {
            name: "watch_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Sweep outcome.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    events: { type: "integer" },
                    status: { type: "string", enum: ["clean", "threatened"] },
                  },
                },
                example: { events: 1, status: "threatened" },
              },
            },
          },
          401: Bearer401,
          404: NotFound404,
        },
      },
    },
    "/packs": {
      get: {
        tags: ["Billing"],
        summary: "List credit packs",
        security: [],
        responses: {
          200: {
            description: "Active packs, cheapest first.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Pack" },
                },
                example: [
                  {
                    slug: "single",
                    title: "Single report",
                    reports: 1,
                    extra_searches: 3,
                    price_minor: 199,
                    currency: "USD",
                  },
                ],
              },
            },
          },
        },
      },
    },
    "/checkout": {
      post: {
        tags: ["Billing"],
        summary: "Start a Stripe checkout session",
        description:
          "Returns a hosted checkout URL. Send return_to as a same-site path to land back on the page that started the purchase.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckoutRequest" },
              example: { pack_slug: "five" },
            },
          },
        },
        responses: {
          200: {
            description: "The checkout session.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutResponse" },
                example: {
                  checkout_url: "https://checkout.stripe.com/c/pay/cs_test",
                  order_id: 301,
                },
              },
            },
          },
          401: Bearer401,
          404: {
            description: "No active pack with that slug.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { detail: "Pack not found" },
              },
            },
          },
          422: validation422(),
          503: {
            description: "Payments are not configured.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { detail: "Payments are not configured" },
              },
            },
          },
        },
      },
    },
    "/orders": {
      get: {
        tags: ["Billing"],
        summary: "List your orders",
        responses: {
          200: {
            description: "Your most recent orders.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
          401: Bearer401,
        },
      },
    },
    "/api-keys": {
      get: {
        tags: ["Keys"],
        summary: "List API keys",
        description:
          "Prefixes and usage only. Raw keys are never returned because only their hashes are stored.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "page_size",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: "A page of keys.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiKeyPage" },
              },
            },
          },
          401: Bearer401,
        },
      },
      post: {
        tags: ["Keys"],
        summary: "Create an API key",
        description:
          "Returns the raw key exactly once. Copy it before you close the response; only its hash is stored.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiKeyCreate" },
              example: { name: "CI checks" },
            },
          },
        },
        responses: {
          201: {
            description: "The raw key, shown once.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiKeyCreated" },
              },
            },
          },
          401: Bearer401,
        },
      },
    },
    "/api-keys/{key_id}": {
      delete: {
        tags: ["Keys"],
        summary: "Revoke an API key",
        description: "Requests using the key fail from the next call onward.",
        parameters: [
          {
            name: "key_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Revoked." },
          401: Bearer401,
          404: {
            description: "No key with that id belongs to you.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { detail: "Key not found" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "uba_live_ prefix",
        description: "Your API key from the API tab of your account page.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { detail: { type: "string" } },
      },
      Me: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          full_name: { type: ["string", "null"] },
          avatar_url: { type: ["string", "null"] },
          searches_left: { type: "integer" },
          credits: { type: "integer" },
        },
      },
      Preferences: {
        type: "object",
        properties: {
          report_ready: { type: "boolean" },
          payment_receipts: { type: "boolean" },
          product_updates: { type: "boolean" },
          watch_alerts: { type: "boolean" },
        },
      },
      NameCandidate: {
        type: "object",
        properties: {
          name: { type: "string" },
          rationale: { type: "string" },
        },
      },
      SearchCategory: {
        type: "string",
        enum: [
          "business",
          "product",
          "feature",
          "marketing",
          "service",
          "content",
          "investment",
          "process",
        ],
      },
      GenerateRequest: {
        type: "object",
        required: ["brief"],
        properties: {
          brief: { type: "string", minLength: 3, maxLength: 400 },
          count: { type: "integer", minimum: 1, maximum: 30, default: 12 },
          style: { type: "string", maxLength: 120 },
        },
      },
      SearchCreate: {
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string", maxLength: 400 },
          category: { $ref: "#/components/schemas/SearchCategory" },
          anon_session_id: { type: "string", format: "uuid" },
          cf_turnstile_token: { type: "string" },
        },
      },
      GenerateAndFillRequest: {
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string", maxLength: 400 },
          category: { $ref: "#/components/schemas/SearchCategory" },
          style: { type: "string", maxLength: 120 },
          count: { type: "integer", minimum: 1, maximum: 30, default: 12 },
          anon_session_id: { type: "string", format: "uuid" },
          cf_turnstile_token: { type: "string" },
        },
      },
      DirectCheckRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 60 },
          anon_session_id: { type: "string", format: "uuid" },
          cf_turnstile_token: { type: "string" },
        },
      },
      NameCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", maxLength: 255 },
          about: { type: ["string", "null"], maxLength: 2000 },
          anon_session_id: { type: "string", format: "uuid" },
          cf_turnstile_token: { type: "string" },
        },
      },
      CheckCreate: {
        type: "object",
        properties: {
          tlds: {
            type: "array",
            items: { type: "string", maxLength: 24 },
            maxItems: 30,
            default: ["com", "ai", "io", "co", "app"],
          },
          platforms: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "x",
                "instagram",
                "tiktok",
                "youtube",
                "linkedin",
                "github",
                "discord",
                "reddit",
                "pinterest",
                "snapchat",
                "threads",
                "telegram",
                "twitch",
                "medium",
                "behance",
                "dribbble",
                "producthunt",
              ],
            },
            maxItems: 17,
            default: ["github", "x", "instagram", "tiktok", "youtube"],
          },
          anon_session_id: { type: "string", format: "uuid" },
          cf_turnstile_token: { type: "string" },
        },
      },
      CheckAllCreate: {
        allOf: [
          { $ref: "#/components/schemas/CheckCreate" },
          {
            type: "object",
            properties: {
              name_ids: {
                type: "array",
                items: { type: "integer" },
                description: "Restrict the sweep to these names.",
              },
            },
          },
        ],
      },
      GenerationState: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["generating", "ready", "failed"] },
          progress: { type: "integer" },
          error: { type: ["string", "null"] },
        },
      },
      SearchSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          query: { type: "string" },
          category: { type: "string" },
          name_count: { type: "integer" },
          created_at: { type: "string" },
        },
      },
      SearchHeader: {
        type: "object",
        properties: {
          id: { type: "integer" },
          query: { type: "string" },
          category: { type: "string" },
          name_count: { type: "integer" },
          checked_count: { type: "integer" },
          generation: { $ref: "#/components/schemas/GenerationState" },
          brief_summary: { type: ["string", "null"] },
          brief_attributes: { type: ["object", "null"] },
          created_at: { type: "string" },
        },
      },
      Snapshot: {
        type: "object",
        description: "Partial results published live while a check runs.",
        properties: {
          domains: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tld: { type: "string" },
                available: { type: "boolean" },
              },
            },
          },
          socials: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                available: { type: "boolean" },
              },
            },
          },
          ai: {
            type: "object",
            properties: {
              models: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    model: { type: "string" },
                    ok: { type: "boolean" },
                  },
                },
              },
              verdict: {
                type: ["string", "null"],
                enum: ["clean", "minor", "hard", null],
              },
            },
          },
        },
      },
      SearchResults: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                about: { type: ["string", "null"] },
                score: { type: "integer" },
                tier: { type: "string" },
                domains: { type: "array", items: { type: "object" } },
                socials: { type: "array", items: { type: "object" } },
                aiAssociation: { type: "string" },
              },
            },
          },
          pending: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                job: {
                  type: ["object", "null"],
                  properties: {
                    status: {
                      type: "string",
                      enum: [
                        "queued",
                        "running",
                        "succeeded",
                        "failed",
                        "canceled",
                      ],
                    },
                    progress: { type: "integer" },
                    current_step: { type: ["string", "null"] },
                    error: { type: ["string", "null"] },
                    snapshot: { $ref: "#/components/schemas/Snapshot" },
                  },
                },
              },
            },
          },
        },
      },
      CheckReport: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          attempt_no: { type: "integer" },
          overall_score: { type: "integer" },
          overall_risk_level: {
            type: "string",
            enum: ["excellent", "good", "okay", "poor"],
          },
          judgment: { type: "string" },
          scoring_version: { type: "string" },
          created_at: { type: "string" },
          pillars: { type: "array", items: { type: "object" } },
          domains: { type: "array", items: { type: "object" } },
          socials: { type: "array", items: { type: "object" } },
          ai: { type: "array", items: { type: "object" } },
        },
      },
      CheckedNameList: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "object" } },
          total: { type: "integer" },
          page: { type: "integer" },
          page_size: { type: "integer" },
        },
      },
      WatchCreate: {
        type: "object",
        required: ["search_id", "name"],
        properties: {
          search_id: { type: "integer" },
          name: { type: "string" },
          tlds: { type: "array", items: { type: "string" }, maxItems: 5 },
          platforms: { type: "array", items: { type: "string" }, maxItems: 3 },
        },
      },
      WatchUpdate: {
        type: "object",
        properties: {
          tlds: { type: "array", items: { type: "string" }, maxItems: 5 },
          platforms: { type: "array", items: { type: "string" }, maxItems: 3 },
        },
      },
      WatchItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name_id: { type: "integer" },
          search_id: { type: "integer" },
          name: { type: "string" },
          status: { type: "string", enum: ["clean", "threatened"] },
          tlds: { type: "array", items: { type: "string" } },
          platforms: { type: "array", items: { type: "string" } },
          clean_since: { type: ["string", "null"] },
          days_clean: { type: ["integer", "null"] },
          last_swept_at: { type: ["string", "null"] },
          created_at: { type: "string" },
          events: { type: "array", items: { type: "object" } },
        },
      },
      WatchList: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/WatchItem" },
          },
          total: { type: "integer" },
          slots: {
            type: "object",
            properties: {
              used: { type: "integer" },
              total: { type: "integer" },
            },
          },
        },
      },
      Pack: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          reports: { type: "integer" },
          extra_searches: { type: "integer" },
          price_minor: { type: "integer" },
          currency: { type: "string" },
        },
      },
      CheckoutRequest: {
        type: "object",
        required: ["pack_slug"],
        properties: {
          pack_slug: { type: "string" },
          return_to: {
            type: "string",
            description: "A same-site path, such as /dashboard/history/123.",
          },
        },
      },
      CheckoutResponse: {
        type: "object",
        properties: {
          checkout_url: { type: "string", format: "uri" },
          order_id: { type: "integer" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer" },
          status: { type: "string" },
          amount_minor: { type: "integer" },
          currency: { type: "string" },
          paid_at: { type: ["string", "null"] },
          created_at: { type: "string" },
          reports: { type: "integer" },
          searches: { type: "integer" },
          receipt_url: { type: ["string", "null"], format: "uri" },
        },
      },
      ApiKeyCreate: {
        type: "object",
        properties: { name: { type: "string", maxLength: 100 } },
      },
      ApiKeyCreated: {
        type: "object",
        properties: {
          id: { type: "integer" },
          key: { type: "string", description: "Shown once, never again." },
          prefix: { type: "string" },
          name: { type: "string" },
        },
      },
      ApiKeyPublic: {
        type: "object",
        properties: {
          id: { type: "integer" },
          prefix: { type: "string" },
          name: { type: "string" },
          is_active: { type: "boolean" },
          last_used_at: { type: ["string", "null"] },
          created_at: { type: "string" },
        },
      },
      ApiKeyPage: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/ApiKeyPublic" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          page_size: { type: "integer" },
        },
      },
    },
  },
} as const
