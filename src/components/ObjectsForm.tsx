// src/components/ObjectsForm.tsx
import { useState } from "react";
import type { OwnedObject } from "../domain/types";

type Props = {
  objects: OwnedObject[];
  objectName: string;
  setObjectName: (v: string) => void;
  onAddObject: () => void;

  // NEW:
  onRenameObject: (id: string, newName: string) => void;
  onDeleteObject: (id: string) => void;
};

export default function ObjectsForm({
  objects,
  objectName,
  setObjectName,
  onAddObject,
  onRenameObject,
  onDeleteObject,
}: Props) {
  // local inline-edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const startEdit = (o: OwnedObject) => {
    setEditingId(o.id);
    setEditingName(o.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };
  const saveEdit = () => {
    if (!editingId) return;
    onRenameObject(editingId, editingName);
    cancelEdit();
  };

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
      <button className="btn" onClick={onAddObject}>Add object</button>

      <div style={{ marginTop: 16 }}>
        {objects.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No objects yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {objects.map((o) => {
              const isEditing = editingId === o.id;
              return (
                <li key={o.id} style={{ margin: "8px 0" }}>
                  {!isEditing ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span
                        style={{ cursor: "pointer", padding: "4px 0" }}
                        onClick={() => startEdit(o)}
                        title="Click to edit"
                      >
                        {o.name}
                      </span>
                      <button
                        className="btn"
                        style={{ width: "auto", background: "#ef4444" }}
                        onClick={() => onDeleteObject(o.id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: 16,
                        }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" style={{ width: "auto" }} onClick={saveEdit}>
                          Save
                        </button>
                        <button
                          className="btn"
                          style={{ width: "auto", background: "#64748b" }}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn"
                          style={{ width: "auto", background: "#ef4444" }}
                          onClick={() => {
                            onDeleteObject(o.id);
                            cancelEdit();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
