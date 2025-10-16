import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      // Try to serve static asset from the bucket
      return await getAssetFromKV({ request, waitUntil: ctx.waitUntil.bind(ctx) })
    } catch (err) {
      // If not found, return 404 page or fallback
      return new Response('Not Found', { status: 404 })
    }
  },
}
