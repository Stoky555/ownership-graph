import { Handle, Position } from "reactflow";

export default function BubbleNode({ data }: any) {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 9999,
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
