import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade - Golden Ingressos',
  description: 'Política de Privacidade da Golden Ingressos - Como coletamos, usamos e protegemos seus dados pessoais.'
};

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>Golden Ingressos</p>
      </div>

      {/* Introdução */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          A <strong>Golden Ingressos</strong> valoriza profundamente a privacidade e a segurança dos dados de todos os nossos usuários. 
          Nosso compromisso é garantir que qualquer informação pessoal fornecida seja tratada com responsabilidade, transparência e total proteção.
        </p>
        <p style={{ fontSize: '16px' }}>
          Esta Política de Privacidade explica como realizamos a coleta, o uso, o armazenamento e o tratamento dos seus dados pessoais 
          quando você utiliza o nosso site.
        </p>
      </div>

      {/* Seção 1 */}
      <section style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#5d34a4', 
          marginBottom: '15px',
          fontWeight: 'bold',
          borderLeft: '4px solid #5d34a4',
          paddingLeft: '15px'
        }}>
          1. Quais dados pessoais coletamos e para qual finalidade?
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          Ao adquirir ingressos por meio de nossos canais, solicitamos algumas informações básicas, como <strong>nome</strong> e <strong>e-mail</strong>. 
          Esses dados são essenciais para:
        </p>
        <ul style={{ 
          fontSize: '16px', 
          marginLeft: '30px', 
          marginBottom: '15px',
          listStyleType: 'disc'
        }}>
          <li style={{ marginBottom: '8px' }}>
            Entrar em contato com você em caso de cancelamento, alteração de data, horário ou local do evento;
          </li>
          <li style={{ marginBottom: '8px' }}>
            Processar pagamentos, quando a compra é realizada online;
          </li>
          <li style={{ marginBottom: '8px' }}>
            Enviar comunicações de marketing ou pesquisas, caso você autorize no momento do cadastro.
          </li>
        </ul>
        <p style={{ fontSize: '16px' }}>
          Você pode alterar sua autorização para o recebimento dessas mensagens a qualquer momento, bastando entrar em contato conosco.
        </p>
      </section>

      {/* Seção 2 */}
      <section style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#5d34a4', 
          marginBottom: '15px',
          fontWeight: 'bold',
          borderLeft: '4px solid #5d34a4',
          paddingLeft: '15px'
        }}>
          2. Suas informações são compartilhadas ou vendidas?
        </h2>
        <p style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Não.
        </p>
        <p style={{ fontSize: '16px' }}>
          A Golden Ingressos não comercializa, aluga ou compartilha informações pessoais de seus usuários com terceiros para fins comerciais.
        </p>
      </section>

      {/* Seção 3 */}
      <section style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#5d34a4', 
          marginBottom: '15px',
          fontWeight: 'bold',
          borderLeft: '4px solid #5d34a4',
          paddingLeft: '15px'
        }}>
          3. Como protegemos seus dados?
        </h2>
        <p style={{ fontSize: '16px' }}>
          Todos os dados armazenados ficam protegidos em um sistema seguro, dentro de um banco de dados próprio, acessível apenas 
          por ferramentas e processos autorizados. Utilizamos medidas rigorosas para evitar acessos não autorizados, perda, uso indevido 
          ou alteração dos dados.
        </p>
      </section>

      {/* Seção 4 */}
      <section style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#5d34a4', 
          marginBottom: '15px',
          fontWeight: 'bold',
          borderLeft: '4px solid #5d34a4',
          paddingLeft: '15px'
        }}>
          4. Acesso e atualização do cadastro
        </h2>
        <p style={{ fontSize: '16px' }}>
          Você pode visualizar, atualizar ou corrigir suas informações pessoais diretamente no nosso site, acessando sua conta.
        </p>
      </section>

      {/* Seção 5 */}
      <section style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#5d34a4', 
          marginBottom: '15px',
          fontWeight: 'bold',
          borderLeft: '4px solid #5d34a4',
          paddingLeft: '15px'
        }}>
          5. Privacidade no ambiente online
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Levamos muito a sério a proteção dos usuários que interagem conosco digitalmente. A seguir, detalhamos como lidamos com 
          informações coletadas durante o acesso ao nosso site.
        </p>

        {/* Subseção A */}
        <h3 style={{ 
          fontSize: '20px', 
          color: '#764ba2', 
          marginBottom: '12px',
          fontWeight: 'bold'
        }}>
          A. Coleta de dados durante a navegação
        </h3>
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          Quando você visita nosso site, nossos servidores identificam automaticamente apenas o nome do domínio utilizado, 
          sem capturar o endereço de e-mail.
        </p>
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          Também utilizamos <strong>cookies</strong> — pequenos arquivos armazenados no seu navegador — para facilitar sua navegação 
          e melhorar sua experiência. Eles ajudam em funções como:
        </p>
        <ul style={{ 
          fontSize: '16px', 
          marginLeft: '30px', 
          marginBottom: '15px',
          listStyleType: 'disc'
        }}>
          <li style={{ marginBottom: '8px' }}>Manter sua sessão durante o processo de compra;</li>
          <li style={{ marginBottom: '8px' }}>Analisar estatísticas de uso do site;</li>
          <li style={{ marginBottom: '8px' }}>Compreender como podemos aprimorar o layout e as funcionalidades.</li>
        </ul>
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          Caso prefira, você pode configurar seu navegador para bloquear cookies. No entanto, isso poderá afetar o funcionamento 
          correto da compra de ingressos.
        </p>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          As informações coletadas por meio de cookies e métricas são analisadas de forma <strong>anônima</strong>, sem identificação pessoal.
        </p>

        {/* Subseção B */}
        <h3 style={{ 
          fontSize: '20px', 
          color: '#764ba2', 
          marginBottom: '12px',
          fontWeight: 'bold'
        }}>
          B. Segurança nas transações
        </h3>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Compras realizadas no site são protegidas por <strong>certificado SSL</strong>, garantindo criptografia e segurança no envio 
          de dados sensíveis, como informações de cartão de crédito. Seguimos padrões rigorosos para manter sua transação segura.
        </p>

        {/* Subseção C */}
        <h3 style={{ 
          fontSize: '20px', 
          color: '#764ba2', 
          marginBottom: '12px',
          fontWeight: 'bold'
        }}>
          C. Links externos
        </h3>
        <p style={{ fontSize: '16px' }}>
          Nosso site pode apresentar links para páginas de terceiros. Ressaltamos que não temos controle sobre suas políticas de 
          privacidade ou práticas de segurança. Recomendamos que você consulte as políticas de cada site externo antes de fornecer qualquer dado.
        </p>
      </section>

      {/* Seção 7 */}
      <section style={{ marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#5d34a4', 
          marginBottom: '15px',
          fontWeight: 'bold',
          borderLeft: '4px solid #5d34a4',
          paddingLeft: '15px'
        }}>
          7. Informações adicionais e contato
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          Nossa Política de Privacidade pode ser atualizada ou modificada sem aviso prévio, sempre que necessário para manter a 
          conformidade com normas e melhores práticas.
        </p>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>
          Se tiver dúvidas, solicitações ou preocupações sobre o uso dos seus dados, você pode nos contatar através do e-mail:
        </p>
        <p style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: '#5d34a4',
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <a href="mailto:contato@goldeningressos.com.br" style={{ color: '#5d34a4', textDecoration: 'none' }}>
            contato@goldeningressos.com.br
          </a>
        </p>
      </section>

      {/* Rodapé */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '50px',
        paddingTop: '30px',
        borderTop: '2px solid #e0e0e0'
      }}>
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
          Última atualização: Dezembro de 2025
        </p>
        <Link href="/" style={{ 
          color: '#5d34a4', 
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ← Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
