import { useMemo, useState } from "react";
import { calculateDirectOwnershipNames, calculateIndirectOwnershipNames } from "../domain/calculateIndirectOwnershipIds";
import type { Entity, OwnedObject, Ownership } from "../domain/types";

import Tabs from "./ui/Tabs";
import DirectSummary from "./results/DirectSummary";
import GraphSection from "./results/GraphSection";
import TotalsPanel from "./results/TotalsPanel";

type Props = {
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
};

export default function ResultsComponent({ entities, objects, ownerships }: Props) {
  const totals = useMemo(
    () => calculateIndirectOwnershipNames(entities, objects, ownerships),
    [entities, objects, ownerships]
  );

  const directTotals = useMemo(
    () => calculateDirectOwnershipNames(entities, objects, ownerships),
    [entities, objects, ownerships]
  );
  const indirectTotals = useMemo(
    () => calculateIndirectOwnershipNames(entities, objects, ownerships),
    [entities, objects, ownerships]
  );


  const [tab, setTab] = useState<"direct" | "indirect" | "graph">("direct");

  if (ownerships.length === 0) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Results</h2>
        <p style={{ color: "#6b7280" }}>No ownership data yet. Add some first.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Results</h2>

      <Tabs
        tabs={[
          { key: "direct", label: "Direct summary" },
          { key: "indirect", label: "Indirect totals" },
          { key: "graph", label: "Graph" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as typeof tab)}
      >
        {/* Panel 1: Direct */}
        <DirectSummary entities={entities} objects={objects} ownerships={ownerships} />

        {/* Panel 2: both totals */}
        <TotalsPanel direct={directTotals} indirect={indirectTotals} />

        {/* Panel 3: Graph */}
        <GraphSection entities={entities} objects={objects} ownerships={ownerships} />
      </Tabs>
    </div>
  );
}
