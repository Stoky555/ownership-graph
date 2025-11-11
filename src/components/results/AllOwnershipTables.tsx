import { useMemo, useState } from "react";
import type { Entity, OwnedObject, Ownership } from "../../domain/types";
import { buildDirectRows, buildIndirectRows, type TotalRow } from "./normalizeTotals";
import OwnershipTable from "./OwnershipTable";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
  directTotals: any;
  indirectTotals: any;
};

export default function AllOwnershipTables({
  entities,
  objects,
  ownerships,
  directTotals,
  indirectTotals,
}: Props) {
  // Search + scope
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState({
    direct: true,
    indirect: true,
    directGroupedObject: true,
    directGroupedOwner: true,
    indirectGroupedObject: true,
    indirectGroupedOwner: true,
  });

  const directRows: TotalRow[] = useMemo(
    () => buildDirectRows(directTotals, ownerships, entities, objects).sort((a, b) => b.percent - a.percent),
    [directTotals, ownerships, entities, objects]
  );

  const indirectRows: TotalRow[] = useMemo(
    () => buildIndirectRows(indirectTotals, entities, objects).sort((a, b) => b.percent - a.percent),
    [indirectTotals, entities, objects]
  );

  const applyFilter = (rows: TotalRow[], enabled: boolean) => {
    const q = query.trim().toLowerCase();
    if (!q || !enabled) return rows;
    return rows.filter((r) => r.owner.toLowerCase().includes(q) || r.object.toLowerCase().includes(q));
  };

  // Flat tables (filtered only if their toggle is enabled)
  const directRowsFiltered = useMemo(() => applyFilter(directRows, scope.direct), [directRows, scope.direct, query]);
  const indirectRowsFiltered = useMemo(() => applyFilter(indirectRows, scope.indirect), [indirectRows, scope.indirect, query]);

  // Grouped tables (filter before grouping if that toggle is enabled)
  const directByObject = useMemo(
    () => groupRows(applyFilter(directRows, scope.directGroupedObject), "object"),
    [directRows, scope.directGroupedObject, query]
  );
  const directByOwner = useMemo(
    () => groupRows(applyFilter(directRows, scope.directGroupedOwner), "owner"),
    [directRows, scope.directGroupedOwner, query]
  );
  const indirectByObject = useMemo(
    () => groupRows(applyFilter(indirectRows, scope.indirectGroupedObject), "object"),
    [indirectRows, scope.indirectGroupedObject, query]
  );
  const indirectByOwner = useMemo(
    () => groupRows(applyFilter(indirectRows, scope.indirectGroupedOwner), "owner"),
    [indirectRows, scope.indirectGroupedOwner, query]
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Search + scope */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          background: "#f1f5f9",
          padding: "8px 12px",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search owner or object…"
          style={{
            flex: "1 1 240px",
            minWidth: 200,
            padding: "8px 10px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => setQuery("")}
          style={{
            background: "#334155",
            color: "#fff",
            border: "none",
            padding: "8px 10px",
            fontSize: 12,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Clear
        </button>

        <ScopeToggle
          label="Direct"
          checked={scope.direct}
          onChange={(v) => setScope((s) => ({ ...s, direct: v }))}
        />
        <ScopeToggle
          label="Indirect"
          checked={scope.indirect}
          onChange={(v) => setScope((s) => ({ ...s, indirect: v }))}
        />
        <ScopeToggle
          label="Direct • Obj"
          checked={scope.directGroupedObject}
          onChange={(v) => setScope((s) => ({ ...s, directGroupedObject: v }))}
        />
        <ScopeToggle
          label="Direct • Owner"
          checked={scope.directGroupedOwner}
          onChange={(v) => setScope((s) => ({ ...s, directGroupedOwner: v }))}
        />
        <ScopeToggle
          label="Indirect • Obj"
          checked={scope.indirectGroupedObject}
          onChange={(v) => setScope((s) => ({ ...s, indirectGroupedObject: v }))}
        />
        <ScopeToggle
          label="Indirect • Owner"
          checked={scope.indirectGroupedOwner}
          onChange={(v) => setScope((s) => ({ ...s, indirectGroupedOwner: v }))}
        />
      </div>

      {/* Flat tables */}
      <OwnershipTable title="Direct Ownership Connections" rows={directRowsFiltered} />
      <OwnershipTable title="Indirect Ownership Connections" rows={indirectRowsFiltered} />

      {/* Grouped tables */}
      <GroupList title="Direct grouped by Object" groups={directByObject} label="Owner" />
      <GroupList title="Direct grouped by Owner (Entity/Object)" groups={directByOwner} label="Object" />
      <GroupList title="Indirect grouped by Object" groups={indirectByObject} label="Owner" />
      <GroupList title="Indirect grouped by Owner" groups={indirectByOwner} label="Object" />
    </div>
  );
}

function ScopeToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
        background: checked ? "#2563eb" : "#e2e8f0",
        color: checked ? "#fff" : "#0f172a",
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ margin: 0 }}
      />
      {label}
    </label>
  );
}

type Group = { group: string; items: TotalRow[]; total: number };

function groupRows(rows: TotalRow[], by: "object" | "owner"): Group[] {
  const map = new Map<string, TotalRow[]>();
  for (const r of rows) {
    const key = by === "object" ? r.object : r.owner;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  const groups: Group[] = [];
  for (const [group, items] of map.entries()) {
    const total = items.reduce((s, i) => s + i.percent, 0);
    items.sort((a, b) => b.percent - a.percent);
    groups.push({ group, items, total });
  }
  groups.sort((a, b) => b.total - a.total);
  return groups;
}

function GroupList({ title, groups, label }: { title: string; groups: Group[]; label: "Owner" | "Object" }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", fontWeight: 600, background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        {title}
      </div>
      <div style={{ padding: 12, display: "grid", gap: 14 }}>
        {groups.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>No data.</div>}
        {groups.map((g) => (
          <div key={g.group} style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
            <div
              style={{
                padding: "6px 10px",
                fontWeight: 600,
                background: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span>{g.group}</span>
              <span style={{ color: "#64748b" }}>{g.total.toFixed(2)}%</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 420 }}>
                <thead>
                  <tr>
                    <Th>{label}</Th>
                    <Th style={{ textAlign: "right" }}>Percent</Th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((r, i) => (
                    <tr key={i} style={i % 2 ? { background: "#f9fafb" } : undefined}>
                      <Td>{label === "Owner" ? r.owner : r.object}</Td>
                      <Td style={{ textAlign: "right", fontWeight: 600 }}>{r.percent.toFixed(2)}%</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Th: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (p) => (
  <th
    {...p}
    style={{
      padding: "6px 10px",
      textAlign: "left",
      borderBottom: "1px solid #e2e8f0",
      fontWeight: 600,
      color: "#0f172a",
      ...p.style,
    }}
  />
);

const Td: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (p) => (
  <td
    {...p}
    style={{
      padding: "6px 10px",
      borderBottom: "1px solid #f1f5f9",
      color: "#0f172a",
      ...p.style,
    }}
  />
);