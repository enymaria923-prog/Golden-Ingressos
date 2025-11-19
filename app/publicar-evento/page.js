'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '', 
    localEndereco: '' 
  });
  
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [aparecerComoProdutor, setAparecerComoProdutor] = useState(true);
  const [setoresIngressos, setSetoresIngressos] = useState([]);
  
  const [imagem, setImagem] = useState(null); 
  const [imagemPreview, setImagemPreview] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('💥 Erro:', error);
      setLoading(false);
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
        e.target.value = null; 
        setImagem(null);
        setImagemPreview(null);
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Por favor, selecione apenas imagens nos formatos JPG, PNG ou GIF.');
        e.target.value = null; 
        setImagem(null);
        setImagemPreview(null);
        return;
      }
      setImagem(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => fileInputRef.current.click();
  
  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      alert('⚠️ Você precisa estar logado para publicar eventos!');
      router.push('/login');
      return;
    }

    // VALIDAÇÕES BÁSICAS
    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome || !imagem) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a imagem!');
      return;
    }
    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      return;
    }
    
    if (!setoresIngressos || setoresIngressos.length === 0) {
      alert('Por favor, adicione pelo menos um setor com ingressos!');
      return;
    }

    // VALIDAÇÃO - SÓ EXIGE NOME E PREÇO
    let temIngressoValido = false;

    for (const setor of setoresIngressos) {
      if (!setor.nome || setor.nome.trim() === '') {
        alert('Por favor, preencha o nome de todos os setores!');
        return;
      }

      if (setor.usaLotes) {
        if (!setor.lotes || setor.lotes.length === 0) {
          alert(`O setor "${setor.nome}" está configurado para usar lotes, mas não tem nenhum lote criado!`);
          return;
        }

        for (const lote of setor.lotes) {
          if (!lote.nome || lote.nome.trim() === '') {
            alert(`Preencha o nome do lote no setor "${setor.nome}"!`);
            return;
          }

          if (lote.dataInicio && lote.dataFim) {
            const inicio = new Date(lote.dataInicio);
            const fim = new Date(lote.dataFim);
            if (inicio >= fim) {
              alert(`No lote "${lote.nome}" do setor "${setor.nome}": a data de início deve ser anterior à data de fim!`);
              return;
            }
          }

          for (const tipo of lote.tiposIngresso) {
            if (tipo.nome || tipo.preco) {
              if (!tipo.nome || tipo.nome.trim() === '') {
                alert(`Preencha o nome do ingresso no lote "${lote.nome}" do setor "${setor.nome}"!`);
                return;
              }
              if (!tipo.preco || parseFloat(tipo.preco) <= 0) {
                alert(`Preencha um preço válido (maior que zero) no lote "${lote.nome}" do setor "${setor.nome}"!`);
                return;
              }
              temIngressoValido = true;
            }
          }
        }
      } else {
        for (const tipo of setor.tiposIngresso) {
          if (tipo.nome || tipo.preco) {
            if (!tipo.nome || tipo.nome.trim() === '') {
              alert(`Preencha o nome do ingresso no setor "${setor.nome}"!`);
              return;
            }
            if (!tipo.preco || parseFloat(tipo.preco) <= 0) {
              alert(`Preencha um preço válido (maior que zero) no setor "${setor.nome}"!`);
              return;
            }
            temIngressoValido = true;
          }
        }
      }
    }

    if (!temIngressoValido) {
      alert('Adicione pelo menos um tipo de ingresso com nome e preço!');
      return;
    }
    
    setIsSubmitting(true);
    let publicUrl = '';
    let uploadedFilePath = null;

    try {
      console.log('👤 Publicando como usuário:', user.id);

      // ====== 1. UPLOAD DA IMAGEM ======
      if (imagem) {
        const fileExtension = imagem.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${user.id}/${timestamp}-${randomStr}.${fileExtension}`;
        uploadedFilePath = filePath;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, imagem, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        
        publicUrl = publicUrlData.publicUrl;
      }

      // ====== 2. CALCULAR TOTAIS ======
      let totalIngressosEvento = 0;
      let somaPrecos = 0;
      let totalTipos = 0;

      setoresIngressos.forEach(setor => {
        if (setor.usaLotes) {
          setor.lotes.forEach(lote => {
            lote.tiposIngresso.forEach(tipo => {
              const preco = parseFloat(tipo.preco) || 0;
              
              if (tipo.nome && tipo.nome.trim() !== '' && preco > 0) {
                const quantidade = parseInt(tipo.quantidade) || 0;
                totalIngressosEvento += quantidade;
                somaPrecos += preco;
                totalTipos++;
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach(tipo => {
            const preco = parseFloat(tipo.preco) || 0;
            
            if (tipo.nome && tipo.nome.trim() !== '' && preco > 0) {
              const quantidade = parseInt(tipo.quantidade) || 0;
              totalIngressosEvento += quantidade;
              somaPrecos += preco;
              totalTipos++;
            }
          });
        }
      });

      const precoMedioEvento = totalTipos > 0 ? (somaPrecos / totalTipos) : 0;

      // ====== 3. CRIAR EVENTO ======
      const eventData = {
        nome: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        hora: formData.hora,
        local: formData.localNome,
        endereco: formData.localEndereco || null,
        categoria: categorias[0],
        tem_lugar_marcado: temLugarMarcado,
        mostrar_produtor: aparecerComoProdutor,
        imagem_url: publicUrl,
        status: 'pendente',
        rascunho: true,
        user_id: user.id,
        produtor_email: user.email,
        produtor_nome: user.user_metadata?.name || user.email,
        ingressos_vendidos: 0,
        total_ingressos: totalIngressosEvento,
        preco_medio: precoMedioEvento,
        TaxaCliente: 0,
        TaxaProdutor: 0
      };
      
      const { data: insertedData, error: insertError } = await supabase
        .from('eventos')
        .insert([eventData])
        .select();

      if (insertError) {
        if (uploadedFilePath) {
          await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        throw new Error(`Erro ao inserir evento: ${insertError.message}`);
      }
      
      const eventoId = insertedData[0].id;
      console.log('✅ Evento criado com ID:', eventoId);

      // ====== 4. SALVAR LOTES (SE HOUVER) ======
      const lotesMap = new Map();

      for (const setor of setoresIngressos) {
        if (setor.usaLotes && setor.lotes && setor.lotes.length > 0) {
          for (const lote of setor.lotes) {
            const loteData = {
              evento_id: eventoId,
              setor: setor.nome,
              nome: lote.nome,
              quantidade_total: parseInt(lote.quantidadeTotal) || 0,
              quantidade_vendida: 0,
              data_inicio: lote.dataInicio || null,
              data_fim: lote.dataFim || null,
              ativo: true,
              user_id: user.id
            };

            const { data: loteInserido, error: loteError } = await supabase
              .from('lotes')
              .insert([loteData])
              .select();

            if (loteError) {
              throw new Error(`Erro ao salvar lote "${lote.nome}": ${loteError.message}`);
            }

            lotesMap.set(lote.id, loteInserido[0].id);
          }
        }
      }

      // ====== 5. SALVAR INGRESSOS ======
      const ingressosParaSalvar = [];
      
      setoresIngressos.forEach((setor, setorIndex) => {
        if (setor.usaLotes) {
          setor.lotes.forEach((lote, loteIndex) => {
            lote.tiposIngresso.forEach((tipo, tipoIndex) => {
              const preco = parseFloat(tipo.preco) || 0;
              
              if (tipo.nome && tipo.nome.trim() !== '' && preco > 0) {
                const quantidade = parseInt(tipo.quantidade) || 0;
                const timestamp = Date.now().toString().slice(-8);
                const codigoNumerico = parseInt(`${eventoId}${setorIndex}${loteIndex}${tipoIndex}${timestamp}`);
                const loteIdReal = lotesMap.get(lote.id);
                
                ingressosParaSalvar.push({
                  evento_id: eventoId,
                  setor: setor.nome,
                  lote_id: loteIdReal,
                  tipo: tipo.nome,
                  valor: preco.toString(),
                  quantidade: quantidade,
                  vendidos: 0,
                  status_ingresso: 'disponivel',
                  user_id: user.id,
                  codigo: codigoNumerico
                });
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach((tipo, tipoIndex) => {
            const preco = parseFloat(tipo.preco) || 0;
            
            if (tipo.nome && tipo.nome.trim() !== '' && preco > 0) {
              const quantidade = parseInt(tipo.quantidade) || 0;
              const timestamp = Date.now().toString().slice(-8);
              const codigoNumerico = parseInt(`${eventoId}${setorIndex}${tipoIndex}${timestamp}`);
              
              ingressosParaSalvar.push({
                evento_id: eventoId,
                setor: setor.nome,
                lote_id: null,
                tipo: tipo.nome,
                valor: preco.toString(),
                quantidade: quantidade,
                vendidos: 0,
                status_ingresso: 'disponivel',
                user_id: user.id,
                codigo: codigoNumerico
              });
            }
          });
        }
      });

      if (ingressosParaSalvar.length > 0) {
        const { error: ingressosError } = await supabase
          .from('ingressos')
          .insert(ingressosParaSalvar);

        if (ingressosError) {
          throw new Error(`Erro ao salvar ingressos: ${ingressosError.message}`);
        }

        console.log('✅ Ingressos salvos com sucesso!');
      }
      
      router.push(`/publicar-evento/complemento?evento=${eventoId}`);
    } catch (error) {
      console.error('💥 Erro:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🔄 Verificando autenticação...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>⚠️ Sessão não encontrada</h2>
        <button onClick={() => router.push('/login')} className="btn-submit">
          🔐 Ir para Login
        </button>
      </div>
    );
  }

  return (
    <div className="publicar-evento-container">
      <div className="user-info-banner">
        <p>👤 Publicando como: <strong>{user.email}</strong></p>
      </div>
      
      <h1>Publicar Novo Evento - Passo 1/2</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Preencha as informações básicas e configure os setores e ingressos
      </p>
      
      <form onSubmit={handleSubmit}>
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
              placeholder="Descreva seu evento..."
              required
            />
          </div>

          <div className="form-group">
            <label>Imagem do Evento *</label>
            <div className="image-upload-container">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                className="image-input"
                style={{ display: 'none' }} 
              />
              
              {imagemPreview ? (
                <div className="image-preview-container">
                  <img src={imagemPreview} alt="Preview" className="image-preview" />
                  <div className="image-info">
                    <p>✅ {imagem?.name || 'Imagem selecionada'}</p>
                    <button type="button" onClick={removeImage} className="btn-remove-image">
                      Remover Imagem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="image-upload-area" onClick={handleClickUpload}>
                  <div className="upload-icon">📷</div>
                  <p>Clique para selecionar uma imagem</p>
                </div>
              )}
            </div>
          </div>

          <CategoriaSelector onCategoriasChange={setCategorias} />

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

          <div className="form-group">
            <label>Endereço do Local (opcional)</label>
            <input
              type="text"
              name="localEndereco"
              value={formData.localEndereco}
              onChange={handleFormChange}
              placeholder="Ex: Rua Exemplo, 123"
            />
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

        <div className="form-section">
          <h2>Configuração de Assentos</h2>
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
        </div>

        <div className="form-section">
          <h2>👤 Visibilidade do Produtor</h2>
          <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', border: '2px solid #2196f3' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={aparecerComoProdutor}
                onChange={(e) => setAparecerComoProdutor(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1976d2' }}>
                  Aparecer como produtor na página do evento
                </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#555' }}>
                  Seu nome e informações de contato serão exibidos publicamente
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Setores e Ingressos *</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            💡 <strong>Dica:</strong> Preencha apenas <strong>nome</strong> e <strong>preço</strong> dos ingressos. A quantidade é opcional - deixe em branco para ilimitado!
          </p>
          <SetorManager onSetoresChange={setSetoresIngressos} />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Salvando...' : '➡️ Avançar para Cupons e Produtos'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
