'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function EditarDadosProdutorPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [produtor, setProdutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    nome_empresa: '',
    chave_pix: '',
    tipo_chave_pix: '',
    dados_bancarios: '',
    forma_pagamento: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Verifica usuário
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert('Você precisa estar logado!');
        router.push('/login');
        return;
      }
      
      setUser(user);

      // Busca dados do produtor
      const { data: produtorData, error: produtorError } = await supabase
        .from('produtores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (produtorError) {
        console.log('Produtor não encontrado, será criado ao salvar');
      } else {
        setProdutor(produtorData);
        setFormData({
          nome_completo: produtorData.nome_completo || '',
          nome_empresa: produtorData.nome_empresa || '',
          chave_pix: produtorData.chave_pix || '',
          tipo_chave_pix: produtorData.tipo_chave_pix || '',
          dados_bancarios: produtorData.dados_bancarios || '',
          forma_pagamento: produtorData.forma_pagamento || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.chave_pix || !formData.tipo_chave_pix || !formData.forma_pagamento) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    setSaving(true);

    try {
      const dadosAtualizar = {
        id: user.id,
        nome_completo: formData.nome_completo,
        nome_empresa: formData.nome_empresa || null,
        chave_pix: formData.chave_pix,
        tipo_chave_pix: formData.tipo_chave_pix,
        dados_bancarios: formData.dados_bancarios || null,
        forma_pagamento: formData.forma_pagamento,
        updated_at: new Date().toISOString()
      };

      // Tenta atualizar primeiro
      const { error: updateError } = await supabase
        .from('produtores')
        .update(dadosAtualizar)
        .eq('id', user.id);

      // Se não existe, cria
      if (updateError && updateError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('produtores')
          .insert([dadosAtualizar]);

        if (insertError) {
          throw insertError;
        }
      } else if (updateError) {
        throw updateError;
      }

      alert('✅ Dados atualizados com sucesso!');
      router.push('/produtor');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar alterações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/produtor" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Área do Produtor</Link>
        <h1 style={{ margin: '0' }}>Editar Dados do Produtor</h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Dados Pessoais */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Dados Pessoais</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="nome_completo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome Completo: *
                </label>
                <input 
                  id="nome_completo" 
                  name="nome_completo" 
                  type="text" 
                  required 
                  value={formData.nome_completo}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="nome_empresa" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome da empresa / Nome fantasia (se tiver):
                </label>
                <input 
                  id="nome_empresa" 
                  name="nome_empresa" 
                  type="text" 
                  value={formData.nome_empresa}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="Nome da sua empresa ou marca"
                />
              </div>
            </div>

            {/* Recebimento via PIX */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Recebimento via PIX</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="chave_pix" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Chave PIX: *
                </label>
                <input 
                  id="chave_pix" 
                  name="chave_pix" 
                  type="text" 
                  required 
                  value={formData.chave_pix}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                />
              </div>

              <div>
                <label htmlFor="tipo_chave_pix" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo da Chave PIX: *
                </label>
                <select 
                  id="tipo_chave_pix" 
                  name="tipo_chave_pix" 
                  required 
                  value={formData.tipo_chave_pix}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>
            </div>

            {/* Recebimento via Conta Corrente */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Recebimento via Conta Corrente</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="dados_bancarios" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Dados Bancários (Banco, Agência, Conta):
                </label>
                <textarea 
                  id="dados_bancarios" 
                  name="dados_bancarios" 
                  rows="3"
                  value={formData.dados_bancarios}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }} 
                  placeholder="Ex: Banco do Brasil, Agência 1234, Conta 56789-0"
                />
              </div>
            </div>

            {/* Preferência */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Preferência</h3>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Forma de Pagamento de Preferência: *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="radio" 
                      name="forma_pagamento" 
                      value="apenas_pix" 
                      required 
                      checked={formData.forma_pagamento === 'apenas_pix'}
                      onChange={handleChange}
                    />
                    Apenas PIX
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="radio" 
                      name="forma_pagamento" 
                      value="apenas_transferencia" 
                      checked={formData.forma_pagamento === 'apenas_transferencia'}
                      onChange={handleChange}
                    />
                    Apenas Transferência
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="radio" 
                      name="forma_pagamento" 
                      value="ambos" 
                      checked={formData.forma_pagamento === 'ambos'}
                      onChange={handleChange}
                    />
                    Ambos (PIX e Transferência)
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="submit"
                disabled={saving}
                style={{ 
                  backgroundColor: saving ? '#95a5a6' : '#f1c40f', 
                  color: 'black', 
                  padding: '15px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  flex: 1
                }}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              
              <Link 
                href="/produtor"
                style={{ 
                  backgroundColor: '#95a5a6', 
                  color: 'white', 
                  padding: '15px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontSize: '16px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
