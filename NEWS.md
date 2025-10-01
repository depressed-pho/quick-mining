# Release notes

## 1.9.0 -- 2025-10-01

* The addon no longer requires Beta APIs or any other experimental features
  to work. It's been confirmed to be compatible with Minecraft Bedrock
  v1.21.111.
* The legacy way of invoking custom commands, namely `;qmine prefs` and
  `;qmine admin` is now removed. Users must use `/qmine-prefs` and
  `/qmine-admin` respectively. The legacy commands had been retained for a
  compatibility reason but it is incompatible with the stable API.
* Corrected my mistake in the welcome message advertising old names for the
  custom commands.

## 1.8.1 -- 2025-08-09

* Patched an exploit where players could initiate a quick-mining then
  immediately switch to an empty hotbar slot in order to prevent the tool
  from taking damage, or throw the tool away. Now the addon locks the tool
  in the slot while the quick-mining is ongoing.

## 1.8.0 -- 2025-08-08

* Updated the addon for Minecraft Bedrock 1.21.100.
* Fixed an issue where trying to quick-mine Dead Coral Blocks would result
  in an error saying something like `No dead counterpart was found for
  minecraft:dead_tube_coral_block`. This was an oversight. The addon was
  trying to find a dead variant of already dead coral, which obviously
  didn't exist. Dead corals of course cannot die further [#8].
* Eliminated a potential failure case. When a player initiates a
  quick-mining for a large blob of blocks and then immediately teleports
  away, the addon could crash by attempting to break blocks in an unloaded
  chunk. It now skips over blocks that reside in chunks that are no longer
  loaded.

## 1.7.1 -- 2025-07-03

* Fixed an issue where `/qmine-prefs` and `/qmine-admin` would not be
  usable in a world with cheats disabled.

## 1.7.0 -- 2025-07-02

