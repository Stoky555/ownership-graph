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
      <div className="section-header">
        <h2 className="m-0 text-lg font-semibold">Entities</h2>
      </div>

      <div className="inline-add">
        <input
          className="entity-input flex-1 min-w-0"
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
          placeholder="e.g., Alice Novak or Bright Holdings s.r.o."
        />
        <button
          className="btn btn--primary w-auto flex-none"
          onClick={onAddEntity}
        >
          Add entity
        </button>
      </div>

      <div className="mt-3.5">
        {entities.length === 0 ? (
          <p className="m-0 text-slate-500">No entities yet.</p>
        ) : (
          <ul className="m-0 p-0 list-none">
            {entities.map((e) => {
              const isEditing = editingId === e.id;
              return (
                <li key={e.id} className="entity-row">
                  {isEditing ? (
                    <div className="entity-edit col-span-1">
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
                      className="entity-name col-span-1"
                      role="button"
                      tabIndex={0}
                      title="Click to rename"
                      onClick={() => startEdit(e)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") startEdit(e);
                      }}
                    >
                      {e.name}
                    </span>
                  )}

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button className="btn btn--primary btn--sm w-auto" onClick={commitEdit}>Save</button>
                        <button className="btn btn--ghost btn--sm w-auto" onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn--ghost btn--sm w-auto" onClick={() => startEdit(e)}>Rename</button>
                        <button
                          className="btn btn--danger btn--sm w-auto"
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
