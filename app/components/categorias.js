'use client';
import Link from 'next/link';

export default function Categorias() {
  const categorias = [
    { nome: 'Teatro', emoji: '🎭', url: '/busca?q=Teatro' },
    { nome: 'Shows', emoji: '🎵', url: '/busca?q=Shows' },
    { nome: 'Stand-up', emoji: '🎤', url: '/busca?q=Stand-up' },
    { nome: 'Festivais', emoji: '🎪', url: '/busca?q=Festivais' },
    { nome: 'Online', emoji: '💻', url: '/busca?q=Online' },
  ];
  
  return (
    <div className="categorias-container">
      <div className="categorias-scroll">
        {categorias.map((cat) => (
          <Link key={cat.nome} href={cat.url}>
            <div className="categoria-item">
              <div className="categoria-circulo">
                <span>{cat.emoji}</span>
              </div>
              <span className="categoria-nome">{cat.nome}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
