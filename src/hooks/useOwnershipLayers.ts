import { useEffect, useMemo, useState } from "react";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import { calculateIndirectOwnershipIds } from "../domain/calculateIndirectOwnershipIds";
import { directId, indirectId } from "../graph/ids";

export function useOwnershipLayers(entities: Entity[], objects: OwnedObject[], ownerships: Ownership[]) {
  const [hiddenDirectIds, setHiddenDirectIds] = useState<Set<string>>(new Set());
  const [hiddenIndirectIds, setHiddenIndirectIds] = useState<Set<string>>(new Set());
  const [bootstrappedIndirect, setBootstrappedIndirect] = useState(false);

  const directList = useMemo(() =>
    ownerships.map((own) => ({
      id: directId(own), own,
      ownerLabel: own.owner.id,          // labels kept minimal; you can inject maps if needed
      objectLabel: own.objectId,
      percent: own.percent,
    })), [ownerships]);

  const filteredOwnerships = useMemo(
    () => ownerships.filter((o) => !hiddenDirectIds.has(directId(o))),
    [ownerships, hiddenDirectIds]
  );

  const totals = useMemo(
    () => calculateIndirectOwnershipIds(entities, objects, filteredOwnerships),
    [entities, objects, filteredOwnerships]
  );

  const directEdgeIdsForTable = useMemo(
    () => new Set(ownerships.map((o) => directId(o))),
    [ownerships]
  );

  const indirectList = useMemo(() => {
    const rows: Array<{ id: string; sourceKey: string; objectId: string; label: string; percent: number }> = [];
    for (const [sourceKey, targets] of Object.entries(totals)) {
      for (const [objectId, pct] of Object.entries(targets)) {
        if ((pct as number) <= 0.01) continue;
        const id = indirectId(sourceKey, objectId);
        if (directEdgeIdsForTable.has(id)) continue;
        rows.push({ id, sourceKey, objectId, label: `${sourceKey} → object:${objectId}`, percent: pct as number });
      }
    }
    rows.sort((a, b) => b.percent - a.percent);
    return rows;
  }, [totals, directEdgeIdsForTable]);

  // Hide all indirect edges initially
  useEffect(() => {
    if (!bootstrappedIndirect && indirectList.length) {
      setHiddenIndirectIds(new Set(indirectList.map((d) => d.id)));
      setBootstrappedIndirect(true);
    }
  }, [indirectList, bootstrappedIndirect]);

  return {
    directList,
    indirectList,
    totals,
    filteredOwnerships,
    hiddenDirectIds,
    hiddenIndirectIds,
    setHiddenDirectIds,
    setHiddenIndirectIds,
  };
}
