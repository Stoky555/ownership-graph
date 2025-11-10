import { useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow,
{
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
  applyNodeChanges,
  type Node as RFNode,
  type Edge as RFEdge,
  type OnNodesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import { calculateIndirectOwnershipIds } from "../domain/calculateIndirectOwnershipIds";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
  centerEntityId?: string; // optional initial center
};

/* ---------------------------------- UI NODES ---------------------------------- */

function BubbleNode({ data }: any) {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#e0f2fe",
        border: "2px solid #38bdf8",
        fontSize: 12,
        textAlign: "center",
        padding: 6,
        boxSizing: "border-box",
      }}
      title={String(data?.label ?? "")}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      {data?.label}
    </div>
  );
}
const nodeTypes = { bubble: BubbleNode };

/* --------------------------------- HELPERS --------------------------------- */

function placeOnRing(cx: number, cy: number, r: number, index: number, total: number) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

// canonical IDs
const directId = (own: Ownership) => `${own.owner.kind}:${own.owner.id}->object:${own.objectId}`;
const indirectId = (sourceKey: string, objectId: string) => `${sourceKey}->object:${objectId}`;

// name lookups
function makeEntityMap(entities: Entity[]) {
  const m = new Map<string, Entity>();
  for (const e of entities) m.set(e.id, e);
  return m;
}
function makeObjectMap(objects: OwnedObject[]) {
  const m = new Map<string, OwnedObject>();
  for (const o of objects) m.set(o.id, o);
  return m;
}

/* ------------------------------- GRAPH BUILDER ------------------------------ */

