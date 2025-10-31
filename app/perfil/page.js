import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PerfilPage() {
  const supabase = createClient();

  // Verifica se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Busca informações adicionais do perfil (se existirem)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome_completo, telefone, data_nascimento, localizacao')
    .eq('id', user.id)
    .single();

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <h1 style={{ margin: '0' }}>Meu Perfil</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Cartão de Informações Pessoais */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Informações Pessoais</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p><strong>Nome:</strong> {perfil?.nome_completo || 'Não informado'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Telefone:</strong> {perfil?.telefone || 'Não informado'}</p>
            </div>
            <div>
              <p><strong>Data de Nascimento:</strong> {perfil?.data_nascimento || 'Não informado'}</p>
              <p><strong>Localização:</strong> {perfil?.localizacao || 'Não informado'}</p>
            </div>
          </div>

          <button style={{ 
            backgroundColor: '#f1c40f', 
            color: 'black', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Editar Perfil
          </button>
        </div>

        {/* Cartão de Estatísticas */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Estatísticas</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
            <div>
              <h3 style={{ margin: '0', fontSize: '24px', color: '#5d34a4' }}>0</h3>
              <p style={{ margin: '0' }}>Eventos participados</p>
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '24px', color: '#5d34a4' }}>0</h3>
              <p style={{ margin: '0' }}>Ingressos comprados</p>
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '24px', color: '#5d34a4' }}>0</h3>
              <p style={{ margin: '0' }}>Eventos favoritos</p>
            </div>
          </div>
        </div>

        {/* Cartão de Preferências */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Preferências</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ marginBottom: '10px' }}>Notificações</h3>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" /> Notificações por email
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" /> Notificações por SMS
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" /> Notificações push
            </label>
          </div>

          <div>
            <h3 style={{ marginBottom: '10px' }}>Privacidade</h3>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" /> Mostrar perfil público
            </label>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" /> Mostrar atividades
            </label>
          </div>
        </div>

        {/* Cartão de Ações Rápidas */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Ações Rápidas</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/metodos-pagamento" style={{ padding: '10px', backgroundColor: '#f1c40f', color: 'black', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' }}>
              Métodos de pagamento
            </Link>
            <Link href="/alertas" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' }}>
              Configurar alertas
            </Link>
            <Link href="/seguranca" style={{ padding: '10px', backgroundColor: '#e74c3c', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' }}>
              Segurança da conta
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
