'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';

export default function AnalyticsPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hoje: 0,
    ontem: 0,
    semana: 0,
    mes: 0,
    total: 0
  });
  const [historico, setHistorico] = useState([]);

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
      await carregarAnalytics(session.user.id);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAnalytics = async (userId) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const umaSemanaAtras = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const umMesAtras = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      // Buscar dados
      const { data: analyticsData } = await supabase
        .from('analytics_vitrine')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(90);

      if (analyticsData) {
        const hojeDados = analyticsData.find(a => a.data === hoje);
        const ontemDados = analyticsData.find(a => a.data === ontem);
        const semanaDados = analyticsData.filter(a => a.data >= umaSemanaAtras);
        const mesDados = analyticsData.filter(a => a.data >= umMesAtras);

        setStats({
          hoje: hojeDados?.visualizacoes || 0,
          ontem: ontemDados?.visualizacoes || 0,
          semana: semanaDados.reduce((acc, curr) => acc + curr.visualizacoes, 0),
          mes: mesDados.reduce((acc, curr) => acc + curr.visualizacoes, 0),
          total: analyticsData.reduce((acc, curr) => acc + curr.visualizacoes, 0)
        });

        setHistorico(analyticsData.slice(0, 30));
      }

      // Buscar visualizações totais antigas (da coluna visualizacoes do perfil)
      const { data: perfilData } = await supabase
        .from('perfil_produtor')
        .select('visualizacoes')
        .eq('user_id', userId)
        .single();

      if (perfilData?.visualizacoes) {
        setStats(prev => ({ ...prev, total: prev.total + perfilData.visualizacoes }));
      }

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'system-ui' }}><h2>Carregando...</h2></div>;

  return (
    <div style={{ fontFamily: 'system-ui', padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div><h1 style={{ margin: 0 }}>📊 Analytics da Vitrine</h1><p style={{ color: '#666', margin: 0 }}>Acompanhe suas visualizações</p></div>
          <Link href="/minha-vitrine" style={{ padding: '12px 24px', background: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>← Voltar</Link>
        </div>

        {/* Cards de Estatísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Hoje</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.hoje}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>👁️ visualizações</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Ontem</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.ontem}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>👁️ visualizações</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9', marginBottom: '10px' }}>Últimos 7 dias</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.semana}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>👁️ visualizações</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Últimos 30 dias</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.mes}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>👁️ visualizações</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Total Geral</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.total.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>👁️ visualizações</div>
          </div>
        </div>

        {/* Histórico */}
        <h2 style={{ marginBottom: '20px' }}>📅 Histórico (Últimos 30 dias)</h2>
        {historico.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '10px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>📊</p>
            <p style={{ color: '#666', margin: 0 }}>Nenhuma visualização registrada ainda</p>
          </div>
        ) : (
          <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              {historico.map(item => (
                <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{item.visualizacoes}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>visualizações</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
