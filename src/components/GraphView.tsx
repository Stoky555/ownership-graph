import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, applyNodeChanges, type Node as RFNode, type Edge as RFEdge, type OnNodesChange } from "reactflow";
import "reactflow/dist/style.css";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import GraphControls from "./GraphControls";
import { useOwnershipLayers } from "../hooks/useOwnershipLayers";
import { buildGraph } from "../graph/buildGraph";
import BubbleNode from "../graph/BubbleNode";

const nodeTypes = { bubble: BubbleNode };

type Props = { entities: Entity[]; objects: OwnedObject[]; ownerships: Ownership[] };

export default function GraphView({ entities, objects, ownerships }: Props) {
  const {
    directList, indirectList, totals, filteredOwnerships,
    hiddenDirectIds, hiddenIndirectIds, setHiddenDirectIds, setHiddenIndirectIds
  } = useOwnershipLayers(entities, objects, ownerships);

  // togglers
  const toggleDirect   = (id: string) => setHiddenDirectIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleIndirect = (id: string) => setHiddenIndirectIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const setAllDirect   = (checked: boolean) => setHiddenDirectIds(() => (checked ? new Set() : new Set(directList.map(d => d.id))));
  const setAllIndirect = (checked: boolean) => setHiddenIndirectIds(() => (checked ? new Set() : new Set(indirectList.map(d => d.id))));

  // graph state
  const [nodes, setNodes] = useState<RFNode[]>([]);
  const [edges, setEdges] = useState<RFEdge[]>([]);

  const layoutInputs = useMemo(() => ({
    entities, objects, totals, hiddenIndirectEdges: hiddenIndirectIds, centerNodeId: null, directOwnerships: filteredOwnerships,
  }), [entities, objects, totals, hiddenIndirectIds, filteredOwnerships]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(layoutInputs);
    setEdges(e);
    setNodes(prev => (prev.length ? prev : n));
  }, [layoutInputs]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GraphControls
        directList={directList}
        indirectList={indirectList}
        hiddenDirectIds={hiddenDirectIds}
        hiddenIndirectIds={hiddenIndirectIds}
        toggleDirect={toggleDirect}
        toggleIndirect={toggleIndirect}
        setAllDirect={setAllDirect}
        setAllIndirect={setAllIndirect}
      />

      <div style={{ height: 640 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable
          onNodesChange={onNodesChange}
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { strokeWidth: 2, stroke: "#334155" },
            labelStyle: { fontWeight: 600 },
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
