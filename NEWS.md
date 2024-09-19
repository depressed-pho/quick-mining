# Release notes

## 1.1.6 -- not released yet

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
