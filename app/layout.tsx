import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Navigation } from "./components/Navigation";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kiddo News",
  description: "A safe place for kids to read news articles",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
