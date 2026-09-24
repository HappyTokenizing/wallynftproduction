"""Build the public Final Collection 6 gallery without flattening transparency."""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageChops

PROJECT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--collection', type=Path, required=True)
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--inventory', type=Path, required=True, help='Verified source inventory with SHA-256 hashes')
    args = parser.parse_args()
    rows = list(csv.DictReader((args.collection / 'Collection Manifest.csv').open(newline='')))
    rows.sort(key=lambda row: int(row['token_id']))
    if [int(row['token_id']) for row in rows] != list(range(1, 2001)):
        raise ValueError('Expected exactly the 2,000 unique Final Collection 6 token IDs.')
    if sum(row['edition'] == '1 of 1' for row in rows) != 10:
        raise ValueError('Expected ten 1-of-1 editions.')
    inventory = json.loads(args.inventory.read_text())
    expected = {entry['filename']: entry for entry in inventory['files']}
    if len(expected) != 2000:
        raise ValueError('Expected an inventory of 2,000 canonical source files.')
    asset_version = 'final6-20260922'
    output = PROJECT / 'public/collection' / asset_version
    output.mkdir(parents=True, exist_ok=True)

    def prepare(row: dict) -> dict:
        token_id = int(row['token_id'])
        source = args.collection / row['filename']
        if source.parent != args.collection or not source.is_file():
            raise ValueError(f'Invalid manifest source: {source}')
        before = source.stat()
        digest = hashlib.sha256()
        with source.open('rb') as handle:
            for block in iter(lambda: handle.read(1024 * 1024), b''):
                digest.update(block)
        source_hash = digest.hexdigest()
        if source_hash != expected[row['filename']]['sha256']:
            raise ValueError(f'Source differs from approved inventory: {source.name}')
        with Image.open(source) as image:
            if image.size != (4608, 4608) or image.mode != 'RGBA':
                raise ValueError(f'Unexpected source format: {source.name}')
            image = image.resize((600, 600), Image.Resampling.LANCZOS)
            destination = output / f'{token_id:04d}.webp'
            image.save(destination, 'WEBP', quality=90, exact=True, method=4)
            with Image.open(destination) as saved:
                if ImageChops.difference(image.getchannel('A'), saved.convert('RGBA').getchannel('A')).getbbox():
                    raise ValueError(f'Transparency verification failed: {destination.name}')
        after = source.stat()
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            raise ValueError(f'Source changed during export: {source.name}; rerun the export.')
        unique = row['edition'] == '1 of 1'
        return {
            'id': token_id, 'number': f'{token_id:04d}',
            'name': row['color'] if unique else f'Wally #{token_id:04d}',
            'image': f'/collection/{asset_version}/{token_id:04d}.webp',
            'sourceSha256': source_hash,
            'tier': row['edition'], 'color': row['color'],
            'hat': None if unique else row['hat'],
            'tusk': None if unique else row['tusk'], 'oneOfOne': unique,
        }

    records = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for record in pool.map(prepare, rows):
            records.append(record)
            if len(records) % 250 == 0:
                print(f'Exported and verified {len(records)}/2000', flush=True)
    payload = {
        'collectionVersion': 'Final Collection 6 — September 22, 2026',
        'sourceDimensions': [4608, 4608], 'previewDimensions': [600, 600],
        'totalSupply': len(records),
        'previewCount': len(records),
        'distribution': [
            {'tier': 'Standard', 'count': 1990, 'percent': 99.5, 'color': '#d8e3dc'},
            {'tier': '1 of 1', 'count': 10, 'percent': 0.5, 'color': '#f0bf54'},
        ],
        'items': records,
    }
    (PROJECT / 'public/collection.json').write_text(json.dumps(payload, indent=2) + '\n')
    total_bytes = sum(p.stat().st_size for p in output.glob('*.webp'))
    print(f'Prepared {len(records)} verified transparent previews; {total_bytes / 1e6:.1f} MB total.', flush=True)


if __name__ == '__main__':
    main()
