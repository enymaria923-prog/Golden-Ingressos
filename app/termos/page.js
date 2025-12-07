import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso - Golden Ingressos',
  description: 'Termos de Uso da Golden Ingressos para Produtores e Compradores de ingressos.'
};

export default function TermosPage() {
  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      lineHeight: '1.8',
      color: '#333'
    }}>
      {/* Cabeçalho */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '3px solid #5d34a4'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          color: '#5d34a4', 
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          Termos de Uso
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>Golden Ingressos</p>
      </div>

      {/* ====== TERMO PRODUTOR ====== */}
      <section style={{ 
        marginBottom: '50px',
        padding: '30px',
        backgroundColor: '#f9f7fb',
        borderRadius: '12px',
        border: '2px solid #9b59b6'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          color: '#9b59b6', 
          marginBottom: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '3px solid #9b59b6',
          paddingBottom: '15px'
        }}>
          ✅ TERMO — PRODUTOR
        </h2>

        <div style={{ fontSize: '16px' }}>
          <p style={{ marginBottom: '20px' }}>
            A <strong>Golden Ingressos</strong> atua como uma plataforma que oferece ferramentas para a venda de ingressos, 
            comercialização de produtos e serviços relacionados aos eventos, inscrições e gestão de participantes. Todos os eventos 
            divulgados na plataforma são de total responsabilidade dos Produtores, já que a Golden Ingressos <strong>não organiza, 
            não produz e não executa</strong> nenhum dos eventos disponibilizados.
          </p>

          <p style={{ 
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#9b59b6',
            fontSize: '17px'
          }}>
            É de responsabilidade exclusiva dos Produtores:
          </p>

          <ul style={{ 
            marginLeft: '30px', 
            marginBottom: '20px',
            listStyleType: 'disc'
          }}>
            <li style={{ marginBottom: '10px' }}>Definir a quantidade e os valores dos ingressos;</li>
            <li style={{ marginBottom: '10px' }}>Estabelecer regras de acesso ao evento;</li>
            <li style={{ marginBottom: '10px' }}>
              Determinar políticas de reembolso, troca de titularidade e requisitos legais (como meia-entrada);
            </li>
            <li style={{ marginBottom: '10px' }}>Informar claramente suas condições aos consumidores.</li>
          </ul>

          <div style={{ 
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ddd'
          }}>
            <p style={{ marginBottom: '15px' }}>
              A plataforma Golden Ingressos permite que o Produtor solicite, até o <strong>segundo dia útil após o encerramento 
              do evento</strong>, o cancelamento de uma venda e o reembolso ao comprador. O Produtor deve comunicar previamente 
              sua política de cancelamento e garantir que ela seja compatível com o prazo permitido pela plataforma.
            </p>

            <p style={{ marginBottom: '15px' }}>
              Caso o Consumidor exerça o direito de arrependimento previsto em lei, o reembolso deve ser realizado <strong>pelo 
              Produtor</strong>, em até <strong>7 (sete) dias</strong> contados a partir da compra.
            </p>
          </div>

          <div style={{ 
            padding: '20px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            border: '2px solid #4caf50'
          }}>
            <p style={{ margin: 0, lineHeight: '1.8' }}>
              <strong style={{ color: '#2e7d32' }}>💰 Repasses Financeiros:</strong><br />
              Para receber seus repasses, o Produtor deverá informar seus dados bancários. O valor total vendido, já descontada 
              a taxa de serviço da Golden Ingressos, será transferido para a conta cadastrada <strong>no terceiro dia útil após 
              a realização efetiva do evento</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ====== TERMO COMPRADOR ====== */}
      <section style={{ 
        marginBottom: '50px',
        padding: '30px',
        backgroundColor: '#f0f8ff',
        borderRadius: '12px',
        border: '2px solid #2196f3'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          color: '#2196f3', 
          marginBottom: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '3px solid #2196f3',
          paddingBottom: '15px'
        }}>
          ✅ TERMO — COMPRADOR
        </h2>

        <div style={{ fontSize: '16px' }}>
          <p style={{ marginBottom: '20px' }}>
            A <strong>Golden Ingressos</strong> oferece uma plataforma que facilita a compra de ingressos, inscrições e 
            contribuições para eventos, além de auxiliar na gestão dos participantes. Contudo, todos os eventos anunciados são 
            responsabilidade dos Organizadores, uma vez que a Golden Ingressos <strong>não cria, não realiza e não administra</strong> nenhum deles.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Cabe aos Organizadores definir quantidades, valores, regras de acesso, políticas de cancelamento, troca de titularidade 
            e outros critérios aplicáveis ao evento.
          </p>

          <div style={{ 
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #ffc107'
          }}>
            <p style={{ margin: 0, color: '#856404' }}>
              <strong>⚠️ Atenção:</strong> A Golden Ingressos <strong>não se responsabiliza</strong> por ingressos adquiridos 
              fora do seu ambiente oficial.
            </p>
          </div>

          <h3 style={{ 
            fontSize: '20px', 
            color: '#1976d2', 
            marginBottom: '15px',
            fontWeight: 'bold',
            marginTop: '25px'
          }}>
            🔒 Verificação e Confirmação de Compras
          </h3>

          <p style={{ marginBottom: '20px' }}>
            Todas as compras feitas pela plataforma passam por processos de verificação, seja conferindo dados do pagamento via 
            cartão de crédito, seja aguardando a confirmação de boletos. Caso haja inconsistência ou a operação não seja aprovada, 
            a compra será automaticamente cancelada.
          </p>

          <div style={{ 
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ 
              fontSize: '18px', 
              color: '#d32f2f', 
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              🔄 Troca de Titularidade
            </h4>
            <p style={{ margin: 0, lineHeight: '1.8' }}>
              Se o Participante receber um ingresso por meio de <strong>troca de titularidade</strong>, deve estar ciente de que 
              o comprador original poderá — desde que autorizado pelo Organizador — cancelar a compra ou realizar nova troca, o 
              que pode impedir o acesso do portador atual ao evento.
            </p>
          </div>

          <h3 style={{ 
            fontSize: '20px', 
            color: '#1976d2', 
            marginBottom: '15px',
            fontWeight: 'bold',
            marginTop: '25px'
          }}>
            💳 Política de Reembolso
          </h3>

          <p style={{ marginBottom: '20px' }}>
            A política de reembolso é definida pelo Organizador do evento. Cabe ao Comprador consultar essa política antes da 
            compra e, se necessário, entrar em contato diretamente com o Organizador para solicitar o cancelamento e o reembolso.
          </p>

          <h3 style={{ 
            fontSize: '20px', 
            color: '#1976d2', 
            marginBottom: '15px',
            fontWeight: 'bold',
            marginTop: '25px'
          }}>
            📧 Recebimento de Ingressos
          </h3>

          <p style={{ marginBottom: '15px' }}>
            Os ingressos adquiridos pela Golden Ingressos serão enviados ao e-mail informado após a confirmação do pagamento. 
            Eles também poderão ser acessados pelo site ou aplicativo da plataforma, desde que exista uma conta vinculada ao 
            mesmo e-mail utilizado na compra.
          </p>

          <div style={{ 
            padding: '15px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '2px solid #ef5350'
          }}>
            <p style={{ margin: 0, color: '#c62828', lineHeight: '1.8' }}>
              <strong>⚠️ Importante:</strong> O Comprador concorda em verificar o funcionamento do seu sistema anti-spam e 
              filtros semelhantes. Caso o ingresso não seja recebido devido a bloqueio, filtro ou configuração incorreta do 
              e-mail do usuário, isso não gerará direito a indenização ou qualquer garantia adicional.
            </p>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '50px',
        paddingTop: '30px',
        borderTop: '2px solid #e0e0e0'
      }}>
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '15px' }}>
          Última atualização: Dezembro de 2025
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
          <Link href="/privacidade" style={{ 
            color: '#5d34a4', 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            📄 Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}
