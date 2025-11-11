import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, applyNodeChanges, type Node as RFNode, type Edge as RFEdge, type OnNodesChange } from "reactflow";
import "reactflow/dist/style.css";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import GraphControls from "./GraphControls";
import { useOwnershipLayers } from "../hooks/useOwnershipLayers";
import { buildGraph } from "../graph/buildGraph";
import BubbleNode from "../graph/BubbleNode";
import { SimpleBezierEdge } from "reactflow";

const nodeTypes = { bubble: BubbleNode };
const edgeTypes = { simplebezier: SimpleBezierEdge };

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

  const [showEdgePanels, setShowEdgePanels] = useState(true);
  
  const [isDragging, setIsDragging] = useState(false);

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

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "simplebezier",
      animated: isDragging,
      style: { strokeWidth: 2, stroke: "#334155" },
      labelStyle: { fontWeight: 600 },
    }),
    [isDragging]
  );

  const displayedEdges = useMemo(() => {
    if (!isDragging) return edges;      // keep labels normally
    return edges.map(e => ({
      ...e,
      label: undefined,                 // hide during drag for performance
      labelBgPadding: undefined as any,
      labelBgBorderRadius: undefined as any,
    }));
  }, [edges, isDragging]);

  return (
    <div className="flex flex-col gap-4">
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

      <div className="h-[640px]">
        <ReactFlow
          nodes={nodes}
          edges={displayedEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable
          onNodesChange={onNodesChange}
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodeDrag={() => setIsDragging(true)}
          onNodeDragStop={() => setIsDragging(false)}
          snapToGrid
          snapGrid={[12, 12]}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
