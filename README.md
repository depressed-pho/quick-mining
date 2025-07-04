# Quick Mining Addon

![Quick Mining Addon logo](doc/logo.png)

This is a Minecraft Bedrock addon for quickly mining ore veins and cutting
the entire trees down. With this addon enabled, when a player mines a
block, all the surrounding blocks with the same type break, which in turn
causes other blocks surrounding them with the same type to break in a chain
reaction.

![Screen shot of cutting trees down](doc/screenshot-00.jpg)
![Screen shot of mining coal vein](doc/screenshot-01.jpg)

There are already plenty of similar addons out there, and this is yet
another one joining the party. Why do we need more? What makes it different
from others?

1. **It respects tool enchantments.** Mining ores with *Fortune* pickaxes
   yields more. *Unbreaking* tools last longer. XP-producing blocks like
   Coal ores repair your *Mending* tools. *Silk Touch* may produce
   different kind of items depending on the block type.
2. **It consumes durability of your tools correctly.** Most vein-mining
   addons let you mine the entire vein with consuming durability worth only
   one use of your tool. This addon consumes durability worth one use per
   block you mine, making it less overpowered.
3. **It decays leaves fast.** Cutting logs with an axe also breaks leaves
   immediately, with no additional consumption of tool durability.
4. **It collects items and XP orbs for you.** Items produced by mining
   blocks are directly placed in your inventory. The same goes for XP orbs,
   unless you have damaged *Mending* tools and armors.
5. **It is customizable.** It comes with a configuration UI to let you
   customize the behavior of the addon, such as when to enable
   quick-mining, what kind of blocks should be quick-mined, and more.
6. **It can coexist with other addons.** Modifying `player.json` is one of
   the greatest ways to make an addon incompatible with others. This addon
   doesn't do things like that. Custom tools added by other addons should
   also work as long as they have vanilla-compatible [item
   tags](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/recipereference/examples/recipetaglist).

# Installation

1. Enable the behavior pack on your world. This automatically enables its
   resource pack counterpart. Enabling it globally is not recommended.
2. Enable **Beta APIs** in the experimental settings for your world.

# Usage

Quick-mining happens when you mine blocks with a suitable tool while
*sneaking*, such as cutting logs with an axe and mining ores with a
pickaxe. You must use a correct tool for your task, that is, cutting trees
with bare hand will not trigger quick-mining.

## Special cases

