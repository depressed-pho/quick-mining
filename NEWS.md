# Release notes

## 1.1.3 -- not released yet

* Updated the addon for Minecraft Bedrock 1.20.80.
* Cocoa pods can now be quick-mined too. It's under the "Plants and Crops"
  category. They require axes to quick-mine. Immature pods yield 1 bean,
  and mature ones yield 3 beans. Tool enchantments do not affect them at
  all.

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
