const { roleAtLeast } = require('./roles');

// 16.3 - living people get extra protection on precise dates/places,
// regardless of profile_visibility. Deceased people (16.4) are exempt -
// historical accuracy matters more once privacy risk is gone.
function sanitizePersonForViewer(person, membership, viewerUserId) {
  if (!person.is_living) return person; // no extra restriction for the deceased

  const isSelf = person.claimed_by_user_id && person.claimed_by_user_id === viewerUserId;
  const isTrusted = isSelf || roleAtLeast(membership.role, 'admin');
  if (isTrusted) return person;

  const sanitized = { ...person };
  if (person.birth_date) sanitized.birth_date = `${person.birth_date.slice(0, 4)}-01-01`; // year only, day/month zeroed
  sanitized.birth_place = person.birth_place ? 'Location withheld' : null;
  return sanitized;
}

function sanitizePeopleList(people, membership, viewerUserId) {
  return people.map((p) => sanitizePersonForViewer(p, membership, viewerUserId));
}

module.exports = { sanitizePersonForViewer, sanitizePeopleList };