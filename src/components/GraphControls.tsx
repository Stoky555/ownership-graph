import { useState } from "react";

type DirectRow = { id: string; ownerLabel: string; objectLabel: string; percent: number };
type IndirectRow = { id: string; label: string; percent: number };

export default function GraphControls({
  directList,
  indirectList,
  hiddenDirectIds,
  hiddenIndirectIds,
  toggleDirect,
  toggleIndirect,
  setAllDirect,
  setAllIndirect,
}: {
  directList: DirectRow[];
  indirectList: IndirectRow[];
  hiddenDirectIds: Set<string>;
  hiddenIndirectIds: Set<string>;
  toggleDirect: (id: string) => void;
  toggleIndirect: (id: string) => void;
  setAllDirect: (checked: boolean) => void;
  setAllIndirect: (checked: boolean) => void;
}) {
  const [showEdgePanels, setShowEdgePanels] = useState(true);

  // shared button style helper
  const buttonStyle = (active: boolean): React.CSSProperties => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: active ? "#f1f5f9" : "#f1f5f9aa", // slight blur for inactive
    color: active ? "#111827" : "#9ca3af",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Toggle edge table visibility */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={showEdgePanels}
            onChange={(e) => setShowEdgePanels(e.target.checked)}
          />
          Show edge tables
        </label>
      </div>

      {showEdgePanels && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* DIRECT connections */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h4 style={{ margin: 0 }}>Direct ownerships</h4>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setAllDirect(true)}>Enable all</button>
                <button onClick={() => setAllDirect(false)}>Disable all</button>
              </div>
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto", display: "grid", gap: 6 }}>
              {directList.map((row) => {
                const active = !hiddenDirectIds.has(row.id);
                return (
                  <button
                    key={row.id}
                    onClick={() => toggleDirect(row.id)}
                    style={buttonStyle(active)}
                  >
                    {row.ownerLabel} → {row.objectLabel} ({row.percent}%)
                  </button>
                );
              })}
              {directList.length === 0 && (
                <div style={{ color: "#6b7280" }}>No direct ownerships.</div>
              )}
            </div>
            <small style={{ color: "#6b7280" }}>
              Click a connection to toggle visibility and inclusion in indirect calculations.
            </small>
          </div>

          {/* INDIRECT connections */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h4 style={{ margin: 0 }}>Indirect edges</h4>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setAllIndirect(true)}>Show all</button>
                <button onClick={() => setAllIndirect(false)}>Hide all</button>
              </div>
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 6 }}>
              {indirectList.map((row) => {
                const active = !hiddenIndirectIds.has(row.id);
                return (
                  <button
                    key={row.id}
                    onClick={() => toggleIndirect(row.id)}
                    style={buttonStyle(active)}
                  >
                    {row.label} ({row.percent}%)
                  </button>
                );
              })}
              {indirectList.length === 0 && (
                <div style={{ color: "#6b7280" }}>No indirect edges.</div>
              )}
            </div>
            <small style={{ color: "#6b7280" }}>
              Click a connection to show or hide it from the graph.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
