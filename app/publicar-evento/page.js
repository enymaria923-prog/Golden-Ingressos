'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import ProdutoManager from './components/ProdutoManager';
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
  const [taxa, setTaxa] = useState({ 
    taxaComprador: 15, 
    taxaProdutor: 5 
  });
  
  const [setoresIngressos, setSetoresIngressos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  
  const [imagem, setImagem] = useState(null); 
  const [imagemPreview, setImagemPreview] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth mudou:', event);
      if (session?.user) {
        console.log('✅ Usuário detectado:', session.user.email);
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
      console.log('🔍 Verificando usuário...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📦 Sessão:', session);
      
      if (session?.user) {
        console.log('✅ Usuário logado:', session.user.email);
        setUser(session.user);
      } else {
        console.log('❌ Nenhum usuário logado');
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

    // VALIDAR SETORES E INGRESSOS
    console.log('🎫 Setores recebidos:', setoresIngressos);
    
    if (!setoresIngressos || setoresIngressos.length === 0) {
      alert('Por favor, adicione pelo menos um setor com ingressos!');
      return;
    }

    // VALIDAR CADA SETOR
    let temIngressoValido = false;
    for (const setor of setoresIngressos) {
      if (!setor.nome || setor.nome.trim() === '') {
        alert('Por favor, preencha o nome de todos os setores!');
        return;
      }

      // VALIDAR CAPACIDADE DO SETOR
      let totalIngressosSetor = 0;
      
      if (setor.usaLotes) {
        // SE USA LOTES
        if (!setor.lotes || setor.lotes.length === 0) {
          alert(`O setor "${setor.nome}" está configurado para usar lotes, mas não tem nenhum lote criado!`);
          return;
        }

        for (const lote of setor.lotes) {
          if (!lote.nome || lote.nome.trim() === '') {
            alert(`Preencha o nome do lote no setor "${setor.nome}"!`);
            return;
          }

          // VALIDAR DATAS DO LOTE
          if (lote.dataInicio && lote.dataFim) {
            const inicio = new Date(lote.dataInicio);
            const fim = new Date(lote.dataFim);
            if (inicio >= fim) {
              alert(`No lote "${lote.nome}" do setor "${setor.nome}": a data de início deve ser anterior à data de fim!`);
              return;
            }
          }

          // VALIDAR INGRESSOS DO LOTE
          let totalIngressosLote = 0;
          for (const tipo of lote.tiposIngresso) {
            if (!tipo.nome || !tipo.preco || !tipo.quantidade) {
              alert(`Preencha todos os campos do ingresso no lote "${lote.nome}" do setor "${setor.nome}"!`);
              return;
            }
            
            const quantidade = parseInt(tipo.quantidade);
            const preco = parseFloat(tipo.preco);
            
            if (quantidade <= 0 || preco <= 0) {
              alert(`Valores inválidos no lote "${lote.nome}". Quantidade e preço devem ser maiores que zero!`);
              return;
            }
            
            totalIngressosLote += quantidade;
            temIngressoValido = true;
          }

          // VERIFICAR SE ULTRAPASSA CAPACIDADE DO LOTE
          if (lote.quantidadeTotal && totalIngressosLote > parseInt(lote.quantidadeTotal)) {
            alert(`O total de ingressos (${totalIngressosLote}) no lote "${lote.nome}" ultrapassa a capacidade definida (${lote.quantidadeTotal})!`);
            return;
          }

          totalIngressosSetor += totalIngressosLote;
        }
      } else {
        // SE NÃO USA LOTES (INGRESSOS DIRETOS)
        for (const tipo of setor.tiposIngresso) {
          if (!tipo.nome || !tipo.preco || !tipo.quantidade) {
            alert(`Preencha todos os campos do ingresso no setor "${setor.nome}"!`);
            return;
          }
          
          const quantidade = parseInt(tipo.quantidade);
          const preco = parseFloat(tipo.preco);
          
          if (quantidade <= 0 || preco <= 0) {
            alert(`Valores inválidos no setor "${setor.nome}". Quantidade e preço devem ser maiores que zero!`);
            return;
          }
          
          totalIngressosSetor += quantidade;
          temIngressoValido = true;
        }
      }

      // VERIFICAR SE ULTRAPASSA CAPACIDADE DO SETOR
      if (setor.capacidadeTotal && totalIngressosSetor > parseInt(setor.capacidadeTotal)) {
        alert(`O total de ingressos (${totalIngressosSetor}) no setor "${setor.nome}" ultrapassa a capacidade definida (${setor.capacidadeTotal})!`);
        return;
      }
    }

    if (!temIngressoValido) {
      alert('Adicione pelo menos um ingresso válido!');
      return;
    }

    // VALIDAR PRODUTOS (SE HOUVER)
    console.log('🛍️ Produtos recebidos:', produtos);
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        if (!produto.nome || !produto.preco || !produto.quantidade || !produto.tipoProduto) {
          alert(`Preencha todos os campos obrigatórios do produto "${produto.nome || 'sem nome'}"!`);
          return;
        }
        
        const preco = parseFloat(produto.preco);
        const quantidade = parseInt(produto.quantidade);
        
        if (preco <= 0 || quantidade <= 0) {
          alert(`Valores inválidos no produto "${produto.nome}". Preço e quantidade devem ser maiores que zero!`);
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    let publicUrl = '';
    let uploadedFilePath = null;

    try {
      console.log('👤 Publicando como usuário:', user.id);

      // ====== 1. UPLOAD DA IMAGEM DO EVENTO ======
      if (imagem) {
        const fileExtension = imagem.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${user.id}/${timestamp}-${randomStr}.${fileExtension}`;
        uploadedFilePath = filePath;

        console.log('📤 Iniciando upload da imagem do evento para:', filePath);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, imagem, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        console.log('✅ Upload realizado:', uploadData);
        
        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        
        publicUrl = publicUrlData.publicUrl;
        console.log('🔗 URL pública:', publicUrl);
      }

      // ====== 2. CALCULAR TOTAIS DO EVENTO ======
      let totalIngressosEvento = 0;
      let somaPrecos = 0;
      let totalTipos = 0;

      setoresIngressos.forEach(setor => {
        if (setor.usaLotes) {
          setor.lotes.forEach(lote => {
            lote.tiposIngresso.forEach(tipo => {
              const quantidade = parseInt(tipo.quantidade) || 0;
              const preco = parseFloat(tipo.preco) || 0;
              
              if (quantidade > 0 && preco > 0) {
                totalIngressosEvento += quantidade;
                somaPrecos += preco;
                totalTipos++;
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach(tipo => {
            const quantidade = parseInt(tipo.quantidade) || 0;
            const preco = parseFloat(tipo.preco) || 0;
            
            if (quantidade > 0 && preco > 0) {
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
        TaxaCliente: taxa.taxaComprador,
        TaxaProdutor: taxa.taxaProdutor,
        imagem_url: publicUrl,
        status: 'pendente',
        user_id: user.id,
        produtor_email: user.email,
        produtor_nome: user.user_metadata?.name || user.email,
        ingressos_vendidos: 0,
        total_ingressos: totalIngressosEvento,
        preco_medio: precoMedioEvento
      };

      console.log('📝 Inserindo evento no banco...', eventData);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('eventos')
        .insert([eventData])
        .select();

      if (insertError) {
        console.error('❌ Erro na inserção:', insertError);
        
        if (uploadedFilePath) {
          console.log('🗑️ Removendo imagem do storage...');
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
          console.log(`📦 Salvando lotes do setor "${setor.nome}"...`);
          
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
              console.error('❌ Erro ao salvar lote:', loteError);
              throw new Error(`Erro ao salvar lote "${lote.nome}": ${loteError.message}`);
            }

            lotesMap.set(lote.id, loteInserido[0].id);
            console.log(`✅ Lote "${lote.nome}" salvo com ID: ${loteInserido[0].id}`);
          }
        }
      }

      // ====== 5. SALVAR INGRESSOS ======
      console.log('🎫 Salvando ingressos...');
      const ingressosParaSalvar = [];
      
      setoresIngressos.forEach((setor, setorIndex) => {
        if (setor.usaLotes) {
          setor.lotes.forEach((lote, loteIndex) => {
            lote.tiposIngresso.forEach((tipo, tipoIndex) => {
              const quantidade = parseInt(tipo.quantidade) || 0;
              const valor = parseFloat(tipo.preco) || 0;
              
              if (quantidade > 0 && valor > 0) {
                const timestamp = Date.now().toString().slice(-8);
                const codigoNumerico = parseInt(`${eventoId}${setorIndex}${loteIndex}${tipoIndex}${timestamp}`);
                const loteIdReal = lotesMap.get(lote.id);
                
                ingressosParaSalvar.push({
                  evento_id: eventoId,
                  setor: setor.nome,
                  lote_id: loteIdReal,
                  tipo: tipo.nome,
                  valor: valor.toString(),
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
            const quantidade = parseInt(tipo.quantidade) || 0;
            const valor = parseFloat(tipo.preco) || 0;
            
            if (quantidade > 0 && valor > 0) {
              const timestamp = Date.now().toString().slice(-8);
              const codigoNumerico = parseInt(`${eventoId}${setorIndex}${tipoIndex}${timestamp}`);
              
              ingressosParaSalvar.push({
                evento_id: eventoId,
                setor: setor.nome,
                lote_id: null,
                tipo: tipo.nome,
                valor: valor.toString(),
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

      console.log('💾 Ingressos a serem salvos:', ingressosParaSalvar);

      if (ingressosParaSalvar.length > 0) {
        const { error: ingressosError } = await supabase
          .from('ingressos')
          .insert(ingressosParaSalvar);

        if (ingressosError) {
          console.error('❌ Erro ao salvar ingressos:', ingressosError);
          throw new Error(`Erro ao salvar ingressos: ${ingressosError.message}`);
        }

        console.log('✅ Ingressos salvos com sucesso!');
      } else {
        throw new Error('Nenhum ingresso válido para salvar!');
      }

      // ====== 6. SALVAR PRODUTOS (SE HOUVER) ======
      if (produtos && produtos.length > 0) {
        console.log('🛍️ Salvando produtos...');
        
        for (const produto of produtos) {
          let imagemProdutoUrl = null;

          if (produto.imagem) {
            const fileExtension = produto.imagem.name.split('.').pop();
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const filePath = `produtos/${user.id}/${eventoId}/${timestamp}-${randomStr}.${fileExtension}`;

            console.log('📤 Upload da imagem do produto:', produto.nome);

            const { data: uploadProdData, error: uploadProdError } = await supabase.storage
              .from('imagens_eventos')
              .upload(filePath, produto.imagem, { 
                cacheControl: '3600', 
                upsert: false 
              });

            if (uploadProdError) {
              console.error('⚠️ Erro ao fazer upload da imagem do produto, continuando sem imagem:', uploadProdError);
            } else {
              const { data: publicProdUrlData } = supabase.storage
                .from('imagens_eventos')
                .getPublicUrl(filePath);
              
              imagemProdutoUrl = publicProdUrlData.publicUrl;
            }
          }

          const produtoData = {
            evento_id: eventoId,
            nome: produto.nome,
            descricao: produto.descricao || null,
            preco: parseFloat(produto.preco),
            quantidade_disponivel: parseInt(produto.quantidade),
            quantidade_vendida: 0,
            tamanho: produto.tamanho || null,
            imagem_url: imagemProdutoUrl,
            tipo_produto: produto.tipoProduto,
            ativo: true,
            user_id: user.id
          };

          const { error: produtoError } = await supabase
            .from('produtos')
            .insert([produtoData]);

          if (produtoError) {
            console.error('❌ Erro ao salvar produto:', produtoError);
            throw new Error(`Erro ao salvar produto "${produto.nome}": ${produtoError.message}`);
          }

          console.log(`✅ Produto "${produto.nome}" salvo com sucesso!`);
        }
      }
      
      alert('🎉 Evento publicado com sucesso! Em breve estará disponível no site.');
      
      setFormData({
        titulo: '', descricao: '', data: '', hora: '', localNome: '', localEndereco: ''
      });
      setCategorias([]);
      setTemLugarMarcado(false);
      setTaxa({ taxaComprador: 15, taxaProdutor: 5 });
      setSetoresIngressos([]);
      setProdutos([]);
      setImagem(null);
      setImagemPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      router.push('/produtor');

    } catch (error) {
      console.error('💥 Erro no processo de publicação:', error);
      alert(`❌ Erro ao publicar evento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🔄 Verificando autenticação...</h2>
        <p>Aguarde um momento...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>⚠️ Sessão não encontrada</h2>
        <p>Não conseguimos verificar seu login.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          <button onClick={checkUser} className="btn-submit" style={{ background: '#2196F3' }}>
            🔄 Tentar Novamente
          </button>
          <button onClick={() => router.push('/login')} className="btn-submit">
            🔐 Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="publicar-evento-container">
      <div className="user-info-banner">
        <p>👤 Publicando como: <strong>{user.email}</strong></p>
      </div>
      
      <h1>Publicar Novo Evento</h1>
      
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
          <h2>Setores e Ingressos *</h2>
          <SetorManager onSetoresChange={setSetoresIngressos} />
        </div>

        <div className="form-section">
          <h2>🛍️ Produtos Adicionais (Opcional)</h2>
          <ProdutoManager onProdutosChange={setProdutos} />
        </div>

        <div className="form-section">
          <h2>Configuração de Taxas</h2>
          <SelecionarTaxa onTaxaSelecionada={setTaxa} />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Publicando...' : '🚀 Publicar Evento'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
