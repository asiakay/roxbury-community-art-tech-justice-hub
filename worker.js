export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/resources/")) {
      return handleResourceRequest(path, env);
    }

    let assetPath = path;
    if (assetPath === "/") assetPath = "/index.html";

    try {
      const asset = await fetch(new URL(assetPath, import.meta.url));
      if (asset.ok) return asset;

      const fallback = await fetch(new URL("/index.html", import.meta.url));
      return new Response(await fallback.text(), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  },
};

const ALLOWED_RESOURCE_TYPES = ["learn", "build", "community"];

const FALLBACK_RESOURCES = {
  learn: {
    resource: "learn",
    title: "Learning Pathways",
    items: [
      {
        title: "Intro to Cooperative Tech",
        description:
          "Workshop curriculum connecting civic technology with community-owned platforms.",
        url: "https://docs.google.com/document/d/1cooperative-tech",
        format: "Curriculum",
      },
      {
        title: "Clean Energy Playbook",
        description:
          "Community solar onboarding kit featuring lesson plans, tooling, and funding resources.",
        url: "https://solarroot.org/learn",
        format: "Toolkit",
      },
    ],
  },
  build: {
    resource: "build",
    title: "Build Projects",
    items: [
      {
        title: "Civic App Starter",
        description:
          "Cloudflare Workers template for launching community engagement applications.",
        url: "https://github.com/asiakay/civic-app-starter",
        format: "Repository",
      },
      {
        title: "Mutual Aid Sensor Kit",
        description:
          "Hardware build files and firmware that track environmental data for local co-ops.",
        url: "https://mutualaid.dev/sensor-kit",
        format: "Hardware",
      },
    ],
  },
  community: {
    resource: "community",
    title: "Community Happenings",
    items: [
      {
        title: "Tech Justice Assembly",
        description:
          "Monthly gathering focused on digital equity organizing in Roxbury and Greater Boston.",
        url: "https://lu.ma/tech-justice-assembly",
        format: "Event",
      },
      {
        title: "Open Governance Circle",
        description:
          "Bi-weekly strategy call for residents stewarding cooperative infrastructure projects.",
        url: "https://calendar.community/open-governance",
        format: "Meetup",
      },
    ],
  },
};

async function handleResourceRequest(path, env) {
  const segments = path.split("/").filter(Boolean);
  const resourceType = segments[segments.length - 1]?.toLowerCase();

  if (!resourceType || !ALLOWED_RESOURCE_TYPES.includes(resourceType)) {
    return jsonResponse(
      {
        error: "Resource not found",
      },
      404,
    );
  }

  const fallback = FALLBACK_RESOURCES[resourceType];
  let kvPayload = null;

  if (env?.RESOURCES?.get) {
    try {
      kvPayload = await env.RESOURCES.get(resourceType, { type: "json" });
    } catch (error) {
      console.error(`RESOURCES KV JSON fetch failed for ${resourceType}`, error);
    }

    if (!kvPayload) {
      try {
        const textPayload = await env.RESOURCES.get(resourceType);
        if (textPayload) {
          kvPayload = JSON.parse(textPayload);
        }
      } catch (error) {
        console.error(`RESOURCES KV text fetch failed for ${resourceType}`, error);
      }
    }
  }

  const payload = normalizeResourcePayload(resourceType, kvPayload, fallback);
  return jsonResponse(payload);
}

function normalizeResourcePayload(resourceType, kvPayload, fallback) {
  if (!kvPayload || typeof kvPayload !== "object") {
    return decoratePayload(fallback);
  }

  const normalized = {
    resource: kvPayload.resource ?? resourceType,
    title: kvPayload.title ?? fallback.title,
    items: Array.isArray(kvPayload.items) ? kvPayload.items : fallback.items,
    lastUpdated: kvPayload.lastUpdated ?? new Date().toISOString(),
  };

  return decoratePayload(normalized);
}

function decoratePayload(payload) {
  if (!payload.lastUpdated) {
    return {
      ...payload,
      lastUpdated: new Date().toISOString(),
    };
  }
  return payload;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}
