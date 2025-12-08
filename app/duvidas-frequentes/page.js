'use client';

import React, { useState } from 'react';

const FAQPage = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const faqs = [
    {
      id: 1,
      icon: "👤",
      color: "blue",
      title: "Como criar minha conta (Cliente)?",
      content: (
        <>
          <p className="mb-3">Para comprar ingressos e acessar seus eventos, o primeiro passo é ter o seu cadastro. É muito simples:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Acesse a página de login e clique na opção <strong>"Criar Nova Conta"</strong>;</li>
            <li>Preencha o formulário com seus dados conforme solicitado na tela: <strong>Nome Completo</strong>, seu melhor <strong>E-mail</strong>, crie uma <strong>Senha</strong> segura (mínimo de 6 caracteres) e repita a senha no campo <strong>Confirmar Senha</strong>;</li>
            <li>Clique no botão amarelo <strong>"Criar Conta"</strong>;</li>
            <li><strong>Atenção:</strong> Por medidas de segurança, após o cadastro, o sistema (identificado como <strong>Supabase</strong>) enviará um e-mail de verificação para você. É necessário abrir este e-mail e clicar no link ou botão azul escrito <strong>"Confirm your mail"</strong>. Só após essa confirmação seu login estará liberado.</li>
          </ol>
        </>
      )
    },
    {
      id: 2,
      icon: "🎫",
      color: "green",
      title: "Como encontrar e acessar meus ingressos?",
      content: (
        <>
          <p className="mb-3">Não precisa se preocupar em imprimir nada. Para acessar seus ingressos:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Faça login na sua conta na Golden Ingressos;</li>
            <li>Vá até a área <strong>"Meus Ingressos"</strong> no menu principal;</li>
            <li>Lá, tudo estará organizado: você verá uma aba com os ingressos dos eventos que <strong>ainda vão acontecer</strong> e outra separada com o histórico dos eventos que <strong>já passaram</strong>.</li>
          </ul>
        </>
      )
    },
    {
      id: 3,
      icon: "💻",
      color: "purple",
      title: "Como posso acessar um evento online?",
      content: (
        <>
          <p className="mb-3">Os eventos online são realizados via transmissão em plataformas externas. É responsabilidade do organizador definir e informar na página do evento qual ferramenta será utilizada.</p>
          <ul className="space-y-3">
            <li>
              <strong>Acesso via Navegador:</strong> Para transmissões via <strong>Youtube, Instagram, Facebook, Google Meet/Hangouts (no iOS) e Twitch</strong>, o acesso geralmente acontece direto pelo navegador, sem precisar baixar nada (pode ser necessário apenas estar logado na conta do serviço);
            </li>
            <li>
              <strong>Instalação de App:</strong> Se o evento for via <strong>Google Meet/Hangouts (no Android), Skype, Telegram, Whatsapp ou Zoom.us</strong>, pode ser necessário instalar o aplicativo correspondente e criar uma conta na plataforma escolhida.
            </li>
          </ul>
        </>
      )
    },
    {
      id: 4,
      icon: "🔄",
      color: "orange",
      title: "Por que não consegui solicitar meu reembolso?",
      content: (
        <>
          <p className="mb-3">Se o botão de cancelamento não está disponível ou sua solicitação foi negada, é provável que o pedido não cumpra os requisitos da nossa Política de Cancelamento. Para o cancelamento automático, o pedido <strong>DEVE</strong> atender a <strong>todas</strong> as 4 condições abaixo:</p>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li><strong>Titularidade:</strong> O reembolso só pode ser solicitado pelo <strong>titular da compra</strong> (através do e-mail usado na aquisição). Ter o ingresso em mãos não faz de você o titular da compra;</li>
            <li><strong>Prazo:</strong> A solicitação deve ser feita em até <strong>7 (sete) dias corridos</strong> após a compra OU até <strong>48 horas antes</strong> do início do evento (prevalecendo o que ocorrer primeiro);</li>
            <li><strong>Cancelamento Total:</strong> A Golden Ingressos não realiza reembolso parcial. Se você pedir o cancelamento de um pedido com vários ingressos, <strong>a compra inteira será cancelada</strong>;</li>
            <li><strong>Sem Check-in:</strong> O ingresso <strong>não pode ter sido utilizado</strong> (bipado) na entrada do evento ou usado para retirada de kits/abadás.</li>
          </ol>
        </>
      )
    },
    {
      id: 5,
      icon: "💰",
      color: "yellow",
      title: "Qual o custo para utilizar a Golden Ingressos?",
      content: (
        <>
          <p className="mb-3">Para o comprador, a taxa varia de acordo com o plano escolhido pelo produtor do evento. Para o produtor, <strong>a Golden Ingressos é a única plataforma que paga para você vender.</strong></p>
          <p className="mb-3">Nós possuímos um modelo inédito onde o produtor pode receber uma bonificação sobre a bilheteria. Confira os planos que o produtor pode selecionar livremente para cada evento:</p>
          <ul className="space-y-3">
            <li><strong>Plano Premium:</strong> Taxa de 18,5% para o comprador. O produtor recebe o valor do ingresso <strong>+ 6,5% de bônus</strong>.</li>
            <li><strong>Plano Padrão:</strong> Taxa de 15% para o comprador (média de mercado). O produtor recebe o valor do ingresso <strong>+ 5% de bônus</strong>.</li>
            <li><strong>Plano Econômico:</strong> Taxa de 10% para o comprador. O produtor recebe o valor do ingresso <strong>+ 3% de bônus</strong>.</li>
            <li><strong>Plano Competitivo:</strong> Taxa de apenas 8% para o comprador (a menor do mercado). O produtor recebe o valor integral do ingresso (sem bônus, mas com alta competitividade nas vendas).</li>
            <li><strong>Plano Absorção:</strong> Taxa <strong>ZERO</strong> para o comprador. O produtor absorve o custo, pagando apenas 8% sobre a bilheteria total (uma taxa muito inferior aos 10-15% cobrados por outras plataformas).</li>
          </ul>
        </>
      )
    },
    {
      id: 6,
      icon: "✅",
      color: "green",
      title: "Existe alguma taxa para criar uma conta ou publicar um evento?",
      content: (
        <>
          <p className="mb-3">Não! A criação da sua conta, tanto de usuário quanto de produtor, é totalmente <strong>gratuita</strong>. O uso da plataforma e a publicação dos eventos também não têm custo inicial.</p>
          <p>Na Golden Ingressos, a regra é clara: <strong>se não vendeu, não paga.</strong> Você só tem custos (ou lucros extras, dependendo do plano) quando a venda acontece.</p>
        </>
      )
    }
  ];

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { border: 'border-l-blue-500', icon: 'text-blue-600' },
      green: { border: 'border-l-green-500', icon: 'text-green-600' },
      purple: { border: 'border-l-purple-500', icon: 'text-purple-600' },
      orange: { border: 'border-l-orange-500', icon: 'text-orange-600' },
      yellow: { border: 'border-l-yellow-500', icon: 'text-yellow-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FAQ Cards */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {faqs.map((faq) => {
            const isExpanded = expandedCard === faq.id;
            const colorClasses = getColorClasses(faq.color);
            
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-lg border-l-4 ${colorClasses.border} shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md`}
              >
                <button
                  onClick={() => toggleCard(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`text-2xl ${colorClasses.icon}`}>
                      {faq.icon}
                    </span>
                    <h3 className="text-base font-semibold text-gray-800">
                      {faq.title}
                    </h3>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {faq.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg p-10 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Pronto para revolucionar seus eventos?</h2>
          <p className="mb-6 text-purple-100">Junte-se à Golden Ingressos e comece a lucrar mais hoje mesmo!</p>
          <a 
            href="mailto:contato@goldeningressos.com.br"
            className="inline-block bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-300 transition-colors shadow-md"
          >
            🚀 Enviar E-mail para o Suporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
