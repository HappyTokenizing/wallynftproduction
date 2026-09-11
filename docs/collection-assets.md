# Collection assets

The registry uses the 2,000 rows of the Final Collection 6 `Collection Manifest.csv`: 1,990 standard editions and ten 1-of-1s. Duplicate/backup PNGs outside the manifest are excluded. Edition labels and traits come directly from that manifest. Earlier collection ranks and rarity tiers are not reused.

Rebuild the gallery with Python and Pillow:

```sh
python3 scripts/prepare_collection_assets.py --collection "/path/to/Final Collection 6"
```

The script exports 600px quality-90 RGBA WebP previews to `public/collection/final6/` and verifies every saved alpha value against the resized original. The website serves these previews directly to avoid an unnecessary second conversion. Full-resolution originals and mint metadata are not modified. Previous public asset paths remain available for existing links.

The five `public/editorial/final6-*.webp` pictures contain exact collection PNG heads composited over cleaned archival photographic plates. Hero, bridge, Wall Street and grain boats match the revised WALLY deck. The bridge has the corrected upward-sloping sunglass reflections. The additional housing scene uses WALLY #0220. Artwork and photographs belong to their respective rights holders; existing photo credits remain on the website.
