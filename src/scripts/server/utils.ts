import { Block } from "cicada-lib/block.js";
import { Entity } from "cicada-lib/entity.js";

export function isStandingOn(entity: Entity, block: Block): boolean {
    const loc   = entity.location;
    const delta = 0.3; // Assumed length of the entity hitbox

    // block.y < loc.y because we don't want to consider an entity to be
    // standing on the block if the block is non-solid and the player is
    // *inside* it.
    return block.x - delta <= loc.x && loc.x < block.x + 1 + delta &&
           block.y         <  loc.y && loc.y < block.y + 2         &&
           block.z - delta <= loc.z && loc.z < block.z + 1 + delta;
}
