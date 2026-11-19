import type { Metadata } from "next";
import { Architects_Daughter, JetBrains_Mono, Space_Mono, Work_Sans } from "next/font/google";
import "./globals.css";

// PyTrek's four fonts (see docs/fonts.md for roles and backups).
// next/font downloads them at build time and serves them from our own site,
// so students' browsers never contact Google.

/** App and teaching text (default for everything). */
const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

/** Ranger handwriting: short notes, clue cards, story flavor only. */
const architectsDaughter = Architects_Daughter({
  subsets: ["latin"],
  weight: "400", // the only weight this font has
  display: "swap",
  variable: "--font-architects-daughter",
});

/** Rogue AI agent / "terminal" voice. */
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

/** Student code: editor, code examples, program output. */
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "PyTrek",
  description:
    "Fun, hands-on Python practice for BYU CS 111, starting with the web scraping unit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${architectsDaughter.variable} ${spaceMono.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
