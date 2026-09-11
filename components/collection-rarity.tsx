'use client';

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable rarity table must be reachable by keyboard. */

import { useMemo, useState } from 'react';

type CollectionEntry = {
  color: string | null;
  hat: string | null;
  tusk: string | null;
  oneOfOne: boolean;
};

const categories = [
  { key: 'color', label: 'Colors' },
  { key: 'hat', label: 'Hats' },
  { key: 'tusk', label: 'Tusks' },
] as const;

export function CollectionRarity({ items }: { items: CollectionEntry[] }) {
  const [category, setCategory] = useState<'color' | 'hat' | 'tusk'>('color');
  const frequencies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const trait = item[category] ?? 'Unique';
      counts.set(trait, (counts.get(trait) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  }, [category, items]);
  const oneOfOnes = items.filter((item) => item.oneOfOne).length;
  const label = categories.find((entry) => entry.key === category)?.label;
  const percent = (count: number) =>
    `${((count / items.length) * 100).toFixed(2).replace(/\.?0+$/, '')}%`;

  return (
    <details className="collection-rarity">
      <summary>
        <span>Collection rarity</span>
        <span className="rarity-toggle" aria-hidden="true" />
      </summary>
      <div className="rarity-panel">
        <div className="rarity-intro">
          <div>
            <h3>Inside the herd</h3>
            <p>
              Trait frequencies across all {items.length.toLocaleString()} NFTs.
              Rarest traits appear first.
            </p>
          </div>
          <p className="rarity-editions">
            <strong>{oneOfOnes} one-of-ones</strong>
            <span>{percent(oneOfOnes)} of the collection</span>
          </p>
        </div>
        <div
          className="edition-tabs rarity-categories"
          aria-label="Rarity trait category"
        >
          {categories.map((entry) => (
            <button
              type="button"
              key={entry.key}
              aria-pressed={category === entry.key}
              aria-controls="rarity-frequencies"
              className={category === entry.key ? 'active' : ''}
              onClick={() => setCategory(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <section
          className="rarity-scroll"
          id="rarity-frequencies"
          tabIndex={0}
          aria-label={`${label} rarity details`}
        >
          <table>
            <caption>
              {label} · {frequencies.length} traits
            </caption>
            <thead>
              <tr>
                <th scope="col">Trait</th>
                <th scope="col">NFTs</th>
                <th scope="col">Collection</th>
              </tr>
            </thead>
            <tbody>
              {frequencies.map(([trait, count]) => (
                <tr key={trait}>
                  <th scope="row">{trait}</th>
                  <td>{count.toLocaleString()}</td>
                  <td>{percent(count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </details>
  );
}
