// src/components/OwnershipForm.tsx
import type { Entity, OwnedObject, Ownership } from "../domain/types";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];

  ownerKind: "entity" | "object";
  setOwnerKind: (k: "entity" | "object") => void;

  ownerEntityId: string;
  setOwnerEntityId: (v: string) => void;

  ownerObjectOwnerId: string;
  setOwnerObjectOwnerId: (v: string) => void;

  ownershipPercent: string;
  setOwnershipPercent: (v: string) => void;

  selectedObjectId: string;
  setSelectedObjectId: (v: string) => void;

  onAddOwnership: () => void;
};

export default function OwnershipForm({
  entities, objects, ownerships,
  ownerKind, setOwnerKind,
  ownerEntityId, setOwnerEntityId,
  ownerObjectOwnerId, setOwnerObjectOwnerId,
  ownershipPercent, setOwnershipPercent,
  selectedObjectId, setSelectedObjectId,
  onAddOwnership,
}: Props) {
  return (
    <>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Ownership</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {/* Owner type toggle */}
        <label style={{ fontSize: 14, display: "block", marginBottom: 6 }}>
          Owner is:
        </label>
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="ownerKind"
              value="entity"
              checked={ownerKind === "entity"}
              onChange={() => {
                setOwnerKind("entity");
                setOwnerObjectOwnerId("");
              }}
            />
            Entity
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="ownerKind"
              value="object"
              checked={ownerKind === "object"}
              onChange={() => {
                setOwnerKind("object");
                setOwnerEntityId("");
              }}
            />
            Object
          </label>
        </div>

        {/* Owner picker (switches by ownerKind) */}
        {ownerKind === "entity" ? (
          <label style={{ fontSize: 14, display: "block" }}>
            Owner (Entity)
            <select
              value={ownerEntityId}
              onChange={(e) => setOwnerEntityId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 6, marginBottom: 10, fontSize: 16 }}
            >
              <option value="">— choose entity —</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <label style={{ fontSize: 14, display: "block" }}>
            Owner (Object)
            <select
              value={ownerObjectOwnerId}
              onChange={(e) => setOwnerObjectOwnerId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 6, marginBottom: 10, fontSize: 16 }}
            >
              <option value="">— choose object —</option>
              {objects.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
        )}

        {/* Percent input */}
        <label style={{ fontSize: 14 }}>
          Percent
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            value={ownershipPercent}
            onChange={(e) => setOwnershipPercent(e.target.value)}
            placeholder="e.g., 25"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 6, fontSize: 16 }}
          />
        </label>

        {/* Object select */}
        <label style={{ fontSize: 14 }}>
          Object (owned thing)
          <select
            value={selectedObjectId}
            onChange={(e) => setSelectedObjectId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 6, fontSize: 16 }}
          >
            <option value="">— choose object —</option>
            {objects.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>

        <button className="btn" onClick={onAddOwnership}>
          Add ownership
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {ownerships.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No ownership entries yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {ownerships.map(o => {
              const ownerName =
                o.owner.kind === "entity"
                  ? (entities.find(e => e.id === o.owner.id)?.name ?? "Unknown entity")
                  : (objects.find(ob => ob.id === o.owner.id)?.name ?? "Unknown object");

              const objName = objects.find(ob => ob.id === o.objectId)?.name ?? "Unknown object";

              return (
                <li key={o.id} style={{ margin: "6px 0" }}>
                  <strong>{ownerName}</strong> owns <strong>{o.percent}%</strong> of <strong>{objName}</strong>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
