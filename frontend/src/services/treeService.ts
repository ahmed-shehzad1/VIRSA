import apiClient from "./apiClient";
import { mapPerson, type BackendPerson } from "./personService";
import type { Person } from "@/data/types";

export type TreeNode = {
  id: string;
  data: {
    firstName: string;
    lastName?: string | null;
    gender?: string | null;
    birthDate?: string | null;
    deathDate?: string | null;
    isLiving: boolean;
    photoUrl?: string | null;
    isClaimed: boolean;
  };
};

export type TreeEdge = {
  id: string;
  source: string;
  target: string;
  type: "parent" | "spouse" | "sibling";
};

export type TreeResponse = {
  nodes: TreeNode[];
  edges: TreeEdge[];
  meta?: { totalPeopleInFamily: number; includedCount: number; truncated: boolean };
};

function nameFromNode(node: TreeNode) {
  return [node.data.firstName, node.data.lastName].filter(Boolean).join(" ");
}

export function mapTreeToPeople(tree: TreeResponse): Person[] {
  const levels = new Map<string, number>();
  const parentEdges = tree.edges.filter((edge) => edge.type === "parent");
  const children = new Set(parentEdges.map((edge) => edge.target));
  const roots = tree.nodes.filter((node) => !children.has(node.id)).map((node) => node.id);
  const queue = roots.map((id) => ({ id, level: 0 }));

  while (queue.length) {
    const current = queue.shift();
    if (!current || levels.has(current.id)) continue;
    levels.set(current.id, current.level);
    parentEdges
      .filter((edge) => edge.source === current.id)
      .forEach((edge) => queue.push({ id: edge.target, level: current.level + 1 }));
  }

  tree.nodes.forEach((node, index) => {
    if (!levels.has(node.id)) levels.set(node.id, 0);
    const sameLevel = tree.nodes.filter(
      (candidate) => levels.get(candidate.id) === levels.get(node.id),
    );
    const position = sameLevel.indexOf(node);
    const person = mapPerson({
      id: node.id,
      family_id: "",
      first_name: node.data.firstName,
      last_name: node.data.lastName,
      gender: node.data.gender,
      birth_date: node.data.birthDate,
      death_date: node.data.deathDate,
      is_living: node.data.isLiving,
      photo_url: node.data.photoUrl,
    } as BackendPerson);
    person.fullName = nameFromNode(node);
    person.pos = { x: position * 230 + 40, y: (levels.get(node.id) || 0) * 150 + 40 };
    person.parentIds = parentEdges
      .filter((edge) => edge.target === node.id)
      .map((edge) => edge.source);
    person.spouseIds = tree.edges
      .filter(
        (edge) => edge.type === "spouse" && (edge.source === node.id || edge.target === node.id),
      )
      .map((edge) => (edge.source === node.id ? edge.target : edge.source));
    return person;
  });

  return tree.nodes.map((node) => {
    const person = mapPerson({
      id: node.id,
      family_id: "",
      first_name: node.data.firstName,
      last_name: node.data.lastName,
      gender: node.data.gender,
      birth_date: node.data.birthDate,
      death_date: node.data.deathDate,
      is_living: node.data.isLiving,
      photo_url: node.data.photoUrl,
    } as BackendPerson);
    const level = levels.get(node.id) || 0;
    const sameLevel = tree.nodes.filter((candidate) => (levels.get(candidate.id) || 0) === level);
    person.pos = { x: sameLevel.indexOf(node) * 230 + 40, y: level * 150 + 40 };
    person.parentIds = parentEdges
      .filter((edge) => edge.target === node.id)
      .map((edge) => edge.source);
    person.spouseIds = tree.edges
      .filter(
        (edge) => edge.type === "spouse" && (edge.source === node.id || edge.target === node.id),
      )
      .map((edge) => (edge.source === node.id ? edge.target : edge.source));
    person.fullName = nameFromNode(node);
    return person;
  });
}

export async function getTree(familyId: string) {
  const response = await apiClient.get<{ data: TreeResponse }>(`/api/families/${familyId}/tree`);
  return { ...response.data.data, people: mapTreeToPeople(response.data.data) };
}
