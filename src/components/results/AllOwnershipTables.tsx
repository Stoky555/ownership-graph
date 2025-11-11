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
    <div className="grid gap-4">
      {/* Search + scope */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-100 p-3 border border-slate-200 rounded-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search owner or object…"
          className="entity-input flex-[1_1_240px] min-w-[200px]"
        />
        <button type="button" onClick={() => setQuery("")} className="btn w-auto btn--ghost text-sm">
          Clear
        </button>

        <div className="flex flex-wrap gap-2">
          <ScopeToggle label="Direct" checked={scope.direct} onChange={(v) => setScope((s) => ({ ...s, direct: v }))} />
          <ScopeToggle label="Indirect" checked={scope.indirect} onChange={(v) => setScope((s) => ({ ...s, indirect: v }))} />
          <ScopeToggle label="Direct • Obj" checked={scope.directGroupedObject} onChange={(v) => setScope((s) => ({ ...s, directGroupedObject: v }))} />
          <ScopeToggle label="Direct • Owner" checked={scope.directGroupedOwner} onChange={(v) => setScope((s) => ({ ...s, directGroupedOwner: v }))} />
          <ScopeToggle label="Indirect • Obj" checked={scope.indirectGroupedObject} onChange={(v) => setScope((s) => ({ ...s, indirectGroupedObject: v }))} />
          <ScopeToggle label="Indirect • Owner" checked={scope.indirectGroupedOwner} onChange={(v) => setScope((s) => ({ ...s, indirectGroupedOwner: v }))} />
        </div>
      </div>

      {/* Flat tables */}
      {scope.direct && <OwnershipTable title="Direct Ownership Connections" rows={directRowsFiltered} />}
      {scope.indirect && <OwnershipTable title="Indirect Ownership Connections" rows={indirectRowsFiltered} />}

      {/* Grouped tables */}
      {scope.directGroupedObject && <GroupList title="Direct grouped by Object" groups={directByObject} label="Owner" />}
      {scope.directGroupedOwner && <GroupList title="Direct grouped by Owner (Entity/Object)" groups={directByOwner} label="Object" />}
      {scope.indirectGroupedObject && <GroupList title="Indirect grouped by Object" groups={indirectByObject} label="Owner" />}
      {scope.indirectGroupedOwner && <GroupList title="Indirect grouped by Owner" groups={indirectByOwner} label="Object" />}
    </div>
  );
}

function ScopeToggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <label className="inline-flex items-center select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition
                   bg-white text-slate-700 border-slate-300 shadow-sm
                   peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600
                   peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/60"
      >
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100 transition text-white"
        >
          <path fill="currentColor" d="M8.143 14.314 3.57 9.742l1.414-1.414 3.159 3.159 6.873-6.873 1.414 1.414z" />
        </svg>
        {label}
      </span>
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
    <div className="panel">
      <div className="panel-header">{title}</div>
      <div className="p-3 grid gap-3.5">
        {groups.length === 0 && <div className="text-slate-500 text-sm">No data.</div>}
        {groups.map((g) => (
          <div key={g.group} className="border border-slate-200 rounded-md overflow-hidden">
            <div className="px-2.5 py-1.5 font-semibold bg-slate-50 flex justify-between text-[13px]">
              <span>{g.group}</span>
              <span className="text-slate-500">{g.total.toFixed(2)}%</span>
            </div>
            <div className="table-wrap">
              <table className="tbl min-w-[420px]">
                <thead>
                  <tr>
                    <Th>{label}</Th>
                    <Th className="text-right">Percent</Th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((r, i) => (
                    <tr key={i} className={i % 2 ? "tr-alt" : ""}>
                      <Td>{label === "Owner" ? r.owner : r.object}</Td>
                      <Td className="text-right font-semibold">{r.percent.toFixed(2)}%</Td>
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

const Th: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className = "", ...p }) => (
  <th {...p} className={`th ${className}`} />
);

const Td: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({ className = "", ...p }) => (
  <td {...p} className={`td ${className}`} />
);