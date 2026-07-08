import "./globals.css";

export const metadata = {
  title: "Reflection Board — Phase 1 Rebrand Retro",
  description: "Team reflection board for Faye's Phase 1 rebrand retro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
