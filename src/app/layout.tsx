import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wayfaria — Every journey deserves the right teammate",
  description: "Weather-aware travel planning, voice dictation, real-time collaboration, Google Calendar sync, and health-aware recommendations for every adventure.",
  keywords: "travel, itinerary, vacation, planning, weather, voice dictation, calendar sync, group sharing",
  openGraph: {
    title: "Wayfaria — Every journey deserves the right teammate",
    description: "The only travel app that thinks about when plans change, borders close, groups disagree, the weather doesn't match, and you need support along the way.",
    url: "https://wayfaria.live",
    siteName: "Wayfaria",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-900 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}