const router = require('express').Router();

// 19.1 / 19.4 - static, non-user metadata only. Used by the frontend's
// public marketing/landing page for SEO tags - never for anything behind
// login. If this ever needs per-family data, it does NOT belong here.
router.get('/meta', (req, res) => {
  res.json({
    success: true,
    data: {
      appName: 'Virsa',
      tagline: 'Preserve your family history, together.',
      description: 'Virsa is a private, collaborative family archive - build your family tree, preserve stories, and keep memories safe.',
      canonicalUrl: 'https://virsa.app', // update once you have a real domain
    },
  });
});

module.exports = router;