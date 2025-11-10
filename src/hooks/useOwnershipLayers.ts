import { useCallback, useEffect, useMemo, useState } from "react";
import type { Entity, OwnedObject, Ownership } from "../domain/types";
import { calculateIndirectOwnershipIds } from "../domain/calculateIndirectOwnershipIds";
import { directId, indirectId } from "../graph/ids";

export function useOwnershipLayers(entities: Entity[], objects: OwnedObject[], ownerships: Ownership[]) {
  const [hiddenDirectIds, setHiddenDirectIds] = useState<Set<string>>(new Set());
  const [hiddenIndirectIds, setHiddenIndirectIds] = useState<Set<string>>(new Set());
  const [bootstrappedIndirect, setBootstrappedIndirect] = useState(false);

    // lookups: id -> display name
    const entityNameById = useMemo(
        () => new Map(entities.map(e => [e.id, e.name] as const)),
        [entities]
    );
    const objectNameById = useMemo(
        () => new Map(objects.map(o => [o.id, o.name] as const)),
        [objects]
    );

    const directList = useMemo(
    () =>
        ownerships.map((own) => ({
        id: directId(own),
        own,
        ownerLabel:
            own.owner.kind === "entity"
            ? (entityNameById.get(own.owner.id) ?? own.owner.id)
            : (objectNameById.get(own.owner.id) ?? own.owner.id),
        objectLabel: objectNameById.get(own.objectId) ?? own.objectId,
        percent: own.percent,
        })),
    [ownerships, entityNameById, objectNameById]
    );

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

    // helper for "entity:..." | "object:..." keys
    const nameForSourceKey = useCallback((key: string) => {
        const [kind, rawId] = key.split(":");
        return kind === "entity"
            ? (entityNameById.get(rawId) ?? rawId)
            : (objectNameById.get(rawId) ?? rawId);
    }, [entityNameById, objectNameById]);

    const indirectList = useMemo(() => {
        const rows: Array<{ id: string; sourceKey: string; objectId: string; label: string; percent: number }> = [];
        for (const [sourceKey, targets] of Object.entries(totals)) {
            for (const [objectId, pct] of Object.entries(targets)) {
            if ((pct as number) <= 0.01) continue;
            const id = indirectId(sourceKey, objectId);
            if (directEdgeIdsForTable.has(id)) continue;

            const sourceLabel = nameForSourceKey(sourceKey);
            const objectLabel = objectNameById.get(objectId) ?? objectId;

            rows.push({
                id,
                sourceKey,
                objectId,
                label: `${sourceLabel} → ${objectLabel}`,
                percent: pct as number,
            });
            }
        }
        rows.sort((a, b) => b.percent - a.percent);
        return rows;
    }, [totals, directEdgeIdsForTable, nameForSourceKey, objectNameById]);

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
