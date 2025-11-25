'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import Link from 'next/link';
import '../admin.css';

export default function CuponsPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);
  const [novoCupom, setNovoCupom] = useState({
    codigo: '',
    descricao: ''
  });
  const [cupomSelecionado, setCupomSelecionado] = useState(null);
  const [produtoresDoCupom, setProdutoresDoCupom] = useState([]);
  const [carregandoProdutores, setCarregandoProdutores] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    setIsAuthenticated(loggedIn);
    if (loggedIn) {
      carregarCupons();
    } else {
      router.push('/admin/bokunohero');
    }
  }, []);

  const carregarCupons = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCupons(data || []);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      alert('❌ Erro ao carregar cupons: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const carregarProdutoresDoCupom = async (codigoCupom) => {
    setCarregandoProdutores(true);
    try {
      const { data, error } = await supabase
        .from('produtores')
        .select('*')
        .eq('cupom_utilizado', codigoCupom)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutoresDoCupom(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
      alert('❌ Erro ao carregar produtores: ' + error.message);
      setProdutoresDoCupom([]);
    } finally {
      setCarregandoProdutores(false);
    }
  };

  const handleCriarCupom = async (e) => {
    e.preventDefault();
    
    if (!novoCupom.codigo.trim()) {
      alert('⚠️ Por favor, insira um código para o cupom!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cupons')
        .insert([{
          codigo: novoCupom.codigo.trim().toUpperCase(),
          descricao: novoCupom.descricao.trim() || null
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          alert('⚠️ Este código de cupom já existe!');
        } else {
          throw error;
        }
        return;
      }

      alert('✅ Cupom criado com sucesso!');
      setNovoCupom({ codigo: '', descricao: '' });
      setMostrarFormNovo(false);
      carregarCupons();
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      alert('❌ Erro ao criar cupom: ' + error.message);
    }
  };

  const handleExcluirCupom = async (id, codigo) => {
    if (!confirm(`Tem certeza que deseja excluir o cupom "${codigo}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Cupom excluído com sucesso!');
      carregarCupons();
      if (cupomSelecionado?.id === id) {
        setCupomSelecionado(null);
        setProdutoresDoCupom([]);
      }
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      alert('❌ Erro ao excluir cupom: ' + error.message);
    }
  };

  const handleSelecionarCupom = (cupom) => {
    setCupomSelecionado(cupom);
    carregarProdutoresDoCupom(cupom.codigo);
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🎟️ Gerenciamento de Cupons</h1>
        <Link href="/admin/bokunohero" className="btn-logout">
          ← Voltar para Moderação
        </Link>
      </header>

      <div className="admin-action-bar">
        <button 
          onClick={() => setMostrarFormNovo(!mostrarFormNovo)} 
          className="btn-recargar"
          style={{ backgroundColor: mostrarFormNovo ? '#e74c3c' : '#27ae60' }}
        >
          {mostrarFormNovo ? '❌ Cancelar' : '➕ Criar Novo Cupom'}
        </button>
        <button onClick={carregarCupons} className="btn-recargar">
          🔄 Recarregar
        </button>
      </div>

      {mostrarFormNovo && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px' }}>➕ Criar Novo Cupom</h2>
          <form onSubmit={handleCriarCupom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Código do Cupom: *
              </label>
              <input
                type="text"
                value={novoCupom.codigo}
                onChange={(e) => setNovoCupom({ ...novoCupom, codigo: e.target.value.toUpperCase() })}
                placeholder="Ex: PARCEIRO2024"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Descrição (opcional):
              </label>
              <textarea
                value={novoCupom.descricao}
                onChange={(e) => setNovoCupom({ ...novoCupom, descricao: e.target.value })}
                placeholder="Ex: Cupom para parceiros de marketing"
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button 
              type="submit"
              style={{
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '15px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✅ Criar Cupom
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        {/* Lista de Cupons */}
        <div>
          <h2 style={{ marginBottom: '15px' }}>📋 Lista de Cupons ({cupons.length})</h2>
          
          {carregando ? (
            <div className="admin-loading">Carregando cupons...</div>
          ) : cupons.length === 0 ? (
            <p style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '8px', 
              textAlign: 'center',
              color: '#666'
            }}>
              Nenhum cupom cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cupons.map(cupom => (
                <div
                  key={cupom.id}
                  onClick={() => handleSelecionarCupom(cupom)}
                  style={{
                    backgroundColor: cupomSelecionado?.id === cupom.id ? '#e8f5e9' : 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: cupomSelecionado?.id === cupom.id ? '2px solid #27ae60' : '1px solid #ddd',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#5d34a4' }}>
                        🎟️ {cupom.codigo}
                      </h3>
                      {cupom.descricao && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          {cupom.descricao}
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                        Criado em: {formatarData(cupom.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExcluirCupom(cupom.id, cupom.codigo);
                      }}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produtores do Cupom Selecionado */}
        <div>
          {cupomSelecionado ? (
            <>
              <h2 style={{ marginBottom: '15px' }}>
                👥 Produtores que usaram: <span style={{ color: '#5d34a4' }}>{cupomSelecionado.codigo}</span>
              </h2>
              
              {carregandoProdutores ? (
                <div className="admin-loading">Carregando produtores...</div>
              ) : produtoresDoCupom.length === 0 ? (
                <p style={{ 
                  backgroundColor: 'white', 
                  padding: '30px', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  Nenhum produtor ainda usou este cupom.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {produtoresDoCupom.map(produtor => (
                    <div
                      key={produtor.id}
                      style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    >
                      <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>
                        {produtor.nome_completo || 'Nome não informado'}
                      </h3>
                      
                      {produtor.nome_empresa && (
                        <p style={{ margin: '0 0 8px 0' }}>
                          <strong>🏢 Empresa:</strong> {produtor.nome_empresa}
                        </p>
                      )}
                      
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>📧 Email:</strong> {produtor.email || 'Não informado'}
                      </p>
                      
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>🆔 ID:</strong> {produtor.id}
                      </p>
                      
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>📅 Cadastrado em:</strong> {formatarData(produtor.created_at)}
                      </p>
                      
                      {produtor.chave_pix && (
                        <div style={{ 
                          backgroundColor: '#e8f5e9', 
                          padding: '10px', 
                          borderRadius: '5px',
                          marginTop: '10px'
                        }}>
                          <p style={{ margin: '0 0 5px 0' }}>
                            <strong>💳 PIX:</strong> {produtor.chave_pix}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Tipo:</strong> {produtor.tipo_chave_pix?.toUpperCase() || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '50px', 
              borderRadius: '8px', 
              textAlign: 'center',
              color: '#999'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 20px 0' }}>👈</p>
              <p style={{ fontSize: '18px', margin: 0 }}>
                Selecione um cupom para ver os produtores
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
