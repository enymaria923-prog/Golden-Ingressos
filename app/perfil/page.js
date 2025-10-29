// app/perfil/page.js

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
// Vamos criar este arquivo no próximo passo:
import { atualizarPerfil } from '../actions-perfil'; 

export default async function PerfilPage() {
  
  const supabase = createClient();

  // 1. Protege a rota:
  // Tenta buscar o usuário. Se não houver, manda-o para o Login.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?message=Você precisa estar logado para ver seu perfil.');
  }

  // 2. Busca o perfil existente:
  // Busca na tabela 'perfis' pela linha que tem o ID do usuário logado.
  const { data: perfil, error } = await supabase
   .select('id, nome_completo, chave_pix, tipo_chave_pix, banco_conta_corrente, preferencia_pagamento')
    .select('*')
    .eq('id', user.id) // O 'id' do perfil TEM que ser igual ao 'id' do usuário
    .single(); // .single() pega só um resultado (ou dá erro se houver vários)

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "range not satisiable" (significa que não encontrou o perfil, o que é normal para um novo usuário)
    console.error("Erro ao buscar perfil:", error);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Meu Perfil de Produtor</h1>
      </header>

      {/* Formulário do Perfil */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '8px' }}>
        
        <p style={{ fontSize: '14px', color: '#555' }}>
          Email da Conta: <strong>{user.email}</strong> (Não pode ser alterado)
        </p>
        <hr style={{ margin: '20px 0' }} />

        {/* O 'action' chama a função que vamos criar no próximo passo */}
        <form action={atualizarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <h3>Dados Pessoais</h3>
          <label htmlFor="nome_completo">Nome Completo:</label>
          <input 
            id="nome_completo" 
            name="nome_completo" 
            type="text" 
            style={{ padding: '10px' }}
            defaultValue={perfil?.nome_completo || ''} // Pré-preenche com dados do banco
          />

          <h3>Recebimento via PIX</h3>
          <label htmlFor="chave_pix">Chave PIX:</label>
          <input 
            id="chave_pix" 
            name="chave_pix" 
            type="text" 
            style={{ padding: '10px' }}
            defaultValue={perfil?.chave_pix || ''}
          />
          
          <label htmlFor="tipo_chave_pix">Tipo da Chave PIX:</label>
          <select 
            id="tipo_chave_pix" 
            name="tipo_chave_pix" 
            style={{ padding: '10px' }}
            defaultValue={perfil?.tipo_chave_pix || ''}
          >
            <option value="">Selecione...</option>
            <option value="CPF">CPF</option>
            <option value="Email">Email</option>
            <option value="Celular">Celular</option>
            <option value="Aleatoria">Chave Aleatória</option>
          </select>

          <h3>Recebimento via Conta Corrente</h3>
          <label htmlFor="banco_conta_corrente">Dados Bancários (Banco, Agência, Conta):</label>
          <textarea 
            id="banco_conta_corrente" 
            name="banco_conta_corrente" 
            rows="3" 
            style={{ padding: '10px' }}
            defaultValue={perfil?.banco_conta_corrente || ''}
          />

          <h3>Preferência</h3>
          <label htmlFor="preferencia_pagamento">Forma de Pagamento Preferida:</label>
          <select 
            id="preferencia_pagamento" 
            name="preferencia_pagamento" 
            style={{ padding: '10px' }}
            defaultValue={perfil?.preferencia_pagamento || ''}
          >
            <option value="">Selecione...</option>
            <option value="PIX">Apenas PIX</option>
            <option value="Transferência">Apenas Transferência</option>
            <option value="Ambos">Ambos</option>
          </select>

          <button 
            type="submit"
            style={{ backgroundColor: '#f1c40f', color: 'black', padding: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
