import "./globals.css";
import "./direction.css";
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
          href="/art/atlas-04988e4d9db3/brand-7c320ba9ea.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/atlas-numbers-304d9c1758.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/atlas-chinese-a03fe24c6d.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-04988e4d9db3/passengers-mid.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-04988e4d9db3/carriage.webp"
          media="(min-width:701px)"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-04988e4d9db3/carriage-mobile.webp"
          media="(max-width:700px)"
        />
        <link
          rel="preload"
          as="image"
          href="/art/atlas-04988e4d9db3/passengers-far.webp"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
