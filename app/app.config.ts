export default defineAppConfig({
  title: 'Sink',
  github: 'https://sink.gamas.workers.dev/gamas-github',
  twitter: 'https://sink.gamas.workers.dev/gamas-x',
  website: 'https://sink.gamas.workers.dev/gamas-website',
  instagram: 'https://sink.gamas.workers.dev/gamas-instagram',
  description: 'A Simple / Speedy / Secure Link Shortener with Analytics, 100% run on Cloudflare.',
  image: 'https://sink.cool/banner.png',
  previewTTL: 300, // 5 minutes
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
