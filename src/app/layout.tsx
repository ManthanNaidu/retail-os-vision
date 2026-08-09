import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RetailOS AI — AI-Powered Business OS for Indian Retailers',
  description: 'Increase profits, reduce losses, automate operations. The intelligent business partner built for Indian retail stores — grocery, medical, electronics, fashion and more.',
  keywords: 'retail software india, pos system, inventory management, billing software, ai retail',
  authors: [{ name: 'RetailOS AI' }],
  openGraph: {
    title: 'RetailOS AI',
    description: 'AI-Powered Business Operating System for Indian Retailers',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1a56db" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
