// app/SubmitButton.js
'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus(); // Hook do React para saber se o formulário está a enviar

  return (
    <button
      type="submit"
      disabled={pending} // Desativa o botão enquanto o formulário está a enviar (boa prática)
      style={{
        backgroundColor: pending ? '#bdc3c7' : '#f1c40f', // Cor cinza se estiver a enviar
        color: 'black',
        padding: '15px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      {pending ? 'Publicando...' : 'Publicar Evento'}
    </button>
  );
}
