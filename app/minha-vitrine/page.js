// ==========================================
// ARQUIVO 1: app/minha-vitrine/organizar/page.js
// ==========================================
// Este é o PAINEL DE ADMINISTRAÇÃO onde você 
// organiza categorias e eventos
// ==========================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';

export default function OrganizarEventosPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [categorias, setCategorias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', icone: '📁', cor: '#5d34a4' });
  const [categoriaExpandida, setCategoriaExpandida] = useState({});

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      await carregarDados(session.user.id);
    } catch (error) {
      console.error('Erro:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const carregarDados = async (userId) => {
    try {
      // Buscar categorias
      const { data: categoriasData } = await supabase
        .from('categorias_vitrine')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      setCategorias(categoriasData || []);

      // Buscar eventos aprovados do usuário
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('id, nome, data, hora, local, status')
        .eq('user_id', userId)
        .eq('status', 'aprovado')
        .order('data', { ascending: true });

      // Buscar configuração dos eventos na vitrine
      const { data: eventosVitrineData } = await supabase
        .from('eventos_vitrine')
        .select('*')
        .eq('user_id', userId);

      // Combinar dados
      const eventosMap = new Map(eventosVitrineData?.map(ev => [ev.evento_id, ev]) || []);
      
      const eventosCombinados = (eventosData || []).map(evento => {
        const config = eventosMap.get(evento.id);
        return {
          ...evento,
          categoria_id: config?.categoria_id || null,
          ordem: config?.ordem || 0,
          destaque: config?.destaque || false,
          visivel: config?.visivel_vitrine !== false,
          config_id: config?.id
        };
      });

      setEventos(eventosCombinados);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    }
  };

  const eventosPorCategoria = () => {
    const grouped = {};
    
    categorias.forEach(cat => {
      grouped[cat.id] = eventos
        .filter(e => e.categoria_id === cat.id && e.visivel)
        .sort((a, b) => a.ordem - b.ordem);
    });
    
    grouped['sem-categoria'] = eventos
      .filter(e => !e.categoria_id && e.visivel)
      .sort((a, b) => a.ordem - b.ordem);
    
    return grouped;
  };

  const adicionarCategoria = async () => {
    if (!novaCategoria.nome.trim()) {
      alert('Digite um nome para a categoria');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('categorias_vitrine')
        .insert([{
          user_id: user.id,
          nome: novaCategoria.nome,
          icone: novaCategoria.icone,
          cor: novaCategoria.cor,
          ordem: categorias.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCategorias([...categorias, data]);
      setNovaCategoria({ nome: '', icone: '📁', cor: '#5d34a4' });
      alert('✅ Categoria criada!');
      
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar categoria');
    }
  };

  const removerCategoria = async (id) => {
    if (!confirm('Remover esta categoria? Os eventos não serão deletados.')) return;
    
    try {
      const { error } = await supabase
        .from('categorias_vitrine')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategorias(categorias.filter(c => c.id !== id));
      setEventos(eventos.map(e => 
        e.categoria_id === id ? { ...e, categoria_id: null } : e
      ));
      
      alert('✅ Categoria removida!');
      
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao remover categoria');
    }
  };

  const moverCategoria = async (id, direcao) => {
    const index = categorias.findIndex(c => c.id === id);
    if ((direcao === 'cima' && index === 0) || (direcao === 'baixo' && index === categorias.length - 1)) return;
    
    const novasCategorias = [...categorias];
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;
    [novasCategorias[index], novasCategorias[novoIndex]] = [novasCategorias[novoIndex], novasCategorias[index]];
    
    setCategorias(novasCategorias.map((c, i) => ({ ...c, ordem: i })));
  };

  const moverEvento = (eventoId, direcao, categoriaId) => {
    const eventosCategoria = eventos
      .filter(e => e.categoria_id === categoriaId && e.visivel)
      .sort((a, b) => a.ordem - b.ordem);
    
    const index = eventosCategoria.findIndex(e => e.id === eventoId);
    if ((direcao === 'cima' && index === 0) || (direcao === 'baixo' && index === eventosCategoria.length - 1)) return;
    
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;
    const eventoAtual = eventosCategoria[index];
    const eventoTroca = eventosCategoria[novoIndex];
    
    setEventos(eventos.map(e => {
      if (e.id === eventoAtual.id) return { ...e, ordem: novoIndex };
      if (e.id === eventoTroca.id) return { ...e, ordem: index };
      return e;
    }));
  };

  const toggleVisibilidade = (id) => {
    setEventos(eventos.map(e => 
      e.id === id ? { ...e, visivel: !e.visivel } : e
    ));
  };

  const toggleDestaque = (id) => {
    setEventos(eventos.map(e => 
      e.id === id ? { ...e, destaque: !e.destaque } : e
    ));
  };

  const moverParaCategoria = (eventoId, novaCategoriaId) => {
    const novaCategoria = novaCategoriaId === 'sem-categoria' ? null : novaCategoriaId;
    setEventos(eventos.map(e => 
      e.id === eventoId ? { ...e, categoria_id: novaCategoria } : e
    ));
  };

  const salvarTudo = async () => {
    setSalvando(true);
    
    try {
      // Salvar ordem das categorias
      for (const cat of categorias) {
        await supabase
          .from('categorias_vitrine')
          .update({ ordem: cat.ordem })
          .eq('id', cat.id);
      }

      // Salvar/atualizar eventos_vitrine
      for (const evento of eventos) {
        const dados = {
          user_id: user.id,
          evento_id: evento.id,
          categoria_id: evento.categoria_id,
          ordem: evento.ordem,
          destaque: evento.destaque,
          visivel_vitrine: evento.visivel
        };

        if (evento.config_id) {
          // Atualizar existente
          await supabase
            .from('eventos_vitrine')
            .update(dados)
            .eq('id', evento.config_id);
        } else {
          // Inserir novo
          await supabase
            .from('eventos_vitrine')
            .insert([dados]);
        }
      }

      alert('✅ Configurações salvas com sucesso!');
      await carregarDados(user.id);
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  const grouped = eventosPorCategoria();

  return (
    <div style={{ fontFamily: 'system-ui', padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '10px' }}>🎭 Organizar Eventos da Vitrine</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Use as setas para reordenar. Organize como quiser!
        </p>

        {/* CRIAR CATEGORIA */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>➕ Nova Categoria</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nome da categoria"
              value={novaCategoria.nome}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
              style={{ flex: '1', minWidth: '200px', padding: '12px', borderRadius: '8px', border: 'none' }}
            />
            <input
              type="text"
              placeholder="🎵"
              value={novaCategoria.icone}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, icone: e.target.value })}
              maxLength="2"
              style={{ width: '70px', padding: '12px', borderRadius: '8px', border: 'none', textAlign: 'center' }}
            />
            <input
              type="color"
              value={novaCategoria.cor}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
              style={{ width: '60px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            />
            <button
              onClick={adicionarCategoria}
              style={{ padding: '12px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* CATEGORIAS */}
        <div style={{ marginBottom: '30px' }}>
          <h2>📋 Categorias</h2>
          {categorias.map((cat, index) => (
            <div key={cat.id} style={{ background: 'white', padding: '18px', borderRadius: '10px', marginBottom: '12px', border: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => moverCategoria(cat.id, 'cima')} disabled={index === 0} style={{ background: index === 0 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '4px 8px' }}>▲</button>
                <button onClick={() => moverCategoria(cat.id, 'baixo')} disabled={index === categorias.length - 1} style={{ background: index === categorias.length - 1 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: index === categorias.length - 1 ? 'not-allowed' : 'pointer', padding: '4px 8px' }}>▼</button>
              </div>
              <span style={{ fontSize: '32px' }}>{cat.icone}</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '18px' }}>{cat.nome}</strong>
                <span style={{ marginLeft: '12px', color: '#999' }}>({grouped[cat.id]?.length || 0} eventos)</span>
              </div>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: cat.cor }} />
              <button onClick={() => removerCategoria(cat.id)} style={{ padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>

        {/* EVENTOS */}
        <div>
          <h2>🎯 Eventos</h2>
          
          {categorias.map(cat => (
            <div key={cat.id} style={{ marginBottom: '20px' }}>
              <div onClick={() => setCategoriaExpandida({ ...categoriaExpandida, [cat.id]: !categoriaExpandida[cat.id] })} style={{ background: cat.cor, color: 'white', padding: '18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{cat.icone}</span>
                <strong style={{ flex: 1, fontSize: '20px' }}>{cat.nome}</strong>
                <span>({grouped[cat.id]?.length || 0})</span>
                <span>{categoriaExpandida[cat.id] ? '▼' : '▶'}</span>
              </div>
              
              {categoriaExpandida[cat.id] && (
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginLeft: '20px', marginTop: '10px' }}>
                  {grouped[cat.id]?.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center' }}>📭 Sem eventos</p>
                  ) : (
                    grouped[cat.id]?.map((evento, index) => (
                      <div key={evento.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: evento.destaque ? '3px solid #f39c12' : '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button onClick={() => moverEvento(evento.id, 'cima', cat.id)} disabled={index === 0} style={{ background: index === 0 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px' }}>▲</button>
                          <button onClick={() => moverEvento(evento.id, 'baixo', cat.id)} disabled={index === grouped[cat.id].length - 1} style={{ background: index === grouped[cat.id].length - 1 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px' }}>▼</button>
                        </div>
                        {evento.destaque && <span>⭐</span>}
                        <div style={{ flex: 1 }}>
                          <strong>{evento.nome}</strong>
                          <div style={{ fontSize: '13px', color: '#666' }}>📅 {new Date(evento.data).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <select value={evento.categoria_id || 'sem-categoria'} onChange={(e) => moverParaCategoria(evento.id, e.target.value)} style={{ padding: '6px', borderRadius: '5px', border: '1px solid #ddd' }}>
                          <option value="sem-categoria">Sem categoria</option>
                          {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
                        </select>
                        <button onClick={() => toggleDestaque(evento.id)} style={{ padding: '6px 12px', background: evento.destaque ? '#f39c12' : '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{evento.destaque ? '⭐' : '☆'}</button>
                        <button onClick={() => toggleVisibilidade(evento.id)} style={{ padding: '6px 12px', background: evento.visivel ? '#27ae60' : '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{evento.visivel ? '👁️' : '🚫'}</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SALVAR */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={salvarTudo} disabled={salvando} style={{ padding: '18px 50px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            {salvando ? '⏳ Salvando...' : '💾 Salvar Tudo'}
          </button>
        </div>
      </div>
    </div>
  );
}
