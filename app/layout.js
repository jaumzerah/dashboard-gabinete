import './globals.css';

export const metadata = {
  title: 'Apolônio — Controle de Demandas',
  description: 'Painel de controle de demandas do Gabinete Dep. Federal Reimont — PT/RJ',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
