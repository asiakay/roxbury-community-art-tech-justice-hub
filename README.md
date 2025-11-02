# Roxbury Community Art & Tech Justice Hub

Building creative and technological equity through education, innovation, and collaboration.

## 🌐 Public Demo
**Live site:** [https://roxbury-tech.asialakaygrady-6d4.workers.dev](https://roxbury-tech.asialakaygrady-6d4.workers.dev)

## ⚙️ Stack
- Cloudflare Workers + Pages
- HTML, CSS, and minimal JS
- Static site deployment using `wrangler.toml`

## 🚀 Deployment
```bash
npx wrangler deploy
```
Bucket: `./`
Worker name: `roxbury-tech`

## 🛠️ Local Development
Use [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) to run the site locally while you iterate on HTML, CSS, or Worker updates.

```bash
npx wrangler dev
```

This command starts a local preview with live reload enabled. Any changes to `index.html`, `style.css`, or `worker.js` are automatically reflected in the browser, making it easy to test new layouts or worker logic before deploying.
