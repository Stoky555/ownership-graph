// src/components/ObjectsForm.tsx
import { useState } from "react";
import { OwnedObject } from "../../../domain/types";

type Props = {
  objects: OwnedObject[];
  objectName: string;
  setObjectName: (v: string) => void;
  onAddObject: () => void;
  onRenameObject: (id: string, newName: string) => void;
  onDeleteObject: (id: string) => void;
};

export default function ObjectsForm({
  objects = [],
  objectName = "",
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
      <div className="section-header">
        <h2 className="m-0 text-lg font-semibold">Objects</h2>
      </div>

      <div className="inline-add">
        <input
          className="entity-input flex-1 min-w-0"
          value={objectName}
          onChange={(e) => setObjectName(e.target.value)}
          placeholder="e.g., Building A, Warehouse 12"
        />
        <button
          className="btn btn--primary w-auto flex-none"
          onClick={onAddObject}
        >
          Add object
        </button>
      </div>

      <div className="mt-3.5">
        {objects.length === 0 ? (
          <p className="m-0 text-slate-500 text-sm">No objects yet.</p>
        ) : (
          <ul className="m-0 p-0 list-none">
            {objects.map((o) => {
              const isEditing = editingId === o.id;
              return (
                <li key={o.id} className="entity-row">
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
                      onClick={() => startEdit(o)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") startEdit(o);
                      }}
                    >
                      {o.name}
                    </span>
                  )}

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button className="btn btn--primary btn--sm w-auto" onClick={commitEdit}>
                          Save
                        </button>
                        <button className="btn btn--ghost btn--sm w-auto" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="btn btn--danger btn--sm w-auto"
                          onClick={() => {
                            if (confirm(`Delete "${o.name}"? Related ownerships removed.`)) {
                              onDeleteObject(o.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn--ghost btn--sm w-auto"
                          onClick={() => startEdit(o)}
                        >
                          Rename
                        </button>
                        <button
                          className="btn btn--danger btn--sm w-auto"
                          onClick={() => {
                            if (confirm(`Delete "${o.name}"? Related ownerships removed.`)) {
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
