import type { Metadata } from 'next';
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
  metadataBase: new URL('https://wallynftstaging4.vercel.app'),
  title: 'The Daily Times Journal Bulletin: WALLY NFT',
  description:
    'A special television bulletin from Wally and 1,000 leaders working to bring the real world onchain through fair, open RWA markets.',
  openGraph: {
    title: 'The Daily Times Journal Bulletin: WALLY NFT',
    description: '1,000 leaders. One mission. Bring the real world onchain.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1719,
        height: 900,
        alt: 'The Daily Times Journal Bulletin: The real world is coming onchain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Daily Times Journal Bulletin: WALLY NFT',
    description: '1,000 leaders. One mission. Bring the real world onchain.',
    images: ['/og.png'],
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
      <body>{children}</body>
    </html>
  );
}
