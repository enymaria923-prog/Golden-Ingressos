// app/layout.js - Molde principal da aplicação

/* Este 'layout' é obrigatório para o Next.js */

export const metadata = {
  title: 'Golden Ingressos',
  description: 'Sua plataforma de eventos VIP',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
