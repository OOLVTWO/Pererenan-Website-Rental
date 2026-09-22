import { Plus_Jakarta_Sans } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/styles/globals.css";
import "@/styles/flat.css";

// Self-hosted via Next.js at build time — no runtime CDN request.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Boss Rent Pererenan — Admin",
  description: "Panel administrasi rental motor Boss Rent Pererenan",
  // Panel admin tidak perlu muncul di mesin pencari.
  robots: { index: false, follow: false },
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
    <html lang="id" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
