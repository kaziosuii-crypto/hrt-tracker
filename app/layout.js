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
          as="image"
          href="/art/passengers-mid.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/art/carriage.webp"
          media="(min-width:701px)"
        />
        <link
          rel="preload"
          as="image"
          href="/art/carriage-mobile.webp"
          media="(max-width:700px)"
        />
        <link rel="preload" as="image" href="/art/passengers-far.webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
