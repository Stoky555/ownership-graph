import React from "react";

export type TotalRow = { owner: string; object: string; percent: number };

export default function OwnershipTable({ title, rows, help }: { title: string; rows: TotalRow[]; help?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{rows.length} rows</span>
          {help && (
            <button
              type="button"
              className="btn btn--ghost btn--xs w-auto"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="About this table"
              title="About this table"
            >
              ?
            </button>
          )}
        </div>
      </div>

      {help && open && (
        <div className="px-3 py-2 text-xs sm:text-sm text-slate-700 bg-slate-50 border-b border-slate-200">
          {help}
        </div>
      )}

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <Th>Owner</Th>
              <Th>Object</Th>
              <Th className="text-right">Percent</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 ? "tr-alt" : ""}>
                <Td>{r.owner}</Td>
                <Td>{r.object}</Td>
                <Td className="text-right font-semibold">{r.percent.toFixed(2)}%</Td>
              </tr>
            ))}
          </tbody>
        </table>
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