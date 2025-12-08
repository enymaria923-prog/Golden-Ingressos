'use client';

import React from 'react';

const TeatrosPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '48px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Principal */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Por que a Golden Ingressos é o Palco Perfeito para o Seu Espetáculo Teatral?
          </h1>
        </div>

        {/* Introdução */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #9333ea'
        }}>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Produzir teatro no Brasil é um ato de resistência e paixão. Sabemos que cada peça em cartaz envolve suor, ensaios exaustivos e um desafio financeiro constante. Por isso, a Golden Ingressos não é apenas uma bilheteria online; somos o parceiro que o produtor teatral sempre sonhou, mas nunca encontrou no mercado — até agora.
          </p>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#374151',
            fontWeight: '600'
          }}>
            Somos a melhor escolha para a sua temporada porque unimos tecnologia de ponta a um modelo financeiro que injetam dinheiro no seu projeto, fortalecendo a cultura de forma real.
          </p>
        </div>

        {/* Card 1: Lucratividade */}
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
              1. Lucratividade Inédita: Nós Pagamos Para Você Vender
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            No mercado tradicional, a taxa de conveniência é um dinheiro que "desaparece" da mão do produtor. Na Golden Ingressos, nós mudamos o jogo. Oferecemos planos onde você recebe um bônus sobre a bilheteria, transformando a taxa cobrada do espectador em receita extra para o seu espetáculo.
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Você tem total liberdade para escolher a estratégia de cada temporada ou apresentação:
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
              <strong>Quer maximizar o lucro?</strong> Escolha o Plano Premium (18,5% para o cliente) ou Padrão (15% para o cliente) e receba de volta o valor do ingresso + 6,5% ou 5% de bônus.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Quer lotar o teatro com preço baixo?</strong> Use o Plano Competitivo (apenas 8% de taxa, a menor do mercado) ou o Plano Absorção (Taxa Zero para o cliente).
            </li>
          </ul>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            fontStyle: 'italic'
          }}>
            Nenhuma outra plataforma devolve parte da taxa para o produtor. Esse dinheiro extra pode pagar o figurino, a divulgação ou aumentar o cachê do elenco.
          </p>
        </div>

        {/* Card 2: Ticket Médio */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🛍️</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              2. Aumente o Ticket Médio: Venda Mais que Ingressos
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Sabemos que a experiência do teatro começa antes de abrir as cortinas. Com a nossa ferramenta de <strong>Venda de Produtos</strong>, você transforma o momento da compra do ingresso em uma oportunidade de aumentar o faturamento.
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            O espectador pode comprar, no mesmo carrinho:
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
              <strong>Alimentação:</strong> O combo de pipoca e refrigerante para retirar na bomboniere do teatro;
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Logística:</strong> O voucher de estacionamento antecipado;
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Merchandising:</strong> A camiseta oficial da peça, o roteiro autografado ou canecas temáticas.
            </li>
          </ul>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151'
          }}>
            Isso garante receita antecipada e evita filas no local, melhorando a experiência do seu público e fortalecendo o caixa da produção.
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
            <span style={{ fontSize: '32px' }}>🛠️</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              3. Ferramentas Feitas para Quem Produz Cultura
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Nossa plataforma foi desenhada para resolver as dores do dia a dia de quem faz teatro:
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
              <strong>Gestão de Sessões e Temporadas:</strong> Adicione novas datas, sessões extras ou prorrogue a temporada em poucos cliques, sem burocracia. O sistema é flexível para lidar com a dinâmica do teatro.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Mapa de Setores e Lotes:</strong> Organize plateia, balcão, camarotes e ingressos promocionais (meia-entrada, antecipado) com controle total de estoque.
            </li>
            <li style={{ 
              marginBottom: '0',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Sua Vitrine (Bio Personalizada):</strong> Esqueça os agregadores de links pagos. Oferecemos gratuitamente a Vitrine Golden, onde você centraliza o link de vendas da peça, as redes sociais do elenco e contatos de imprensa, tudo com customização visual profissional.
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
              4. Segurança e Confiança
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '0'
          }}>
            Toda essa inovação roda sobre um sistema robusto de segurança e bancos de dados de alto nível. Seus recebíveis e os dados do seu público são processados por empresas de pagamento renomadas. <strong>Você foca no aplauso, nós cuidamos da segurança da transação.</strong>
          </p>
        </div>

        {/* CTA Final */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
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
            Golden Ingressos: A plataforma que valoriza o teatro, recompensa o produtor e fortalece a cultura.
          </h2>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '32px',
            color: '#e9d5ff'
          }}>
            Traga seu espetáculo para cá.
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
            🎭 Publicar Meu Espetáculo
          </a>
        </div>

      </div>
    </div>
  );
};

export default TeatrosPage;
