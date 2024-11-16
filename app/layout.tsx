import Navbar from '@/components/Navbar';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

let title = 'Suk-Link - Suk's Short Link Generator';
let description = '生成属于你自己的短链接';
let url = 'https://suk-link-code.vercel.app';
let ogimage = 'https://slink-code.vercel.app/og-image.png';
let sitename = 'suk-link-code.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh_cn">
      <head>
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
