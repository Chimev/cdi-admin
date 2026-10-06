import './globals.css'; // Make sure your Tailwind CSS is imported here
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CDI Admin Dashboard',
  description: 'Admin dashboard for Chapel of Divine Inspiration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}