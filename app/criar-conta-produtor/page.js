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

      alert('✅ Conta criada com sucesso! Faça login para continuar.');
      router.push('/login');

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="criar-conta-container">
      <div className="criar-conta-box">
        <h1>Criar Conta de Produtor</h1>
        <p className="subtitle">Preencha os dados para começar a vender ingressos</p>

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
