// src/components/ObjectsForm.tsx
import type { OwnedObject } from "../domain/types";

type Props = {
  objects: OwnedObject[];
  objectName: string;
  setObjectName: (v: string) => void;
  onAddObject: () => void;
};

export default function ObjectsForm({
  objects,
  objectName,
  setObjectName,
  onAddObject,
}: Props) {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>Objects</h2>

      <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
        Object name
      </label>
      <input
        value={objectName}
        onChange={(e) => setObjectName(e.target.value)}
        placeholder="e.g., Apartment 12A or Company XYZ"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          marginBottom: 10,
          fontSize: 16,
        }}
      />

      <button className="btn" onClick={onAddObject}>
        Add object
      </button>

      <div style={{ marginTop: 16 }}>
        {objects.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No objects yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {objects.map((o) => (
              <li key={o.id} style={{ margin: "6px 0" }}>
                {o.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
