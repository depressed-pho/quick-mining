import { ItemStack } from "cicada-lib/item/stack.js";

export function randomIntInClosedInterval(lower: number, upper: number) {
    return Math.floor(
        Math.random() * (upper - lower + 1) + lower);
}

/** The scripting API does not offer access to loot table, and this is a
 * miserable attempt to simulate it.
 */
export class LootTable {
    readonly #conds: [LootCondition, LootPool[]][];

    public constructor() {
        this.#conds = [];
    }

    public when(cond: LootCondition, pools: LootPool[]): this {
        this.#conds.push([cond, pools]);
        return this;
    }

    public otherwise(pools: LootPool[]): this {
        return this.always(pools);
    }

    public always(pools: LootPool[]): this {
        return this.when(LootCondition.always(), pools);
    }

    public execute(tool?: ItemStack): ItemStack[] {
        const stacks: ItemStack[] = [];
        for (const [cond, pools] of this.#conds) {
            if (cond.evaluate(tool)) {
                for (const pool of pools)
                    Array.prototype.push.apply(stacks, pool.execute(tool));
                break;
            }
        }
        return stacks;
    }
}

export class LootPool {
    readonly #rolls: Rolls;
    #cond?: LootCondition;
    readonly #ents: LootEntry[];

    public constructor() {
        this.#rolls = {min: 1, max: 1};
        this.#ents  = [];
    }

    public rolls(constant: number): this;
    public rolls(min: number, max: number): this;
    public rolls(...args: any[]): this {
        if (args.length == 1) {
            this.#rolls.min = args[0];
            this.#rolls.max = args[0];
        }
        else {
            this.#rolls.min = args[0];
            this.#rolls.max = args[1];
        }
        return this;
    }

    public condition(cond: LootCondition): this {
        this.#cond = cond;
        return this;
    }

    public entry(entry: LootEntry): this;
    public entry(stack: ItemStack): this;
    public entry(arg: any): this {
        if (arg instanceof ItemStack)
            this.entry(LootEntry.item(arg));
        else
            this.#ents.push(arg);
        return this;
    }

    public execute(tool?: ItemStack): ItemStack[] {
        const stacks: ItemStack[] = [];
        const numRolls = randomIntInClosedInterval(this.#rolls.min, this.#rolls.max);
        for (let i = 0; i < numRolls; i++) {
            if (this.#cond && !this.#cond.evaluate(tool))
                continue;

            const totalWeight = this.#ents.reduce((acc, ent) => acc + ent.weight(), 0);
            let rand = Math.random() * totalWeight;
            for (const ent of this.#ents) {
                rand -= ent.weight();
                if (rand < 0) {
                    Array.prototype.push.apply(stacks, ent.execute(tool));
                    break;
                }
            }
        }
        return stacks;
    }
}

interface Rolls {
    min: number;
    max: number;
}

export abstract class LootCondition {
    public abstract evaluate(tool?: ItemStack): boolean;

    public static always(): LootCondition.Always {
        return new LootCondition.Always();
    }

    public static not(cond: LootCondition): LootCondition.Not {
        return new LootCondition.Not(cond);
    }

    public static and(conds: LootCondition[]): LootCondition.And {
        return new LootCondition.And(conds);
    }

    public static or(conds: LootCondition[]): LootCondition.Or {
        return new LootCondition.Or(conds);
    }

    public static randomChance(noFortune: number,
                               fortune1?: number,
                               fortune2?: number,
                               fortune3?: number,
                               fortune4plus?: number) {
        return new LootCondition.RandomChance(
            noFortune, fortune1, fortune2, fortune3, fortune4plus);
    }

    public static matchTool(): LootCondition.MatchTool {
        return new LootCondition.MatchTool();
    }
}
export namespace LootCondition {
    export class Always extends LootCondition {
        public evaluate(): boolean {
            return true;
        }
    }

    export class Not extends LootCondition {
        readonly #cond: LootCondition;

        public constructor(cond: LootCondition) {
            super();
            this.#cond = cond;
        }

        public evaluate(tool?: ItemStack): boolean {
            return !this.#cond.evaluate(tool);
        }
    }

    export class And extends LootCondition {
        readonly #conds: LootCondition[];

        public constructor(conds: LootCondition[]) {
            super();
            this.#conds = conds;
        }

        public evaluate(tool?: ItemStack): boolean {
            for (const cond of this.#conds) {
                if (!cond.evaluate(tool))
                    return false;
            }
            return true;
        }
    }

    export class Or extends LootCondition {
        readonly #conds: LootCondition[];

        public constructor(conds: LootCondition[]) {
            super();
            this.#conds = conds;
        }

        public evaluate(tool?: ItemStack): boolean {
            for (const cond of this.#conds) {
                if (cond.evaluate(tool))
                    return true;
            }
            return false;
        }
    }

    export class RandomChance extends LootCondition {
        readonly #chances: [number, number, number, number, number];

        public constructor(noFortune: number,
                           fortune1?: number,
                           fortune2?: number,
                           fortune3?: number,
                           fortune4plus?: number) {
            super();
            this.#chances = [
                noFortune,
                fortune1     ?? noFortune,
                fortune2     ?? (fortune1 ?? noFortune),
                fortune3     ?? (fortune2 ?? (fortune1 ?? noFortune)),
                fortune4plus ?? (fortune3 ?? (fortune2 ?? (fortune1 ?? noFortune)))
            ];
        }

        public evaluate(tool?: ItemStack): boolean {
            if (tool) {
                const fortune = tool.enchantments.get("fortune");
                const level   = fortune ? fortune.level : 0;
                const chance  = this.#chances[level >= 4 ? 4 : level]!;
                return Math.random() < chance;
            }
            else {
                return Math.random() < this.#chances[0];
            }
        }
    }

    export class MatchTool extends LootCondition {
        #typeId?: string;
        #enchantments: MatchEnchantment[];

        public constructor() {
            super();
            this.#enchantments = [];
        }

        public typeId(typeId: string): this {
            this.#typeId = typeId;
            return this;
        }

        public enchantment(id: string): this {
            this.#enchantments.push({
                id
            });
            return this;
        }

