import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Golden Ingressos é Confiável? - Segurança e Compromisso',
  description: 'A única plataforma de venda de ingressos que paga para os produtores parceiros. Conheça nosso compromisso com segurança e recompensa financeira.'
};

export default function ConfiancaPage() {
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
            Golden Ingressos é Confiável?
          </h1>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#f1c40f',
            marginBottom: '10px'
          }}>
            A única plataforma de venda de ingressos que paga para os produtores parceiros.
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
          marginBottom: '30px'
        }}>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '20px',
            lineHeight: '1.9',
            color: '#444'
          }}>
            A <strong>Golden Ingressos</strong> nasceu de um propósito claro e urgente: <strong>transformar a maneira como 
            a cultura é financiada e gerida no Brasil</strong>. Mais do que uma plataforma de vendas online, somos parceiros 
            estratégicos de quem faz o espetáculo acontecer.
          </p>
          <p style={{ 
            fontSize: '18px', 
            lineHeight: '1.9',
            color: '#444'
          }}>
            Nossa fundação foi guiada pelo desejo genuíno de apoiar financeiramente os produtores culturais. Sabemos que 
            realizar um evento exige paixão, mas também investimento. Por isso, quebramos o padrão do mercado com um 
            <strong> modelo de negócio justo e recompensador</strong>.
          </p>
        </section>

        {/* Título: Por que escolher */}
        <h2 style={{ 
          fontSize: '32px', 
          color: '#5d34a4',
          textAlign: 'center',
          marginBottom: '40px',
          fontWeight: 'bold'
        }}>
          Por que escolher a Golden Ingressos?
        </h2>

        {/* Card 1: Recompensa Financeira */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px',
          borderLeft: '6px solid #f1c40f'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            color: '#5d34a4',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '32px' }}>💰</span>
            1. Recompensa Financeira Inédita para o Produtor
          </h3>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444',
            marginBottom: '15px'
          }}>
            Nós valorizamos o seu trabalho. Na Golden Ingressos, o produtor não apenas vende ingressos; 
            <strong> ele é recompensado por isso</strong>.
          </p>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444'
          }}>
            Implementamos um sistema onde <strong style={{ color: '#f1c40f' }}>repassamos ao produtor parte das taxas 
            de serviço pagas pelos compradores</strong>. Transformamos a taxa de conveniência em uma nova fonte de receita 
            para o seu projeto, injetando capital diretamente no ecossistema cultural.
          </p>
        </section>

        {/* Card 2: Segurança */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px',
          borderLeft: '6px solid #27ae60'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            color: '#5d34a4',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '32px' }}>🔒</span>
            2. Segurança Robusta e Tecnologia de Ponta
          </h3>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444',
            marginBottom: '15px'
          }}>
            A <strong>confiança é o pilar da nossa operação</strong>. Desenvolvemos um sistema robusto de segurança 
            cibernética, desenhado para proteger tanto o produtor quanto o comprador contra fraudes e ataques.
          </p>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444'
          }}>
            Utilizamos <strong style={{ color: '#27ae60' }}>bancos de dados de alto nível, com criptografia avançada</strong>, 
            garantindo a integridade e o sigilo absoluto de todas as informações armazenadas em nossa plataforma.
          </p>
        </section>

        {/* Card 3: Pagamentos */}
        <section style={{ 
          backgroundColor: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          borderLeft: '6px solid #3498db'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            color: '#5d34a4',
            marginBottom: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '32px' }}>💳</span>
            3. Processamento de Pagamentos Certificado
          </h3>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444',
            marginBottom: '15px'
          }}>
            Sabemos que a gestão financeira do seu evento é sagrada. Por isso, não arriscamos.
          </p>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444',
            marginBottom: '15px'
          }}>
            Todo o nosso fluxo financeiro é processado através de <strong style={{ color: '#3498db' }}>parcerias com 
            empresas de pagamentos renomadas e consolidadas no mercado global</strong>. Isso assegura que cada transação 
            seja auditável, rápida e, acima de tudo, segura.
          </p>
          <p style={{ 
            fontSize: '17px', 
            lineHeight: '1.9',
            color: '#444'
          }}>
            O dinheiro do seu público e o seu faturamento estão em boas mãos.
          </p>
        </section>

        {/* Conclusão Destacada */}
        <section style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white',
          marginBottom: '40px'
        }}>
          <p style={{ 
            fontSize: '22px', 
            fontWeight: 'bold',
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            A Golden Ingressos é confiável porque foi feita por quem entende as dores da produção e por quem domina a 
            tecnologia de segurança.
          </p>
          <p style={{ 
            fontSize: '19px',
            lineHeight: '1.7',
            marginBottom: '25px'
          }}>
            Junte-se a nós. Venda com segurança, lucre mais com o repasse de taxas e faça parte de uma plataforma que 
            realmente investe na cultura.
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
              boxShadow: '0 4px 12px rgba(241, 196, 15, 0.4)',
              transition: 'all 0.3s'
            }}>
              🚀 Comece Agora
            </button>
          </Link>
        </section>

        {/* Rodapé da Página */}
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '30px',
          borderTop: '2px solid #e0e0e0'
        }}>
          <p style={{ fontSize: '14px', color: '#999', marginBottom: '15px' }}>
            Tem dúvidas? Entre em contato conosco
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ 
              color: '#5d34a4', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ← Voltar para a página inicial
            </Link>
            <Link href="/termos" style={{ 
              color: '#5d34a4', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📄 Termos de Uso
            </Link>
            <Link href="/privacidade" style={{ 
              color: '#5d34a4', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🔒 Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
