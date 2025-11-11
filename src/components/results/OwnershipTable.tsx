import React from "react";

export type TotalRow = { owner: string; object: string; percent: number };

export default function OwnershipTable({ title, rows }: { title: string; rows: TotalRow[] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>{title}</span>
        <span className="text-xs text-slate-500">{rows.length} rows</span>
      </div>
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