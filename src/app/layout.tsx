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
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
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
  // Avatars and uploaded photos are all served from Supabase storage — a
  // separate origin from the app itself — so without a heads-up every one
  // of those images (the header avatar shows on every single page) pays a
  // fresh DNS+TLS handshake before its own request can even start.
  // Preconnecting lets the browser open that connection in parallel with
  // everything else instead of serially once the <img> is discovered.
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="lt" className="h-full antialiased" suppressHydrationWarning>
      <head>{supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />}</head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
