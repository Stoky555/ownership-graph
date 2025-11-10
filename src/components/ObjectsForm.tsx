// src/components/ObjectsForm.tsx
import { useState } from "react";
import type { OwnedObject } from "../domain/types";

type Props = {
  objects: OwnedObject[];
  objectName: string;
  setObjectName: (v: string) => void;
  onAddObject: () => void;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startEdit = (o: OwnedObject) => {
    setEditingId(o.id);
    setDraftName(o.name);
  };

  const commitEdit = () => {
    const name = draftName.trim();
    if (!editingId || !name) return cancelEdit();
    const current = objects.find(x => x.id === editingId)?.name ?? "";
    if (name !== current) onRenameObject(editingId, name);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  return (
    <>
      <div className="section-header" style={{ marginTop: 0 }}>
        <h2 style={{ margin: 0 }}>Objects</h2>
      </div>

      {/* Inline add row (matches EntitiesForm) */}
      <div className="inline-add" style={{ marginTop: 8, display: "flex", gap: 8, width: "100%" }}>
        <input
          className="entity-input"
          style={{ flex: 1, minWidth: 0 }}
          value={objectName}
          onChange={(e) => setObjectName(e.target.value)}
          placeholder="e.g., Building A, Warehouse 12, Final Asset J"
        />
        <button
          className="btn btn--primary"
          style={{ flex: "0 0 auto" }}
          onClick={onAddObject}
        >
          Add object
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: 14 }}>
        {objects.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No objects yet.</p>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {objects.map((o) => {
              const isEditing = editingId === o.id;

              return (
                <li key={o.id} className="entity-row">
                  {/* Left: name or editor */}
                  {isEditing ? (
                    <div className="entity-edit" style={{ gridColumn: "1 / span 1" }}>
                      <input
                        className="entity-input"
                        autoFocus
                        value={draftName}
                        onChange={(ev) => setDraftName(ev.target.value)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") commitEdit();
                          if (ev.key === "Escape") cancelEdit();
                        }}
                      />
                    </div>
                  ) : (
                    <span
                      className="entity-name"
                      role="button"
                      tabIndex={0}
                      title="Click to rename"
                      onClick={() => startEdit(o)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") startEdit(o);
                      }}
                      style={{ gridColumn: "1 / span 1" }}
                    >
                      {o.name}
                    </span>
                  )}

                  {/* Right: actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {isEditing ? (
                      <>
                        <button className="btn btn--primary btn--sm" onClick={commitEdit}>
                          Save
                        </button>
                        <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => {
                            if (confirm(`Delete "${o.name}"? This also removes related ownerships.`)) {
                              onDeleteObject(o.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn--ghost btn--sm" onClick={() => startEdit(o)}>
                          Rename
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => {
                            if (confirm(`Delete "${o.name}"? This also removes related ownerships.`)) {
                              onDeleteObject(o.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
