'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';
import './CriarContaProdutor.css';

export default function CriarContaProdutorPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
    nomeCompleto: '',
    nomeEmpresa: '',
    chavePix: '',
    tipoChavePix: '',
    dadosBancarios: '',
    formaPagamento: '',
    cupomRecomendacao: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    
    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (!formData.nomeCompleto || !formData.chavePix || !formData.tipoChavePix || !formData.formaPagamento) {
      setErro('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Inserir dados do produtor na tabela produtores
      const { error: produtorError } = await supabase
        .from('produtores')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          nome_completo: formData.nomeCompleto,
          nome_empresa: formData.nomeEmpresa || null,
          chave_pix: formData.chavePix,
          tipo_chave_pix: formData.tipoChavePix,
          dados_bancarios: formData.dadosBancarios || null,
          forma_pagamento: formData.formaPagamento,
          cupom_recomendacao: formData.cupomRecomendacao.trim().toUpperCase() || null
        }]);

      if (produtorError) throw produtorError;

      // Mostrar página de sucesso
      setCadastroSucesso(true);

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Página de Sucesso - Verificação de Email
  if (cadastroSucesso) {
    return (
      <div className="criar-conta-container">
        <div className="criar-conta-box" style={{ maxWidth: '650px' }}>
          
          {/* Ícone de Sucesso */}
          <div style={{ fontSize: '64px', color: '#2ecc71', textAlign: 'center', marginBottom: '20px' }}>
            ✓
          </div>

          <h1 style={{ textAlign: 'center', color: '#2ecc71', marginBottom: '10px' }}>
            Cadastro Realizado com Sucesso!
          </h1>
          
          <p className="subtitle" style={{ textAlign: 'center', marginBottom: '30px' }}>
            Falta apenas um passo para ativar sua conta
          </p>

          {/* Box de Informação sobre Verificação */}
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '25px', 
            borderRadius: '8px', 
            marginBottom: '25px',
            border: '2px solid #2ecc71'
          }}>
            <h3 style={{ color: '#2d5016', marginTop: '0', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📧 Verificação de Email Necessária
            </h3>
            
            <p style={{ color: '#2d5016', marginBottom: '15px', lineHeight: '1.6' }}>
              <strong>O Supabase enviou um email de verificação para:</strong>
              <br />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{formData.email}</span>
            </p>
            
            <p style={{ color: '#2d5016', marginBottom: '15px', lineHeight: '1.6' }}>
              Para ativar sua conta de produtor, siga estes passos:
            </p>
            
            <ol style={{ color: '#2d5016', paddingLeft: '20px', margin: '0', lineHeight: '1.8' }}>
              <li>Acesse sua caixa de entrada de email</li>
              <li>Procure por um email do <strong>Supabase</strong> (remetente: noreply@mail.app.supabase.io)</li>
              <li>Abra o email e clique no botão <strong>"Confirm your mail"</strong></li>
              <li>Após confirmar, retorne aqui e faça login</li>
            </ol>
          </div>

          {/* Aviso sobre Spam */}
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '5px', 
            marginBottom: '25px',
            border: '1px solid #ffc107'
          }}>
            <p style={{ margin: '0', color: '#856404', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>💡 Dica:</strong> Se não encontrar o email de verificação do Supabase na sua caixa de entrada, 
              verifique a pasta de <strong>spam/lixo eletrônico</strong>. Às vezes, emails automáticos podem ir para lá.
            </p>
          </div>

          {/* Informação Adicional */}
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '5px', 
            marginBottom: '30px',
            border: '1px solid #2196f3'
          }}>
            <p style={{ margin: '0', color: '#1565c0', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>ℹ️ Importante:</strong> Sua conta só estará completamente ativa após você confirmar 
              o email através do link enviado pelo Supabase. Sem essa confirmação, você não conseguirá fazer login.
            </p>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/login"
              className="btn-submit"
              style={{ 
                textAlign: 'center', 
                textDecoration: 'none',
                backgroundColor: '#2ecc71',
                display: 'block'
              }}
            >
              Já confirmei meu email - Fazer Login
            </Link>
            
            <Link
              href="/produtor"
              style={{ 
                textAlign: 'center', 
                textDecoration: 'none',
                backgroundColor: '#f1c40f',
                color: '#000',
                padding: '12px 20px',
                borderRadius: '5px',
                fontWeight: 'bold',
                display: 'block'
              }}
            >
              Ir para Área do Produtor
            </Link>

            <Link
              href="/"
              style={{ 
                textAlign: 'center', 
                textDecoration: 'none',
                backgroundColor: '#95a5a6',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '5px',
                fontWeight: 'bold',
                display: 'block'
              }}
            >
              Voltar para Home
            </Link>
          </div>

          {/* Informação sobre Reenvio */}
          <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '25px', lineHeight: '1.6' }}>
            Não recebeu o email? Aguarde alguns minutos e verifique sua pasta de spam.
            <br />
            Se necessário, você pode tentar criar a conta novamente.
          </p>
        </div>
      </div>
    );
  }

  // Formulário de Cadastro
  return (
    <div className="criar-conta-container">
      <div className="criar-conta-box">
        <h1>Criar Conta de Produtor</h1>
        <p className="subtitle">Preencha os dados para começar a vender ingressos</p>

        {/* Aviso sobre verificação de email */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #2196f3'
        }}>
          <p style={{ margin: '0', color: '#1565c0', fontSize: '14px', lineHeight: '1.6' }}>
            <strong>⚠️ Atenção:</strong> Após o cadastro, o Supabase enviará um email de verificação.
            Você precisará confirmar seu email clicando em "Confirm your mail" antes de fazer login.
          </p>
        </div>

        {erro && <div className="erro-message">{erro}</div>}

        <form onSubmit={handleSubmit} className="criar-conta-form">
          
          {/* Dados de Login */}
          <div className="form-section">
            <h3>🔐 Dados de Login</h3>
            
            <div className="form-group">
              <label htmlFor="email">Email: *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha: *</label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                value={formData.senha}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha: *</label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                required
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="form-section">
            <h3>👤 Dados Pessoais</h3>
            
            <div className="form-group">
              <label htmlFor="nomeCompleto">Nome Completo: *</label>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                required
                value={formData.nomeCompleto}
                onChange={handleChange}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nomeEmpresa">Nome da Empresa / Nome Fantasia:</label>
              <input
                id="nomeEmpresa"
                name="nomeEmpresa"
                type="text"
                value={formData.nomeEmpresa}
                onChange={handleChange}
                placeholder="Nome da sua empresa ou marca (opcional)"
              />
            </div>
          </div>

          {/* Dados de Pagamento */}
          <div className="form-section">
            <h3>💳 Dados de Pagamento</h3>
            
            <div className="form-group">
              <label htmlFor="chavePix">Chave PIX: *</label>
              <input
                id="chavePix"
                name="chavePix"
                type="text"
                required
                value={formData.chavePix}
                onChange={handleChange}
                placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoChavePix">Tipo da Chave PIX: *</label>
              <select
                id="tipoChavePix"
                name="tipoChavePix"
                required
                value={formData.tipoChavePix}
                onChange={handleChange}
              >
                <option value="">Selecione o tipo</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">Email</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave Aleatória</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dadosBancarios">Dados Bancários (Banco, Agência, Conta):</label>
              <textarea
                id="dadosBancarios"
                name="dadosBancarios"
                rows="3"
                value={formData.dadosBancarios}
                onChange={handleChange}
                placeholder="Ex: Banco do Brasil, Agência 1234, Conta 56789-0 (opcional)"
              />
            </div>

            <div className="form-group">
              <label>Forma de Pagamento de Preferência: *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value="apenas_pix"
                    required
                    checked={formData.formaPagamento === 'apenas_pix'}
                    onChange={handleChange}
                  />
                  Apenas PIX
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value="apenas_transferencia"
                    checked={formData.formaPagamento === 'apenas_transferencia'}
                    onChange={handleChange}
                  />
                  Apenas Transferência
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value="ambos"
                    checked={formData.formaPagamento === 'ambos'}
                    onChange={handleChange}
                  />
                  Ambos (PIX e Transferência)
                </label>
              </div>
            </div>
          </div>

          {/* Cupom de Recomendação */}
          <div className="form-section">
            <h3>🎟️ Cupom de Recomendação (Opcional)</h3>
            
            <div className="form-group">
              <label htmlFor="cupomRecomendacao">Código do Cupom:</label>
              <input
                id="cupomRecomendacao"
                name="cupomRecomendacao"
                type="text"
                value={formData.cupomRecomendacao}
                onChange={(e) => setFormData({ ...formData, cupomRecomendacao: e.target.value.toUpperCase() })}
                placeholder="Ex: PARCEIRO2024 (deixe em branco se não tiver)"
                style={{ textTransform: 'uppercase' }}
              />
              <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                Se você foi indicado por alguém, insira o código do cupom aqui
              </small>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="login-link">
            Já tem uma conta? <Link href="/login">Fazer login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