* **[Trees](https://minecraft.wiki/w/Tree)**:
  * Cutting [Logs](https://minecraft.wiki/w/Log) or
    [Wood](https://minecraft.wiki/w/Wood) also breaks non-player-placed
    leaves surrounding them. This is a fast simulation of decaying so your
    axe don't lose durability for this, and its enchantments don't
    apply. If you want to gather leaf blocks, break them with shears or a
    Silk Touch hoe.
  * There are 4 separate options for enabling quick-mining Logs, Stripped
    Logs, Wood, and Stripped Wood. These options work in a combining
    manner. For example, suppose you have enabled options for Logs and
    Stripped Logs, mining Logs also mines nearby Stripped Logs and vice
    versa, as long as they share the same wood type (such as
    [Oak](https://minecraft.wiki/w/Oak)).
* **[Mangrove trees](https://minecraft.wiki/w/Mangrove)**: Cutting mangrove
  logs or roots cuts the entire tree down, including moss carpets touching
  them and propagules hanging from leaves.
* **[Azalea leaves](https://minecraft.wiki/w/Azalea_tree)**:
  Breaking azalea leaves (flowering or not) also breaks the other variant.
* **[Huge Mushrooms](https://minecraft.wiki/w/Huge_mushroom)**:
  Mining mushroom blocks (red or brown) also mines mushroom stems and vice
  versa.
* **[Huge Nether Fungi](https://minecraft.wiki/w/Huge_fungus)**:
  Mining nether wart blocks (warped or not) also mines surrounding
  shroomlights and vice versa.

# Customization

Type `/qmine-prefs` on the chat screen. A customization UI will show
up. These are per-player settings and do not affect any other players.

![Screenshot of preferences UI](doc/prefs-ui.jpg)

Protection settings:

* **Abort mining blocks when your *named* tool is about to break**: With
  this option enabled, quick-mining will abort or will not trigger when the
  durability of your tool is depleting. This only applies to *named* tools.
* **Keep your ground blocks from getting quick-mined**: This option
  protects blocks underneath the player from being quick-mined. Note it's
  not perfect. The addon does not take account of the type of block you are
  standing on, so you can still accidentally fall down if you are on a
  gravity-affected block such as sand, or one that requires supporting
  blocks like redstone repeater.
* **Prevent you from accidentally breaking Budding Amethyst in Survival**:
  [Budding Amethyst](https://minecraft.wiki/w/Budding_Amethyst) is
  not eligible for quick-mining in the first place, but this option also
  prevents you from accidentally mining them with or without any
  tools. This doesn't mean a perfect protection. You can still break them
  with [TNT](https://minecraft.wiki/w/TNT), and
  [Creepers](https://minecraft.wiki/w/Creeper) don't care the
  option at all. *This option is disabled by default.*

Loots settings:

* **Automatically collect items and XP orbs**: Items produced by mining
  blocks are directly placed in your inventory as long as they
  fit. Overflowed items will be spawned as [item
  entities](https://minecraft.wiki/w/Item_(entity)) at the same
  location as the player. [Experience
  orbs](https://minecraft.wiki/w/Experience) go directly into any
  [Mending](https://minecraft.wiki/w/Mending) equipment until
  they are fully repaired, and excess XP will go into the player.

Quick-mining mode:

* **When sneaking**: Enable quick-mining only when the player is sneaking.
* **When not sneaking**: Enable quick-mining only when the player is not
  sneaking.
* **Always**: Always trigger quick-mining.
* **Never**: Never trigger quick-mining.

Block coverage:

* **Bones**: Enable quick-mining for [Bone
  blocks](https://minecraft.wiki/w/Bone_Block). They require pickaxes to
  quick-mine. *This option is disabled by default.*
* **Bookshelves**: Enable quick-mining for
  [Bookshelves](https://minecraft.wiki/w/Bookshelf). This currently does
  not allow [Chiseled
  Bookshelf](https://minecraft.wiki/w/Chiseled_Bookshelf) to be quick-mined
  due to a technical issue.
* **Clay, Mud, and Snow**: Enable quick-mining for
  [Clay](https://minecraft.wiki/w/Clay),
  [Mud](https://minecraft.wiki/w/Mud), [Snow
  Block](https://minecraft.wiki/w/Snow_Block), and
  [Snow](https://minecraft.wiki/w/Snow). These require
  [shovels](https://minecraft.wiki/w/Shovel) to quick-mine.
* **Corals**: Enable quick-mining for
  [Coral](https://minecraft.wiki/w/Coral), [Dead
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
* **Amethyst Buds and Clusters**: Enable quick-mining for [Amethyst
  Buds](https://minecraft.wiki/w/Amethyst_Cluster) of any size, as
  well as Amethyst Clusters. These require
  [pickaxes](https://minecraft.wiki/w/Pickaxe) with [Silk
  Touch](https://minecraft.wiki/w/Silk_Touch).
* **Dirt, Grass Block, and their variants**: Enable quick-mining for
  [Dirt](https://minecraft.wiki/w/Dirt), [Coarse
  Dirt](https://minecraft.wiki/w/Coarse_Dirt), [Dirt
  Path](https://minecraft.wiki/w/Dirt_Path),
  [Farmland](https://minecraft.wiki/w/Farmland), [Grass
  Block](https://minecraft.wiki/w/Grass_Block),
  [Mycelium](https://minecraft.wiki/w/Mycelium),
  [Podzol](https://minecraft.wiki/w/Podzol), and [Rooted
  Dirt](https://minecraft.wiki/w/Rooted_Dirt). Moisture level of
  Farmland is ignored. *This option is disabled by default.*
* **Glowstone and Sea Lantern**: Enable quick-mining for
  [Glowstone](https://minecraft.wiki/w/Glowstone) and [Sea
  Lantern](https://minecraft.wiki/w/Sea_Lantern). These require
  pickaxes.
* **Ice, Packed Ice, and Blue Ice**: Enable quick-mining for
  [Ice](https://minecraft.wiki/w/Ice), [Packed
  Ice](https://minecraft.wiki/w/Packed_Ice), and [Blue
  Ice](https://minecraft.wiki/w/Blue_Ice). Ice requires pickaxes
  to quick-mine, and the latter two additionally requires Silk
  Touch. Breaking ice with a non-silk-touch tool will turn it into
  [Water](https://minecraft.wiki/w/Water) if certain conditions
  are met.
* **Leaves**: Enable quick-mining for
  [Leaves](https://minecraft.wiki/w/Leaves). They require either
  [Shears](https://minecraft.wiki/w/Shears) or
  [hoes](https://minecraft.wiki/w/Hoe).
* **Logs and Nether Fungus Stems**: Enable quick-mining for non-stripped
  [Logs](https://minecraft.wiki/w/Log), including the [Nether
  fungus](https://minecraft.wiki/w/Huge_fungus) variants and [Mangrove
  Roots](https://minecraft.wiki/w/Mangrove_Roots). These require
  [axes](https://minecraft.wiki/w/Axe) to quick-mine. [Creaking
  Heart](https://minecraft.wiki/w/Creaking_Heart) does not count as a
  wood-like block, and is not eligible for quick-mining.
* **Mineral Blocks**: Enable quick-mining for [Mineral
  Blocks](https://minecraft.wiki/w/Block_of_Mineral), except for [Block of
  Amethyst](https://minecraft.wiki/w/Block_of_Amethyst) and Block of [Raw
  Metals](https://minecraft.wiki/w/Raw_Metal). It ignores variance in
  oxidization levels and waxing of [Block of
  Copper](https://minecraft.wiki/w/Block_of_Copper). These require pickaxes
  of varying tiers. *This option is disabled by default.*
* **Moss Blocks and Carpets**: Enable quick-mining for [Moss
  Block](https://minecraft.wiki/w/Moss_Block), [Moss
  Carpet](https://minecraft.wiki/w/Moss_Carpet), [Pale Moss
  Block](https://minecraft.wiki/w/Pale_Moss_Block), and [Pale Moss
  Carpet](https://minecraft.wiki/w/Pale_Moss_Carpet). These require
  hoes. *This option is disabled by default.*
* **Mushroom Blocks and Stems**: Enable quick-mining for [Huge
  Mushrooms](https://minecraft.wiki/w/Huge_mushroom). They require
  axes to quick-mine.
* **Netherrack, Crimson and Warped Nylium**: Enable quick-mining for
  [Netherrack](https://minecraft.wiki/w/Netherrack) and
  [Nylium](https://minecraft.wiki/w/Nylium). *This option is
  disabled by default.*
* **Obsidian and Crying Obsidian**: Enable quick-mining for
  [Obsidian](https://minecraft.wiki/w/Obsidian) and [Crying
  Obsidian](https://minecraft.wiki/w/Crying_Obsidian). These
  require pickaxes of at least diamond-tier.
* **Ores**: Enable quick-mining for [Ore
  blocks](https://minecraft.wiki/w/Ore) as well as [Ancient
  Debris](https://minecraft.wiki/w/Ancient_Debris), [Block of Raw
  Iron](https://minecraft.wiki/w/Block_of_Raw_Iron), and any other blocks
  of raw metal. They require pickaxes of varying tiers. Note that [Gilded
  Blackstone](https://minecraft.wiki/w/Gilded_Blackstone) does not count as
  ore and is not eligible for quick-mining.
* **Plants and Crops**: Enable quick-mining for several plants and
  crops. Mining crops with a hoe does not consume its durability.
  * [Cocoa pods](https://minecraft.wiki/w/Cocoa_Beans),
    [Melon](https://minecraft.wiki/w/Melon), and
    [Pumpkin](https://minecraft.wiki/w/Pumpkin) require axes to
    quick-mine.
  * [Nether Wart](https://minecraft.wiki/w/Nether_Wart) requires
    hoes to quick-mine, not sure if it's a plant though.
  * [Grass and Fern](https://minecraft.wiki/w/Grass) require
    either hoes or shears.
  * [Beetroot](https://minecraft.wiki/w/Beetroot),
    [Carrot](https://minecraft.wiki/w/Carrot),
    [Potato](https://minecraft.wiki/w/Potato), and
    [Wheat](https://minecraft.wiki/w/Wheat) require hoes.
  * [Glow Lichen](https://minecraft.wiki/w/Glow_Lichen) and
    [Vines](https://minecraft.wiki/w/Vines) require shears. Note
    that [Sculk Vein](https://minecraft.wiki/w/Sculk_Vein) does
    not count as a plant, while Glow Lichen counts although lichens are
    technically not plants.
  * [Sea Pickle](https://minecraft.wiki/w/Sea_Pickle) requires shears to
    quick-mine, and does not consume tool durability. It counts as a plant
    although it's in fact not.
  * [Bush](https://minecraft.wiki/w/Bush), [Firefly
    Bush](https://minecraft.wiki/w/Firefly_Bush), [Short Dry
    Grass](https://minecraft.wiki/w/Short_Dry_Grass), [Tall Dry
    Grass](https://minecraft.wiki/w/Tall_Dry_Grass), and [Leaf
    Litter](https://minecraft.wiki/w/Leaf_Litter) require shears, and they
    don't consume durability.
  * [Hay bales](https://minecraft.wiki/w/Hay_Bale) require hoes, and they
    do consume durability.
* **Abundant rocks such as Stone and Cobblestone**: Enable quick-mining for
  [Stone](https://minecraft.wiki/w/Stone),
  [Cobblestone](https://minecraft.wiki/w/Cobblestone), [Mossy
  Cobblestone](https://minecraft.wiki/w/Mossy_Cobblestone),
  [Deepslate](https://minecraft.wiki/w/Deepslate), [Cobbled
  Deepslate](https://minecraft.wiki/w/Cobbled_Deepslate), and [End
  Stone](https://minecraft.wiki/w/End_Stone). *This option is disabled by
  default.*
* **Non-stone Common Rocks such as Andesite, Basalt, and Tuff**: Enable
  quick-mining for [Andesite](https://minecraft.wiki/w/Andesite),
  [Basalt](https://minecraft.wiki/w/Basalt),
  [Diorite](https://minecraft.wiki/w/Diorite),
  [Granite](https://minecraft.wiki/w/Granite), and
  [Tuff](https://minecraft.wiki/w/Tuff). These require pickaxes to
  quick-mine. *This option is disabled by default.*
* **Uncommon Rocks such as Blackstone, Calcite, and Magma Block**: Enable
  quick-mining for
  [Blackstone](https://minecraft.wiki/w/Blackstone), [Block of
  Amethyst](https://minecraft.wiki/w/Block_of_Amethyst),
  [Calcite](https://minecraft.wiki/w/Calcite), [Dripstone
  Block](https://minecraft.wiki/w/Dripstone_Block), and [Magma
  Block](https://minecraft.wiki/w/Magma_Block). These require
  pickaxes to quick-mine. *This option is disabled by default.*
* **Gravel, Sand, and Red Sand**: Enable quick-mining for
  [Gravel](https://minecraft.wiki/w/Gravel),
  [Sand](https://minecraft.wiki/w/Sand), and Red Sand. These
  require shovels to quick-mine. *This option is disabled by default.*
* **Sculk Block, Catalyst, Sensor, Shrieker, and Vein**: Enable
  quick-mining for [Sculk](https://minecraft.wiki/w/Sculk), [Sculk
  Catalyst](https://minecraft.wiki/w/Sculk_Catalyst), [Sculk
  Sensor](https://minecraft.wiki/w/Sculk_Sensor), [Sculk
  Shrieker](https://minecraft.wiki/w/Sculk_Shrieker), and [Sculk
  Vein](https://minecraft.wiki/w/Sculk_Vein). These require hoes
  to quick-mine.
* **Soul Sand and Soul Soil**: Enable quick-mining for [Soul
  Sand](https://minecraft.wiki/w/Soul_Sand) and [Soul
  Soil](https://minecraft.wiki/w/Soul_Soil). These require shovels
  to quick-mine.
* **Stripped Logs and Stripped Nether Fungus Stems**: Enable quick-mining
  for [Stripped Logs](https://minecraft.wiki/w/Stripped_Log) including the
  [Nether fungus](https://minecraft.wiki/w/Huge_fungus) variants. These
  require axes to quick-mine. *This option is disabled by default.*
* **Stripped Wood and Stripped Hyphae**: Enable quick-mining for [Stripped
  Wood](https://minecraft.wiki/w/Stripped_Wood) including the [Nether
  fungus](https://minecraft.wiki/w/Huge_fungus) variants. These require
  axes to quick-mine. *This option is disabled by default.*
* **Terracotta**: Enable quick-mining for
  [Terracotta](https://minecraft.wiki/w/Terracotta), colored or
  not, but not including [glazed
  one](https://minecraft.wiki/w/Glazed_Terracotta). These require
  pickaxes to quick-mine. *This option is disabled by default.*
* **Crimson and Warped Wart Blocks, and Shroomlight**: Enable quick-mining
  for [Nether Wart
  Block](https://minecraft.wiki/w/Nether_Wart_Block), Warped Wart
  Block, and
  [Shroomlight](https://minecraft.wiki/w/Shroomlight). These
  require hoes to quick-mine.
* **Wood and Hyphae**: Enable quick-mining for
  [Wood](https://minecraft.wiki/w/Wood) including the [Nether
  fungus](https://minecraft.wiki/w/Huge_fungus) variants. These require
  axes to quick-mine. *This option is disabled by default.*

## For server admins

Players with operator privileges can also change worldwide settings by
typing `/qmine-admin` on the chat screen.

* **Consume hunger bar proportionally to the number of blocks mined**:
  Turning this option on makes quick-mining consume the hunger bar the same
  way as mining blocks in the regular way. And when the hunger bar of the
  player drops below 3 points (1.5 ham shanks), they lose their ability to
  perform quick-mining. Turning it off may slightly improve performance of
  the addon but makes it OP so it's not recommended.
* **Time budget for quick-mining in milliseconds per tick**: Setting this
  to higher values may speed up the process of quick-mining, but can cause
  severe server lags. MCBE addons are single-threaded, that is, addon
  scripts run on the same thread that ticks the server. This means addons
  cannot spend too much time in each game tick, so this addon measures the
  time it's taking and reschedules its remaining work for the next tick if
  it's going to take longer than this value. It is not recommended to
  change this value unless you know what you are doing.
* **Maximum horizontal distance for blocks to quick-mine**, **Maximum
  vertical distance for blocks to quick-mine**: The range of blocks to be
  quick-mined is limited by these values. Setting them to higher values
  would allow players to cause a massive destruction.

# Known issues

* This addon shows a welcome message when you join a world where the addon
  is installed. But the message is sometimes not shown as of Minecraft
  Bedrock 1.21.60. This is because the game spawns players long before it
  starts rendering the world for them, and addons can't know the real
  readiness. If this happens to you, you can still see the message by
  opening the chat screen.
* Tall variants of [Grass and
  Fern](https://minecraft.wiki/w/Grass) cannot be quick-mined due
  to the way how they are implemented in the game. That is, replacing their
  upper half with `minecraft:air` causes their lower half to break, and we
  cannot collect loots from their lower halves. The same goes for [tall
  flowers](https://minecraft.wiki/w/Flower).
* [Snowlogged](https://minecraft.wiki/w/Snowlogging) plants cannot be
  quick-mined, neither with hoes nor shovels. This is because snowlogged
  blocks seem to be internally represented in a very ad-hoc way, that is,
  they are represented as [snow layers](https://minecraft.wiki/w/Snow) with
  a block state indicating that they are covering *something*, but the
  thing they cover is not accessible from the scripting API. Addons can
  therefore not uncover them nor harvest covered plants.
* [Chiseled Bookshelf](https://minecraft.wiki/w/Chiseled_Bookshelf) cannot
  be quick-mined. It is supposed to be a container but it doesn't have a
  block component `minecraft:inventory` and thus we cannot retrieve books
  inside it using the scripting API.
* Using the [/reload](https://minecraft.wiki/w/Commands/reload) command
  makes the addon temporarily non-working until the server is
  restarted. This is because addons aren't notified when they are about to
  be reloaded so they cannot save their internal state to survive
  reloading. `/reload all` works fine though.
* Custom ores or wood added by add-ons aren't quick-mined. This is because:
  1. There are no standard block tags for ore blocks representing the
     required tool tier,
  2. Loot tables are not accessible from the scripting API, and
  3. The API doesn't provide any means to simulate what would be dropped
     when a block is mined.

In short, these are issues that we can do absolutely nothing about. Ask
Mojang to improve the API if you want these to be fixed.

# Download

See [releases](https://github.com/depressed-pho/quick-mining/releases).

# Release notes

See [NEWS](NEWS.md).

# Tested on

* M1 iPad Pro (iOS)

# Author

PHO

# License

[CC0](https://creativecommons.org/share-your-work/public-domain/cc0/)
“No Rights Reserved”
