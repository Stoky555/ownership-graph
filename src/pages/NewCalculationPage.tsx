import { useEffect, useState } from "react";
import type { OwnedObject, Entity, Ownership } from "../domain/types";
import { useNavigate } from "react-router-dom";
import SectionTabs from "../components/SectionTabs";
import NewCalcSection from "../components/NewCalcSection";
import { mockEntities, mockObjects, mockOwnerships } from "../domain/mockData";

export default function NewCalculationPage() {
  const [section, setSection] = useState<"objects" | "entities" | "ownership" | "result">("objects");

  const [objects, setObjects] = useState<OwnedObject[]>([]);
  const [objectName, setObjectName] = useState("");
  const onAddObject = () => {
    const name = objectName.trim();
    if (!name) return;
    const duplicate = objects.some(o => o.name.toLowerCase() === name.toLowerCase());
    if (duplicate) { alert("An object with that name already exists."); return; }
    const newObj: OwnedObject = { id: crypto.randomUUID(), name };
    setObjects(prev => [...prev, newObj]);
    setObjectName("");
  };

  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityName, setEntityName] = useState("");
  const onAddEntity = () => {
    const name = entityName.trim();
    if (!name) return;
    const duplicate = entities.some(e => e.name.toLowerCase() === name.toLowerCase());
    if (duplicate) { alert("An entity with that name already exists."); return; }
    const e: Entity = { id: crypto.randomUUID(), name };
    setEntities(prev => [...prev, e]);
    setEntityName("");
  };

  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string>("");
  const [ownershipPercent, setOwnershipPercent] = useState<string>("");
  const [ownerKind, setOwnerKind] = useState<"entity" | "object">("entity");

  // selected owner id depending on the kind
  const [ownerEntityId, setOwnerEntityId] = useState<string>("");
  const [ownerObjectOwnerId, setOwnerObjectOwnerId] = useState<string>("");

  // load preset dataset
  const loadSample = () => {
    setObjects(mockObjects);
    setEntities(mockEntities);
    setOwnerships(mockOwnerships);
    setSection("ownership");
  };

  // clear everything
  const clearAll = () => {
    setObjects([]);
    setEntities([]);
    setOwnerships([]);
    setSection("objects");
  };

  // optional: auto-load when ?mock=1 is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mock") === "1") loadSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddOwnership = () => {
    // Validate owner
    let ownerId: string | null = null;
    if (ownerKind === "entity") ownerId = ownerEntityId || null;
    else ownerId = ownerObjectOwnerId || null;
    if (!ownerId) { alert("Pick an owner."); return; }

    // Validate target object
    if (!selectedObjectId) { alert("Pick a target object."); return; }

    // Validate percent
    const p = Number(ownershipPercent);
    if (!Number.isFinite(p) || p <= 0 || p > 100) {
      alert("Percent must be between 0 and 100.");
      return;
    }

    const ownerRef: Ownership["owner"] =
      ownerKind === "entity"
        ? { kind: "entity", id: ownerId }
        : { kind: "object", id: ownerId };

    const exists = ownerships.some(
      (o) =>
        o.objectId === selectedObjectId &&
        o.owner.kind === ownerRef.kind &&
        o.owner.id === ownerRef.id
    );
    if (exists) { alert("This ownership relationship already exists."); return; }

    const newOwn: Ownership = {
      id: crypto.randomUUID(),
      owner: ownerRef,
      objectId: selectedObjectId,
      percent: p,
    };

    setOwnerships(prev => [...prev, newOwn]);
    setOwnershipPercent("");
  };

  const navigate = useNavigate();

  function onDeleteObject(id: string): void {
    setObjects(prev => prev.filter(o => o.id !== id));
    setOwnerships(prev =>
      prev.filter(o => o.objectId !== id && !(o.owner.kind === "object" && o.owner.id === id))
    );
    setSelectedObjectId(prev => (prev === id ? "" : prev));
  }

  function onRenameObject(id: string, newName: string): void {
    const name = newName.trim();
    if (!name) return;
    const exists = objects.some(o => o.id !== id && o.name.toLowerCase() === name.toLowerCase());
    if (exists) { alert("An object with that name already exists."); return; }
    setObjects(prev => prev.map(o => (o.id === id ? { ...o, name } : o)));
  }

  const onRenameEntity = (id: string, newName: string) =>
    setEntities(prev => prev.map(e => (e.id === id ? { ...e, name: newName } : e)));

  const onDeleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    setOwnerships(prev =>
      prev.filter(o => !(o.owner.kind === "entity" && o.owner.id === id))
    );
  };

  const onUpdateOwnership = (id: string, patch: Partial<Pick<Ownership,"owner"|"objectId"|"percent">>) =>
    setOwnerships(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));

  const onDeleteOwnership = (id: string) =>
    setOwnerships(prev => prev.filter(o => o.id !== id));

  return (
    <main className="app-shell">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold">New Calculation</h1>
      </header>

      {/* Keep tabs visible on result. If you want to hide them too, wrap in section !== "result". */}
      <SectionTabs value={section} onChange={setSection} />

      {section !== "result" && (
        <div className="flex gap-2 mb-3">
          <button className="btn w-auto bg-cyan-500 hover:bg-cyan-600" onClick={loadSample}>
            ⤓ Load sample data
          </button>
          <button className="btn w-auto btn--danger" onClick={clearAll}>
            ✖ Clear all
          </button>
          <button
            className="btn w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => setSection("result")}
            disabled={ownerships.length === 0}
          >
            ▶ Start calculation
          </button>
        </div>
      )}

      <NewCalcSection
        section={section}
        objects={objects}
        objectName={objectName}
        setObjectName={setObjectName}
        onAddObject={onAddObject}
        entities={entities}
        entityName={entityName}
        setEntityName={setEntityName}
        onAddEntity={onAddEntity}
        ownerships={ownerships}
        ownerKind={ownerKind}
        setOwnerKind={setOwnerKind}
        ownerEntityId={ownerEntityId}
        setOwnerEntityId={setOwnerEntityId}
        ownerObjectOwnerId={ownerObjectOwnerId}
        setOwnerObjectOwnerId={setOwnerObjectOwnerId}
        ownershipPercent={ownershipPercent}
        setOwnershipPercent={setOwnershipPercent}
        selectedObjectId={selectedObjectId}
        setSelectedObjectId={setSelectedObjectId}
        onAddOwnership={onAddOwnership}
        onRenameObject={onRenameObject}
        onDeleteObject={onDeleteObject}
        onRenameEntity={onRenameEntity}
        onDeleteEntity={onDeleteEntity}
        onUpdateOwnership={onUpdateOwnership}
        onDeleteOwnership={onDeleteOwnership}
      />

      <button
        className="btn w-auto bg-slate-500 hover:bg-slate-600"
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>
    </main>
  );
}
