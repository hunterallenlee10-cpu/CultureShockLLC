import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Inter, JetBrains_Mono } from 'next/font/google';
import { site } from '@/content/site';
import { SmoothScroll } from '@/components/chrome/SmoothScroll';
import { Grain } from '@/components/chrome/Grain';
import { Cursor } from '@/components/chrome/Cursor';
import { Hud } from '@/components/chrome/Hud';
import { ShockTransition } from '@/components/chrome/ShockTransition';
import { Preloader, preloaderScript } from '@/components/chrome/Preloader';
import { FullscreenPlayer } from '@/components/media/FullscreenPlayer';
import './globals.css';

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  // Display type is always italic: 900 headlines, 800 sub-heads/buttons, 700 tracked taglines.
  weight: ['700', '800', '900'],
  style: ['italic'],
  variable: '--font-barlow',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: '%s — Culture Shock' },
  description: site.seo.description,
  applicationName: site.name,
  keywords: [
    'video production DMV',
    'Baltimore videographer',
    'DC video production',
    'branded content',
    'sports cinematography',
    'event coverage',
    'documentary',
    'photography',
    'Culture Shock',
  ],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: site.seo.title, description: site.seo.description },
  icons: { icon: '/icon.svg' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[200] rounded bg-gold px-4 py-2 font-medium text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll />
        <Hud />
        <main id="main">{children}</main>
        <ShockTransition />
        <FullscreenPlayer />
        <Grain />
        <Cursor />
      </body>
    </html>
  );
}
