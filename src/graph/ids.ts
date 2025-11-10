import type { Ownership } from "../domain/types";

export const directId = (own: Ownership) =>
  `${own.owner.kind}:${own.owner.id}->object:${own.objectId}`;

export const indirectId = (sourceKey: string, objectId: string) =>
  `${sourceKey}->object:${objectId}`;
