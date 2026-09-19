import type { Metadata } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/lib/theme";
import { AuthGate } from "@/components/AuthGate";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

const grotesk = localFont({
  src: [
    { path: "../fonts/SpaceGrotesk-Regular.ttf", weight: "400" },
    { path: "../fonts/SpaceGrotesk-Medium.ttf", weight: "500" },
    { path: "../fonts/SpaceGrotesk-SemiBold.ttf", weight: "600" },
    { path: "../fonts/SpaceGrotesk-Bold.ttf", weight: "700" },
  ],
  variable: "--font-grotesk",
});

const mono = localFont({
  src: [{ path: "../fonts/SpaceMono-Regular.ttf", weight: "400" }],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MoTiroong Admin",
  description: "Attendance administration for MoTiroong",
};

// Stamps the persisted/preferred theme before first paint (no flash).
const themeInit = `(function(){try{var t=localStorage.getItem("mt-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${grotesk.variable} ${mono.variable} antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <AuthGate>{children}</AuthGate>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
