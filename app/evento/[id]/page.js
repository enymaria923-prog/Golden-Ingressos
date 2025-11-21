import { createClient } from '../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';


export default async function EventoPage({ params }) {
  const supabase = createClient();
  const { id } = await params;

  // Verifica usuário logado
  const { data: { user } } = await supabase.auth.getUser();

  // Buscar dados do evento
  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !evento) {
    notFound();
  }

  // Verifica se está nos favoritos
  let isFavorito = false;
  if (user) {
    const { data: favoritoData } = await supabase
      .from('favoritos')
      .select('id')
      .eq('user_id', user.id)
      .eq('evento_id', id)
      .single();
    
    isFavorito = !!favoritoData;
  }

  // Buscar lotes, ingressos, produtos e cupons (mantém código original)
  const { data: lotes } = await supabase
    .from('lotes')
    .select('*')
    .eq('evento_id', id)
    .eq('ativo', true)
    .order('id', { ascending: true });

  const { data: ingressos } = await supabase
    .from('ingressos')
    .select('*')
    .eq('evento_id', id)
    .eq('status_ingresso', 'disponivel')
    .order('setor', { ascending: true });

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('evento_id', id)
    .eq('ativo', true)
    .order('id', { ascending: true });

  const { data: cupons } = await supabase
    .from('cupons')
    .select('*')
    .eq('evento_id', id)
    .eq('ativo', true);

  const temCupons = cupons && cupons.length > 0;

  // Organizar dados por setores (mantém lógica original)
  const setoresOrganizados = {};
  
  if (ingressos && ingressos.length > 0) {
    ingressos.forEach(ingresso => {
      const setorNome = ingresso.setor || 'Sem Setor';
      
      if (!setoresOrganizados[setorNome]) {
        setoresOrganizados[setorNome] = {
          lotes: {}
        };
      }

      if (ingresso.lote_id) {
        const loteInfo = lotes?.find(l => l.id === ingresso.lote_id);
        const loteNome = loteInfo?.nome || `Lote ${ingresso.lote_id}`;
        
        if (!setoresOrganizados[setorNome].lotes[loteNome]) {
          setoresOrganizados[setorNome].lotes[loteNome] = {
            info: loteInfo,
            ingressos: []
          };
        }
        setoresOrganizados[setorNome].lotes[loteNome].ingressos.push(ingresso);
      } else {
        if (!setoresOrganizados[setorNome].lotes['direto']) {
          setoresOrganizados[setorNome].lotes['direto'] = {
            info: null,
            ingressos: []
          };
        }
        setoresOrganizados[setorNome].lotes['direto'].ingressos.push(ingresso);
      }
    });
  }

  const precoMaisBaixo = ingressos && ingressos.length > 0
    ? Math.min(...ingressos.map(i => parseFloat(i.valor)))
    : 0;

  const taxaCliente = evento.TaxaCliente || evento.taxacliente || 15;

  const calcularValorComTaxa = (valor) => {
    const valorBase = parseFloat(valor);
    const valorTaxa = valorBase * (taxaCliente / 100);
    return (valorBase + valorTaxa).toFixed(2);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '15px 30px', marginBottom: '0' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
          &larr; Voltar para Home
        </Link>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginTop: '30px', textAlign: 'center', position: 'relative' }}>
          {/* Botão de favorito no topo da imagem */}
          {user && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
              <FavoritoButton eventoId={evento.id} isFavoritoInicial={isFavorito} />
            </div>
          )}
          
          <img 
            src={evento.imagem_url || 'https://placehold.co/1200x500/5d34a4/ffffff?text=EVENTO'} 
            alt={evento.nome}
            style={{ 
              width: '100%', 
              maxWidth: '1200px',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          />
        </div>

        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '42px', 
          color: '#2c3e50', 
          marginTop: '30px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          {evento.nome}
        </h1>

        <div style={{ 
          textAlign: 'center', 
          fontSize: '20px', 
          color: '#5d34a4',
          fontWeight: '600',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <span>📅 {new Date(evento.data + 'T' + evento.hora).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          <span>🕐 {evento.hora}</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '30px',
          marginBottom: '40px'
        }}>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '28px', marginBottom: '20px' }}>
              📋 Sobre o Evento
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
              {evento.descricao || 'Descrição não disponível.'}
            </p>

            <div style={{ marginTop: '25px' }}>
              <span style={{ 
                backgroundColor: '#e8f4f8', 
                color: '#2980b9', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                🎭 {evento.categoria}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#5d34a4', marginTop: 0, fontSize: '22px', marginBottom: '20px' }}>
              📍 Local
            </h3>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
              {evento.local || 'A definir'}
            </p>
            {evento.endereco && (
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                {evento.endereco}
              </p>
            )}

            <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
              <p style={{ margin: '10px 0', color: '#555' }}>
                {evento.tem_lugar_marcado ? '🪑 Evento com lugar marcado' : '🎫 Entrada livre (sem lugar marcado)'}
              </p>
              {evento.online && (
                <p style={{ margin: '10px 0', color: '#555' }}>💻 Evento Online</p>
              )}
            </div>

            {evento.produtor_nome && (
              <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
                <h4 style={{ color: '#5d34a4', fontSize: '16px', marginBottom: '10px' }}>
                  Sobre o produtor
                </h4>
                <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>
                  <strong>{evento.produtor_nome}</strong>
                </p>
                {evento.produtor_email && (
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '13px' }}>
                    📧 {evento.produtor_email}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {temCupons && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            marginBottom: '40px',
            border: '2px solid #ffc107'
          }}>
            <h3 style={{ color: '#856404', marginTop: 0, fontSize: '22px', marginBottom: '15px', textAlign: 'center' }}>
              🎟️ Tem um cupom de desconto?
            </h3>
            <p style={{ textAlign: 'center', color: '#856404', marginBottom: '20px', fontSize: '14px' }}>
              Digite seu código de cupom no momento da compra para ganhar desconto!
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <input
                type="text"
                placeholder="Digite o código do cupom"
                disabled
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '2px solid #ffc107',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  backgroundColor: 'white'
                }}
              />
              <button
                disabled
                style={{
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
              >
                Aplicar
              </button>
            </div>
            <p style={{ textAlign: 'center', color: '#856404', marginTop: '15px', fontSize: '12px' }}>
              * O cupom será aplicado durante o processo de checkout
            </p>
          </div>
        )}

        {/* RESTO DO CÓDIGO DE INGRESSOS E PRODUTOS PERMANECE IGUAL */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>
            🎫 Ingressos
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px', marginBottom: '30px' }}>
            A partir de <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>R$ {calcularValorComTaxa(precoMaisBaixo)}</span>
          </p>

          {Object.keys(setoresOrganizados).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p style={{ fontSize: '18px' }}>⚠️ Nenhum ingresso disponível no momento</p>
            </div>
          ) : (
            Object.entries(setoresOrganizados).map(([setorNome, setorData]) => (
              <div key={setorNome} style={{ 
                marginBottom: '35px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#5d34a4', 
                  color: 'white', 
                  padding: '15px 25px',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  🎪 {setorNome}
                </div>

                <div style={{ padding: '25px' }}>
                  {Object.entries(setorData.lotes).map(([loteNome, loteData]) => (
                    <div key={loteNome} style={{ marginBottom: '20px' }}>
                      
                      {loteNome !== 'direto' && (
                        <div style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '12px 20px', 
                          borderRadius: '8px',
                          marginBottom: '15px',
                          borderLeft: '4px solid #9b59b6'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: '#8e44ad', fontSize: '16px' }}>
                              📦 {loteNome}
                            </span>
                            {loteData.info?.data_inicio && loteData.info?.data_fim && (
                              <span style={{ fontSize: '13px', color: '#666' }}>
                                Válido: {new Date(loteData.info.data_inicio).toLocaleDateString('pt-BR')} até {new Date(loteData.info.data_fim).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {loteData.ingressos.map((ingresso) => {
                        const ingressosDisponiveis = ingresso.quantidade - ingresso.vendidos;
                        const valorBase = parseFloat(ingresso.valor);
                        const valorTaxa = valorBase * (taxaCliente / 100);
                        const valorTotal = valorBase + valorTaxa;

                        return (
                          <div key={ingresso.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '20px',
                            backgroundColor: '#fafafa',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: '18px', color: '#2c3e50', marginBottom: '5px' }}>
                                {ingresso.tipo}
                              </h4>
                              <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
                                {ingressosDisponiveis > 0 
                                  ? `${ingressosDisponiveis} disponíveis` 
                                  : '❌ Esgotado'}
                              </p>
                            </div>
                            
                            <div style={{ textAlign: 'right', marginRight: '20px' }}>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                R$ {valorBase.toFixed(2)} + R$ {valorTaxa.toFixed(2)} (taxa)
                              </div>
                              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#27ae60' }}>
                                R$ {valorTotal.toFixed(2)}
                              </div>
                            </div>

                            {ingressosDisponiveis > 0 ? (
                              <Link href={`/checkout?evento_id=${evento.id}&ingresso_id=${ingresso.id}`}>
                                <button style={{
                                  backgroundColor: '#f1c40f',
                                  color: '#000',
                                  border: 'none',
                                  padding: '12px 30px',
                                  borderRadius: '8px',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s'
                                }}>
                                  Comprar
                                </button>
                              </Link>
                            ) : (
                              <button disabled style={{
                                backgroundColor: '#ccc',
                                color: '#666',
                                border: 'none',
                                padding: '12px 30px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'not-allowed'
                              }}>
                                Esgotado
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#e8f8f5', 
            borderRadius: '8px',
            border: '1px solid #27ae60'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Entrada garantida</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
                <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Pagamento seguro</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Suporte 24h</div>
              </div>
            </div>
          </div>
        </div>

        {produtos && produtos.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
              🛍️ Produtos do Evento
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '25px' 
            }}>
              {produtos.map(produto => {
                const quantidadeDisponivel = produto.quantidade_disponivel - (produto.quantidade_vendida || 0);

                return (
                  <div key={produto.id} style={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {produto.imagem_url ? (
                        <img 
                          src={produto.imagem_url} 
                          alt={produto.nome}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '48px' }}>📦</span>
                      )}
                    </div>

                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#2c3e50' }}>
                        {produto.nome}
                      </h3>
                      
                      {produto.descricao && (
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                          {produto.descricao}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#27ae60' }}>
                          R$ {parseFloat(produto.preco).toFixed(2)}
                        </span>
                        {produto.tamanho && (
                          <span style={{ 
                            backgroundColor: '#e8f4f8', 
                            color: '#2980b9', 
                            padding: '4px 12px', 
                            borderRadius: '15px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            Tamanho: {produto.tamanho}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '13px', color: '#999', marginBottom: '15px' }}>
                        {quantidadeDisponivel > 0 
                          ? `${quantidadeDisponivel} disponíveis` 
                          : '❌ Esgotado'}
                      </p>

                      {quantidadeDisponivel > 0 ? (
                        <Link href={`/checkout?evento_id=${evento.id}&produto_id=${produto.id}`}>
                          <button style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            width: '100%',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}>
                            Adicionar ao Carrinho
                          </button>
                        </Link>
                      ) : (
                        <button disabled style={{
                          backgroundColor: '#ccc',
                          color: '#666',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '8px',
                          width: '100%',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          cursor: 'not-allowed'
                        }}>
                          Esgotado
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
