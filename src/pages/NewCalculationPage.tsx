import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Entity, OwnedObject, Ownership } from "../domain/types";
import { exportCalculation, parseCalculation, readFileAsText } from "../utils/fileIO";
import { mockEntities, mockObjects, mockOwnerships } from "../domain/mockData";
import NewCalcSection from "../features/calculation/components/NewCalcSection";
import SectionTabs from "../features/calculation/components/SectionTabs";

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
    const percent = parseFloat(ownershipPercent);
    if (!selectedObjectId || !Number.isFinite(percent) || percent <= 0) return;

    const currentTotal = ownerships
      .filter(o => o.objectId === selectedObjectId)
      .reduce((s, o) => s + o.percent, 0);

    if (currentTotal + percent > 100.0001) {
      alert(`Direct ownership for this object would exceed 100% (current ${currentTotal.toFixed(2)}%).`);
      return;
    }

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onExportJson = () => {
    exportCalculation({
      version: 1,
      meta: { createdAt: new Date().toISOString() },
      entities,
      objects,
      ownerships,
    });
  };

  const onClickImport = () => fileInputRef.current?.click();

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const data = parseCalculation(text);
      // optional confirm to replace
      if (!confirm("Import will replace current data. Continue?")) return;
      setEntities(data.entities);
      setObjects(data.objects);
      setOwnerships(data.ownerships);
      // Reset transient UI
      setOwnerEntityId(""); setOwnerObjectOwnerId(""); setOwnershipPercent(""); setSelectedObjectId("");
      setSection(data.ownerships.length ? "result" : "objects");
    } catch (err: any) {
      alert(`Failed to import JSON: ${err?.message ?? err}`);
    } finally {
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  return (
    <main className="app-shell">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold">New Calculation</h1>
      </header>

      <SectionTabs value={section} onChange={setSection} />

      {section !== "result" && (
        <div className="flex flex-wrap gap-2 mb-3">
          <button className="btn btn--sm w-auto bg-cyan-500 hover:bg-cyan-600" onClick={loadSample}>⤓ Load sample data</button>
          <button className="btn btn--sm w-auto btn--danger" onClick={clearAll}>✖ Clear all</button>
          <button className="btn w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => setSection("result")} disabled={ownerships.length === 0}>▶ Start calculation</button>

          {/* New: Export/Import */}
          <span className="mx-1 hidden sm:inline">|</span>
          <button className="btn btn--ghost btn--sm w-auto" onClick={onExportJson}>⇩ Export JSON</button>
          <button className="btn btn--ghost btn--sm w-auto" onClick={onClickImport}>⇧ Import JSON</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportFile}
          />
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
