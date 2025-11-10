// src/components/OwnershipForm.tsx
import { useMemo, useState } from "react";
import type { Entity, OwnedObject, Ownership } from "../domain/types";

type OwnerKind = "entity" | "object";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];

  // add form state (you already have these)
  ownerKind: OwnerKind;
  setOwnerKind: (k: OwnerKind) => void;

  ownerEntityId: string;
  setOwnerEntityId: (v: string) => void;

  ownerObjectOwnerId: string;
  setOwnerObjectOwnerId: (v: string) => void;

  ownershipPercent: string;
  setOwnershipPercent: (v: string) => void;

  selectedObjectId: string;
  setSelectedObjectId: (v: string) => void;

  onAddOwnership: () => void;

  // NEW for editing rows
  onUpdateOwnership: (
    id: string,
    patch: Partial<Pick<Ownership, "owner" | "objectId" | "percent">>
  ) => void;
  onDeleteOwnership: (id: string) => void;
};

export default function OwnershipForm({
  entities, objects, ownerships,
  ownerKind, setOwnerKind,
  ownerEntityId, setOwnerEntityId,
  ownerObjectOwnerId, setOwnerObjectOwnerId,
  ownershipPercent, setOwnershipPercent,
  selectedObjectId, setSelectedObjectId,
  onAddOwnership,
  onUpdateOwnership,
  onDeleteOwnership,
}: Props) {
  // inline-edit state for a row
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftKind, setDraftKind] = useState<OwnerKind>("entity");
  const [draftOwnerId, setDraftOwnerId] = useState("");
  const [draftObjectId, setDraftObjectId] = useState("");
  const [draftPercent, setDraftPercent] = useState<string>("");

  const entityMap = useMemo(() => new Map(entities.map(e => [e.id, e.name])), [entities]);
  const objectMap = useMemo(() => new Map(objects.map(o => [o.id, o.name])), [objects]);

  const beginEdit = (o: Ownership) => {
    setEditingId(o.id);
    const k: OwnerKind = o.owner.kind;
    setDraftKind(k);
    setDraftOwnerId(o.owner.id);
    setDraftObjectId(o.objectId);
    setDraftPercent(String(o.percent));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftOwnerId("");
    setDraftObjectId("");
    setDraftPercent("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const p = Number(draftPercent);
    if (!Number.isFinite(p) || p <= 0 || p > 100) {
      alert("Percent must be between 0 and 100.");
      return;
    }
    onUpdateOwnership(editingId, {
      owner: { kind: draftKind, id: draftOwnerId } as Ownership["owner"],
      objectId: draftObjectId,
      percent: p,
    });
    cancelEdit();
  };

  const ownerLabel = (o: Ownership) =>
    o.owner.kind === "entity"
      ? (entityMap.get(o.owner.id) ?? o.owner.id)
      : (objectMap.get(o.owner.id) ?? o.owner.id);

  const objectLabel = (o: Ownership) => objectMap.get(o.objectId) ?? o.objectId;

  return (
    <>
      <div className="section-header" style={{ marginTop: 0 }}>
        <h2 style={{ margin: 0 }}>Ownership</h2>
      </div>

      {/* Inline add row — styled like other forms */}
      <div className="inline-add" style={{
        marginTop: 8,
        display: "grid",
        gap: 8,
        gridTemplateColumns: "minmax(120px, 1fr) minmax(160px, 2fr) minmax(120px, 1fr) minmax(160px, 2fr) auto"
      }}>
        {/* owner kind */}
        <div className="entity-input" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="add_ownerKind"
              value="entity"
              checked={ownerKind === "entity"}
              onChange={() => { setOwnerKind("entity"); setOwnerObjectOwnerId(""); }}
            />
            Entity
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="add_ownerKind"
              value="object"
              checked={ownerKind === "object"}
              onChange={() => { setOwnerKind("object"); setOwnerEntityId(""); }}
            />
            Object
          </label>
        </div>

        {/* owner select */}
        {ownerKind === "entity" ? (
          <select
            className="entity-input"
            value={ownerEntityId}
            onChange={(e) => setOwnerEntityId(e.target.value)}
          >
            <option value="">— choose entity —</option>
            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        ) : (
          <select
            className="entity-input"
            value={ownerObjectOwnerId}
            onChange={(e) => setOwnerObjectOwnerId(e.target.value)}
          >
            <option value="">— choose object —</option>
            {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}

        {/* percent */}
        <input
          className="entity-input"
          type="number"
          inputMode="decimal"
          min="0" max="100" step="0.01"
          value={ownershipPercent}
          onChange={(e) => setOwnershipPercent(e.target.value)}
          placeholder="e.g., 25"
        />

        {/* target object */}
        <select
          className="entity-input"
          value={selectedObjectId}
          onChange={(e) => setSelectedObjectId(e.target.value)}
        >
          <option value="">— choose object —</option>
          {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>

        <button className="btn btn--primary" onClick={onAddOwnership}>Add ownership</button>
      </div>

      {/* List */}
      <div style={{ marginTop: 14 }}>
        {ownerships.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>No ownership entries yet.</p>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {ownerships.map((o) => {
              const isEditing = editingId === o.id;

              return (
                <li key={o.id} className="entity-row">
                  {/* left cell: display or editor */}
                  {!isEditing ? (
                    <span
                      className="entity-name"
                      role="button"
                      tabIndex={0}
                      title="Click to edit"
                      onClick={() => beginEdit(o)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") beginEdit(o);
                      }}
                      style={{ gridColumn: "1 / span 1" }}
                    >
                      <strong>{ownerLabel(o)}</strong> → <strong>{objectLabel(o)}</strong> ({o.percent}%)
                    </span>
                  ) : (
                    <div className="entity-edit" style={{ gridColumn: "1 / span 1", display: "grid", gap: 8,
                      gridTemplateColumns: "minmax(110px,1fr) minmax(160px,2fr) minmax(120px,1fr) minmax(160px,2fr)" }}>
                      {/* owner kind */}
                      <div className="entity-input" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="radio"
                            name={`edit_kind_${o.id}`}
                            value="entity"
                            checked={draftKind === "entity"}
                            onChange={() => setDraftKind("entity")}
                          />
                          Entity
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="radio"
                            name={`edit_kind_${o.id}`}
                            value="object"
                            checked={draftKind === "object"}
                            onChange={() => setDraftKind("object")}
                          />
                          Object
                        </label>
                      </div>

                      {/* owner select */}
                      {draftKind === "entity" ? (
                        <select
                          className="entity-input"
                          value={draftOwnerId}
                          onChange={(e) => setDraftOwnerId(e.target.value)}
                        >
                          {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      ) : (
                        <select
                          className="entity-input"
                          value={draftOwnerId}
                          onChange={(e) => setDraftOwnerId(e.target.value)}
                        >
                          {objects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                        </select>
                      )}

                      {/* percent */}
                      <input
                        className="entity-input"
                        type="number"
                        inputMode="decimal"
                        min="0" max="100" step="0.01"
                        value={draftPercent}
                        onChange={(e) => setDraftPercent(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                      />

                      {/* object */}
                      <select
                        className="entity-input"
                        value={draftObjectId}
                        onChange={(e) => setDraftObjectId(e.target.value)}
                      >
                        {objects.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* right cell: actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {isEditing ? (
                      <>
                        <button className="btn btn--primary btn--sm" onClick={saveEdit}>Save</button>
                        <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancel</button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => {
                            if (confirm(`Delete this ownership?`)) onDeleteOwnership(o.id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn--ghost btn--sm" onClick={() => beginEdit(o)}>Edit</button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => {
                            if (confirm(`Delete ${ownerLabel(o)} → ${objectLabel(o)}?`)) onDeleteOwnership(o.id);
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
