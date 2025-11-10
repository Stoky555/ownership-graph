// src/components/EntitiesForm.tsx
import { useState } from "react";
import type { Entity } from "../domain/types";

type Props = {
  entities: Entity[];
  entityName: string;
  setEntityName: (v: string) => void;
  onAddEntity: () => void;
  onRenameEntity: (id: string, newName: string) => void;
  onDeleteEntity: (id: string) => void;
};

export default function EntitiesForm({
  entities,
  entityName,
  setEntityName,
  onAddEntity,
  onRenameEntity,
  onDeleteEntity,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startEdit = (e: Entity) => {
    setEditingId(e.id);
    setDraftName(e.name);
  };

  const commitEdit = () => {
    const name = draftName.trim();
    if (!editingId || !name) return cancelEdit();
    const current = entities.find((x) => x.id === editingId)?.name ?? "";
    if (name !== current) onRenameEntity(editingId, name);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  return (
    <>
      <div className="section-header" style={{ marginTop: 0 }}>
        <h2 style={{ margin: 0 }}>Entities</h2>
      </div>

      {/* Inline add row */}
      <div
        className="inline-add"
        style={{ marginTop: 8, display: "flex", gap: 8, width: "100%" }}
      >
        <input
          className="entity-input"
          style={{ flex: 1, minWidth: 0 }}              // ← grow and allow shrinking
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
          placeholder="e.g., Alice Novak or Bright Holdings s.r.o."
        />
        <button
          className="btn btn--primary"
          style={{ flex: "0 0 auto" }}                   // ← don’t stretch
          onClick={onAddEntity}
        >
          Add entity
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: 14 }}>
        {entities.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No entities yet.</p>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {entities.map((e) => {
              const isEditing = editingId === e.id;

              return (
                <li key={e.id} className="entity-row">
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
                      onClick={() => startEdit(e)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") startEdit(e);
                      }}
                      style={{ gridColumn: "1 / span 1" }}
                    >
                      {e.name}
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
                      </>
                    ) : (
                      <>
                        <button className="btn btn--ghost btn--sm" onClick={() => startEdit(e)}>
                          Rename
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => {
                            if (confirm(`Delete "${e.name}"? This also removes related ownerships.`)) {
                              onDeleteEntity(e.id);
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
