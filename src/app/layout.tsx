import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BambooDigital — Project Tracker",
  description: "Terminal-style project management and time tracking",
};

const SW_SCRIPT = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(reg) { console.log('[PWA] SW registered', reg.scope); })
        .catch(function(err) { console.error('[PWA] SW registration failed', err); });
    });
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00ff66" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <script dangerouslySetInnerHTML={{ __html: SW_SCRIPT }} />
      </body>
    </html>
  );
}
