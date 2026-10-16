import './globals.css'
export const metadata={title:'HRT Atlas',description:'Private longitudinal HRT dashboard'}
export default function RootLayout({children}){return <html lang="zh-CN"><head><link rel="preload" as="image" href="/hrt-assets/commuter-near.webp" fetchPriority="high"/></head><body>{children}</body></html>}
