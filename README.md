# Quick Mining Addon

This is a Minecraft Bedrock addon for quickly mining ore veins and cutting
the entire trees down.

FIXME: more description

## Usage

FIXME

### Special cases

* **Log-like blocks**: Mining logs and woods (stripped or not) with an axe
  also mines non-player-placed leaves surrounding them. This is a fast
  simulation of decaying so the axe don't lose durability for this, and its
  enchantments don't apply. If you want to gather leaf blocks, mine them
  with shears or a Silk Touch hoe.
* **Mangrove trees**: Mining mangrove logs or roots with an axe mines the
  entire mangrove tree, including moss carpets touching them.
* **Azalea leaves**: Mining azalea leaves (flowering or not) with a hoe or
  shears also mines the other variants.
* **Huge Mushrooms**: Mining mushroom blocks (red or brown) with an axe
  also mines mushroom stems and vice versa.
* **Huge Nether Fungi**: Mining nether wart blocks (warped or not) with a
  hoe also mines surrounding shroomlights and vice versa.

### Known issues

* Hanging mangrove propagules aren't auto-collected. This is currently
  unfixable because their drop rate is not known to the community and thus
  we cannot simulate its loot table.
* Quick-mining huge mushrooms with a non-silk-touch axe yields too many
  mushrooms. This happens because we don't know their drop rate accurately.
* Custom ores added by add-ons aren't quick-mined. This is because:
  1. There are no standard block tags for ore blocks representing the
     required tool tier,
  2. Loot tables are not accessible from the scripting API, and
  3. The API doesn't provide any means to simulate what would be dropped
     when a block is mined.
* Mining a huge blob of Sculk blocks with a non-silk-touch hoe spawns a
  huge number of small experience orbs and may cause a lag, as opposed to
  spawning a few large experience orbs. This is because there is no means
  to spawn orbs whose value is larger than 1.

In short, these are issues that we can do absolutely nothing about. Ask
Mojang to improve the API if you want these to be fixed.

## Download

See [releases](https://github.com/depressed-pho/chunk-utilities/releases).

## Release notes

See [NEWS](NEWS.md).

## Tested on

* Minecraft Bedrock 1.19.51, M1 iPad Pro (11-inch, 3rd generation, model MHQU3J/A)

## Author

PHO

## License

[CC0](https://creativecommons.org/share-your-work/public-domain/cc0/)
“No Rights Reserved”
