import type { Entity, OwnedObject, Ownership } from "../../domain/types";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
};

export default function DirectSummary({ entities, objects, ownerships }: Props) {
  const byObject = new Map<string, Ownership[]>();
  for (const o of ownerships) {
    if (!byObject.has(o.objectId)) byObject.set(o.objectId, []);
    byObject.get(o.objectId)!.push(o);
  }

  return (
    <div className="grid gap-4">
      {objects.map((obj) => {
        const rows = byObject.get(obj.id) ?? [];
        const total = rows.reduce((s, r) => s + r.percent, 0);
        const ownerName = (r: Ownership) =>
          r.owner.kind === "entity"
            ? (entities.find((e) => e.id === r.owner.id)?.name ?? "Unknown entity")
            : (objects.find((o) => o.id === r.owner.id)?.name ?? "Unknown object");

        const status =
          total > 100 ? "⚠ exceeds 100%" :
          total < 100 && rows.length > 0 ? "ℹ below 100%" :
          rows.length === 0 ? "— no owners —" :
          "✓ ok";

        return (
          <div key={obj.id} className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex justify-between mb-2">
              <strong>{obj.name}</strong>
              <span>{status}</span>
            </div>

            {rows.length === 0 ? (
              <p className="m-0 text-slate-500">No direct owners.</p>
            ) : (
              <ul className="pl-5 mb-1.5 mt-0 list-disc">
                {rows.map((r) => (
                  <li key={r.id}>
                    {ownerName(r)} — <strong>{r.percent}%</strong>
                  </li>
                ))}
              </ul>
            )}

            <div className="text-sm text-slate-700">
              Total direct: <strong>{total}%</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
