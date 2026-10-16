import "./globals.css";
export const metadata = {
  title: "HRT Atlas",
  description: "Private longitudinal HRT dashboard",
};
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preload"
          as="font"
          href="/fonts/atlas-heavy-a1954717bc.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/atlas-display-392bb82dd5.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-09ce5461945a/passengers-mid.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-09ce5461945a/carriage.webp"
          media="(min-width:701px)"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-09ce5461945a/carriage-mobile.webp"
          media="(max-width:700px)"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-09ce5461945a/passengers-far.webp"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
