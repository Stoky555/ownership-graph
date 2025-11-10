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
    <div style={{ display: "grid", gap: 16 }}>
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
          <div key={obj.id} style={{ background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>{obj.name}</strong>
              <span>{status}</span>
            </div>

            {rows.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>No direct owners.</p>
            ) : (
              <ul style={{ paddingLeft: 18, margin: "0 0 6px 0" }}>
                {rows.map((r) => (
                  <li key={r.id}>
                    {ownerName(r)} — <strong>{r.percent}%</strong>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ fontSize: 14, color: "#374151" }}>
              Total direct: <strong>{total}%</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
