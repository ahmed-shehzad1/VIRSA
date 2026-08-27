// 19.2 / 19.6 / 19.8 - every API response explicitly tells crawlers not
// to index it, regardless of auth state. This is a second layer of
// defense on top of "the route requires auth" - headers can't be
// bypassed by a misconfigured frontend route or a stray public endpoint.
function noIndex(req, res, next) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  next();
}

module.exports = noIndex;