function buildGraph({
  entities,
  objects,
  totals,                              // indirect totals computed elsewhere
  hiddenIndirectEdges,                 // Set<string> of edge ids to hide
  centerNodeId,                        // "entity:..." | "object:..." | null
  directOwnerships,
}: {
  entities: Entity[];
  objects: OwnedObject[];
  totals: Record<string, Record<string, number>>;
  hiddenIndirectEdges: Set<string>;
  centerNodeId: string | null;
  directOwnerships: Ownership[];
}) {
  const nodes: RFNode[] = [];
  const edges: RFEdge[] = [];

  // nodes
  for (const e of entities) {
    nodes.push({
      id: `entity:${e.id}`,
      type: "bubble",
      position: { x: 0, y: 0 },
      data: { label: e.name },
      draggable: true,
    });
  }
  for (const o of objects) {
    nodes.push({
      id: `object:${o.id}`,
      type: "bubble",
      position: { x: 0, y: 0 },
      data: { label: o.name },
      draggable: true,
    });
  }

  const directEdgeIds = new Set(
    directOwnerships.map((own) => directId(own))
  );

  // edges (INDIRECT only, filtered by hiddenIndirectEdges)
  for (const [sourceKey, targets] of Object.entries(totals)) {
    for (const [objectId, pct] of Object.entries(targets)) {
      if (pct <= 0.01) continue;
      const id = indirectId(sourceKey, objectId);
      if (hiddenIndirectEdges.has(id) || directEdgeIds.has(id)) continue; // ← skip duplicates
      if (hiddenIndirectEdges.has(id)) continue;

      if (hiddenIndirectEdges.has(id)) continue;
      edges.push({
        id,
        source: sourceKey,
        target: `object:${objectId}`,
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

  // layout
  const cx = 360, cy = 260, innerR = 180, outerR = 320;

  const setPos = (id: string, x: number, y: number) => {
    const n = nodes.find((n) => n.id === id);
    if (n) n.position = { x, y };
  };

  const fallbackCenter = entities.length === 1 ? `entity:${entities[0].id}` : null;
  const center = centerNodeId ?? fallbackCenter;

  if (center) {
    setPos(center, cx, cy);
    const neighbors = new Set(
      edges
        .filter((e) => e.source === center || e.target === center)
        .map((e) => (e.source === center ? e.target : e.source))
    );
    const innerIds = Array.from(neighbors);
    const outerIds = nodes.map((n) => n.id).filter((id) => id !== center && !neighbors.has(id));

    innerIds.forEach((id, i) => {
      const p = placeOnRing(cx, cy, innerR, i, innerIds.length);
      setPos(id, p.x, p.y);
    });
    outerIds.forEach((id, i) => {
      const p = placeOnRing(cx, cy, outerR, i, outerIds.length);
      setPos(id, p.x, p.y);
    });
  } else {
    const entityIds = entities.map((e) => `entity:${e.id}`);
    const objectIds = objects.map((o) => `object:${o.id}`);
    entityIds.forEach((id, i) => {
      const p = placeOnRing(cx, cy, innerR, i, entityIds.length);
      setPos(id, p.x, p.y);
    });
    objectIds.forEach((id, i) => {
      const p = placeOnRing(cx, cy, outerR, i, objectIds.length);
      setPos(id, p.x, p.y);
    });
  }

  // --- DIRECT edges (always shown if not hidden by the direct checkboxes) ---
  for (const own of directOwnerships) {
    const source = `${own.owner.kind}:${own.owner.id}`;
    const target = `object:${own.objectId}`;
    edges.push({
      id: directId(own),
      source,
      target,
      type: "smoothstep",
      label: `${own.percent}%`,
      // make direct edges visually distinct (dashed + lighter stroke)
      style: { strokeWidth: 2, stroke: "#94a3b8", strokeDasharray: "4 2" },
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      labelBgPadding: [6, 2],
      labelBgBorderRadius: 4,
      labelStyle: { fontWeight: 600 },
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return { nodes, edges: validEdges };
}

/* -------------------------------- COMPONENT -------------------------------- */

export default function GraphView({
  entities,
  objects,
  ownerships,
  // centerEntityId,
}: Props) {
  const entityMap = useMemo(() => makeEntityMap(entities), [entities]);
  const objectMap = useMemo(() => makeObjectMap(objects), [objects]);

  // // FULL node id ("entity:..." or "object:...") for center
  // const [centerNodeId, setCenterNodeId] = useState<string | null>(
  //   centerEntityId ? `entity:${centerEntityId}` : null
  // );

  // toggles
  const [hiddenDirectIds, setHiddenDirectIds] = useState<Set<string>>(new Set());
  const [hiddenIndirectIds, setHiddenIndirectIds] = useState<Set<string>>(new Set());
  const [bootstrappedIndirect, setBootstrappedIndirect] = useState(false);

  // derive DIRECT list (for UI)
  const directList = useMemo(() => {
    // stable id per row: owner->object
    return ownerships.map((own) => {
      const id = directId(own);
      const ownerLabel =
        own.owner.kind === "entity"
          ? entityMap.get(own.owner.id)?.name ?? own.owner.id
          : objectMap.get(own.owner.id)?.name ?? own.owner.id;
      const objectLabel = objectMap.get(own.objectId)?.name ?? own.objectId;
      return { id, own, ownerLabel, objectLabel, percent: own.percent };
    });
  }, [ownerships, entityMap, objectMap]);

  // filter DIRECT by hidden toggles
  const filteredOwnerships = useMemo(
    () => ownerships.filter((o) => !hiddenDirectIds.has(directId(o))),
    [ownerships, hiddenDirectIds]
  );

  // compute INDIRECT totals based on filtered direct ownerships
  const totals = useMemo(
    () => calculateIndirectOwnershipIds(entities, objects, filteredOwnerships),
    [entities, objects, filteredOwnerships]
  );

  const directEdgeIdsForTable = useMemo(
    () => new Set(ownerships.map((o) => directId(o))),
    [ownerships]
  );

  // build INDIRECT list (for UI)
  const indirectList = useMemo(() => {
    const rows: Array<{ id: string; sourceKey: string; objectId: string; label: string; percent: number }> = [];
    for (const [sourceKey, targets] of Object.entries(totals)) {
      for (const [objectId, pct] of Object.entries(targets)) {
        if (pct <= 0.01) continue;
        const id = indirectId(sourceKey, objectId);
        if (directEdgeIdsForTable.has(id)) continue; // don't show indirect rows that are already direct
        // make a nice label for sourceKey ("entity:x" or "object:y")
        const [kind, rawId] = sourceKey.split(":");
        const sourceLabel =
          kind === "entity"
            ? entityMap.get(rawId)?.name ?? rawId
            : objectMap.get(rawId)?.name ?? rawId;
        const objectLabel = objectMap.get(objectId)?.name ?? objectId;
        rows.push({ id, sourceKey, objectId, label: `${sourceLabel} → ${objectLabel}`, percent: pct as number });
      }
    }
    // sort high to low %
    rows.sort((a, b) => b.percent - a.percent);
    return rows;
  }, [totals, entityMap, objectMap]);

  useEffect(() => {
    if (!bootstrappedIndirect && indirectList.length) {
      // hide all indirect edges initially
      setHiddenIndirectIds(new Set(indirectList.map(d => d.id)));
      setBootstrappedIndirect(true);
    }
  }, [indirectList, bootstrappedIndirect]);

  // Keep the graph in state so drags persist
  const [nodes, setNodes] = useState<RFNode[]>([]);
  const [edges, setEdges] = useState<RFEdge[]>([]);

  // // recompute the graph when inputs/toggles change (unless manual arranging)
  // const layoutInputs = useMemo(
  //   () => ({ entities, objects, totals, hiddenIndirectEdges: hiddenIndirectIds, centerNodeId }),
  //   [entities, objects, totals, hiddenIndirectIds, centerNodeId]
  // );

  const layoutInputs = useMemo(
    () => ({
      entities,
      objects,
      totals,
      hiddenIndirectEdges: hiddenIndirectIds,
      centerNodeId: null,
      directOwnerships: filteredOwnerships,
    }),
    [entities, objects, totals, hiddenIndirectIds, filteredOwnerships]
  );

  // useEffect(() => {
  //   if (manualArrange) return;
  //   const { nodes: n, edges: e } = buildGraph(layoutInputs);
  //   setNodes(n);
  //   setEdges(e);
  // }, [layoutInputs, manualArrange]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(layoutInputs);
    setEdges(e);
    setNodes(prev => (prev.length ? prev : n)); // keep existing manual positions
  }, [layoutInputs]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // const relayout = () => {
  //   const { nodes: n, edges: e } = buildGraph(layoutInputs);
  //   setNodes(n);
  //   setEdges(e);
  // };

  // toggle helpers
  const toggleDirect = (id: string) =>
    setHiddenDirectIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleIndirect = (id: string) =>
    setHiddenIndirectIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const setAllDirect = (checked: boolean) =>
    setHiddenDirectIds(() => (checked ? new Set() : new Set(directList.map((d) => d.id))));

  const setAllIndirect = (checked: boolean) =>
    setHiddenIndirectIds(() => (checked ? new Set() : new Set(indirectList.map((d) => d.id))));

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* --------------------------- CONTROL PANE --------------------------- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* <div>
          <h3 style={{ margin: "0 0 6px" }}>Center node</h3>
          <select
            value={centerNodeId ?? ""}
            onChange={(e) => setCenterNodeId(e.target.value || null)}
            style={{ width: "100%" }}
          >
            <option value="">(auto layout)</option>
            <optgroup label="Entities">
              {entities.map((e) => (
                <option key={e.id} value={`entity:${e.id}`}>{e.name}</option>
              ))}
            </optgroup>
            <optgroup label="Objects">
              {objects.map((o) => (
                <option key={o.id} value={`object:${o.id}`}>{o.name}</option>
              ))}
            </optgroup>
          </select>
        </div> */}

        {/* <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={manualArrange}
              onChange={(e) => setManualArrange(e.target.checked)}
            />
            Manual arrange (drag to move)
          </label>
          <button onClick={relayout} style={{ padding: "4px 10px", borderRadius: 6 }}>
            Re-layout (radial)
          </button>
        </div> */}

        {/* DIRECT LIST */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>Direct ownerships</h4>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setAllDirect(true)}>Enable all</button>
              <button onClick={() => setAllDirect(false)}>Disable all</button>
            </div>
          </div>
          <div style={{ maxHeight: 200, overflow: "auto", marginTop: 8 }}>
            {directList.map((row) => {
              const checked = !hiddenDirectIds.has(row.id);
              return (
                <label key={row.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDirect(row.id)}
                  />
                  <span>{row.ownerLabel} → {row.objectLabel} ({row.percent}%)</span>
                </label>
              );
            })}
            {directList.length === 0 && <div style={{ color: "#6b7280" }}>No direct ownerships.</div>}
          </div>
          <small style={{ color: "#6b7280" }}>Unchecked rows are excluded from the indirect calculation.</small>
        </div>

        {/* INDIRECT LIST */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>Indirect edges</h4>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setAllIndirect(true)}>Show all</button>
              <button onClick={() => setAllIndirect(false)}>Hide all</button>
            </div>
          </div>
          <div style={{ maxHeight: 220, overflow: "auto", marginTop: 8 }}>
            {indirectList.map((row) => {
              const checked = !hiddenIndirectIds.has(row.id);
              return (
                <label key={row.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIndirect(row.id)}
                  />
                  <span>{row.label} ({row.percent}%)</span>
                </label>
              );
            })}
            {indirectList.length === 0 && <div style={{ color: "#6b7280" }}>No indirect edges.</div>}
          </div>
          <small style={{ color: "#6b7280" }}>Unchecked rows are hidden from the graph.</small>
        </div>
      </div>

      {/* ----------------------------- GRAPH CANVAS ----------------------------- */}
      <div style={{ height: 640 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          onNodesChange={onNodesChange}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { strokeWidth: 2, stroke: "#334155" },
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
            labelStyle: { fontWeight: 600 },
          }}
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
