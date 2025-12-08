'use client';

import React from 'react';

const ShowsPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '48px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Principal */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎸</div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            A Revolução no Palco: Por que a Golden Ingressos é a Melhor Parceira para seus Shows
          </h1>
        </div>

        {/* Introdução */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ec4899'
        }}>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            O mercado da música vive de emoção, ritmo e grandes momentos. Mas nos bastidores, quem produz shows sabe que a conta precisa fechar. Seja uma grande turnê, um festival ou um show intimista, a <strong>Golden Ingressos</strong> chegou para liderar uma verdadeira <strong>revolução online no mercado cultural</strong>.
          </p>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#374151',
            fontWeight: '600'
          }}>
            Esqueça o modelo antigo onde a bilheteria é apenas uma ferramenta de cobrança. Nós somos a primeira plataforma que <strong>transforma a venda de ingressos em uma nova fonte de receita para o produtor</strong>, fortalecendo quem realmente faz o show acontecer.
          </p>
        </div>

        {/* Card 1: Revolução Financeira */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>💰</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              1. A Revolução Financeira: Lucre com a Taxa de Conveniência
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            No cenário atual de shows, cada centavo importa. Enquanto outras plataformas retêm 100% das taxas, a Golden Ingressos inova com um modelo inédito: <strong>nós dividimos o faturamento com você.</strong>
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Imagine o impacto disso no fluxo de caixa da sua turnê. Você escolhe o plano ideal para cada evento:
          </p>

          <ul style={{ 
            paddingLeft: '24px', 
            marginBottom: '0',
            listStyleType: 'disc'
          }}>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Quer maximizar o lucro da turnê?</strong> No <strong>Plano Premium</strong> (taxa de 18,5% para o fã) ou <strong>Padrão</strong> (15%), você recebe o valor do ingresso <strong>+ 6,5% ou 5% de bônus extra</strong>. É dinheiro direto no bolso da produção.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Foco em Sold Out (Casa Cheia)?</strong> Use o <strong>Plano Competitivo</strong>. Com uma taxa de apenas <strong>8%</strong> (a menor do mercado, imbatível entre marketplaces), você garante um preço final mais atrativo para o fã, aumentando a velocidade das vendas.
            </li>
            <li style={{ 
              marginBottom: '0',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Estratégia Agressiva?</strong> No <strong>Plano Absorção</strong>, seu público paga <strong>Taxa Zero</strong>. Você absorve o custo pagando apenas 8% sobre a bilheteria (muito abaixo dos 10-15% da concorrência).
            </li>
          </ul>
        </div>

        {/* Card 2: Experiência Completa */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🎟️</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              2. Experiência Completa: Venda Mais que a Entrada
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Um show musical é uma experiência que vai muito além da música. Com a Golden Ingressos, você aumenta o <em>ticket médio</em> de cada fã utilizando nossa ferramenta de <strong>Venda de Produtos</strong> integrada ao checkout.
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Aproveite o momento da compra do ingresso, quando a emoção do fã está no auge, para vender:
          </p>

          <ul style={{ 
            paddingLeft: '24px', 
            marginBottom: '16px',
            listStyleType: 'disc'
          }}>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Consumíveis:</strong> Vouchers de bebidas ou combos de alimentação (evitando filas no bar durante o show);
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Logística:</strong> Estacionamento antecipado ou tickets de transfer;
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Merchandising Oficial:</strong> Camisetas da banda, bonés, copos colecionáveis e acessórios.
            </li>
          </ul>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151'
          }}>
            Isso não só aumenta sua receita antes mesmo do portão abrir, como fortalece a marca do artista e melhora a experiência do público.
          </p>
        </div>

        {/* Card 3: Ferramentas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>⚡</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              3. Ferramentas para a Dinâmica dos Shows
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Sabemos que a venda de shows exige agilidade e precisão. Nossa plataforma oferece:
          </p>

          <ul style={{ 
            paddingLeft: '24px', 
            marginBottom: '0',
            listStyleType: 'disc'
          }}>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Controle Total de Lotes:</strong> Gerencie a "virada de lote" de forma automática e estratégica, criando urgência e impulsionando as vendas.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Gestão de Áreas e Setores:</strong> Organize Pista, Área VIP, Camarote e Backstage com facilidade, definindo quantidades e valores específicos para cada setor.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Sua Vitrine (Bio Personalizada):</strong> Artistas e produtores precisam divulgar muitas coisas ao mesmo tempo (Spotify, YouTube, Redes Sociais). Com a <strong>Vitrine Golden</strong>, você cria uma página centralizadora com todos os seus links, com personalização visual profissional e gratuita.
            </li>
            <li style={{ 
              marginBottom: '0',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Sessão Extra sem Sufoco:</strong> A demanda explodiu? Adicione novas datas ou sessões extras em tempo real, aproveitando o "hype" do momento sem burocracia.
            </li>
          </ul>
        </div>

        {/* Card 4: Segurança */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🔒</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              4. Segurança de Alto Nível para Grandes Volumes
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Shows lidam com alto volume de acessos simultâneos e transações financeiras. Nossa estrutura conta com <strong>bancos de dados de alto nível</strong> e um sistema robusto de segurança. Todo o processamento de pagamentos é feito por empresas renomadas e confiáveis do mercado global.
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            fontWeight: '600',
            marginBottom: '0'
          }}>
            A <strong>Golden Ingressos</strong> é a revolução que o mercado cultural esperava. Nós unimos a tecnologia para vender mais com o apoio financeiro que o produtor merece.
          </p>
        </div>

        {/* CTA Final */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          borderRadius: '12px',
          padding: '48px 32px',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            lineHeight: '1.3'
          }}>
            Faça seu show com quem paga para você vender.
          </h2>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '32px',
            color: '#fce7f3'
          }}>
            Venha para a Golden Ingressos.
          </p>
          <a 
            href="/publicar-evento"
            style={{
              display: 'inline-block',
              backgroundColor: '#fbbf24',
              color: '#1f2937',
              fontWeight: '700',
              padding: '16px 40px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '18px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fcd34d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fbbf24'}
          >
            🎸 Publicar Meu Show
          </a>
        </div>

      </div>
    </div>
  );
};

export default ShowsPage;
