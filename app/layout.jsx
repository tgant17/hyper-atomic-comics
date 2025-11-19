import './globals.css';
import BackgroundScene from '@/components/BackgroundScene';

export const metadata = {
  title: 'Dream Drive',
  description: 'Generate hypersomnia comics on demand'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BackgroundScene />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
