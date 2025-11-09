export type ObjectId = string;
export type EntityId = string;
export type OwnershipId = string;

export type OwnedObject = {
  id: ObjectId;
  name: string;
};

export type Entity = {
  id: EntityId;
  name: string;
};

// 👇 owner can be an entity OR an object
export type OwnerRef =
  | { kind: "entity"; id: EntityId }
  | { kind: "object"; id: ObjectId };

export type Ownership = {
  id: OwnershipId;
  owner: OwnerRef;     // <- NOT a string
  objectId: ObjectId;  // target is always an object
  percent: number;     // 0..100
};