import type { Entity, OwnedObject, Ownership } from "../domain/types";

export type CalculationExport = {
  version: 1;
  meta?: { name?: string; createdAt: string };
  entities: Entity[];
  objects: OwnedObject[];
  ownerships: Ownership[];
};

export function exportCalculation(data: CalculationExport, filename?: string) {
  const name = filename ?? `ownership-calc-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result ?? ""));
    fr.onerror = () => rej(fr.error);
    fr.readAsText(file);
  });
}

export function parseCalculation(text: string): CalculationExport {
  const data = JSON.parse(text);
  if (!data || data.version !== 1) throw new Error("Unsupported or missing version.");
  if (!Array.isArray(data.entities) || !Array.isArray(data.objects) || !Array.isArray(data.ownerships)) {
    throw new Error("Invalid structure.");
  }
  const validEntity = (e: any) => e && typeof e.id === "string" && typeof e.name === "string";
  const validObject = (o: any) => o && typeof o.id === "string" && typeof o.name === "string";
  const validOwnership = (o: any) =>
    o && typeof o.id === "string" &&
    o.owner && (o.owner.kind === "entity" || o.owner.kind === "object") && typeof o.owner.id === "string" &&
    typeof o.objectId === "string" &&
    typeof o.percent === "number" && Number.isFinite(o.percent) && o.percent > 0 && o.percent <= 100;

  if (!data.entities.every(validEntity) || !data.objects.every(validObject) || !data.ownerships.every(validOwnership)) {
    throw new Error("Data validation failed.");
  }
  return data as CalculationExport;
}