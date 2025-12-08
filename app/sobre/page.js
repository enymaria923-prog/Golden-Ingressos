import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sobre a Golden Ingressos - A Revolução Cultural Online',
  description: 'A única plataforma que recompensa produtores financeiramente. Conheça nossos planos e ferramentas exclusivas.'
};

export default function SobrePage() {
  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      backgroundColor: '#f4f4f4',
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #5d34a4 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '42px', 
            marginBottom: '20px',
            fontWeight: 'bold',
            lineHeight: '1.3'
          }}>
            Sobre a Golden Ingressos
          </h1>
          <p style={{ 
            fontSize: '26px', 
            fontWeight: 'bold',
            color: '#f1c40f'
          }}>
            A Revolução Cultural Online
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '50px 20px',
        lineHeight: '1.8',
        color: '#333'
      }}>
        
        {/* Introdução */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <p style={{ 
            fontSize: '20px', 
            marginBottom: '20px',
            lineHeight: '1.9',
            color: '#444',
            fontWeight: '500'
          }}>
            Esqueça tudo o que você sabe sobre plataformas de ingressos. A <strong>Golden Ingressos</strong> não nasceu 
            apenas para vender tickets; nascemos com o propósito genuíno de <strong style={{ color: '#5d34a4' }}>apoiar 
            financeiramente a cultura e os produtores de eventos no Brasil</strong>.
          </p>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '20px',
            lineHeight: '1.9',
            color: '#444'
          }}>
            Enquanto o mercado tradicional apenas retira taxas do seu público e entrega o básico, nós decidimos fazer 
            algo completamente inédito: <strong style={{ color: '#f1c40f' }}>dividimos o nosso faturamento com você</strong>.
          </p>
          <div style={{
            padding: '25px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            border: '2px solid #4caf50',
            marginTop: '25px'
          }}>
            <p style={{ 
              fontSize: '18px', 
              margin: 0,
              lineHeight: '1.9',
              color: '#2e7d32',
              fontWeight: 'bold'
            }}>
              Isso mesmo. Somos a <span style={{ fontSize: '20px' }}>única plataforma do mercado</span> que recompensa 
              o produtor financeiramente, repassando a ele uma parte das taxas de serviço pagas pelos compradores.
            </p>
          </div>
          <p style={{ 
            fontSize: '17px', 
            marginTop: '25px',
            lineHeight: '1.9',
            color: '#444'
          }}>
            Entendemos que o produtor é a peça fundamental do espetáculo, e nada mais justo do que aumentar a sua margem 
            de lucro. Conosco, segurança de alto nível e tecnologia de ponta andam de mãos dadas com a valorização do seu bolso.
          </p>
        </section>

        {/* Título Planos */}
        <h2 style={{ 
          fontSize: '34px', 
          color: '#5d34a4',
          textAlign: 'center',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          Conheça Nossos Planos: Liberdade Total
        </h2>

        <p style={{ 
          fontSize: '18px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#555',
          lineHeight: '1.8'
        }}>
          Aqui, não existem mensalidades. Os planos são gratuitos e a escolha é <strong>100% sua a cada evento publicado</strong>. 
          Você tem a liberdade de decidir qual estratégia usar e quanto será cobrado do seu cliente.
        </p>

        <p style={{ 
          fontSize: '16px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Confira as opções e veja quanto você receberia em um cenário de <strong>R$ 10.000,00 em vendas de ingressos (bilheteria)</strong>:
        </p>

        {/* PLANO PREMIUM */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px',
          borderLeft: '6px solid #FFD700'
        }}>
          <h3 style={{ 
            fontSize: '26px', 
            color: '#FF8C00',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💎 Plano Premium
          </h3>
          <p style={{ fontSize: '17px', lineHeight: '1.9', marginBottom: '15px' }}>
            Neste plano, cobramos do usuário uma taxa de <strong>18,5%</strong>. Este é o valor de taxa de serviço cobrado 
            por diversos marketplaces do mercado.
          </p>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#fff9e6',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold', color: '#FF8C00' }}>
              🌟 O Grande Diferencial:
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8' }}>
              Pagamos ao produtor todo o valor de bilheteria <strong style={{ color: '#f1c40f' }}>+ 6,5% de bônus</strong>.
            </p>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '5px' }}>Cenário de R$ 10 mil:</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>
              Você recebe R$ 10.650,00
            </p>
          </div>
        </section>

        {/* PLANO PADRÃO */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px',
          borderLeft: '6px solid #4CAF50'
        }}>
          <h3 style={{ 
            fontSize: '26px', 
            color: '#4CAF50',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⭐ Plano Padrão
          </h3>
          <p style={{ fontSize: '17px', lineHeight: '1.9', marginBottom: '15px' }}>
            Cobramos do comprador uma taxa de <strong>15%</strong>. Este é o valor de mercado, a taxa cobrada pela grande 
            maioria dos marketplaces.
          </p>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>
              🌟 O Grande Diferencial:
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8' }}>
              Pagamos ao produtor todo o valor de bilheteria <strong style={{ color: '#27ae60' }}>+ 5% de bônus</strong>.
            </p>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '5px' }}>Cenário de R$ 10 mil:</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>
              Você recebe R$ 10.500,00
            </p>
          </div>
        </section>

        {/* PLANO ECONÔMICO */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px',
          borderLeft: '6px solid #2196F3'
        }}>
          <h3 style={{ 
            fontSize: '26px', 
            color: '#2196F3',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🚀 Plano Econômico
          </h3>
          <p style={{ fontSize: '17px', lineHeight: '1.9', marginBottom: '15px' }}>
            Cobramos apenas <strong>10%</strong> de taxa. Este é um valor baixo, praticado por pouquíssimos marketplaces.
          </p>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold', color: '#2196F3' }}>
              🌟 O Grande Diferencial:
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8' }}>
              Mesmo com a taxa reduzida, pagamos ao produtor todo o valor de bilheteria <strong style={{ color: '#1976d2' }}>+ 3% de bônus</strong>.
            </p>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '5px' }}>Cenário de R$ 10 mil:</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>
              Você recebe R$ 10.300,00
            </p>
          </div>
        </section>

        {/* PLANO COMPETITIVO */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px',
          borderLeft: '6px solid #FF5722'
        }}>
          <h3 style={{ 
            fontSize: '26px', 
            color: '#FF5722',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚡ Plano Competitivo
          </h3>
          <p style={{ fontSize: '17px', lineHeight: '1.9', marginBottom: '15px' }}>
            Cobramos apenas <strong>8%</strong> de taxa. <strong style={{ color: '#d32f2f' }}>Esta é a menor taxa do mercado; 
            nenhum outro marketplace de ingressos cobra um valor de taxa tão baixo.</strong>
          </p>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold', color: '#FF5722' }}>
              💼 Repasse:
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8' }}>
              Neste plano não há bônus extra, mas garantimos a competitividade máxima do seu preço. Você recebe 
              integralmente o valor da bilheteria.
            </p>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f3e5f5',
            borderRadius: '8px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '5px' }}>Cenário de R$ 10 mil:</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0', margin: 0 }}>
              Você recebe R$ 10.000,00
            </p>
          </div>
        </section>

        {/* PLANO ABSORÇÃO */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '50px',
          borderLeft: '6px solid #9C27B0'
        }}>
          <h3 style={{ 
            fontSize: '26px', 
            color: '#9C27B0',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🔄 Plano Absorção
          </h3>
          <p style={{ fontSize: '17px', lineHeight: '1.9', marginBottom: '15px' }}>
            Taxa <strong>ZERO</strong> para os compradores. O custo é absorvido pelo produtor.
          </p>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f3e5f5',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold', color: '#9C27B0' }}>
              📋 Condições:
            </p>
            <p style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '15px' }}>
              Do repasse para o produtor, será descontado apenas <strong>8%</strong> do valor total de bilheteria. 
              Outras plataformas até oferecem essa opção, mas cobram do produtor taxas de <strong style={{ color: '#d32f2f' }}>10% a 15%</strong>. 
              Aqui, seu custo é muito menor.
            </p>
          </div>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '5px' }}>Cenário de R$ 10 mil:</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff6f00', margin: 0 }}>
              Você recebe R$ 9.200,00
            </p>
          </div>
        </section>

        {/* Ferramentas Exclusivas */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            fontSize: '30px', 
            color: '#5d34a4',
            marginBottom: '25px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            🛠️ Ferramentas Exclusivas para Produtores Parceiros
          </h2>
          <p style={{ 
            fontSize: '17px', 
            marginBottom: '30px',
            textAlign: 'center',
            color: '#555'
          }}>
            Além de colocar mais dinheiro no seu bolso, oferecemos recursos completos para profissionalizar seu evento:
          </p>

          <div style={{ display: 'grid', gap: '20px' }}>
            
            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #f1c40f'
            }}>
              <h4 style={{ fontSize: '19px', color: '#5d34a4', marginBottom: '10px', fontWeight: 'bold' }}>
                🔗 Sua Vitrine de Links
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                Disponibilizamos gratuitamente uma ferramenta que funciona como um agregador de links, onde você coloca todos 
                os seus contatos e redes sociais em um só lugar. O diferencial é que nossa vitrine possui <strong>opções de 
                customização</strong> que, em serviços semelhantes, só estariam disponíveis nos planos pagos.
              </p>
            </div>

            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #4caf50'
            }}>
              <h4 style={{ fontSize: '19px', color: '#5d34a4', marginBottom: '10px', fontWeight: 'bold' }}>
                🛍️ Venda de Produtos
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                Aumente a receita do seu evento incentivando a compra de produtos (como copos, bonés ou camisetas) no mesmo 
                momento da compra do ingresso, tudo integrado no nosso site.
              </p>
            </div>

            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #2196f3'
            }}>
              <h4 style={{ fontSize: '19px', color: '#5d34a4', marginBottom: '10px', fontWeight: 'bold' }}>
                👤 Perfil Público do Produtor
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                Tenha um espaço exclusivo para suas publicações, descrição detalhada e listagem de todos os seus eventos disponíveis.
              </p>
            </div>

            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #9c27b0'
            }}>
              <h4 style={{ fontSize: '19px', color: '#5d34a4', marginBottom: '10px', fontWeight: 'bold' }}>
                📊 Gestão Perfeita
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                Nosso sistema organiza de forma impecável seus lotes, setores, cupons e tipos de ingressos com suas respectivas quantidades.
              </p>
            </div>

            <div style={{ 
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #ff5722'
            }}>
              <h4 style={{ fontSize: '19px', color: '#5d34a4', marginBottom: '10px', fontWeight: 'bold' }}>
                🎬 Sem Sufoco na Sessão Extra
              </h4>
              <p style={{ fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                Na área do produtor, você tem autonomia total para criar novas sessões e adicionar novos ingressos ao seu evento 
                a qualquer momento, sem burocracia e sem passar sufoco quando a demanda explodir.
              </p>
            </div>

          </div>
        </section>

        {/* CTA Final */}
        <section style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px' }}>
            Pronto para revolucionar seus eventos?
          </h3>
          <p style={{ fontSize: '18px', marginBottom: '25px', lineHeight: '1.7' }}>
            Junte-se à Golden Ingressos e comece a lucrar mais hoje mesmo!
          </p>
          <Link href="/publicar-evento">
            <button style={{
              backgroundColor: '#f1c40f',
              color: '#000',
              padding: '15px 40px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(241, 196, 15, 0.4)'
            }}>
              🚀 Publicar Meu Evento
            </button>
          </Link>
        </section>

        {/* Rodapé da Página */}
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '30px',
          borderTop: '2px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ 
              color: '#5d34a4', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ← Voltar para a página inicial
            </Link>
            <Link href="/confianca" style={{ 
              color: '#5d34a4', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🔒 Somos Confiáveis?
            </Link>
            <Link href="/termos" style={{ 
              color: '#5d34a4', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📄 Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
