import { Ownership, Entity, OwnedObject } from "./types";

export type TotalRow = { owner: string; object: string; percent: number };

// Normalize direct totals or fall back to raw ownerships
export function buildDirectRows(
  directTotals: any,
  ownerships: Ownership[],
  entities: Entity[],
  objects: OwnedObject[]
): TotalRow[] {
  if (Array.isArray(directTotals)) {
    if (directTotals.length && "owner" in directTotals[0] && "object" in directTotals[0]) {
      return directTotals
        .filter((r) => typeof r.percent === "number")
        .map((r) => ({ owner: r.owner, object: r.object, percent: r.percent }));
    }
    if (directTotals.length && "ownerName" in directTotals[0]) {
      return directTotals
        .filter((r) => typeof r.percent === "number")
        .map((r) => ({
          owner: r.ownerName,
          object: r.objectName ?? r.object ?? "",
          percent: r.percent,
        }));
    }
  } else if (directTotals && typeof directTotals === "object") {
    const rows: TotalRow[] = [];
    for (const ownerKey of Object.keys(directTotals)) {
      const objMap = directTotals[ownerKey];
      if (objMap && typeof objMap === "object") {
        for (const objectKey of Object.keys(objMap)) {
          const percent = objMap[objectKey];
          if (typeof percent === "number") {
            rows.push({
              owner: resolveEntityOrObjectName(ownerKey, entities, objects),
              object: resolveObjectName(objectKey, objects),
              percent,
            });
          }
        }
      }
    }
    if (rows.length) return rows;
  }

  return ownerships.map((o) => ({
    owner:
      o.owner.kind === "entity"
        ? entities.find((e) => e.id === o.owner.id)?.name ?? o.owner.id
        : objects.find((ob) => ob.id === o.owner.id)?.name ?? o.owner.id,
    object: objects.find((ob) => ob.id === o.objectId)?.name ?? o.objectId,
    percent: o.percent,
  }));
}

// Normalize indirect totals
export function buildIndirectRows(indirectTotals: any, entities: Entity[], objects: OwnedObject[]): TotalRow[] {
  if (!indirectTotals) return [];

  if (Array.isArray(indirectTotals)) {
    if (indirectTotals.length && "owner" in indirectTotals[0] && "object" in indirectTotals[0]) {
      return indirectTotals
        .filter((r) => typeof r.percent === "number")
        .map((r) => ({ owner: r.owner, object: r.object, percent: r.percent }));
    }
    if (indirectTotals.length && "ownerName" in indirectTotals[0]) {
      return indirectTotals
        .filter((r) => typeof r.percent === "number")
        .map((r) => ({
          owner: r.ownerName,
          object: r.objectName ?? r.object ?? "",
          percent: r.percent,
        }));
    }
  } else if (indirectTotals instanceof Map) {
    const rows: TotalRow[] = [];
    for (const [ownerKey, objMap] of indirectTotals.entries()) {
      if (objMap instanceof Map) {
        for (const [objectKey, percent] of objMap.entries()) {
          if (typeof percent === "number") {
            rows.push({
              owner: resolveEntityOrObjectName(ownerKey, entities, objects),
              object: resolveObjectName(objectKey, objects),
              percent,
            });
          }
        }
      }
    }
    return rows;
  } else if (typeof indirectTotals === "object") {
    const rows: TotalRow[] = [];
    for (const ownerKey of Object.keys(indirectTotals)) {
      const objMap = indirectTotals[ownerKey];
      if (objMap && typeof objMap === "object") {
        for (const objectKey of Object.keys(objMap)) {
          const percent = objMap[objectKey];
          if (typeof percent === "number") {
            rows.push({
              owner: resolveEntityOrObjectName(ownerKey, entities, objects),
              object: resolveObjectName(objectKey, objects),
              percent,
            });
          }
        }
      }
    }
    return rows;
  }

  return [];
}

function resolveEntityOrObjectName(id: string, entities: Entity[], objects: OwnedObject[]) {
  const e = entities.find((x) => x.id === id);
  if (e) return e.name;
  const o = objects.find((x) => x.id === id);
  if (o) return o.name;
  return id;
}

function resolveObjectName(id: string, objects: OwnedObject[]) {
  const o = objects.find((x) => x.id === id);
  return o ? o.name : id;
}