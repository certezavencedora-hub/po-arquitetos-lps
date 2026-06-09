export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.endsWith('.pages.dev')) {
      const target = 'https://lp.pedrodooarquitetos.pt' + url.pathname + url.search;
      return Response.redirect(target, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
