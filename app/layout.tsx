import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Mali, Mountains_of_Christmas } from 'next/font/google';
import './globals.css';

const mali = Mali({ weight: ['400', '600', '700'], subsets: ['thai', 'latin'], variable: '--font-mali', display: 'swap' });
const xmas = Mountains_of_Christmas({ weight: '700', subsets: ['latin'], variable: '--font-xmas', display: 'swap' });

export const metadata: Metadata = {
  title: 'DBD Gacha Gift Exchange 🎄',
  description: 'จับฉลากแลกของขวัญคริสต์มาส & ปีใหม่ ด้วยตู้กาชาปอง',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b1240',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={`${mali.variable} ${xmas.variable}`}>
      <body>{children}</body>
    </html>
  );
}
