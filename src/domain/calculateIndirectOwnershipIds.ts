import type { Entity, OwnedObject, Ownership } from "./types";

/**
 * Calculates total ownership of each Entity and Object in the system.
 * Returns a map:  ownerId -> { [targetObjectId]: percent }
 */
// id-based variant for graph edges: "entity:<id>" | "object:<id>" -> { [objectId]: percent }
export function calculateIndirectOwnershipIds(
  entities: Entity[],
  objects: OwnedObject[],
  ownerships: Ownership[]
) {
  // Build adjacency list
  const adj = new Map<string, { target: string; pct: number }[]>();
  for (const own of ownerships) {
    const src = `${own.owner.kind}:${own.owner.id}`;
    if (!adj.has(src)) adj.set(src, []);
    adj.get(src)!.push({ target: own.objectId, pct: own.percent / 100 });
  }

  // DFS with path accumulation; sum contributions to same target
  const results = new Map<string, Map<string, number>>();
  const dfs = (source: string, current: string, acc: number, visited: Set<string>) => {
    const edges = adj.get(current);
    if (!edges) return;
    for (const { target, pct } of edges) {
      const next = acc * pct;
      if (!results.has(source)) results.set(source, new Map());
      const prev = results.get(source)!.get(target) ?? 0;
      results.get(source)!.set(target, prev + next);

      if (!visited.has(target)) {
        const nv = new Set(visited);
        nv.add(target);
        dfs(source, `object:${target}`, next, nv);
      }
    }
  };

  // start from all entities and objects
  for (const e of entities) dfs(`entity:${e.id}`, `entity:${e.id}`, 1, new Set([`entity:${e.id}`]));
  for (const o of objects)  dfs(`object:${o.id}`, `object:${o.id}`, 1, new Set([`object:${o.id}`]));

  // plain object with percentages
  const out: Record<string, Record<string, number>> = {};
  for (const [src, map] of results.entries()) {
    out[src] = {};
    for (const [objId, val] of map.entries()) out[src][objId] = Number((val * 100).toFixed(2));
  }
  return out;
}

// readable variant: uses names instead of IDs
export function calculateIndirectOwnershipNames(
  entities: Entity[],
  objects: OwnedObject[],
  ownerships: Ownership[]
) {
  // Maps for quick lookup
  const entityNameById = new Map(entities.map(e => [e.id, e.name]));
  const objectNameById = new Map(objects.map(o => [o.id, o.name]));

  // Get indirect results using ID version
  const idResults = calculateIndirectOwnershipIds(entities, objects, ownerships);

  // Convert IDs to names
  const readable: Record<string, Record<string, number>> = {};

  for (const [source, targets] of Object.entries(idResults)) {
    const [kind, id] = source.split(":");
    const sourceName =
      kind === "entity"
        ? entityNameById.get(id) ?? `Unknown entity (${id})`
        : objectNameById.get(id) ?? `Unknown object (${id})`;

    readable[sourceName] = {};

    for (const [targetId, pct] of Object.entries(targets)) {
      const targetName = objectNameById.get(targetId) ?? `Unknown object (${targetId})`;
      readable[sourceName][targetName] = pct;
    }
  }

  return readable;
}
