'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Lista de Osasco + Capitais brasileiras
const CIDADES_BRASIL = [
  // São Paulo
  'Osasco, SP',
  'São Paulo, SP',
  
  // Capitais
  'Rio Branco, AC',
  'Maceió, AL',
  'Macapá, AP',
  'Manaus, AM',
  'Salvador, BA',
  'Fortaleza, CE',
  'Brasília, DF',
  'Vitória, ES',
  'Goiânia, GO',
  'São Luís, MA',
  'Cuiabá, MT',
  'Campo Grande, MS',
  'Belo Horizonte, MG',
  'Belém, PA',
  'João Pessoa, PB',
  'Curitiba, PR',
  'Recife, PE',
  'Teresina, PI',
  'Rio de Janeiro, RJ',
  'Natal, RN',
  'Porto Alegre, RS',
  'Porto Velho, RO',
  'Boa Vista, RR',
  'Florianópolis, SC',
  'Aracaju, SE',
  'Palmas, TO'
];

export default function EscolherCidadePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Filtrar cidades com base na busca
  const cidadesFiltradas = CIDADES_BRASIL.filter(cidade =>
    cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar cidades por estado
  const cidadesPorEstado = cidadesFiltradas.reduce((acc, cidade) => {
    const [nome, uf] = cidade.split(', ');
    if (!acc[uf]) acc[uf] = [];
    acc[uf].push(nome);
    return acc;
  }, {});

  const handleCidadeClick = (cidade) => {
    const nomeCidade = cidade.split(', ')[0];
    router.push(`/cidade/${encodeURIComponent(nomeCidade)}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '30px', borderRadius: '8px', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'white', textDecoration: 'none', fontSize: '18px' }}>
          ← Voltar
        </Link>
        <h1>Escolha sua Cidade</h1>
        <p>Encontre eventos na sua região</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Barra de Pesquisa */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="🔍 Digite o nome da sua cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid #5d34a4',
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>

        {/* Lista de Cidades */}
        {searchTerm && cidadesFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Nenhuma cidade encontrada</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {Object.keys(cidadesPorEstado).sort().map((uf) => (
              <div key={uf} style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#5d34a4', borderBottom: '2px solid #5d34a4', paddingBottom: '10px', marginBottom: '15px' }}>
                  {uf}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {cidadesPorEstado[uf].map((nomeCidade) => {
                    const cidadeCompleta = `${nomeCidade}, ${uf}`;
                    return (
                      <button
                        key={cidadeCompleta}
                        onClick={() => handleCidadeClick(cidadeCompleta)}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f8f8f8',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '15px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#5d34a4';
                          e.target.style.color = 'white';
                          e.target.style.borderColor = '#5d34a4';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#f8f8f8';
                          e.target.style.color = 'black';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        📍 {nomeCidade}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EscolherCidadePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Filtrar cidades com base na busca
  const cidadesFiltradas = CIDADES_BRASIL.filter(cidade =>
    cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar cidades por estado
  const cidadesPorEstado = cidadesFiltradas.reduce((acc, cidade) => {
    const [nome, uf] = cidade.split(', ');
    if (!acc[uf]) acc[uf] = [];
    acc[uf].push(nome);
    return acc;
  }, {});

  const handleCidadeClick = (cidade) => {
    const nomeCidade = cidade.split(', ')[0];
    router.push(`/cidade/${encodeURIComponent(nomeCidade)}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '30px', borderRadius: '8px', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'white', textDecoration: 'none', fontSize: '18px' }}>
          ← Voltar
        </Link>
        <h1>Escolha sua Cidade</h1>
        <p>Encontre eventos na sua região</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Barra de Pesquisa */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="🔍 Digite o nome da sua cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              border: '2px solid #5d34a4',
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>

        {/* Lista de Cidades */}
        {searchTerm && cidadesFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Nenhuma cidade encontrada</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {Object.keys(cidadesPorEstado).sort().map((uf) => (
              <div key={uf} style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#5d34a4', borderBottom: '2px solid #5d34a4', paddingBottom: '10px', marginBottom: '15px' }}>
                  {uf}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {cidadesPorEstado[uf].map((nomeCidade) => {
                    const cidadeCompleta = `${nomeCidade}, ${uf}`;
                    return (
                      <button
                        key={cidadeCompleta}
                        onClick={() => handleCidadeClick(cidadeCompleta)}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f8f8f8',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '15px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#5d34a4';
                          e.target.style.color = 'white';
                          e.target.style.borderColor = '#5d34a4';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#f8f8f8';
                          e.target.style.color = 'black';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        📍 {nomeCidade}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
