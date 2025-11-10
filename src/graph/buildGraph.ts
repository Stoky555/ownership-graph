import { MarkerType, type Edge as RFEdge, type Node as RFNode } from "reactflow";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import { placeOnRing, cx, cy, innerR, outerR } from "./helpers";
import { directId, indirectId } from "./ids";

type Inputs = {
  entities: Entity[];
  objects: OwnedObject[];
  totals: Record<string, Record<string, number>>; // indirect totals
  hiddenIndirectEdges: Set<string>;
  centerNodeId: string | null;
  directOwnerships: Ownership[];                  // already filtered by UI
};

export function buildGraph({
  entities, objects, totals, hiddenIndirectEdges, centerNodeId, directOwnerships,
}: Inputs) {
  const nodes: RFNode[] = [];
  const edges: RFEdge[] = [];

  // nodes
  for (const e of entities) nodes.push({ id: `entity:${e.id}`, type: "bubble", position: { x: 0, y: 0 }, data: { label: e.name }, draggable: true });
  for (const o of objects)  nodes.push({ id: `object:${o.id}`, type: "bubble", position: { x: 0, y: 0 }, data: { label: o.name }, draggable: true });

  // indirect edges (skip hidden or duplicates of direct)
  const directEdgeIds = new Set(directOwnerships.map(directId));
  for (const [sourceKey, targets] of Object.entries(totals)) {
    for (const [objectId, pct] of Object.entries(targets)) {
      if ((pct as number) <= 0.01) continue;
      const id = indirectId(sourceKey, objectId);
      if (hiddenIndirectEdges.has(id) || directEdgeIds.has(id)) continue;
      edges.push({
        id, source: sourceKey, target: `object:${objectId}`,
        type: "smoothstep",
        label: `${pct}%`,
        labelBgPadding: [6, 2],
        labelBgBorderRadius: 4,
        labelStyle: { fontWeight: 600 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: 2, stroke: "#334155" },
      });
    }
  }

  // direct edges (dashed)
  for (const own of directOwnerships) {
    const source = `${own.owner.kind}:${own.owner.id}`;
    const target = `object:${own.objectId}`;
    edges.push({
      id: directId(own), source, target, type: "smoothstep", label: `${own.percent}%`,
      style: { strokeWidth: 2, stroke: "#94a3b8", strokeDasharray: "4 2" },
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      labelBgPadding: [6, 2], labelBgBorderRadius: 4, labelStyle: { fontWeight: 600 },
    });
  }

  // layout
  const setPos = (id: string, x: number, y: number) => {
    const n = nodes.find((n) => n.id === id); if (n) n.position = { x, y };
  };
  const fallbackCenter = entities.length === 1 ? `entity:${entities[0].id}` : null;
  const center = centerNodeId ?? fallbackCenter;

  if (center) {
    setPos(center, cx, cy);
    const neighbors = new Set(
      edges.filter((e) => e.source === center || e.target === center)
           .map((e) => (e.source === center ? e.target : e.source))
    );
    const innerIds = Array.from(neighbors);
    const outerIds = nodes.map((n) => n.id).filter((id) => id !== center && !neighbors.has(id));
    innerIds.forEach((id, i) => { const p = placeOnRing(cx, cy, innerR, i, innerIds.length); setPos(id, p.x, p.y); });
    outerIds.forEach((id, i) => { const p = placeOnRing(cx, cy, outerR, i, outerIds.length); setPos(id, p.x, p.y); });
  } else {
    const entityIds = entities.map((e) => `entity:${e.id}`);
    const objectIds  = objects.map((o) => `object:${o.id}`);
    entityIds.forEach((id, i) => { const p = placeOnRing(cx, cy, innerR, i, entityIds.length); setPos(id, p.x, p.y); });
    objectIds.forEach((id, i)  => { const p = placeOnRing(cx, cy, outerR, i, objectIds.length); setPos(id, p.x, p.y); });
  }

  // prune invalid edges
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  return { nodes, edges: validEdges };
}
