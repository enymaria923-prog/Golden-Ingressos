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
      
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (!userData) {
        redirect('/login');
        return;
      }
      setUser(userData);

      const { data: perfilData } = await supabase
        .from('perfis')
        .select('nome_completo, telefone, data_nascimento, localizacao')
        .eq('id', userData.id)
        .single();

      setPerfil(perfilData);
      
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
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          data_nascimento: formData.data_nascimento,
          localizacao: formData.localizacao,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPerfil(formData);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar as alterações');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <h1 style={{ margin: '0' }}>Meu Perfil</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

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
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
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
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
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
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
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
                    style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
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
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={handleEditToggle}>
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Resto do código permanece igual */}
      </div>
    </div>
  );
}
