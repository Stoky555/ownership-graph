// src/components/EntitiesForm.tsx
import type { Entity } from "../domain/types";

type Props = {
  entities: Entity[];
  entityName: string;
  setEntityName: (v: string) => void;
  onAddEntity: () => void;
};

export default function EntitiesForm({
  entities,
  entityName,
  setEntityName,
  onAddEntity,
}: Props) {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>Entities</h2>

      <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
        Entity name
      </label>
      <input
        value={entityName}
        onChange={(e) => setEntityName(e.target.value)}
        placeholder="e.g., Alice Novak or Bright Holdings s.r.o."
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          marginBottom: 10,
          fontSize: 16,
        }}
      />

      <button className="btn" onClick={onAddEntity}>
        Add entity
      </button>

      <div style={{ marginTop: 16 }}>
        {entities.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No entities yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {entities.map((e) => (
              <li key={e.id} style={{ margin: "6px 0" }}>
                {e.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
