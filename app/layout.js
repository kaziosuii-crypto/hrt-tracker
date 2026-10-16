import "./globals.css";
import "./direction.css";
import { figure } from "../lib/figure-assets";
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
          href={figure("rest")}
          fetchPriority="high"
        />
        <link rel="preload" as="image" href={figure("turn")} />
        <link rel="preload" as="image" href={figure("hand")} />
        <link rel="preload" as="image" href={figure("pattern-v1")} />
      </head>
      <body>{children}</body>
    </html>
  );
}
