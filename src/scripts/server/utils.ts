import { Block } from "cicada-lib/block.js";
import { Entity } from "cicada-lib/entity.js";

export function isStandingOn(entity: Entity, block: Block): boolean {
    const loc   = entity.location;
    const delta = 0.3; // Assumed length of the entity hitbox
    return block.x - delta <= loc.x && loc.x < block.x + 1 + delta &&
           block.y         <= loc.y && loc.y < block.y + 2         &&
           block.z - delta <= loc.z && loc.z < block.z + 1 + delta;
}
