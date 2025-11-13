// src/components/NewCalcSection.tsx
import ObjectsForm from "./ObjectsForm";
import EntitiesForm from "./EntitiesForm";
import OwnershipForm from "./OwnershipForm";
import ResultsComponent from "../../results/components/ResultsComponent";
import { OwnedObject, Entity, Ownership } from "../../../domain/types";

type Section = "objects" | "entities" | "ownership" | "result";

type Props = {
  section: Section;

  // Objects props
  objects: OwnedObject[];
  objectName: string;
  setObjectName: (v: string) => void;
  onAddObject: () => void;

  // Entities props
  entities: Entity[];
  entityName: string;
  setEntityName: (v: string) => void;
  onAddEntity: () => void;

  // Ownership props
  ownerships: Ownership[];
  ownerKind: "entity" | "object";
  setOwnerKind: (k: "entity" | "object") => void;
  ownerEntityId: string;
  setOwnerEntityId: (v: string) => void;
  ownerObjectOwnerId: string;
  setOwnerObjectOwnerId: (v: string) => void;
  ownershipPercent: string;
  setOwnershipPercent: (v: string) => void;
  selectedObjectId: string;
  setSelectedObjectId: (v: string) => void;
  onAddOwnership: () => void;
  onRenameObject: (id: string, newName: string) => void;
  onDeleteObject: (id: string) => void;
  onRenameEntity: (id: string, newName: string) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateOwnership: (id: string, patch: Partial<Pick<Ownership,"owner"|"objectId"|"percent">>) => void;
  onDeleteOwnership: (id: string) => void;
};

export default function NewCalcSection(props: Props) {
  const {
    section,
    objects, objectName, setObjectName, onAddObject,
    entities, entityName, setEntityName, onAddEntity,
    ownerships, ownerKind, setOwnerKind,
    ownerEntityId, setOwnerEntityId,
    ownerObjectOwnerId, setOwnerObjectOwnerId,
    ownershipPercent, setOwnershipPercent,
    selectedObjectId, setSelectedObjectId,
    onAddOwnership,

    // ↓↓↓ ADD THESE
    onRenameObject,
    onDeleteObject,

    onRenameEntity,
    onDeleteEntity,
    onUpdateOwnership,
    onDeleteOwnership,
  } = props;

  return (
    <section className="card">
      {section === "objects" && (
        <ObjectsForm
          objects={objects}
          objectName={objectName}
          setObjectName={setObjectName}
          onAddObject={onAddObject}
          onRenameObject={onRenameObject}   // ← add
          onDeleteObject={onDeleteObject}   // ← add
        />
      )}

      {section === "entities" && (
        <EntitiesForm
          entities={entities}
          entityName={entityName}
          setEntityName={setEntityName}
          onAddEntity={onAddEntity}
          onRenameEntity={onRenameEntity}
          onDeleteEntity={onDeleteEntity}
        />
      )}

      {section === "ownership" && (
        <OwnershipForm
          entities={entities}
          objects={objects}
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
          onUpdateOwnership={onUpdateOwnership}
          onDeleteOwnership={onDeleteOwnership}
        />
      )}

      {section === "result" && (
        <ResultsComponent
            entities={entities}
            objects={objects}
            ownerships={ownerships}
        />
      )}
    </section>
  );
}
