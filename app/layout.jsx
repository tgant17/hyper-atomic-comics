import './globals.css';

export const metadata = {
  title: 'Dream Drive',
  description: 'Generate hypersomnia comics on demand'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
