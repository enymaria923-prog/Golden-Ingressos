'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { logout } from '../actions-auth';

export default function UserDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: '#fff', 
          color: '#5d34a4', 
          padding: '12px 25px', 
          border: '2px solid #5d34a4', 
          borderRadius: '5px', 
          fontWeight: 'bold', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        👤 Minha Conta
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          padding: '10px',
          minWidth: '180px',
          marginTop: '5px',
          zIndex: 1000
        }}>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontWeight: 'bold', 
            color: '#5d34a4', 
            fontSize: '14px',
            borderBottom: '1px solid #eee',
            paddingBottom: '8px'
          }}>
            Olá, {user.email?.split('@')[0]}
          </p>
          <Link 
            href="/perfil" 
            style={{ display: 'block', padding: '8px 0', color: '#333', textDecoration: 'none', fontSize: '14px' }}
            onClick={() => setIsOpen(false)}
          >
            Meu Perfil
          </Link>
          <Link 
            href="/produtor" 
            style={{ display: 'block', padding: '8px 0', color: '#333', textDecoration: 'none', fontSize: '14px' }}
            onClick={() => setIsOpen(false)}
          >
            Área do Produtor
          </Link>
          <Link 
            href="/meus-ingressos" 
            style={{ display: 'block', padding: '8px 0', color: '#333', textDecoration: 'none', fontSize: '14px' }}
            onClick={() => setIsOpen(false)}
          >
            Meus Ingressos
          </Link>
          <Link 
            href="/favoritos" 
            style={{ display: 'block', padding: '8px 0', color: '#333', textDecoration: 'none', fontSize: '14px' }}
            onClick={() => setIsOpen(false)}
          >
            Favoritos
          </Link>
          <form action={logout} style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <button 
              type="submit"
              style={{ 
                backgroundColor: 'transparent', 
                color: '#ff4444', 
                border: 'none', 
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                padding: '8px 0',
                fontSize: '14px'
              }}
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
