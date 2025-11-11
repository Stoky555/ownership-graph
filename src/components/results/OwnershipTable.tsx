import React from "react";

export type TotalRow = { owner: string; object: string; percent: number };

export default function OwnershipTable({ title, rows }: { title: string; rows: TotalRow[] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      <div
        style={{
          padding: "10px 14px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>{rows.length} rows</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", tableLayout: "fixed", fontSize: 14 }}>
          <thead>
            <tr>
              <Th>Owner</Th>
              <Th>Object</Th>
              <Th style={{ textAlign: "right" }}>Percent</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={i % 2 ? { background: "#f9fafb" } : undefined}>
                <Td>{r.owner}</Td>
                <Td>{r.object}</Td>
                <Td style={{ textAlign: "right", fontWeight: 600 }}>{r.percent.toFixed(2)}%</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Th: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (p) => (
  <th
    {...p}
    style={{
      padding: "8px 12px",
      textAlign: "left",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: 600,
      color: "#0f172a",
      fontSize: 13,
      ...p.style,
    }}
  />
);

const Td: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (p) => (
  <td
    {...p}
    style={{
      padding: "8px 12px",
      borderBottom: "1px solid #f1f5f9",
      color: "#0f172a",
      verticalAlign: "top",
      ...p.style,
    }}
  />
);