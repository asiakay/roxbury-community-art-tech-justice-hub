import { serveDir } from 'jsr:@std/http/file-server';

export default {
  async fetch(request, env, ctx) {
    // Serve static files from the current directory
    return serveDir(request, { fsRoot: './' });
  },
};
