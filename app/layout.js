// app/layout.js - Molde principal da aplicação
'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>
        <GoogleOAuthProvider clientId="338308438974-b8hlo2isn9569h5oae7176tgppne5mnd.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