        public evaluate(tool?: ItemStack): boolean {
            if (!tool)
                // Bare hand definitely doesn't match.
                return false;

            if (this.#typeId !== undefined && this.#typeId !== tool.typeId)
                return false;

            for (const ench of this.#enchantments) {
                if (!tool.enchantments.has(ench.id))
                    return false;
            }

            return true;
        }
    }

    interface MatchEnchantment {
        id: string;
    }
}

export abstract class LootEntry {
    #cond?: LootCondition;
    #weight: number;

    public constructor() {
        this.#weight = 1.0;
    }

    public condition(cond: LootCondition): this {
        this.#cond = cond;
        return this;
    }

    public weight(w: number): this;
    public weight(): number;
    public weight(w?: number): any {
        if (w !== undefined) {
            this.#weight = w;
            return this;
        }
        else {
            return this.#weight;
        }
    }

    protected evalCondition(tool?: ItemStack): boolean {
        if (this.#cond)
            return this.#cond.evaluate(tool);
        else
            return true;
    }

    public abstract execute(tool?: ItemStack): ItemStack[];

    public static item(stack: ItemStack): LootEntry.Item {
        return new LootEntry.Item(stack);
    }
}
export namespace LootEntry {
    export class Item extends LootEntry {
        readonly #stack: ItemStack;
        readonly #rolls: Rolls;
        #isMultiplicative: boolean;
        #isDiscreteUniform: boolean;
        #isGrassLike: boolean;
        #binomial: number|undefined;
        #limit: number|undefined;

        public constructor(stack: ItemStack) {
            super();
            this.#stack             = stack;
            this.#rolls             = {min: 1, max: 1};
            this.#isMultiplicative  = false;
            this.#isDiscreteUniform = false;
            this.#isGrassLike       = false;
            this.#binomial          = undefined;
            this.#limit             = undefined;
        }

        public rolls(num: number): this {
            return this.amount(num, num);
        }

        public amount(min: number, max: number): this {
            this.#rolls.min = min;
            this.#rolls.max = max;
            return this;
        }

        public multiplicative(): this {
            this.#isMultiplicative = true;
            return this;
        }

        public discreteUniform(limit?: number): this {
            this.#isDiscreteUniform = true;
            this.#limit             = limit;
            return this;
        }

        /// https://minecraft.fandom.com/wiki/Fortune#Grass,_ferns_and_large_flowers%E2%80%8C[Bedrock_Edition_only]
        public grassLike(): this {
            this.#isGrassLike = true;
            return this;
        }

        /** At least one drop is guaranteed. Calling `.rolls(num)` sets
         * `num + fortune` additional rolls where `fortune` is the
         * fortune level.
         */
        public binomial(probability: number): this {
            this.#binomial = probability;
            return this;
        }

        public execute(tool?: ItemStack): ItemStack[] {
            if (!this.evalCondition(tool)) {
                return [];
            }
            else if (this.#isMultiplicative && tool) {
                // https://minecraft.fandom.com/wiki/Fortune#Ore
                const fortune = tool.enchantments.get("fortune");
                const level   = fortune ? fortune.level : 0;
                const dice    = randomIntInClosedInterval(1, level + 2);
                const mult    = Math.max(1, dice - 1);

                const item   = this.#stack.clone();
                item.amount *= randomIntInClosedInterval(this.#rolls.min, this.#rolls.max);

                const items = [];
                for (let i = 0; i < mult; i++) {
                    items.push(item.clone());
                }
                return items;
            }
            else if (this.#isDiscreteUniform && tool) {
                const fortune = tool.enchantments.get("fortune");
                const level   = fortune ? fortune.level : 0;
                const dice    = randomIntInClosedInterval(this.#rolls.min, this.#rolls.max + level);

                const item   = this.#stack.clone();
                item.amount *= this.#limit ? Math.min(dice, this.#limit) : dice;

                return [item];
            }
            else if (this.#isGrassLike && tool) {
                const dice = randomIntInClosedInterval(1, 8);
                if (dice < 8) {
                    // No drops regardless of fortune.
                    return [];
                }
                else {
                    const fortune = tool.enchantments.get("fortune");
                    const level   = fortune ? fortune.level : 0;
                    const maximum = 1 + level * 2;

                    const item   = this.#stack.clone();
                    item.amount *= randomIntInClosedInterval(1, maximum);

                    return [item];
                }
            }
            else if (this.#binomial !== undefined && tool) {
                const fortune = tool.enchantments.get("fortune");
                const level   = fortune ? fortune.level : 0;
                const rolls   = randomIntInClosedInterval(this.#rolls.min, this.#rolls.max + level);

                const item = this.#stack.clone();
                let amount = 1;
                for (let i = 0; i < rolls; i++) {
                    if (Math.random() < this.#binomial)
                        amount++;
                }
                item.amount *= amount;

                return [item];
            }
            else {
                const item   = this.#stack.clone();
                item.amount *= randomIntInClosedInterval(this.#rolls.min, this.#rolls.max);

                return [item];
            }
        }
    }
}
