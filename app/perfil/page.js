'use client';

import { createClient } from '../../utils/supabase/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PerfilPage() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    data_nascimento: '',
    localizacao: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      
      // Verifica se o usuário está logado
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (!userData) {
        redirect('/login');
        return;
      }
      setUser(userData);

      // Busca informações do perfil
      const { data: perfilData } = await supabase
        .from('perfis')
        .select('nome_completo, telefone, data_nascimento, localizacao')
        .eq('id', userData.id)
        .single();

      setPerfil(perfilData);
      
      // Preenche o form com os dados existentes
      if (perfilData) {
        setFormData({
          nome_completo: perfilData.nome_completo || '',
          telefone: perfilData.telefone || '',
          data_nascimento: perfilData.data_nascimento || '',
          localizacao: perfilData.localizacao || ''
        });
      }
      
      setLoading(false);
    }

    loadUserData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { error } = await supabase
        .from('perfis')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualiza os dados locais
      setPerfil(formData);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar as alterações');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaura os dados originais
    if (perfil) {
      setFormData({
        nome_completo: perfil.nome_completo || '',
        telefone: perfil.telefone || '',
        data_nascimento: perfil.data_nascimento || '',
        localizacao: perfil.localizacao || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Carregando...</div>
      </div>
    );
  }

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
              <p>
                <strong>Nome:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleInputChange}
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    placeholder="Digite seu nome"
                  />
                ) : (
                  perfil?.nome_completo || 'Não informado'
                )}
              </p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p>
                <strong>Telefone:</strong>{' '}
                {isEditing ? (
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    placeholder="Digite seu telefone"
                  />
                ) : (
                  perfil?.telefone || 'Não informado'
                )}
              </p>
            </div>
            <div>
              <p>
                <strong>Data de Nascimento:</strong>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    name="data_nascimento"
                    value={formData.data_nascimento}
                    onChange={handleInputChange}
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  perfil?.data_nascimento || 'Não informado'
                )}
              </p>
              <p>
                <strong>Localização:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleInputChange}
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                    placeholder="Digite sua localização"
                  />
                ) : (
                  perfil?.localizacao || 'Não informado'
                )}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            {isEditing ? (
              <div>
                <button 
                  onClick={handleSave}
                  style={{ 
                    backgroundColor: '#2ecc71', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '5px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button 
                  onClick={handleCancel}
                  style={{ 
                    backgroundColor: '#e74c3c', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '5px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button 
                onClick={handleEditToggle}
                style={{ 
                  backgroundColor: '#f1c40f', 
                  color: 'black', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer'
                }}
              >
                Editar Perfil
              </button>
            )}
          </div>
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
