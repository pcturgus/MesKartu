import type { Metadata } from "next";
// Self-hosted font files (from @fontsource, downloaded from the npm
// registry at install time) instead of the old CSS `@import` of Google's
// font CDN — that import was render-blocking: the browser had to fetch and
// parse globals.css before it even discovered it needed the fonts' own
// CSS from fonts.googleapis.com, then the font files themselves from
// fonts.gstatic.com — three serial round trips to third-party origins
// before any text could render. These files now ship from this site's own
// domain alongside its other static assets, so that whole waterfall is
// gone — a meaningfully faster first paint, especially on mobile.
import "@fontsource/bebas-neue/400.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "MesKartu.Lt — Porų erdvė",
  description: "Bendras aktyvumo ir gyvenimo žurnalas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lt" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
