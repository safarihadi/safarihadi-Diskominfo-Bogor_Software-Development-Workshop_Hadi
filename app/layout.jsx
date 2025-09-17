import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Layanan Publik Kabupaten Bogor",
  description: "Sistem Layanan Publik Kabupaten Bogor",
  

};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/img/Lambang_Kabupaten_Bogor.png" type="image/png" />

      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
