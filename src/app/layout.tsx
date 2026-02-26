import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { UserProvider } from "@/lib/UserContext";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Impact360",
  description: "Measuring gospel impact across every community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
