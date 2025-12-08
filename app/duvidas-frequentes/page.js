'use client';

import React, { useState } from 'react';

const FAQPage = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const faqs = [
    {
      id: 1,
      icon: "👤",
      color: "#3b82f6",
      title: "Como criar minha conta (Cliente)?",
      content: (
        <>
          <p style={{ marginBottom: '12px' }}>Para comprar ingressos e acessar seus eventos, o primeiro passo é ter o seu cadastro. É muito simples:</p>
          <ol style={{ paddingLeft: '24px', marginBottom: '8px' }}>
            <li style={{ marginBottom: '8px' }}>Acesse a página de login e clique na opção <strong>"Criar Nova Conta"</strong>;</li>
            <li style={{ marginBottom: '8px' }}>Preencha o formulário com seus dados conforme solicitado na tela: <strong>Nome Completo</strong>, seu melhor <strong>E-mail</strong>, crie uma <strong>Senha</strong> segura (mínimo de 6 caracteres) e repita a senha no campo <strong>Confirmar Senha</strong>;</li>
            <li style={{ marginBottom: '8px' }}>Clique no botão amarelo <strong>"Criar Conta"</strong>;</li>
            <li style={{ marginBottom: '8px' }}><strong>Atenção:</strong> Por medidas de segurança, após o cadastro, o sistema (identificado como <strong>Supabase</strong>) enviará um e-mail de verificação para você. É necessário abrir este e-mail e clicar no link ou botão azul escrito <strong>"Confirm your mail"</strong>. Só após essa confirmação seu login estará liberado.</li>
          </ol>
        </>
      )
    },
    {
      id: 2,
      icon: "🎫",
      color: "#10b981",
      title: "Como encontrar e acessar meus ingressos?",
      content: (
        <>
          <p style={{ marginBottom: '12px' }}>Não precisa se preocupar em imprimir nada. Para acessar seus ingressos:</p>
          <ul style={{ paddingLeft: '24px', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '8px' }}>Faça login na sua conta na Golden Ingressos;</li>
            <li style={{ marginBottom: '8px' }}>Vá até a área <strong>"Meus Ingressos"</strong> no menu principal;</li>
            <li style={{ marginBottom: '8px' }}>Lá, tudo estará organizado: você verá uma aba com os ingressos dos eventos que <strong>ainda vão acontecer</strong> e outra separada com o histórico dos eventos que <strong>já passaram</strong>.</li>
          </ul>
        </>
      )
    },
    {
      id: 3,
      icon: "💻",
      color: "#a855f7",
      title: "Como posso acessar um evento online?",
      content: (
        <>
          <p style={{ marginBottom: '12px' }}>Os eventos online são realizados via transmissão em plataformas externas. É responsabilidade do organizador definir e informar na página do evento qual ferramenta será utilizada.</p>
          <ul style={{ paddingLeft: '24px', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Acesso via Navegador:</strong> Para transmissões via <strong>Youtube, Instagram, Facebook, Google Meet/Hangouts (no iOS) e Twitch</strong>, o acesso geralmente acontece direto pelo navegador, sem precisar baixar nada (pode ser necessário apenas estar logado na conta do serviço);
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Instalação de App:</strong> Se o evento for via <strong>Google Meet/Hangouts (no Android), Skype, Telegram, Whatsapp ou Zoom.us</strong>, pode ser necessário instalar o aplicativo correspondente e criar uma conta na plataforma escolhida.
            </li>
          </ul>
        </>
      )
    },
    {
      id: 4,
      icon: "🔄",
      color: "#f97316",
      title: "Por que não consegui solicitar meu reembolso?",
      content: (
        <>
          <p style={{ marginBottom: '12px' }}>Se o botão de cancelamento não está disponível ou sua solicitação foi negada, é provável que o pedido não cumpra os requisitos da nossa Política de Cancelamento. Para o cancelamento automático, o pedido <strong>DEVE</strong> atender a <strong>todas</strong> as 4 condições abaixo:</p>
          <ol style={{ paddingLeft: '24px' }}>
            <li style={{ marginBottom: '12px' }}><strong>Titularidade:</strong> O reembolso só pode ser solicitado pelo <strong>titular da compra</strong> (através do e-mail usado na aquisição). Ter o ingresso em mãos não faz de você o titular da compra;</li>
            <li style={{ marginBottom: '12px' }}><strong>Prazo:</strong> A solicitação deve ser feita em até <strong>7 (sete) dias corridos</strong> após a compra OU até <strong>48 horas antes</strong> do início do evento (prevalecendo o que ocorrer primeiro);</li>
            <li style={{ marginBottom: '12px' }}><strong>Cancelamento Total:</strong> A Golden Ingressos não realiza reembolso parcial. Se você pedir o cancelamento de um pedido com vários ingressos, <strong>a compra inteira será cancelada</strong>;</li>
            <li style={{ marginBottom: '12px' }}><strong>Sem Check-in:</strong> O ingresso <strong>não pode ter sido utilizado</strong> (bipado) na entrada do evento ou usado para retirada de kits/abadás.</li>
          </ol>
        </>
      )
    },
    {
      id: 5,
      icon: "💰",
      color: "#eab308",
      title: "Qual o custo para utilizar a Golden Ingressos?",
      content: (
        <>
          <p style={{ marginBottom: '12px' }}>Para o comprador, a taxa varia de acordo com o plano escolhido pelo produtor do evento. Para o produtor, <strong>a Golden Ingressos é a única plataforma que paga para você vender.</strong></p>
          <p style={{ marginBottom: '12px' }}>Nós possuímos um modelo inédito onde o produtor pode receber uma bonificação sobre a bilheteria. Confira os planos que o produtor pode selecionar livremente para cada evento:</p>
          <ul style={{ paddingLeft: '24px', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '12px' }}><strong>Plano Premium:</strong> Taxa de 18,5% para o comprador. O produtor recebe o valor do ingresso <strong>+ 6,5% de bônus</strong>.</li>
            <li style={{ marginBottom: '12px' }}><strong>Plano Padrão:</strong> Taxa de 15% para o comprador (média de mercado). O produtor recebe o valor do ingresso <strong>+ 5% de bônus</strong>.</li>
            <li style={{ marginBottom: '12px' }}><strong>Plano Econômico:</strong> Taxa de 10% para o comprador. O produtor recebe o valor do ingresso <strong>+ 3% de bônus</strong>.</li>
            <li style={{ marginBottom: '12px' }}><strong>Plano Competitivo:</strong> Taxa de apenas 8% para o comprador (a menor do mercado). O produtor recebe o valor integral do ingresso (sem bônus, mas com alta competitividade nas vendas).</li>
            <li style={{ marginBottom: '12px' }}><strong>Plano Absorção:</strong> Taxa <strong>ZERO</strong> para o comprador. O produtor absorve o custo, pagando apenas 8% sobre a bilheteria total (uma taxa muito inferior aos 10-15% cobrados por outras plataformas).</li>
          </ul>
        </>
      )
    },
    {
      id: 6,
      icon: "✅",
      color: "#10b981",
      title: "Existe alguma taxa para criar uma conta ou publicar um evento?",
      content: (
        <>
          <p style={{ marginBottom: '12px' }}>Não! A criação da sua conta, tanto de usuário quanto de produtor, é totalmente <strong>gratuita</strong>. O uso da plataforma e a publicação dos eventos também não têm custo inicial.</p>
          <p>Na Golden Ingressos, a regra é clara: <strong>se não vendeu, não paga.</strong> Você só tem custos (ou lucros extras, dependendo do plano) quando a venda acontece.</p>
        </>
      )
    }
  ];

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '48px 16px' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {faqs.map((faq) => {
            const isExpanded = expandedCard === faq.id;
            
            return (
              <div
                key={faq.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${faq.color}`,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
              >
                <button
                  onClick={() => toggleCard(faq.id)}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '28px', color: faq.color }}>
                      {faq.icon}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {faq.title}
                    </h3>
                  </div>
                  <svg
                    style={{
                      width: '20px',
                      height: '20px',
                      color: '#9ca3af',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div style={{ padding: '4px 24px 20px 24px' }}>
                    <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                      {faq.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
          borderRadius: '8px',
          padding: '40px',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Pronto para revolucionar seus eventos?</h2>
          <p style={{ marginBottom: '24px', color: '#e9d5ff' }}>Junte-se à Golden Ingressos e comece a lucrar mais hoje mesmo!</p>
          <a 
            href="mailto:contato@goldeningressos.com.br"
            style={{
              display: 'inline-block',
              backgroundColor: '#fbbf24',
              color: '#1f2937',
              fontWeight: '600',
              padding: '12px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fcd34d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fbbf24'}
          >
            🚀 Enviar E-mail para o Suporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
