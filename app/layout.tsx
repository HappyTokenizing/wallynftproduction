import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/site-analytics';
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/newsreader/latin-600.css';
import '@fontsource/newsreader/latin-400-italic.css';
import '@fontsource/unifrakturcook/latin-700.css';
import '@fontsource/libre-franklin/latin-700.css';
import './globals.css';
import './edition.css';
import './arrival.css';
import './vintage.css';
import './broadsheet.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://wallynftproduction.vercel.app'),
  title: 'The Daily Times Journal Bulletin: WALLY NFT',
  description:
    'A special television bulletin from Wally and 2,000 NFT holders working to bring the real world onchain through fair, open RWA markets.',
  openGraph: {
    title: 'The Daily Times Journal Bulletin: WALLY NFT',
    description:
      '2,000 NFT holders. One mission. Bring the real world onchain.',
    type: 'website',
    images: [
      {
        url: '/editorial/final6-hero.webp',
        width: 1568,
        height: 1003,
        alt: 'The WALLY herd, led by the Rainbow Gradient 1-of-1',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Daily Times Journal Bulletin: WALLY NFT',
    description:
      '2,000 NFT holders. One mission. Bring the real world onchain.',
    images: ['/editorial/final6-hero.webp'],
  },
  icons: {
    icon: '/wally-logo-mark.png',
    apple: '/wally-logo-mark.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.VERCEL_ENV === 'production' && <SiteAnalytics />}
      </body>
    </html>
  );
}
