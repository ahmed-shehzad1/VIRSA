const personModel = require('../models/person.model');
const relationshipModel = require('../models/relationship.model');
const ApiError = require('../utils/ApiError');
const cache = require('../utils/cache');
const DEFAULT_DEPTH = 5;
const MAX_DEPTH = 20;
const DEFAULT_MAX_NODES = 300;
const HARD_MAX_NODES = 1000;

function addToMap(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

// 5.1 - builds the full in-memory graph for a family in two queries total
async function buildFamilyGraph(familyId) {
  const [people, relationships] = await Promise.all([
    personModel.findAllByFamily(familyId),
    relationshipModel.findAllForFamily(familyId),
  ]);

  const peopleById = new Map(people.map((p) => [p.id, p]));
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spousesOf = new Map();
  const siblingsOf = new Map();

  for (const r of relationships) {
    if (r.type === 'parent') {
      addToMap(parentToChildren, r.person_a_id, r.person_b_id);
      addToMap(childToParents, r.person_b_id, r.person_a_id);
    } else if (r.type === 'spouse') {
      addToMap(spousesOf, r.person_a_id, r.person_b_id);
      addToMap(spousesOf, r.person_b_id, r.person_a_id);
    } else if (r.type === 'sibling') {
      addToMap(siblingsOf, r.person_a_id, r.person_b_id);
      addToMap(siblingsOf, r.person_b_id, r.person_a_id);
    }
  }

  return { peopleById, parentToChildren, childToParents, spousesOf, siblingsOf, relationships };
}

function toNode(person) {
  return {
    id: person.id,
    type: 'personNode',
    data: {
      firstName: person.first_name,
      lastName: person.last_name,
      gender: person.gender,
      birthDate: person.birth_date,
      deathDate: person.death_date,
      isLiving: person.is_living,
      photoUrl: person.photo_url,
      isClaimed: !!person.claimed_by_user_id,
    },
  };
}

// 5.4 - BFS up the parent chain
function traverseAncestors(graph, rootId, depth) {
  const visited = new Set([rootId]);
  let frontier = [rootId];
  for (let level = 0; level < depth && frontier.length > 0; level++) {
    const next = [];
    for (const id of frontier) {
      for (const parentId of graph.childToParents.get(id) || []) {
        if (!visited.has(parentId)) {
          visited.add(parentId);
          next.push(parentId);
        }
      }
    }
    frontier = next;
  }
  return visited;
}

// 5.5 - BFS down the child chain
function traverseDescendants(graph, rootId, depth) {
  const visited = new Set([rootId]);
  let frontier = [rootId];
  for (let level = 0; level < depth && frontier.length > 0; level++) {
    const next = [];
    for (const id of frontier) {
      for (const childId of graph.parentToChildren.get(id) || []) {
        if (!visited.has(childId)) {
          visited.add(childId);
          next.push(childId);
        }
      }
    }
    frontier = next;
  }
  return visited;
}

// 5.6 - pulls in spouses of everyone already in the node set, since a
// spouse is usually expected to render next to their partner
function addSpouses(graph, nodeIds) {
  const withSpouses = new Set(nodeIds);
  for (const id of nodeIds) {
    for (const spouseId of graph.spousesOf.get(id) || []) {
      if (graph.peopleById.has(spouseId)) withSpouses.add(spouseId);
    }
  }
  return withSpouses;
}

function buildNodesAndEdges(graph, nodeIds) {
  const nodes = [...nodeIds].map((id) => toNode(graph.peopleById.get(id))).filter((n) => n.data);

  const edges = graph.relationships
    .filter((r) => nodeIds.has(r.person_a_id) && nodeIds.has(r.person_b_id))
    .map((r) => ({
      id: r.id,
      source: r.person_a_id,
      target: r.person_b_id,
      type: r.type,
      ...(r.type === 'spouse' ? { status: r.status } : {}),
      ...(r.type === 'sibling' ? { siblingType: r.sibling_type } : {}),
    }));

  return { nodes, edges };
}

// 5.1 / 5.3 / 5.8 - full tree, optionally windowed around a root person
async function getTree(familyId, { rootPersonId, depth, maxNodes }) {
  const cacheKey = `tree:${familyId}:${rootPersonId || 'full'}:${depth || DEFAULT_DEPTH}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const graph = await buildFamilyGraph(familyId);

  const resolvedDepth = Math.min(depth || DEFAULT_DEPTH, MAX_DEPTH);
  const cap = Math.min(maxNodes || DEFAULT_MAX_NODES, HARD_MAX_NODES);

  let nodeIds;

  if (rootPersonId) {
    if (!graph.peopleById.has(rootPersonId)) {
      throw ApiError.notFound(
        'Root person not found in this family',
        'PERSON_NOT_FOUND'
      );
    }

    const ancestors = traverseAncestors(graph, rootPersonId, resolvedDepth);
    const descendants = traverseDescendants(graph, rootPersonId, resolvedDepth);

    nodeIds = new Set([...ancestors, ...descendants]);
  } else {
    if (graph.peopleById.size > cap) {
      throw ApiError.badRequest(
        `This family has ${graph.peopleById.size} people, which is too many to render at once. Pass rootPersonId and depth to view a windowed section of the tree.`,
        'TREE_TOO_LARGE',
        {
          totalPeople: graph.peopleById.size,
          maxNodes: cap,
        }
      );
    }

    nodeIds = new Set(graph.peopleById.keys());
  }

  nodeIds = addSpouses(graph, nodeIds);

  const truncated = nodeIds.size > cap;

  if (truncated) {
    nodeIds = new Set([...nodeIds].slice(0, cap));
  }

  const { nodes, edges } = buildNodesAndEdges(graph, nodeIds);

  const result = {
    nodes,
    edges,
    meta: {
      totalPeopleInFamily: graph.peopleById.size,
      includedCount: nodes.length,
      truncated,
    },
  };

  cache.set(cacheKey, result, 30000); // 30s TTL - tree data doesn't need to be instant-fresh

  return result;
}
// 5.4
async function getAncestors(familyId, personId, depth) {
  const graph = await buildFamilyGraph(familyId);
  if (!graph.peopleById.has(personId)) throw ApiError.notFound('Person not found in this family', 'PERSON_NOT_FOUND');

  let nodeIds = traverseAncestors(graph, personId, Math.min(depth || DEFAULT_DEPTH, MAX_DEPTH));
  nodeIds = addSpouses(graph, nodeIds);
  return buildNodesAndEdges(graph, nodeIds);
}

// 5.5
async function getDescendants(familyId, personId, depth) {
  const graph = await buildFamilyGraph(familyId);
  if (!graph.peopleById.has(personId)) throw ApiError.notFound('Person not found in this family', 'PERSON_NOT_FOUND');

  let nodeIds = traverseDescendants(graph, personId, Math.min(depth || DEFAULT_DEPTH, MAX_DEPTH));
  nodeIds = addSpouses(graph, nodeIds);
  return buildNodesAndEdges(graph, nodeIds);
}

// 5.9 - single node's info-card payload with immediate relations resolved
async function getPersonNode(familyId, personId) {
  const graph = await buildFamilyGraph(familyId);
  const person = graph.peopleById.get(personId);
  if (!person) throw ApiError.notFound('Person not found in this family', 'PERSON_NOT_FOUND');

  const resolve = (ids) => (ids || []).map((id) => graph.peopleById.get(id)).filter(Boolean).map(toNode);

  return {
    ...toNode(person),
    relations: {
      parents: resolve(graph.childToParents.get(personId)),
      children: resolve(graph.parentToChildren.get(personId)),
      spouses: resolve(graph.spousesOf.get(personId)),
      siblings: resolve(graph.siblingsOf.get(personId)),
    },
  };
}

// 5.3 - suggested starting point when the frontend hasn't picked a root yet:
// prefer the oldest person with no recorded parents (top of the tree)
async function getSuggestedRoot(familyId) {
  const graph = await buildFamilyGraph(familyId);
  const candidates = [...graph.peopleById.values()].filter((p) => !graph.childToParents.has(p.id));
  const pool = candidates.length ? candidates : [...graph.peopleById.values()];

  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    if (!a.birth_date) return 1;
    if (!b.birth_date) return -1;
    return new Date(a.birth_date) - new Date(b.birth_date);
  });

  return toNode(pool[0]);
}

module.exports = { getTree, getAncestors, getDescendants, getPersonNode, getSuggestedRoot };