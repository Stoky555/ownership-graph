import type { Entity, OwnedObject, Ownership } from "../../../domain/types";
import GraphView from "../../../graph/GraphView";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
};

export default function GraphSection({ entities, objects, ownerships }: Props) {
  return (
    <div>
      <h2 className="m-0 text-lg font-semibold">Graph</h2>
      <GraphView entities={entities} objects={objects} ownerships={ownerships} />
    </div>
  );
}
