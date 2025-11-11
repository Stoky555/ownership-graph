import { useMemo, useState } from "react";
import { calculateDirectOwnershipNames, calculateIndirectOwnershipNames } from "../domain/calculateIndirectOwnershipIds";
import type { Entity, OwnedObject, Ownership } from "../domain/types";

import Tabs from "./ui/Tabs";
import GraphSection from "./results/GraphSection";
import AllOwnershipTables from "./results/AllOwnershipTables";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
};

export default function ResultsComponent({ entities, objects, ownerships }: Props) {
  const directTotals = useMemo(
    () => calculateDirectOwnershipNames(entities, objects, ownerships),
    [entities, objects, ownerships]
  );
  const indirectTotals = useMemo(
    () => calculateIndirectOwnershipNames(entities, objects, ownerships),
    [entities, objects, ownerships]
  );

  const [tab, setTab] = useState<"tables" | "graph">("tables");

  if (ownerships.length === 0) {
    return (
      <div>
        <h2 className="mt-0">Results</h2>
        <p className="text-slate-500">No ownership data yet. Add some first.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-0">Results</h2>
      <Tabs
        tabs={[
          { key: "tables", label: "Ownership tables" },
          { key: "graph", label: "Graph" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as typeof tab)}
      >
        {tab === "tables" && (
          <AllOwnershipTables
            entities={entities}
            objects={objects}
            ownerships={ownerships}
            directTotals={directTotals as any}
            indirectTotals={indirectTotals as any}
          />
        )}

        {tab === "graph" && (
          <GraphSection entities={entities} objects={objects} ownerships={ownerships} />
        )}
      </Tabs>
    </div>
  );
}
