'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import CategoriaSelector from '../../../../publicar-evento/components/CategoriaSelector';
import SetorManager from '../../../../publicar-evento/components/SetorManager';
import CupomManager from '../../../../publicar-evento/components/CupomManager';
import ProdutoManager from '../../../../publicar-evento/components/ProdutoManager';
import '../../../../publicar-evento/PublicarEvento.css';
import '../../admin.css';

function SelecionarTaxa({ onTaxaSelecionada, taxaInicial }) {
  const [taxaSelecionada, setTaxaSelecionada] = useState(taxaInicial);

  const handleTaxaChange = (novasTaxas) => {
    setTaxaSelecionada(novasTaxas);
    onTaxaSelecionada(novasTaxas);
  };

  const calcularRecebimento = (taxaComprador, taxaProdutor) => {
    const valorBase = 10000;
    const recebimento = valorBase + (valorBase * (taxaProdutor / 100));
    return recebimento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calcularRecebimentoAbsorcao = () => {
    const valorBase = 10000;
    const taxaAbsorcao = 8;
    const recebimento = valorBase - (valorBase * (taxaAbsorcao / 100));
    return recebimento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>💰 Plano de Taxas</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
        
        {/* PREMIUM */}
        <div 
          onClick={() => handleTaxaChange({ taxaComprador: 18.5, taxaProdutor: 6.5 })}
          style={{ 
            border: taxaSelecionada.taxaComprador === 18.5 ? '3px solid #FFD700' : '2px solid #ddd',
            borderRadius: '12px', 
            padding: '20px', 
            cursor: 'pointer',
            background: taxaSelecionada.taxaComprador === 18.5 ? '#fff9e6' : 'white',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="radio" 
              checked={taxaSelecionada.taxaComprador === 18.5} 
              onChange={() => {}}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <h4 style={{ margin: 0, color: '#FF8C00' }}>💎 Premium</h4>
          </div>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Taxa Cliente: <strong>18,5%</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Bônus: <strong>+6,5%</strong></p>
          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Recebe: {calcularRecebimento(18.5, 6.5)}
          </p>
        </div>

        {/* PADRÃO */}
        <div 
          onClick={() => handleTaxaChange({ taxaComprador: 15, taxaProdutor: 5 })}
          style={{ 
            border: taxaSelecionada.taxaComprador === 15 ? '3px solid #4CAF50' : '2px solid #ddd',
            borderRadius: '12px', 
            padding: '20px', 
            cursor: 'pointer',
            background: taxaSelecionada.taxaComprador === 15 ? '#e8f5e9' : 'white',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="radio" 
              checked={taxaSelecionada.taxaComprador === 15} 
              onChange={() => {}}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <h4 style={{ margin: 0, color: '#4CAF50' }}>✅ Padrão</h4>
          </div>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Taxa Cliente: <strong>15%</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Bônus: <strong>+5%</strong></p>
          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Recebe: {calcularRecebimento(15, 5)}
          </p>
        </div>

        {/* ECONÔMICO */}
        <div 
          onClick={() => handleTaxaChange({ taxaComprador: 10, taxaProdutor: 3 })}
          style={{ 
            border: taxaSelecionada.taxaComprador === 10 ? '3px solid #2196F3' : '2px solid #ddd',
            borderRadius: '12px', 
            padding: '20px', 
            cursor: 'pointer',
            background: taxaSelecionada.taxaComprador === 10 ? '#e3f2fd' : 'white',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="radio" 
              checked={taxaSelecionada.taxaComprador === 10} 
              onChange={() => {}}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <h4 style={{ margin: 0, color: '#2196F3' }}>💙 Econômico</h4>
          </div>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Taxa Cliente: <strong>10%</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Bônus: <strong>+3%</strong></p>
          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Recebe: {calcularRecebimento(10, 3)}
          </p>
        </div>

        {/* COMPETITIVO */}
        <div 
          onClick={() => handleTaxaChange({ taxaComprador: 8, taxaProdutor: 0 })}
          style={{ 
            border: taxaSelecionada.taxaComprador === 8 ? '3px solid #FF5722' : '2px solid #ddd',
            borderRadius: '12px', 
            padding: '20px', 
            cursor: 'pointer',
            background: taxaSelecionada.taxaComprador === 8 ? '#ffebee' : 'white',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="radio" 
              checked={taxaSelecionada.taxaComprador === 8} 
              onChange={() => {}}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <h4 style={{ margin: 0, color: '#FF5722' }}>🚀 Competitivo</h4>
          </div>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Taxa Cliente: <strong>8%</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Bônus: <strong>0%</strong></p>
          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Recebe: R$ 10.000,00
          </p>
        </div>

        {/* ABSORÇÃO */}
        <div 
          onClick={() => handleTaxaChange({ taxaComprador: 0, taxaProdutor: -8 })}
          style={{ 
            border: taxaSelecionada.taxaComprador === 0 ? '3px solid #9C27B0' : '2px solid #ddd',
            borderRadius: '12px', 
            padding: '20px', 
            cursor: 'pointer',
            background: taxaSelecionada.taxaComprador === 0 ? '#f3e5f5' : 'white',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="radio" 
              checked={taxaSelecionada.taxaComprador === 0} 
              onChange={() => {}}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <h4 style={{ margin: 0, color: '#9C27B0' }}>💜 Absorção</h4>
          </div>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Taxa Cliente: <strong>0%</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>Desconto: <strong>-8%</strong></p>
          <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0 0' }}>
            Recebe: {calcularRecebimentoAbsorcao()}
          </p>
        </div>

      </div>
    </div>
  );
}

export default function EditarEventoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [evento, setEvento] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '',
    localEndereco: '',
    cidade: '',
    status: 'pendente'
  });
  
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [aparecerComoProdutor, setAparecerComoProdutor] = useState(true);
  const [taxa, setTaxa] = useState({ taxaComprador: 15, taxaProdutor: 5 });
  
  const [imagemAtual, setImagemAtual] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [setoresIngressos, setSetoresIngressos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (eventoId) {
      carregarEvento();
    }
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      console.log('📥 Carregando evento ID:', eventoId);
      
      if (!eventoId || eventoId === '[id]' || eventoId.includes('[')) {
        throw new Error('ID de evento inválido');
      }
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Evento não encontrado');
      }

      console.log('✅ Evento carregado:', data);
      setEvento(data);
      
      setFormData({
        titulo: data.nome || '',
        descricao: data.descricao || '',
        data: data.data || '',
        hora: data.hora || '',
        localNome: data.local || '',
        localEndereco: data.endereco || '',
        cidade: data.cidade || '',
        status: data.status || 'pendente'
      });
      
      setCategorias(data.categoria ? [data.categoria] : []);
      setTemLugarMarcado(data.tem_lugar_marcado || false);
      setAparecerComoProdutor(data.mostrar_produtor !== false);
      setTaxa({
        taxaComprador: data.TaxaCliente || 15,
        taxaProdutor: data.TaxaProdutor || 5
      });
      setImagemAtual(data.imagem_url || '');

      // CARREGAR SESSÕES
      const { data: sessoesData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('numero', { ascending: true });

      // CARREGAR INGRESSOS
      const { data: ingressosData } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId)
        .order('setor', { ascending: true });

      // CARREGAR LOTES
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);

      // PROCESSAR SETORES E INGRESSOS
      const setoresMap = new Map();

      ingressosData?.forEach(ing => {
        if (!setoresMap.has(ing.setor)) {
          setoresMap.set(ing.setor, {
            id: `setor-${ing.setor}`,
            nome: ing.setor,
            usaLotes: false,
            lotes: [],
            tiposIngresso: []
          });
        }
      });

      if (lotesData && lotesData.length > 0) {
        lotesData.forEach(lote => {
          const setor = setoresMap.get(lote.setor);
          if (setor) {
            setor.usaLotes = true;
            
            const loteObj = {
              id: lote.id,
              nome: lote.nome,
              dataInicio: lote.data_inicio,
              dataFim: lote.data_fim,
              tiposIngresso: []
            };

            ingressosData?.forEach(ing => {
              if (ing.lote_id === lote.id && ing.setor === lote.setor) {
                loteObj.tiposIngresso.push({
                  id: ing.id,
                  nome: ing.tipo,
                  preco: ing.valor,
                  quantidade: ing.quantidade
                });
              }
            });

            setor.lotes.push(loteObj);
          }
        });
      }

      ingressosData?.forEach(ing => {
        if (ing.lote_id === null) {
          const setor = setoresMap.get(ing.setor);
          if (setor) {
            setor.tiposIngresso.push({
              id: ing.id,
              nome: ing.tipo,
              preco: ing.valor,
              quantidade: ing.quantidade
            });
          }
        }
      });

      setSetoresIngressos(Array.from(setoresMap.values()));

      // CARREGAR CUPONS
      const { data: cuponsData } = await supabase
        .from('cupons')
        .select('*, cupons_ingressos(*), cupons_produtos(*)')
        .eq('evento_id', eventoId);

      if (cuponsData) {
        const cuponsProcessados = cuponsData.map(cupom => {
          const precosPorIngresso = {};
          cupom.cupons_ingressos.forEach(ci => {
            precosPorIngresso[`ingresso-${ci.ingresso_id}`] = ci.preco_com_cupom;
          });

          return {
            id: cupom.id,
            codigo: cupom.codigo,
            descricao: cupom.descricao,
            quantidadeTotal: cupom.quantidade_total,
            dataInicio: cupom.data_validade_inicio,
            dataFim: cupom.data_validade_fim,
            precosPorIngresso
          };
        });
        setCupons(cuponsProcessados);
      }

      // CARREGAR PRODUTOS
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .eq('evento_id', eventoId);

      if (produtosData) {
        const produtosProcessados = produtosData.map(prod => ({
          id: prod.id,
          nome: prod.nome,
          descricao: prod.descricao,
          preco: prod.preco,
          quantidade: prod.quantidade_disponivel,
          tamanho: prod.tamanho,
          tipoProduto: prod.tipo_produto,
          imagemUrl: prod.imagem_url,
          aceitaCupons: false,
          precosPorCupom: {}
        }));
        setProdutos(produtosProcessados);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar evento:', error);
      alert('Erro ao carregar evento: ' + error.message);
      router.push('/admin/bokunohero');
    } finally {
      setCarregando(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Por favor, selecione apenas imagens nos formatos JPG, PNG ou GIF.');
        return;
      }
      
      setNovaImagem(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => fileInputRef.current.click();
  
  const removerNovaImagem = () => {
    setNovaImagem(null);
    setImagemPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (salvando) return;

    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    
    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      return;
    }

    setSalvando(true);
    let publicUrl = imagemAtual;
    let uploadedFilePath = null;

    try {
      // UPLOAD DE NOVA IMAGEM (SE HOUVER)
      if (novaImagem) {
        console.log('📤 Fazendo upload da nova imagem...');
        
        const fileExtension = novaImagem.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${evento.user_id}/${timestamp}-${randomStr}.${fileExtension}`;
        uploadedFilePath = filePath;

        const { error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, novaImagem, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        
        publicUrl = publicUrlData.publicUrl;
        console.log('✅ Nova imagem uploaded:', publicUrl);
        
        // Remove a imagem antiga se houver
        if (imagemAtual && imagemAtual.includes('imagens_eventos')) {
          const oldPath = imagemAtual.split('/imagens_eventos/')[1];
          if (oldPath) {
            await supabase.storage.from('imagens_eventos').remove([oldPath]);
            console.log('🗑️ Imagem antiga removida');
          }
        }
      }

      // ATUALIZAR EVENTO
      const eventData = {
        nome: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        hora: formData.hora,
        local: formData.localNome,
        endereco: formData.localEndereco || null,
        cidade: formData.cidade || null,
        categoria: categorias[0],
        tem_lugar_marcado: temLugarMarcado,
        mostrar_produtor: aparecerComoProdutor,
        TaxaCliente: taxa.taxaComprador,
        TaxaProdutor: taxa.taxaProdutor,
        imagem_url: publicUrl,
        status: formData.status
      };

      console.log('💾 Atualizando evento...', eventData);
      
      const { error: updateError } = await supabase
        .from('eventos')
        .update(eventData)
        .eq('id', eventoId);

      if (updateError) {
        console.error('❌ Erro na atualização:', updateError);
        
        if (uploadedFilePath) {
          await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        
        throw new Error(`Erro ao atualizar evento: ${updateError.message}`);
      }
      
      console.log('✅ Evento atualizado com sucesso!');
      alert('✅ Evento atualizado com sucesso!');
      router.push('/admin/bokunohero');

    } catch (error) {
      console.error('💥 Erro ao salvar:', error);
      alert(`❌ Erro ao atualizar evento: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = () => {
    if (confirm('Deseja realmente cancelar? As alterações não salvas serão perdidas.')) {
      router.push('/admin/bokunohero');
    }
  };

  if (carregando) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Carregando evento...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Evento não encontrado</h2>
        <button onClick={() => router.push('/admin/bokunohero')} className="btn-submit">
          Voltar ao Admin
        </button>
      </div>
    );
  }

  return (
    <div className="publicar-evento-container">
      <div className="edit-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h1>✏️ Editar Evento - Admin</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          ID: {eventoId} | Produtor: {evento.user_id}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* STATUS DO EVENTO */}
        <div className="form-section">
          <h2>Status do Evento</h2>
          <div className="form-group">
            <label>Status Atual:</label>
            <select 
              name="status" 
              value={formData.status}
              onChange={handleFormChange}
              style={{ 
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #ddd'
              }}
            >
              <option value="pendente">⏳ Pendente</option>
              <option value="aprovado">✅ Aprovado</option>
              <option value="rejeitado">❌ Rejeitado</option>
            </select>
          </div>
        </div>

        {/* INFORMAÇÕES BÁSICAS */}
        <div className="form-section">
          <h2>Informações Básicas</h2>
          
          <div className="form-group">
            <label>Título do Evento *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleFormChange}
              placeholder="Ex: Show da Banda X"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição do Evento *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleFormChange}
              placeholder="Descreva o evento..."
              rows="5"
              required
            />
          </div>

          {/* IMAGEM */}
          <div className="form-group">
            <label>Imagem do Evento</label>
            
            {imagemAtual && !imagemPreview && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Imagem Atual:</p>
                <img 
                  src={imagemAtual} 
                  alt="Imagem atual" 
                  style={{ 
                    maxWidth: '300px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }} 
                />
              </div>
            )}

            {imagemPreview && (
              <div className="image-preview-container" style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold', color: '#4caf50' }}>✨ Nova Imagem:</p>
                <img src={imagemPreview} alt="Preview" className="image-preview" />
                <button type="button" onClick={removerNovaImagem} className="btn-remove-image">
                  Cancelar Nova Imagem
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              onClick={handleClickUpload}
              className="btn-submit"
              style={{ background: '#2196F3', marginTop: '10px' }}
            >
              📷 {imagemPreview ? 'Escolher Outra Imagem' : 'Alterar Imagem'}
            </button>
            <small style={{ display: 'block', marginTop: '5px' }}>
              Deixe em branco para manter a imagem atual
            </small>
          </div>

          <CategoriaSelector 
            onCategoriasChange={setCategorias}
            categoriasIniciais={categorias}
          />

          <div className="form-group">
            <label>Nome do Local *</label>
            <input
              type="text"
              name="localNome"
              value={formData.localNome}
              onChange={handleFormChange}
              placeholder="Ex: Teatro Maria Della Costa"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cidade *</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleFormChange}
                placeholder="Ex: São Paulo"
                required
              />
            </div>

            <div className="form-group">
              <label>Endereço do Local</label>
              <input
                type="text"
                name="localEndereco"
                value={formData.localEndereco}
                onChange={handleFormChange}
                placeholder="Ex: Rua Exemplo, 123"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data do Evento *</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Horário *</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÕES */}
        <div className="form-section">
          <h2>Configurações</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={temLugarMarcado}
                onChange={(e) => setTemLugarMarcado(e.target.checked)}
              />
              Evento com lugar marcado
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label ">
<input
type="checkbox"
checked={aparecerComoProdutor}
onChange={(e) => setAparecerComoProdutor(e.target.checked)}
/>
Aparecer como produtor
</label>
</div>
<SelecionarTaxa 
        onTaxaSelecionada={setTaxa}
        taxaInicial={taxa}
      />
    </div>

    {/* SETORES E INGRESSOS */}
    <div className="form-section">
      <h2>Setores e Ingressos</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
        ⚠️ Alterações nos ingressos devem ser feitas com cuidado pois podem afetar vendas já realizadas
      </p>
      <SetorManager 
        onSetoresChange={setSetoresIngressos}
        setoresIniciais={setoresIngressos}
      />
    </div>

    {/* CUPONS */}
    {setoresIngressos.length > 0 && (
      <div className="form-section">
        <h2>Cupons de Desconto</h2>
        <CupomManager 
          setoresIngressos={setoresIngressos}
          onCuponsChange={setCupons}
          cuponsIniciais={cupons}
        />
      </div>
    )}

    {/* PRODUTOS */}
    <div className="form-section">
      <h2>Produtos Adicionais</h2>
      <ProdutoManager 
        onProdutosChange={setProdutos}
        cupons={cupons}
        produtosIniciais={produtos}
      />
    </div>

    {/* BOTÕES */}
    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
      <button 
        type="submit" 
        className="btn-submit"
        disabled={salvando}
        style={{ flex: 1 }}
      >
        {salvando ? '💾 Salvando...' : '💾 Salvar Alterações'}
      </button>
      
      <button 
        type="button"
        onClick={cancelar}
        className="btn-submit"
        disabled={salvando}
        style={{ flex: 1, background: '#666' }}
      >
        ❌ Cancelar
      </button>
    </div>
  </form>
</div>
);
}
