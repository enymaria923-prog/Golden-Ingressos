import React, { useState } from 'react';
import { ChevronDown, HelpCircle, User, Ticket, Monitor, RefreshCw, DollarSign, FileCheck } from 'lucide-react';

const FAQPage = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const faqs = [
    {
      id: 1,
      icon: User,
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
      icon: Ticket,
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
      icon: Monitor,
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
      icon: RefreshCw,
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
      icon: DollarSign,
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
      icon: FileCheck,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dúvidas Frequentes</h1>
          <p className="text-lg text-yellow-50">Encontre respostas para as perguntas mais comuns sobre a Golden Ingressos</p>
        </div>
      </div>

      {/* FAQ Cards */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {faqs.map((faq) => {
            const Icon = faq.icon;
            const isExpanded = expandedCard === faq.id;
            
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'shadow-xl' : 'hover:shadow-lg'
                }`}
              >
                <button
                  onClick={() => toggleCard(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-yellow-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg transition-colors ${
                      isExpanded ? 'bg-yellow-400 text-white' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 pr-4">
                      {faq.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2">
                    <div className="pl-16 pr-4 text-gray-700 leading-relaxed">
                      {faq.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Ainda tem dúvidas?</h2>
          <p className="mb-6 text-yellow-50">Entre em contato com nosso suporte. Estamos aqui para ajudar!</p>
          <button className="bg-white text-yellow-600 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-50 transition-colors shadow-lg">
            Falar com o Suporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
