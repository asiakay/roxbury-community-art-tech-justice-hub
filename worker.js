export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Default to index.html when hitting the root
    if (path === "/") path = "/index.html";

    try {
      // Look for a file in the KV-like assets system
      const asset = await fetch(new URL(path, import.meta.url));
      if (asset.ok) return asset;

      // If not found, try fallback (index.html)
      const fallback = await fetch(new URL("/index.html", import.meta.url));
      return new Response(await fallback.text(), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  },
};
