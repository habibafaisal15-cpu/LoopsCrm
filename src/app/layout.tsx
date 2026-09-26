import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthFrame } from "@/components/layout/AuthFrame";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loops CRM",
  description: "Manage customers, close more deals, grow together with Loops.",
  icons: { icon: "/loops-logo-light.png" },
};

const themeBoot = `(function(){try{var t=localStorage.getItem("loops_theme");if(t!=="light"&&t!=="dark"){t="dark"}document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark"}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <AuthFrame>{children}</AuthFrame>
        </ThemeProvider>
      </body>
    </html>
  );
}
