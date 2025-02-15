import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Navigation } from "./components/Navigation";
import type { ReactNode } from "react";
import { Bubblegum_Sans } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Kiddo News",
	description: "A safe place for kids to read news articles",
};
const bubbleGunSansFont = Bubblegum_Sans({
	preload: true,
	subsets: ["latin"],
	weight: "400",
});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.className} ${bubbleGunSansFont.className}`}>
				<Providers>
					<Navigation />
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
}
