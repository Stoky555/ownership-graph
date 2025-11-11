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

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle edge table visibility */}
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={showEdgePanels}
            onChange={(e) => setShowEdgePanels(e.target.checked)}
            className="accent-blue-600"
          />
          <span>Show edge tables</span>
        </label>
      </div>

      {showEdgePanels && (
        <div className="flex flex-col gap-3">
          {/* DIRECT connections */}
          <div className="panel">
            <div className="panel-header">
              <h4 className="m-0">Direct ownerships</h4>
              <div className="flex gap-2">
                <button className="btn w-auto btn--ghost" onClick={() => setAllDirect(true)}>Enable all</button>
                <button className="btn w-auto btn--ghost" onClick={() => setAllDirect(false)}>Disable all</button>
              </div>
            </div>
            <div className="panel-content">
              <div className="max-h-[200px] overflow-y-auto grid gap-1.5">
                {directList.map((row) => {
                  const active = !hiddenDirectIds.has(row.id);
                  return (
                    <button
                      key={row.id}
                      className={`control-btn ${active ? "control-btn--active" : ""}`}
                      onClick={() => toggleDirect(row.id)}
                    >
                      {row.ownerLabel} → {row.objectLabel} ({row.percent}%)
                    </button>
                  );
                })}
                {directList.length === 0 && (
                  <div className="text-slate-500">No direct ownerships.</div>
                )}
              </div>
              <small className="text-slate-500">
                Click a connection to toggle visibility and inclusion in indirect calculations.
              </small>
            </div>
          </div>

          {/* INDIRECT connections */}
          <div className="panel">
            <div className="panel-header">
              <h4 className="m-0">Indirect edges</h4>
              <div className="flex gap-2">
                <button className="btn w-auto btn--ghost" onClick={() => setAllIndirect(true)}>Show all</button>
                <button className="btn w-auto btn--ghost" onClick={() => setAllIndirect(false)}>Hide all</button>
              </div>
            </div>
            <div className="panel-content">
              <div className="max-h-[220px] overflow-y-auto grid gap-1.5">
                {indirectList.map((row) => {
                  const active = !hiddenIndirectIds.has(row.id);
                  return (
                    <button
                      key={row.id}
                      className={`control-btn ${active ? "control-btn--active" : ""}`}
                      onClick={() => toggleIndirect(row.id)}
                    >
                      {row.label} ({row.percent}%)
                    </button>
                  );
                })}
                {indirectList.length === 0 && (
                  <div className="text-slate-500">No indirect edges.</div>
                )}
              </div>
              <small className="text-slate-500">
                Click a connection to show or hide it from the graph.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
