'use client';

import React from 'react';

const StandUpPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '48px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Principal */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Golden Ingressos, o Palco Mais Lucrativo para o Stand-up
          </h1>
        </div>

        {/* Introdução */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            O cenário do Stand-up Comedy no Brasil cresceu e se profissionalizou. Hoje, lotar um comedy club ou um teatro exige estratégia, divulgação pesada e uma gestão financeira afiada. A Golden Ingressos chega para liderar uma revolução online no mercado cultural, oferecendo algo que nenhuma outra plataforma jamais ofereceu: <strong>valorização real do seu trabalho através do repasse de taxas.</strong>
          </p>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#374151',
            fontWeight: '600'
          }}>
            Sabemos que na comédia o timing é tudo. E o momento de mudar para uma plataforma que coloca dinheiro no seu bolso é agora.
          </p>
        </div>

        {/* Card 1: O Cachê Aumenta */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>💸</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              1. O Cachê Aumenta com a Nossa Parceria
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            No modelo antigo, você se preocupa em vender ingressos e vê as taxas de serviço ficarem integralmente com a plataforma. Na Golden Ingressos, nós quebramos esse padrão. <strong>Nós pagamos para você vender.</strong>
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '12px'
          }}>
            Para um comediante independente ou uma produtora de humor, isso significa margem de lucro para investir em tráfego pago, na produção de conteúdo ou simplesmente para aumentar o faturamento da noite.
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Você escolhe o plano ideal para cada show ou turnê:
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
              <strong>Quer maximizar o lucro da sessão?</strong> Escolha o Plano Premium (taxa de 18,5% para o público) ou Padrão (15%). Neles, nós repassamos a você o valor total da bilheteria + um bônus de 6,5% ou 5%. É receita extra garantida.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Precisa lotar a casa rápido?</strong> Vá de Plano Competitivo. Cobramos apenas 8% de taxa do comprador. Nenhum outro marketplace de ingressos cobra um valor de taxa tão baixo. Isso torna o ingresso mais acessível e acelera a decisão de compra.
            </li>
            <li style={{ 
              marginBottom: '0',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Estratégia de "Taxa Zero"?</strong> No Plano Absorção, seu fã não paga taxa nenhuma. Você absorve o custo pagando apenas 8% sobre a bilheteria (enquanto concorrentes cobram até 15% de você).
            </li>
          </ul>
        </div>

        {/* Card 2: Venda a Piada e o Merch */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>👕</span>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              2. Venda a Piada e o Merch: Aumente seu Faturamento
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            No stand-up, a venda de produtos é uma parte essencial da receita. Com a Golden Ingressos, você não precisa esperar o show acabar para vender no foyer. Utilize nossa ferramenta de <strong>Venda de Produtos</strong> integrada ao checkout:
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
              <strong>Merchandising:</strong> Venda camisetas com seus bordões, livros autografados, canecas ou bonés junto com o ingresso.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Consumação Antecipada:</strong> Se o show é em um comedy club ou bar, venda porções de petiscos antecipadamente.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Estacionamento:</strong> Facilite a vida do público vendendo o ticket do estacionamento online.
            </li>
          </ul>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151'
          }}>
            Isso garante dinheiro em caixa antes mesmo da primeira risada e evita filas e maquininhas travando na saída do show.
          </p>
        </div>

        {/* Card 3: Ferramentas Ágeis */}
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
              3. Ferramentas Ágeis para a Comédia
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            A rotina do stand-up é dinâmica. Nossa plataforma acompanha seu ritmo:
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
              <strong>Sessão Extra em Minutos:</strong> O show das 20h esgotou? Abra a sessão das 22h instantaneamente através da área do produtor, sem burocracia. Não perca o hype da venda.
            </li>
            <li style={{ 
              marginBottom: '12px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Sua Vitrine (Bio Personalizada):</strong> Comediantes vivem de redes sociais. Em vez de pagar por agregadores de links, use a <strong>Vitrine Golden</strong> gratuitamente. Centralize agenda de shows, canal do YouTube e redes sociais em uma página customizável e profissional.
            </li>
            <li style={{ 
              marginBottom: '0',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              <strong>Gestão de Lotes:</strong> Crie urgência com viradas de lote automáticas ("Lote Promocional", "1º Lote") e gerencie cupons de desconto para seus seguidores fiéis.
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
              4. Segurança e Tecnologia de Ponta
            </h2>
          </div>
          
          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Não importa se é um show solo para 100 pessoas ou um especial de comédia para 5.000. Nosso sistema possui <strong>bancos de dados de alto nível</strong> e segurança robusta para proteger cada transação. O processamento financeiro é feito por empresas renomadas, garantindo que o seu cachê esteja seguro.
          </p>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: '#374151',
            fontWeight: '600',
            marginBottom: '0'
          }}>
            A Golden Ingressos não está aqui apenas para vender tickets; estamos aqui para financiar a expansão da comédia no Brasil.
          </p>
        </div>

        {/* CTA Final */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
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
            O microfone é seu, e o lucro também.
          </h2>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '32px',
            color: '#fed7aa'
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
            🎤 Publicar Meu Show de Comédia
          </a>
        </div>

      </div>
    </div>
  );
};

export default StandUpPage;
