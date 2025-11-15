'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';

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
      const { data: categoriasData } = await supabase
        .from('categorias_vitrine')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      setCategorias(categoriasData || []);

      const { data: eventosData } = await supabase
        .from('eventos')
        .select('id, nome, data, hora, local, status')
        .eq('user_id', userId)
        .eq('status', 'aprovado')
        .order('data', { ascending: true });

      const { data: eventosVitrineData } = await supabase
        .from('eventos_vitrine')
        .select('*')
        .eq('user_id', userId);

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
    }
  };

  const eventosPorCategoria = () => {
    const grouped = {};
    categorias.forEach(cat => {
      grouped[cat.id] = eventos.filter(e => e.categoria_id === cat.id && e.visivel).sort((a, b) => a.ordem - b.ordem);
    });
    grouped['sem-categoria'] = eventos.filter(e => !e.categoria_id && e.visivel).sort((a, b) => a.ordem - b.ordem);
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
    if (!confirm('Remover esta categoria?')) return;
    
    try {
      await supabase.from('categorias_vitrine').delete().eq('id', id);
      setCategorias(categorias.filter(c => c.id !== id));
      setEventos(eventos.map(e => e.categoria_id === id ? { ...e, categoria_id: null } : e));
      alert('✅ Removida!');
    } catch (error) {
      alert('Erro ao remover');
    }
  };

  const moverCategoria = (id, direcao) => {
    const index = categorias.findIndex(c => c.id === id);
    if ((direcao === 'cima' && index === 0) || (direcao === 'baixo' && index === categorias.length - 1)) return;
    const novasCategorias = [...categorias];
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;
    [novasCategorias[index], novasCategorias[novoIndex]] = [novasCategorias[novoIndex], novasCategorias[index]];
    setCategorias(novasCategorias.map((c, i) => ({ ...c, ordem: i })));
  };

  const moverEvento = (eventoId, direcao, categoriaId) => {
    const eventosCategoria = eventos.filter(e => e.categoria_id === categoriaId && e.visivel).sort((a, b) => a.ordem - b.ordem);
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
    setEventos(eventos.map(e => e.id === id ? { ...e, visivel: !e.visivel } : e));
  };

  const toggleDestaque = (id) => {
    setEventos(eventos.map(e => e.id === id ? { ...e, destaque: !e.destaque } : e));
  };

  const moverParaCategoria = (eventoId, novaCategoriaId) => {
    const novaCategoria = novaCategoriaId === 'sem-categoria' ? null : novaCategoriaId;
    setEventos(eventos.map(e => e.id === eventoId ? { ...e, categoria_id: novaCategoria } : e));
  };

  const salvarTudo = async () => {
    setSalvando(true);
    try {
      for (const cat of categorias) {
        await supabase.from('categorias_vitrine').update({ ordem: cat.ordem }).eq('id', cat.id);
      }

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
          await supabase.from('eventos_vitrine').update(dados).eq('id', evento.config_id);
        } else {
          await supabase.from('eventos_vitrine').insert([dados]);
        }
      }

      alert('✅ Salvo!');
      await carregarDados(user.id);
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>Carregando...</h2></div>;

  const grouped = eventosPorCategoria();

  return (
    <div style={{ fontFamily: 'system-ui', padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ marginBottom: '5px' }}>🎭 Organizar Eventos</h1>
            <p style={{ color: '#666' }}>Organize categorias e eventos da sua vitrine</p>
          </div>
          <Link href="/minha-vitrine" style={{ padding: '10px 20px', background: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            ← Voltar
          </Link>
        </div>

        {/* NOVA CATEGORIA */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>➕ Nova Categoria</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nome" value={novaCategoria.nome} onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })} style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '8px', border: 'none' }} />
            <input type="text" placeholder="🎵" value={novaCategoria.icone} onChange={(e) => setNovaCategoria({ ...novaCategoria, icone: e.target.value })} maxLength="2" style={{ width: '70px', padding: '12px', borderRadius: '8px', border: 'none', textAlign: 'center' }} />
            <input type="color" value={novaCategoria.cor} onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })} style={{ width: '60px', borderRadius: '8px', border: 'none' }} />
            <button onClick={adicionarCategoria} style={{ padding: '12px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Adicionar</button>
          </div>
        </div>

        {/* CATEGORIAS */}
        <h2 style={{ marginBottom: '15px' }}>📋 Categorias ({categorias.length})</h2>
        {categorias.map((cat, index) => (
          <div key={cat.id} style={{ background: 'white', padding: '18px', borderRadius: '10px', marginBottom: '12px', border: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => moverCategoria(cat.id, 'cima')} disabled={index === 0} style={{ background: index === 0 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: index === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
              <button onClick={() => moverCategoria(cat.id, 'baixo')} disabled={index === categorias.length - 1} style={{ background: index === categorias.length - 1 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: index === categorias.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
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

        {/* EVENTOS */}
        <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>🎯 Eventos ({eventos.length})</h2>
        {categorias.map(cat => (
          <div key={cat.id} style={{ marginBottom: '20px' }}>
            <div onClick={() => setCategoriaExpandida({ ...categoriaExpandida, [cat.id]: !categoriaExpandida[cat.id] })} style={{ background: cat.cor, color: 'white', padding: '15px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{cat.icone}</span>
              <strong style={{ flex: 1 }}>{cat.nome}</strong>
              <span>({grouped[cat.id]?.length || 0})</span>
              <span>{categoriaExpandida[cat.id] ? '▼' : '▶'}</span>
            </div>
            {categoriaExpandida[cat.id] && (
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
                {grouped[cat.id]?.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center' }}>Sem eventos</p>
                ) : (
                  grouped[cat.id]?.map((ev, i) => (
                    <div key={ev.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '8px', border: ev.destaque ? '2px solid #f39c12' : '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button onClick={() => moverEvento(ev.id, 'cima', cat.id)} disabled={i === 0} style={{ background: i === 0 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 6px', fontSize: '10px', cursor: i === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                        <button onClick={() => moverEvento(ev.id, 'baixo', cat.id)} disabled={i === grouped[cat.id].length - 1} style={{ background: i === grouped[cat.id].length - 1 ? '#ddd' : '#3498db', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 6px', fontSize: '10px', cursor: i === grouped[cat.id].length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                      </div>
                      {ev.destaque && <span>⭐</span>}
                      <div style={{ flex: 1 }}>
                        <strong>{ev.nome}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>📅 {new Date(ev.data).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <select value={ev.categoria_id || 'sem-categoria'} onChange={(e) => moverParaCategoria(ev.id, e.target.value)} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '12px' }}>
                        <option value="sem-categoria">Sem categoria</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
                      </select>
                      <button onClick={() => toggleDestaque(ev.id)} style={{ padding: '5px 10px', background: ev.destaque ? '#f39c12' : '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>{ev.destaque ? '⭐' : '☆'}</button>
                      <button onClick={() => toggleVisibilidade(ev.id)} style={{ padding: '5px 10px', background: ev.visivel ? '#27ae60' : '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>{ev.visivel ? '👁️' : '🚫'}</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        {/* SALVAR */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={salvarTudo} disabled={salvando} style={{ padding: '18px 50px', background: salvando ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer' }}>
            {salvando ? '⏳ Salvando...' : '💾 Salvar Tudo'}
          </button>
        </div>
      </div>
    </div>
  );
}
