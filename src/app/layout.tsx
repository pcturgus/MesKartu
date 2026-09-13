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

// Applies a saved theme choice (from ThemeToggle) before first paint, so
// switching pages/reloading never flashes the wrong theme. Inline + first
// in <body> so it runs before anything below it renders. Falls back to the
// device's own light/dark setting (same as before this existed) when
// nothing has been chosen yet, or in a browser with JS disabled.
const themeInitScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lt" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
