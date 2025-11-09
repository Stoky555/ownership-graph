// src/components/GraphView.tsx
import { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import { calculateIndirectOwnershipIds } from "../domain/calculateIndirectOwnershipIds";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
  mode?: "direct" | "indirect";   // ← add this
};

export default function GraphView({ entities, objects, ownerships, mode = "direct" }: Props) {
  const { nodes, edges } = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];

    // simple left/right layout: entities on the left, objects on the right
    entities.forEach((e, i) => {
      nodes.push({
        id: `entity:${e.id}`,
        position: { x: 0, y: i * 80 },
        data: { label: e.name },
        style: { background: "#eef2ff", padding: 6, borderRadius: 8, border: "1px solid #c7d2fe" },
      });
    });

    objects.forEach((o, i) => {
      nodes.push({
        id: `object:${o.id}`,
        position: { x: 380, y: i * 80 },
        data: { label: o.name },
        style: { background: "#ecfdf5", padding: 6, borderRadius: 8, border: "1px solid #a7f3d0" },
      });
    });

    if (mode === "indirect") {
        const totals = calculateIndirectOwnershipIds(entities, objects, ownerships);
        for (const [sourceKey, targets] of Object.entries(totals)) {
            for (const [objectId, pct] of Object.entries(targets)) {
            if (pct <= 0.01) continue; // skip tiny contributions
            edges.push({
                id: `${sourceKey}->object:${objectId}`,
                source: sourceKey,               // "entity:<id>" OR "object:<id>"
                target: `object:${objectId}`,
                label: `${pct}%`,
                labelBgPadding: [6, 2],
                labelBgBorderRadius: 4,
            });
            }
        }
    } else {
    // direct edges (includes object→object)
        ownerships.forEach((own) => {
            const source = `${own.owner.kind}:${own.owner.id}`;
            const target = `object:${own.objectId}`;
            edges.push({
            id: `${source}->${target}`,
            source,
            target,
            label: `${own.percent}%`,
            labelBgPadding: [6, 2],
            labelBgBorderRadius: 4,
            });
        });
    }

    return { nodes, edges };
  }, [entities, objects, ownerships, mode]);

  return (
    <div style={{ height: 420 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
