import type { OwnerRef, Ownership, ObjectId, Entity, OwnedObject } from "./types";

const makeOwnership = (owner: OwnerRef, objectId: ObjectId, percent: number): Ownership => ({
  id: `${owner.kind}:${owner.id}->object:${objectId}`, // stable key
  owner,
  objectId,
  percent,
});

export const mockEntities: Entity[] = [
  { id: "a", name: "Alpha Holdings" },
  { id: "b", name: "Beta Ltd" },
];

export const mockObjects: OwnedObject[] = [
  { id: "1",  name: "Site A" },
  { id: "2",  name: "Warehouse B" },
  { id: "3",  name: "Plant C" },
  { id: "5",  name: "Unit E" },
  { id: "6",  name: "Depot F" },
  { id: "7",  name: "Yard G" },
  { id: "8",  name: "Station H" },
  { id: "9",  name: "Aggregator I" },
  { id: "10", name: "Final Asset J" }, // terminal node
];

/**
 * Shape:
 *
 * Alpha (a) ──60%──> 1 ──> 5 ──> 9 ──> 10
 *           └─40%──> 2 ──> 6 ──┘
 *
 * Beta  (b) ──100%─> 3 ──> 7 ──> 8 ──┘
 *
 * Notes:
 * - Each object has at most ONE outgoing edge (a single connection).
 * - Multiple branches converge into object 9, then 10 is the terminal object.
 * - Entities each directly own 1–2 objects.
 */
export const mockOwnerships: Ownership[] = [
  // Entities own 1–2 starting objects
  makeOwnership({ kind: "entity", id: "a" }, "1", 42),
  makeOwnership({ kind: "entity", id: "a" }, "2", 35),
  makeOwnership({ kind: "entity", id: "b" }, "3", 12),

  // Single-connection object chains that converge
  makeOwnership({ kind: "object", id: "1" }, "5", 53),
  makeOwnership({ kind: "object", id: "2" }, "6", 21),
  makeOwnership({ kind: "object", id: "3" }, "7", 32),

  makeOwnership({ kind: "object", id: "7" }, "8", 74),

  // Converge into 9
  makeOwnership({ kind: "object", id: "5" }, "9", 12),
  makeOwnership({ kind: "object", id: "6" }, "9", 63),
  makeOwnership({ kind: "object", id: "8" }, "9", 35),

  // Terminal edge
  makeOwnership({ kind: "object", id: "9" }, "10", 32),
];