type DirectRow = { id: string; ownerLabel: string; objectLabel: string; percent: number };
type IndirectRow = { id: string; label: string; percent: number };

export default function GraphControls({
  directList, indirectList,
  hiddenDirectIds, hiddenIndirectIds,
  toggleDirect, toggleIndirect,
  setAllDirect, setAllIndirect,
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                <input type="checkbox" checked={checked} onChange={() => toggleDirect(row.id)} />
                <span>{row.ownerLabel} → {row.objectLabel} ({row.percent}%)</span>
              </label>
            );
          })}
          {directList.length === 0 && <div style={{ color: "#6b7280" }}>No direct ownerships.</div>}
        </div>
        <small style={{ color: "#6b7280" }}>Unchecked rows are excluded from the indirect calculation.</small>
      </div>

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
                <input type="checkbox" checked={checked} onChange={() => toggleIndirect(row.id)} />
                <span>{row.label} ({row.percent}%)</span>
              </label>
            );
          })}
          {indirectList.length === 0 && <div style={{ color: "#6b7280" }}>No indirect edges.</div>}
        </div>
        <small style={{ color: "#6b7280" }}>Unchecked rows are hidden from the graph.</small>
      </div>
    </div>
  );
}
