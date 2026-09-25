import { Plus_Jakarta_Sans, Schibsted_Grotesk } from "next/font/google";

// Self-hosted via Next.js at build time — no runtime CDN request.
// Font judul halaman publik — sama persis dengan yang dipakai di mockup.
const display = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Boss Rent Pererenan — Scooter Rental in Canggu & Pererenan",
  description:
    "Automatic scooter rental in Pererenan, Canggu and Berawa from Rp 100k a day. Free delivery, helmet and raincoat included.",
  metadataBase: new URL("https://pererenan-website-rental.vercel.app"),
  icons: {
    icon: [
      { url: '/images/logoCompany.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/images/logoCompany.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
