'use client';

import Link from 'next/link';

export default function Categorias() {
  const categorias = [
    { nome: 'Teatro', emoji: '🎭', url: '/teatros' },
    { nome: 'Shows', emoji: '🎵', url: '/shows' },
    { nome: 'Stand-up', emoji: '🎤', url: '/stand-up' },
    { nome: 'Festivais', emoji: '🎪', url: '/festivais' },
    { nome: 'Online', emoji: '💻', url: '/online' },
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
