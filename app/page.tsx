'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { BroadcastIntro } from '@/components/broadcast-intro';
import { NewsletterPopup } from '@/components/newsletter-popup';
import { NewsletterSignup } from '@/components/newsletter-signup';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import collectionPayload from '@/public/collection.json';

type Wally = {
  id: number;
  number: string;
  name: string;
  image: string;
  tier: string;
  rank: number;
  score: number;
  color: string | null;
  hat: string | null;
  tusk: string | null;
  oneOfOne: boolean;
};

type Distribution = {
  tier: string;
  count: number;
  percent: number;
  color: string;
};

type CollectionData = {
  totalSupply: number;
  previewCount: number;
  distribution: Distribution[];
  items: Wally[];
};

const collection = collectionPayload as CollectionData;
const featuredNumbers = [
  '0001',
  '0003',
  '0014',
  '0027',
  '0140',
  '0280',
  '0296',
  '0347',
] as const;
const featuredOrder = new Map<string, number>(
  featuredNumbers.map((number, index) => [number, index]),
);
const orderedCollectionItems = [...collection.items].sort((a, b) => {
  const aOrder = featuredOrder.get(a.number) ?? Number.MAX_SAFE_INTEGER;
  const bOrder = featuredOrder.get(b.number) ?? Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
});
const tierOrder = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', '1 of 1'];
const editionSections = [
  ['story', 'Front Page', 'Lead Story'],
  ['world', 'World Desk', 'Real Assets'],
  ['herd', 'Special Report', 'The 1,000'],
  ['registry', 'Classifieds', 'Collection Index'],
  ['activations', 'Public Square', 'Dispatches'],
] as const;
const worldDeskStories = [
  {
    src: '/editorial/bridge-elephant-laurel-wally.png',
    alt: 'A real elephant with a full color laurel wreath Wally NFT head at a 1943 bridge construction site',
    desk: 'INFRASTRUCTURE',
    title: 'The rails, bridges, and public works that hold value together.',
    copy: 'Real world assets begin with the systems people rely on every day. Onchain markets can widen how that value is understood and accessed.',
    credit: 'Library of Congress · FSA/OWI · 1943',
  },
  {
    src: '/editorial/wall-street-elephant-top-hat-wally-v2.png',
    alt: 'A real elephant with a full color top hat Wally NFT head on Wall Street in 1917',
    desk: 'MARKETS',
    title: 'Old markets meet open rails.',
    copy: 'Transparency should travel farther than privilege.',
    credit: 'Library of Congress · 1917',
  },
  {
    src: '/editorial/grain-boats-elephant-wally.png',
    alt: 'A real elephant with a full color winter hat Wally NFT head beside grain elevators in 1943',
    desk: 'COMMERCE',
    title: 'Goods move. Ownership can move better.',
    copy: 'Trade, inventory, and productive assets belong in a more connected system.',
    credit: 'Library of Congress · FSA/OWI · 1943',
  },
  {
    src: '/editorial/housing-elephant-wally.png',
    alt: 'A real elephant with a full color crowned Wally NFT head near prefabricated housing in 1941',
    desk: 'HOUSING',
    title: 'The onchain world must still serve the real one.',
    copy: 'Technology matters when it improves access to the assets that shape daily life.',
    credit: 'Library of Congress · FSA/OWI · 1941',
  },
] as const;

