// app/editar-dados-produtor/page.js

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Server Action para atualizar os dados
async function updateProdutor(formData) {
  'use server';
  
  const supabase = createClient();
  
  // Primeiro verifica o usuário
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const nome_completo = formData.get('nome_completo');
  const nome_empresa = formData.get('nome_empresa');
  const chave_pix = formData.get('chave_pix');
  const tipo_chave_pix = formData.get('tipo_chave_pix');
  const dados_bancarios = formData.get('dados_bancarios');
  const forma_pagamento = formData.get('forma_pagamento');

  // Atualiza os dados
  const { error } = await supabase
    .from('produtores')
    .update({
      nome_completo,
      nome_empresa,
      chave_pix,
      tipo_chave_pix,
      dados_bancarios,
      forma_pagamento,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar:', error);
    // Redireciona com mensagem de erro
    redirect('/editar-dados-produtor?error=Erro ao salvar alterações');
  }

  // Redireciona com mensagem de sucesso
  redirect('/produtor?success=Dados atualizados com sucesso');
}

export default async function EditarDadosProdutorPage({ searchParams }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar dados atuais do produtor
  const { data: produtor } = await supabase
    .from('produtores')
    .select('*')
    .eq('id', user.id)
    .single();

  const error = searchParams.error;
  const success = searchParams.success;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/produtor" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Área do Produtor</Link>
        <h1 style={{ margin: '0' }}>Editar Dados do Produtor</h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            {success}
          </div>
        )}

        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
          <form action={updateProdutor} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
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
                  defaultValue={produtor?.nome_completo || ''}
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
                  defaultValue={produtor?.nome_empresa || ''}
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
                  defaultValue={produtor?.chave_pix || ''}
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
                  defaultValue={produtor?.tipo_chave_pix || ''}
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
                  defaultValue={produtor?.dados_bancarios || ''}
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
                      defaultChecked={produtor?.forma_pagamento === 'apenas_pix'}
                    />
                    Apenas PIX
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="radio" 
                      name="forma_pagamento" 
                      value="apenas_transferencia" 
                      defaultChecked={produtor?.forma_pagamento === 'apenas_transferencia'}
                    />
                    Apenas Transferência
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="radio" 
                      name="forma_pagamento" 
                      value="ambos" 
                      defaultChecked={produtor?.forma_pagamento === 'ambos'}
                    />
                    Ambos (PIX e Transferência)
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="submit"
                style={{ 
                  backgroundColor: '#f1c40f', 
                  color: 'black', 
                  padding: '15px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  flex: 1
                }}
              >
                Salvar Alterações
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
                  flex: 1
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
