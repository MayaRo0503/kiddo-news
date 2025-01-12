import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigation } from "./components/Navigation";
import { ToastProvider } from "app/components/ui/use-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kiddo News",
  description: "A safe place for kids to read news articles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            <main>{children}</main>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