* Fixed an issue where changes made to `/qmine-prefs` or `/qmine-admin` GUI
  would not be saved [#7]. Reported by RutvikFozdar, SynovialAlloy, and
  ABadPlayer76233.
* Fixed an issue where the hunger bar would be consumed when it
  shouldn't. Specifically, blocks that are mined as a bonus, such as leaves
  that are broken as a result of nearby logs being mined, no longer
  consumes the hunger bar. Creative players are also exempted from hunger
  now.
* Reimplemented the mining priority system to fix an issue where loots from
  leaves that are broken as a consequence of mining nearby logs could
  sometimes drop without being auto-collected. This also allows us to
  implement quick-mining blocks that are generated with fragile attachments
  such as Coral.
* Cocoa pods are now automatically collected when their attaching jungle
  logs are quick-mined. They were previously scattered around and not
  collected.
* Added a category for [Coral](https://minecraft.wiki/w/Coral), [Dead
  Coral](https://minecraft.wiki/w/Dead_Coral), [Coral
  Fans](https://minecraft.wiki/w/Coral_Fans), [Dead Coral
  Fans](https://minecraft.wiki/w/Dead_Coral_Fans), [Coral
  Blocks](https://minecraft.wiki/w/Coral_Blocks), and [Dead Coral
  Blocks](https://minecraft.wiki/w/Dead_Coral_Block). These require
  pickaxes with Silk Touch, except for Coral Blocks that can also be
  quick-mined with a non-silk-touch pickaxe (although doing so kills the
  corals). Mining non-block corals or fans do not consume tool
  durability. Mining Coral Blocks also mines non-block Corals, Coral Fans,
  and [Sea Pickles](https://minecraft.wiki/w/Sea_Pickle) attached to them
  with no tool durability nor hunger bar consumption, but non-block Corals
  and Fans are destroyed in this case because that's what happens in
  vanilla Minecraft.
* Added [Sea Pickle](https://minecraft.wiki/w/Sea_Pickle) to the category
  **Plants and Crops**. It requires shears to quick-mine, and does not
  consume tool durability. Yes I know sea pickle isn't a plant but
  Minecraft treats it as so. It's not my fault.

## 1.6.0 -- 2025-06-19

* Updated the addon for Minecraft Bedrock 1.21.90 [#5].
* The name of the addon shown in the pack list now contains version number,
  as requested by lycannon [#3].
* Fixed custom commands `;qmine prefs` and `;qmine admin` that have stopped
  working since MCBE 1.21.80. Reported by TELDAX-2 and Nicane (#4).
* Migrated to native custom commands introduced in MCBE 1.21.80. The
  per-player preferences UI can now be opened via `/qmine-prefs`, and the
  admin UI can be opened via `/qmine-admin`. Legacy commands still work,
  but they are deprecated and will probably be removed in the future. (The
  migration was my plan, but also suggested separately by XEnzoX9808)
* Added [Leaf Litter](https://minecraft.wiki/w/Leaf_Litter) to the category
  **Plants and Crops**. It requires shears to quick-mine, and does not
  consume durability. Suggested by captaingreed477
* Quick-mining now consumes the hunger bar proportionally to the number of
  blocks mined. And when the hunger bar of the player drops below 3 points
  (1.5 ham shanks), they lose their ability to perform
  quick-mining. Previously the addon didn't consume the hunger value at
  all.
  * Since this is essentially a nerf of the addon, this behavior can be
    turned off via worldwide settings that can be opened with
    `/qmine-admin` if you are on a singleplayer world or a server op.
  * We are not going to add a toggle button for turning consumption of tool
    durability off, because the addon has always done it since the very
    beginning.

## 1.5.0 -- 2025-06-19

* 1.5.0 was meant to be an update for Minecraft Bedrock 1.21.81 but its
  release was canceled.

## 1.4.0 -- 2025-03-27

* Updated the addon for Minecraft Bedrock 1.21.70.
* Added [Bush](https://minecraft.wiki/w/Bush), [Firefly
  Bush](https://minecraft.wiki/w/Firefly_Bush), [Short Dry
  Grass](https://minecraft.wiki/w/Short_Dry_Grass), and [Tall Dry
  Grass](https://minecraft.wiki/w/Tall_Dry_Grass) to the category **Plants
  and Crops**. These require shears to quick-mine, and do not consume
  durability.
* Improved the Player Preferences UI for better readability.

## 1.3.0 -- 2025-02-17

* Updated the addon for Minecraft Bedrock 1.21.60.
* Renamed the category **Stone, Cobblestone, Deepslate, and Cobbled
  Deepslate** into **Abundant Rocks such as Stone and Cobblestone**.
* Added [End Stone](https://minecraft.wiki/w/End_Stone) to the category
  **Abundant Rocks such as Stone and Cobblestone**, as suggested by
  snerj. Note that this category is disabled by default. Mass-destructing
  end stone where it is abundant may entail bad consequences. Care should
  be taken when doing that.

## 1.2.0 -- 2024-12-08

* Added a category for [Bookshelf](https://minecraft.wiki/w/Bookshelf)
  which is enabled by default, as suggested by SLEETYGRAPH5. This currently
  does not allow [Chiseled
  Bookshelf](https://minecraft.wiki/w/Chiseled_Bookshelf) to be quick-mined
  due to a technical issue. That is, although it's supposed to be a
  container but it doesn't have a block component `minecraft:inventory` and
  thus we cannot retrieve books inside it using the scripting API.
* Added a category for [Moss Block](https://minecraft.wiki/w/Moss_Block),
  [Moss Carpet](https://minecraft.wiki/w/Moss_Carpet), [Pale Moss
  Block](https://minecraft.wiki/w/Pale_Moss_Block), and [Pale Moss
  Carpet](https://minecraft.wiki/w/Pale_Moss_Carpet) which is disabled by
  default. They require hoes to quick-mine.
* Added [Pale Oak](https://minecraft.wiki/w/Pale_oak) log, stripped log,
  wood, and stripped wood, and leaves to their respective
  categories. [Creaking Heart](https://minecraft.wiki/w/Creaking_Heart)
  does not count as a wood-like block, and is not eligible for
  quick-mining.

## 1.1.10 -- 2024-12-04

* Updated the addon for Minecraft Bedrock 1.21.50. This is only a quick fix
  to make the addon compatible with this version. New blocks such as [Pale
  Oak](https://minecraft.wiki/w/Pale_oak) cannot be quick-mined yet.

## 1.1.9 -- 2024-11-09

* Fully grown [Mangrove
  Propagules](https://minecraft.wiki/w/Mangrove_Propagule) hanging from
  mangrove leaves are now automatically collected when the leaves are
  quick-mined, as long as auto-collection is enabled.
* Added categories for [Wood](https://minecraft.wiki/w/Wood), [Stripped
  Logs](https://minecraft.wiki/w/Stripped_Log), and [Stripped
  Wood](https://minecraft.wiki/w/Stripped_Wood). These are all disabled by
  default. These, and the category "Logs", work in a combining manner. For
  example, suppose you have enabled options for Logs and Stripped Logs,
  mining Logs also mines nearby Stripped Logs and vice versa, as long as
  they share the same wood type (such as
  [Oak](https://minecraft.wiki/w/Oak)). Suggested by SLEETYGRAPH5.
* Added a category for [Mineral
  Blocks](https://minecraft.wiki/w/Block_of_Mineral) which is disabled by
  default. This covers blocks of smelted metals and gem-like minerals
  except for [Block of
  Amethyst](https://minecraft.wiki/w/Block_of_Amethyst), which is covered
  by another category "Uncommon Rocks". It ignores variance in oxidization
  levels and waxing of [Block of
  Copper](https://minecraft.wiki/w/Block_of_Copper). Suggested by
  SLEETYGRAPH5.

## 1.1.8 -- 2024-10-26

* Added [Hay bales](https://minecraft.wiki/w/Hay_Bale) to the category
  "Plants and Crops", which is enabled by default. They require hoes to
  quick-mine, and consumes tool durability unlike wheat crops. Suggested by
  SLEETYGRAPH5.
* Added a category for bones, which currently contains only [Bone
  blocks](https://minecraft.wiki/w/Bone_Block). Quick-mining bones is
  disabled by default because (A) bones are typically used as building
  blocks and you don't want to destroy your buildings by accident, and (B)
  players don't usually search for
  [Fossils](https://minecraft.wiki/w/Fossil) to collect bones but they
  usually produce them by setting up a bonemeal farm. Suggested by
  SLEETYGRAPH5.

## 1.1.7 -- 2024-10-26

* Updated the addon for Minecraft Bedrock 1.21.40.
* The way how the game internally represents [Huge
  mushrooms](https://minecraft.wiki/w/Huge_mushroom) has significantly
  changed. Due to this change this addon can no longer differentiate red
  mushrooms from brown ones when it comes to determining whether to
  propagate quick-mining or not. That is, when a red mushroom and a brown
  mushroom have grown right next to each other with their caps touching,
  and when you mine the stem of one of them, the addon now takes both
  mushrooms down at once. This shouldn't be a problem in practice but it's
  still a behavioral change.

## 1.1.6 -- 2024-09-19

* Updated the addon for Minecraft Bedrock 1.21.30.
* Quick-mining [Snow](https://minecraft.wiki/w/Snow) with a silk-touch
  shovel now yields Snow in an amount corresponding to the number of layers
  of the block, except for 8 layers of Snow, which drops a [Snow
  Block](https://minecraft.wiki/w/Snow_Block). Previously silk touch didn't
  have any effects on Snow.
* When the named tool protection is enabled, the addon now aborts mining
  blocks when the durability of the tool goes down to 4. Previously it
  allowed tool durability to go down to 0, which meant the tool would break
  when you hit a mob with it just once. Now it will break on the 5th hit.
* Falling protection no longer takes place when a player is standing inside
  a non-solid block (i.e. blocks with no collisions) and the player tries
  to quick-mine the block. Previously the protection took place when you
  harvested a batch of plants while being inside it, which wasn't the
  protection was meant for.

## 1.1.5 -- 2024-08-19

* Updated the addon for Minecraft Bedrock 1.21.21.
* Corrected the dropping rate of mushrooms from Mushroom Blocks. Previously
  there was a 33.33% chance of dropping 0, 1, or 2 mushrooms
  respectively. Now they have a chance of 77.77% of dropping nothing, and
  respectively a chance of 11.11% to drop 1 or 2 mushrooms.
* Mushroom Stem Blocks no longer drop anything when mined with a
  non-silk-touch axe.

## 1.1.4 -- 2024-06-21

* Updated the addon for Minecraft Bedrock 1.21.0.

## 1.1.3 -- 2024-04-25

* Updated the addon for Minecraft Bedrock 1.20.80.
* Cocoa pods can now be quick-mined too. It's under the "Plants and Crops"
  category. They require axes to quick-mine. Immature pods yield 1 bean,
  and mature ones yield 3 beans. Neither RNG nor tool enchantments affect
  their drop rate.

## 1.1.2 -- 2024-03-17

* Updated the addon for Minecraft Bedrock 1.20.70.
* Fixed an issue where block breaking and item picking sound could also be
  heard in other dimensions at the same coordinates.

## 1.1.1 -- 2024-02-28

* Fixed an issue where quick-mining a large amount of blocks with a single
  click could crash the game. The issue was caused by an undocumented
  change in how scheduled promises are executed on Bedrock 1.20.60. Prior
  to the change the game engine would postpone running scheduled tasks when
  they were going to exceed the time budget (50 ms per tick), but now it
  appears to run all the tasks before entering the next game tick, and can
  trigger the watchdog when there are too many tasks even if they are small
  individually. C'mon Mojang, was the change really intentional? It doesn't
  make sense to me.

## 1.1.0 -- 2024-02-08

* Updated the addon for Minecraft Bedrock 1.20.60.
* Added a category for dirt-like blocks, which aren't quick-mined by
  default.
* Added a category for stone-like abundant rocks, which aren't quick-mined
  by default.
* Added a category for netherrack-like blocks, which aren't quick-mined by
  default.
* Fixed a bug where mining crops with a hoe reduces its durability when it
  shouldn't.

## 1.0.1 -- 2024-01-29

* Fixed a bug where Granite was missing from the category of non-stone
  common rocks.
* Fixed a bug where Nether fungus stems were missing from the category of
  logs.
* Fixed a bug where non-log wooden blocks (such as planks) would also count
  as logs. They are no longer quick-mined.
* Changed the log category so that stripped logs are excluded. They are no
  longer quick-mined.

## 1.0.0 -- 2024-01-28

* Initial release.
