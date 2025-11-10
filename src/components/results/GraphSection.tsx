import type { Entity, OwnedObject, Ownership } from "../../domain/types";
import GraphView from "../GraphView";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
};

export default function GraphSection({ entities, objects, ownerships }: Props) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Graph</h3>
      <GraphView entities={entities} objects={objects} ownerships={ownerships} />
    </div>
  );
}