function tierSlug(tier: string) {
  return tier.toLowerCase().replaceAll(' ', '-');
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeTier, setActiveTier] = useState('All');
  const [collectionOrder, setCollectionOrder] = useState<'featured' | 'number'>(
    'featured',
  );
  const [visibleCount, setVisibleCount] = useState(8);
  const [signalOpen, setSignalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('story');
  const [replaySignal, setReplaySignal] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-18% 0px -64% 0px', threshold: [0.04, 0.2, 0.5] },
    );
    editionSections.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^#/, '');
    const items =
      collectionOrder === 'number' ? collection.items : orderedCollectionItems;
    return items.filter((item) => {
      const tierMatch = activeTier === 'All' || item.tier === activeTier;
      const searchText = [
        item.number,
        item.name,
        item.color,
        item.hat,
        item.tusk,
        item.tier,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return tierMatch && (!needle || searchText.includes(needle));
    });
  }, [activeTier, collectionOrder, query]);

  const chooseTier = (tier: string) => {
    setActiveTier(tier);
    setVisibleCount(8);
  };

  return (
    <div className="edition-shell" id="top">
      <a className="skip-link" href="#story">
        Skip to today&apos;s edition
      </a>

      <header className="edition-nav">
        <a className="edition-brand" href="#top" aria-label="Wally NFT home">
          <Image
            src="/wally-logo-mark.png"
            alt=""
            width={84}
            height={84}
            priority
          />
          <span>
            WALLY NFT<small>DAILY EDITION</small>
          </span>
        </a>
        <nav aria-label="Edition sections">
          {editionSections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? 'active' : ''}
              aria-current={activeSection === id ? 'location' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <button type="button" onClick={() => setSignalOpen(true)}>
          Coming soon
        </button>
      </header>

      <main className="edition-main">
        <BroadcastIntro key={replaySignal} />

        <section
          className="front-page"
          id="story"
          aria-labelledby="front-page-title"
        >
          <div className="newspaper-flag">
            <span>ALL THE NEWS THAT FITS THE ONCHAIN ERA</span>
            <span>SPECIAL DIGITAL EDITION · 1,000 LEADERS</span>
          </div>
          <div className="newspaper-masthead">
            <p>Independent dispatches from the onchain frontier</p>
            <h1>The Daily Times Journal Bulletin</h1>
            <p>Fair markets for the real world · Est. 2026</p>
          </div>
          <div className="newspaper-date-line">
            <span>VOL. I · NO. 001</span>
            <span>SUNDAY, AUGUST 30, 2026</span>
            <span>PRICE: CONVICTION</span>
          </div>

          <nav className="edition-index" aria-label="In this edition">
            {editionSections.map(([id, label, description], index) => (
              <a href={`#${id}`} key={id}>
                <span>PAGE {index + 1}</span>
                <strong>{label}</strong>
                <small>{description}</small>
              </a>
            ))}
          </nav>

          <div className="front-headline">
            <p>BREAKING NEWS!</p>
            <h2 id="front-page-title">
              Wally rallies 1,000 leaders for a fair onchain world.
            </h2>
            <strong>
              A mission driven collection carries real world value into a more
              open financial era.
            </strong>
          </div>

          <div className="front-grid">
            <figure className="front-portrait">
              <Image
                src="/editorial/breaking-news-wally-herd-v2.png"
                alt="Five real black and white elephants with distinct full color Wally NFT heads, led by Rainbow Wally"
                width={1536}
                height={1024}
                sizes="(max-width: 760px) 92vw, 40vw"
                priority
              />
              <figcaption>
                Five leaders answer the call · The RWA Herd is 1,000 strong
              </figcaption>
            </figure>

            <article className="lead-copy">
              <p className="front-byline">By The Wally Editorial Desk</p>
              <p className="lead-dropcap">
                The world holds enormous value. Access to it is still too
                narrow. Wally exists to make the shift to real world assets
                understandable, memorable, and human.
              </p>
              <p>
                The collection brings together people who believe markets can be
                more open, transparent, and useful when the real world moves
                onchain responsibly.
              </p>
              <a href="#herd">Meet the 1,000 leaders</a>
            </article>

            <aside className="front-briefs" aria-label="Mission at a glance">
              <p>WHY IT MATTERS</p>
              <dl>
                <div>
                  <dt>01</dt>
                  <dd>Bring value onchain</dd>
                </div>
                <div>
                  <dt>02</dt>
                  <dd>Keep markets fair</dd>
                </div>
                <div>
                  <dt>03</dt>
                  <dd>Open access wider</dd>
                </div>
              </dl>
            </aside>
          </div>
          <a className="page-turn" href="#world">
            Turn to the World Desk <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          className="world-desk"
          id="world"
          aria-labelledby="world-desk-title"
        >
          <div className="section-rule">
            <span>REAL WORLD REPORT</span>
            <span id="world-desk-title">What Comes Onchain</span>
          </div>
          <div className="world-grid">
            {worldDeskStories.map((story, index) => (
              <article
                className={`world-story${index === 0 ? ' world-story-lead' : ''}`}
                key={story.title}
              >
                <figure>
                  <Image
                    src={story.src}
                    alt={story.alt}
                    width={1024}
                    height={790}
                    sizes={
                      index === 0
                        ? '(max-width: 700px) 92vw, 48vw'
                        : '(max-width: 700px) 92vw, 23vw'
                    }
                  />
                  <figcaption>{story.credit}</figcaption>
                </figure>
                <p>{story.desk}</p>
                <h2>{story.title}</h2>
                <p>{story.copy}</p>
              </article>
            ))}
            <article className="world-story broadcast-replay-story">
              <p>BROADCAST ARCHIVE</p>
              <div className="broadcast-replay-mark" aria-hidden="true">
                ↻
              </div>
              <h2>Replay the opening bulletin.</h2>
              <p>
                Return to the television desk and watch today&apos;s special
                report from the beginning.
              </p>
              <button
                type="button"
                onClick={() => setReplaySignal((signal) => signal + 1)}
              >
                Replay broadcast <span aria-hidden="true">↻</span>
              </button>
            </article>
          </div>
          <a className="page-turn" href="#herd">
            Continue to the Special Report <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          className="herd-edition"
          id="herd"
          aria-labelledby="herd-title"
        >
          <div className="section-rule">
            <span>CONTINUED FROM FRONT PAGE</span>
            <span>Special Report: The 1,000</span>
          </div>
          <div className="herd-lead">
            <div className="herd-number" aria-hidden="true">
              1,000
            </div>
            <div>
              <p>ONE FIXED GENESIS COLLECTION</p>
              <h2 id="herd-title">
                Not spectators.
                <br />
                Leaders.
              </h2>
              <p>
                Founders, builders, educators, investors, and believers helping
                the RWA Foundation bring the world onchain.
              </p>
            </div>
          </div>
          <div className="rarity-table" aria-label="Collection rarity">
            {collection.distribution.map((entry) => (
              <div key={entry.tier}>
                <span>{entry.tier}</span>
                <strong>{entry.count}</strong>
                <small>{entry.percent}%</small>
              </div>
            ))}
          </div>
          <a className="page-turn" href="#registry">
            Open the Collection Index <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          className="collection-edition"
          id="registry"
          aria-labelledby="registry-title"
        >
          <div className="section-rule inverse">
            <span>THE COLLECTION INDEX</span>
            <span>Archive &amp; Rarity</span>
          </div>
          <div className="collection-heading">
            <div>
              <p>THE GENESIS REGISTRY · RECORDS 0001 TO 1000</p>
              <h2 id="registry-title">The Wally Classifieds</h2>
              <small className="sample-collection-note">sample collection</small>
            </div>
            <p>Search by number, color, hat, tusk, or rarity.</p>
          </div>

          <div className="collection-tools">
            <label>
              <span className="sr-only">Search the Wally collection</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(8);
                }}
                placeholder="Search the archive by # or trait"
                aria-label="Search the Wally collection"
              />
            </label>
            <div className="edition-tabs" aria-label="Filter by rarity">
              {tierOrder.map((tier) => (
                <button
                  type="button"
                  key={tier}
                  className={activeTier === tier ? 'active' : ''}
                  onClick={() => chooseTier(tier)}
                  aria-pressed={activeTier === tier}
                >
                  {tier}
                </button>
              ))}
            </div>
            <div className="collection-order" aria-label="Collection order">
              <button
                type="button"
                className={collectionOrder === 'featured' ? 'active' : ''}
                onClick={() => {
                  setCollectionOrder('featured');
                  setVisibleCount(8);
                }}
                aria-pressed={collectionOrder === 'featured'}
              >
                Featured
              </button>
              <button
                type="button"
                className={collectionOrder === 'number' ? 'active' : ''}
                onClick={() => {
                  setCollectionOrder('number');
                  setVisibleCount(8);
                }}
                aria-pressed={collectionOrder === 'number'}
              >
                # Order
              </button>
            </div>
            <output className="collection-count" aria-live="polite">
              {filteredItems.length} records
            </output>
          </div>

          <div className="edition-grid">
            {filteredItems.slice(0, visibleCount).map((item) => (
              <article className="edition-card" key={item.number}>
                <div className="edition-card-image">
                  <Image
                    src={item.image}
                    alt={`${item.name}: ${item.color ?? 'special color'}, ${item.hat ?? 'special headwear'}`}
                    width={600}
                    height={600}
                    sizes="(max-width: 620px) 46vw, (max-width: 980px) 31vw, 23vw"
                  />
                  <span className={`edition-tier tier-${tierSlug(item.tier)}`}>
                    {item.tier}
                  </span>
                </div>
                <div className="edition-card-copy">
                  <h3>{item.name}</h3>
                  <p>Rank {String(item.rank).padStart(4, '0')}</p>
                  <dl>
                    <div>
                      <dt>Color</dt>
                      <dd>{item.color ?? 'Unique'}</dd>
                    </div>
                    <div>
                      <dt>Hat</dt>
                      <dd>{item.hat ?? 'One of one'}</dd>
                    </div>
                    <div>
                      <dt>Tusk</dt>
                      <dd>{item.tusk ?? 'Unique'}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
            {filteredItems.length === 0 && (
              <div className="edition-empty">
                <h3>No Wally found.</h3>
                <p>Try another number or trait.</p>
              </div>
            )}
          </div>

          {visibleCount < filteredItems.length && (
            <button
              type="button"
              className="edition-more"
              onClick={() => setVisibleCount((count) => count + 8)}
            >
              Show more leaders
            </button>
          )}
          <a className="page-turn" href="#newsletter">
            Receive the Herd Dispatch <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          className="newsletter-edition"
          id="newsletter"
          aria-labelledby="newsletter-title"
        >
          <div className="section-rule">
            <span>THE HERD DISPATCH</span>
            <span>News Delivered Direct</span>
          </div>
          <div className="newsletter-grid">
            <div className="newsletter-copy">
              <p>THE NEWSLETTER</p>
              <h2 id="newsletter-title">Heard from the Herd.</h2>
              <p>
                A concise briefing on Wally, the collection, and the movement
                bringing real world assets into fair and open markets.
              </p>
            </div>
            <div className="newsletter-signup-panel">
              <NewsletterSignup />
              <div className="newsletter-newswire">
                <span>FOLLOW THE NEWSWIRE</span>
                <a
                  href="https://x.com/WALLYCollection"
                  target="_blank"
                  rel="noreferrer"
                >
                  @WALLYCollection on X / Twitter
                </a>
              </div>
            </div>
          </div>
          <a className="page-turn" href="#activations">
            Read Dispatches &amp; Activations <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          className="activation-edition"
          id="activations"
          aria-labelledby="activation-title"
        >
          <div className="section-rule">
            <span>THE PUBLIC SQUARE</span>
            <span>Dispatches &amp; Activations</span>
          </div>
          <div className="activation-headline">
            <p>NEXT EDITION</p>
            <h2 id="activation-title">The herd moves beyond the page.</h2>
          </div>
          <div className="activation-columns">
            {[
              ['Research', 'Make real world assets easier to understand.'],
              ['Gatherings', 'Connect the people building fair markets.'],
              ['Missions', 'Turn attention into useful public action.'],
            ].map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <small>COMING SOON</small>
              </article>
            ))}
          </div>
        </section>

        <section className="edition-signoff">
          <Image
            src="/collection/0510.webp"
            alt="Wally leader No. 0510"
            width={600}
            height={600}
            sizes="(max-width: 760px) 80vw, 38vw"
          />
          <div>
            <p>THE WALLY PLEDGE</p>
            <h2>
              Bring the world onchain.
              <br />
              Make it fair for all.
            </h2>
            <button type="button" onClick={() => setSignalOpen(true)}>
              Stand by for launch
            </button>
          </div>
        </section>
      </main>

      <footer className="edition-footer">
        <strong>The Daily Times Journal Bulletin</strong>
        <p>Mission driven culture for fair and open RWA markets.</p>
        <nav aria-label="Footer navigation">
          <a href="#story">Front Page</a>
          <a href="#world">World Desk</a>
          <a href="#registry">Registry</a>
          <a href="#newsletter">Newsletter</a>
          <a href="#activations">Dispatches</a>
          <a
            href="https://x.com/WALLYCollection"
            target="_blank"
            rel="noreferrer"
          >
            @WALLYCollection
          </a>
        </nav>
      </footer>

      <Dialog open={signalOpen} onOpenChange={setSignalOpen}>
        <DialogContent className="edition-dialog">
          <span>THE DAILY TIMES JOURNAL BULLETIN</span>
          <DialogTitle>Stand by for the next edition.</DialogTitle>
          <DialogDescription>
            Collection launch details and the first public activations will be
            announced here soon.
          </DialogDescription>
          <p>LAUNCH APPROACHING · 1,000 LEADERS</p>
          <DialogClose className="edition-dialog-close">
            Return to the paper
          </DialogClose>
        </DialogContent>
      </Dialog>
      <NewsletterPopup />
    </div>
  );
}
