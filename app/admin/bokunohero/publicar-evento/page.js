'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import './PublicarEvento.css';
const PublicarEventoAdmin = () => {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    localNome: '', 
    localEndereco: '',
    cidade: ''
  });
  
  const [datasHorarios, setDatasHorarios] = useState([{ data: '', hora: '' }]);
  const [imagensDescricao, setImagensDescricao] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [aparecerComoProdutor, setAparecerComoProdutor] = useState(true);
  const [setoresIngressos, setSetoresIngressos] = useState([]);
  
  const [imagem, setImagem] = useState(null); 
  const [imagemPreview, setImagemPreview] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const imagemDescricaoInputRef = useRef(null);

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
      console.error('Erro ao verificar usuário:', error);
      setLoading(false);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const adicionarDataHorario = () => {
    setDatasHorarios([...datasHorarios, { data: '', hora: '' }]);
  };

  const removerDataHorario = (index) => {
    if (datasHorarios.length > 1) {
      setDatasHorarios(datasHorarios.filter((_, i) => i !== index));
    }
  };

  const handleDataHorarioChange = (index, field, value) => {
    const novasDatas = [...datasHorarios];
    novasDatas[index][field] = value;
    setDatasHorarios(novasDatas);
  };

  const handleImagemDescricaoChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 5MB por imagem.');
        return;
      }
      
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Apenas JPG, PNG ou GIF são aceitos.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagensDescricao(prev => [...prev, {
          file: file,
          preview: e.target.result,
          textoAntes: '',
          textoDepois: ''
        }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const atualizarTextoImagem = (index, field, value) => {
    const novasImagens = [...imagensDescricao];
    novasImagens[index][field] = value;
    setImagensDescricao(novasImagens);
  };

  const removerImagemDescricao = (index) => {
    setImagensDescricao(imagensDescricao.filter((_, i) => i !== index));
  };

  const moverImagemDescricao = (index, direction) => {
    const novasImagens = [...imagensDescricao];
    const novoIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (novoIndex >= 0 && novoIndex < novasImagens.length) {
      [novasImagens[index], novasImagens[novoIndex]] = [novasImagens[novoIndex], novasImagens[index]];
      setImagensDescricao(novasImagens);
    }
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

    if (!formData.titulo || !formData.descricao || !formData.localNome || !imagem) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a imagem!');
      return;
    }

    const datasValidas = datasHorarios.filter(dh => dh.data && dh.hora);
    if (datasValidas.length === 0) {
      alert('Por favor, adicione pelo menos uma data e horário!');
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

    for (const setor of setoresIngressos) {
      if (!setor.nome || setor.nome.trim() === '') {
        alert('Por favor, preencha o nome de todos os setores!');
        return;
      }

      const temCapacidadeSetor = setor.capacidadeDefinida && setor.capacidadeDefinida > 0;
      
      let temCapacidadeTipos = false;
      if (setor.usaLotes) {
        temCapacidadeTipos = setor.lotes.some(lote => 
          lote.tiposIngresso.some(tipo => {
            const temNome = tipo.nome && tipo.nome.trim() !== '';
            const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
            const temQtd = tipo.quantidade && parseInt(tipo.quantidade) > 0;
            return temNome && temPreco && temQtd;
          })
        );
      } else {
        temCapacidadeTipos = setor.tiposIngresso.some(tipo => {
          const temNome = tipo.nome && tipo.nome.trim() !== '';
          const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
          const temQtd = tipo.quantidade && parseInt(tipo.quantidade) > 0;
          return temNome && temPreco && temQtd;
        });
      }

      if (!temCapacidadeSetor && !temCapacidadeTipos) {
        alert(`⚠️ O setor "${setor.nome}" precisa ter capacidade definida no setor OU nos tipos de ingresso!`);
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

          let temIngressoValidoNoLote = false;
          for (const tipo of lote.tiposIngresso) {
            const temNome = tipo.nome && tipo.nome.trim() !== '';
            const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
            
            if (temNome && temPreco) {
              temIngressoValidoNoLote = true;
            } else if (temNome && !temPreco) {
              alert(`O ingresso "${tipo.nome}" no lote "${lote.nome}" precisa ter um preço!`);
              return;
            } else if (!temNome && temPreco) {
              alert(`Há um preço sem nome de ingresso no lote "${lote.nome}"!`);
              return;
            }
          }

          if (!temIngressoValidoNoLote) {
            alert(`O lote "${lote.nome}" precisa ter pelo menos um tipo de ingresso válido!`);
            return;
          }
        }
      } else {
        let temIngressoValidoNoSetor = false;
        for (const tipo of setor.tiposIngresso) {
          const temNome = tipo.nome && tipo.nome.trim() !== '';
          const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
          
          if (temNome && temPreco) {
            temIngressoValidoNoSetor = true;
          } else if (temNome && !temPreco) {
            alert(`O ingresso "${tipo.nome}" no setor "${setor.nome}" precisa ter um preço!`);
            return;
          } else if (!temNome && temPreco) {
            alert(`Há um preço sem nome de ingresso no setor "${setor.nome}"!`);
            return;
          }
        }

        if (!temIngressoValidoNoSetor) {
          alert(`O setor "${setor.nome}" precisa ter pelo menos um tipo de ingresso válido!`);
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    let publicUrl = '';
    let uploadedFilePath = null;
    let eventoIdCriado = null;
    let imagensDescricaoUploadadas = [];

    try {
      console.log('👤 Publicando como usuário:', user.id);

      if (imagem) {
        const fileExtension = imagem.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${user.id}/${timestamp}-${randomStr}.${fileExtension}`;
        uploadedFilePath = filePath;

        const { error: uploadError } = await supabase.storage
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
        console.log('✅ Imagem carregada:', publicUrl);
      }

      for (let i = 0; i < imagensDescricao.length; i++) {
        const img = imagensDescricao[i];
        const fileExtension = img.file.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${user.id}/descricao/${timestamp}-${i}-${randomStr}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, img.file, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem ${i + 1}: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        
        imagensDescricaoUploadadas.push({
          url: publicUrlData.publicUrl,
          textoAntes: img.textoAntes,
          textoDepois: img.textoDepois,
          ordem: i,
          filePath: filePath
        });

        console.log(`✅ Imagem descrição ${i + 1} carregada`);
      }

      let totalIngressosEvento = 0;
      let somaPrecos = 0;
      let totalTipos = 0;

      setoresIngressos.forEach(setor => {
        const capacidadeSetor = setor.capacidadeDefinida;
        
        if (capacidadeSetor && parseInt(capacidadeSetor) > 0) {
          const capacidade = parseInt(capacidadeSetor);
          totalIngressosEvento += capacidade;
        } else {
          if (setor.usaLotes) {
            setor.lotes.forEach(lote => {
              lote.tiposIngresso.forEach(tipo => {
                const temNome = tipo.nome && tipo.nome.trim() !== '';
                const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
                
                if (temNome && temPreco) {
                  const qtd = tipo.quantidade ? parseInt(tipo.quantidade) : 0;
                  totalIngressosEvento += qtd;
                }
              });
            });
          } else {
            setor.tiposIngresso.forEach(tipo => {
              const temNome = tipo.nome && tipo.nome.trim() !== '';
              const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
              
              if (temNome && temPreco) {
                const qtd = tipo.quantidade ? parseInt(tipo.quantidade) : 0;
                totalIngressosEvento += qtd;
              }
            });
          }
        }
        
        if (setor.usaLotes) {
          setor.lotes.forEach(lote => {
            lote.tiposIngresso.forEach(tipo => {
              const temNome = tipo.nome && tipo.nome.trim() !== '';
              const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
              if (temNome && temPreco) {
                somaPrecos += parseFloat(tipo.preco);
                totalTipos++;
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach(tipo => {
            const temNome = tipo.nome && tipo.nome.trim() !== '';
            const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
            if (temNome && temPreco) {
              somaPrecos += parseFloat(tipo.preco);
              totalTipos++;
            }
          });
        }
      });

      const precoMedioEvento = totalTipos > 0 ? (somaPrecos / totalTipos) : 0;

      const eventData = {
        nome: formData.titulo,
        descricao: formData.descricao,
        data: datasValidas[0].data,
        hora: datasValidas[0].hora,
        local: formData.localNome,
        endereco: formData.localEndereco || null,
        cidade: formData.cidade || null,
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
        throw new Error(`Erro ao inserir evento: ${insertError.message}`);
      }
      
      eventoIdCriado = insertedData[0].id;
      console.log('✅ Evento criado! ID:', eventoIdCriado);

      const { data: sessaoOriginal, error: sessaoOriginalError } = await supabase
        .from('sessoes')
        .insert({
          evento_id: eventoIdCriado,
          data: datasValidas[0].data,
          hora: datasValidas[0].hora,
          numero: 1,
          is_original: true
        })
        .select()
        .single();

      if (sessaoOriginalError) {
        throw new Error(`Erro ao criar sessão original: ${sessaoOriginalError.message}`);
      }

      console.log('✅ Sessão original criada! ID:', sessaoOriginal.id);

      if (imagensDescricaoUploadadas.length > 0) {
        const imagensParaSalvar = imagensDescricaoUploadadas.map(img => ({
          evento_id: eventoIdCriado,
          imagem_url: img.url,
          texto_antes: img.textoAntes || null,
          texto_depois: img.textoDepois || null,
          ordem: img.ordem
        }));

        const { error: imagensError } = await supabase
          .from('eventos_imagens_descricao')
          .insert(imagensParaSalvar);

        if (imagensError) {
          throw new Error(`Erro ao salvar imagens da descrição: ${imagensError.message}`);
        }

        console.log(`✅ ${imagensDescricaoUploadadas.length} imagens da descrição salvas`);
      }

      for (const setor of setoresIngressos) {
        let capacidadeCalculada = 0;
        
        if (setor.usaLotes) {
          setor.lotes.forEach(lote => {
            lote.tiposIngresso.forEach(tipo => {
              const temNome = tipo.nome && tipo.nome.trim() !== '';
              const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
              if (temNome && temPreco) {
                capacidadeCalculada += tipo.quantidade ? parseInt(tipo.quantidade) : 0;
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach(tipo => {
            const temNome = tipo.nome && tipo.nome.trim() !== '';
            const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
            if (temNome && temPreco) {
              capacidadeCalculada += tipo.quantidade ? parseInt(tipo.quantidade) : 0;
            }
          });
        }
        
        const capacidadeDefinida = setor.capacidadeDefinida || null;

        const { error: setorError } = await supabase
          .from('setores')
          .insert([{
            eventos_id: eventoIdCriado,
            sessao_id: sessaoOriginal.id,
            nome: setor.nome,
            capacidade_calculada: capacidadeCalculada,
            capacidade_definida: capacidadeDefinida
          }]);

        if (setorError) {
          throw new Error(`Erro ao salvar setor: ${setorError.message}`);
        }
      }

      const lotesMap = new Map();

      for (const setor of setoresIngressos) {
        if (setor.usaLotes && setor.lotes && setor.lotes.length > 0) {
          for (const lote of setor.lotes) {
            let quantidadeTotalLote = 0;
            
            lote.tiposIngresso.forEach(tipo => {
              const temNome = tipo.nome && tipo.nome.trim() !== '';
              const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
              if (temNome && temPreco) {
                quantidadeTotalLote += tipo.quantidade ? parseInt(tipo.quantidade) : 0;
              }
            });

            const loteData = {
              evento_id: eventoIdCriado,
              sessao_id: sessaoOriginal.id,
              setor: setor.nome,
              nome: lote.nome,
              quantidade_total: quantidadeTotalLote,
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
              throw new Error(`Erro ao salvar lote: ${loteError.message}`);
            }

            lotesMap.set(lote.id, loteInserido[0].id);
          }
        }
      }

      const ingressosParaSalvar = [];
      let contadorIngresso = 0;

      setoresIngressos.forEach((setor) => {
        if (setor.usaLotes) {
          setor.lotes.forEach((lote) => {
            lote.tiposIngresso.forEach((tipo) => {
              const temNome = tipo.nome && tipo.nome.trim() !== '';
              const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
              
              if (temNome && temPreco) {
                const quantidade = tipo.quantidade ? parseInt(tipo.quantidade) : 0;
                const preco = parseFloat(tipo.preco);
                const loteIdReal = lotesMap.get(lote.id);
                const codigo = Date.now() + contadorIngresso;
                
                ingressosParaSalvar.push({
                  evento_id: eventoIdCriado,
                  sessao_id: sessaoOriginal.id,
                  setor: setor.nome,
                  lote_id: loteIdReal,
                  tipo: tipo.nome,
                  valor: preco.toString(),
                  quantidade: quantidade,
                  vendidos: 0,
                  status_ingresso: 'disponivel',
                  user_id: user.id,
                  codigo: codigo
                });
                
                contadorIngresso++;
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach((tipo) => {
            const temNome = tipo.nome && tipo.nome.trim() !== '';
            const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
            
            if (temNome && temPreco) {
              const quantidade = tipo.quantidade ? parseInt(tipo.quantidade) : 0;
              const preco = parseFloat(tipo.preco);
              const codigo = Date.now() + contadorIngresso;
              
              ingressosParaSalvar.push({
                evento_id: eventoIdCriado,
                sessao_id: sessaoOriginal.id,
                setor: setor.nome,
                lote_id: null,
                tipo: tipo.nome,
                valor: preco.toString(),
                quantidade: quantidade,
                vendidos: 0,
                status_ingresso: 'disponivel',
                user_id: user.id,
                codigo: codigo
              });
              
              contadorIngresso++;
            }
          });
        }
      });

      if (ingressosParaSalvar.length === 0) {
        throw new Error('Nenhum ingresso válido para salvar!');
      }

      const { data: ingressosInseridos, error: ingressosError } = await supabase
        .from('ingressos')
        .insert(ingressosParaSalvar)
        .select();

      if (ingressosError) {
        throw new Error(`Erro ao salvar ingressos: ${ingressosError.message}`);
      }

      console.log(`✅ ${ingressosInseridos.length} INGRESSOS DA SESSÃO 1 SALVOS!`);

      if (datasValidas.length > 1) {
        for (let i = 1; i < datasValidas.length; i++) {
          const dataHora = datasValidas[i];
          
          const { data: novaSessao, error: novaSessaoError } = await supabase
            .from('sessoes')
            .insert({
              evento_id: eventoIdCriado,
              data: dataHora.data,
              hora: dataHora.hora,
              numero: i + 1,
              is_original: false
            })
            .select()
            .single();

          if (novaSessaoError) {
            console.error(`Erro ao criar sessão ${i + 1}:`, novaSessaoError);
            continue;
          }

          for (const setor of setoresIngressos) {
            let capacidadeCalculada = 0;
            
            if (setor.usaLotes) {
              setor.lotes.forEach(lote => {
                lote.tiposIngresso.forEach(tipo => {
                  const temNome = tipo.nome && tipo.nome.trim() !== '';
                  const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
                  if (temNome && temPreco) {
                    capacidadeCalculada += tipo.quantidade ? parseInt(tipo.quantidade) : 0;
                  }
                });
              });
            } else {
              setor.tiposIngresso.forEach(tipo => {
                const temNome = tipo.nome && tipo.nome.trim() !== '';
                const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
                if (temNome && temPreco) {
                  capacidadeCalculada += tipo.quantidade ? parseInt(tipo.quantidade) : 0;
                }
              });
            }
            
            await supabase.from('setores').insert([{
              eventos_id: eventoIdCriado,
              sessao_id: novaSessao.id,
              nome: setor.nome,
              capacidade_calculada: capacidadeCalculada,
              capacidade_definida: setor.capacidadeDefinida || null
            }]);
          }

          const novosLotesMap = new Map();
          for (const setor of setoresIngressos) {
            if (setor.usaLotes && setor.lotes && setor.lotes.length > 0) {
              for (const lote of setor.lotes) {
                let quantidadeTotalLote = 0;
                
                lote.tiposIngresso.forEach(tipo => {
                  const temNome = tipo.nome && tipo.nome.trim() !== '';
                  const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
                  if (temNome && temPreco) {
                    quantidadeTotalLote += tipo.quantidade ? parseInt(tipo.quantidade) : 0;
                  }
                });

                const { data: novoLote } = await supabase
                  .from('lotes')
                  .insert([{
                    evento_id: eventoIdCriado,
                    sessao_id: novaSessao.id,
                    setor: setor.nome,
                    nome: lote.nome,
                    quantidade_total: quantidadeTotalLote,
                    quantidade_vendida: 0,
                    data_inicio: lote.dataInicio || null,
                    data_fim: lote.dataFim || null,
                    ativo: true,
                    user_id: user.id
                  }])
                  .select()
                  .single();

                if (novoLote) novosLotesMap.set(lote.id, novoLote.id);
              }
            }
          }

          const novosIngressos = [];
          let contadorNovo = 0;

          setoresIngressos.forEach((setor) => {
            if (setor.usaLotes) {
              setor.lotes.forEach((lote) => {
                lote.tiposIngresso.forEach((tipo) => {
                  const temNome = tipo.nome && tipo.nome.trim() !== '';
                  const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
                  
                  if (temNome && temPreco) {
                    novosIngressos.push({
                      evento_id: eventoIdCriado,
                      sessao_id: novaSessao.id,
                      setor: setor.nome,
                      lote_id: novosLotesMap.get(lote.id),
                      tipo: tipo.nome,
                      valor: parseFloat(tipo.preco).toString(),
                      quantidade: tipo.quantidade ? parseInt(tipo.quantidade) : 0,
                      vendidos: 0,
                      status_ingresso: 'disponivel',
                      user_id: user.id,codigo: Date.now() + contadorNovo + (i * 10000)
                });
                contadorNovo++;
              }
            });
          });
        } else {
          setor.tiposIngresso.forEach((tipo) => {
            const temNome = tipo.nome && tipo.nome.trim() !== '';
            const temPreco = tipo.preco && parseFloat(tipo.preco) > 0;
            
            if (temNome && temPreco) {
              novosIngressos.push({
                evento_id: eventoIdCriado,
                sessao_id: novaSessao.id,
                setor: setor.nome,
                lote_id: null,
                tipo: tipo.nome,
                valor: parseFloat(tipo.preco).toString(),
                quantidade: tipo.quantidade ? parseInt(tipo.quantidade) : 0,
                vendidos: 0,
                status_ingresso: 'disponivel',
                user_id: user.id,
                codigo: Date.now() + contadorNovo + (i * 10000)
              });
              contadorNovo++;
            }
          });
        }
      });

      if (novosIngressos.length > 0) {
        await supabase.from('ingressos').insert(novosIngressos);
      }

      console.log(`✅ Sessão ${i + 1} criada com ${novosIngressos.length} ingressos!`);
    }
  }

  console.log(`✅✅✅ SUCESSO TOTAL! ${datasValidas.length} SESSÕES CRIADAS!`);
  
  alert(`✅ Evento "${formData.titulo}" criado com sucesso!\n\n🎬 ${datasValidas.length} sessões criadas\n🎫 ${ingressosInseridos.length} tipos de ingresso por sessão\n📊 ${totalIngressosEvento} ingressos por sessão\n🖼️ ${imagensDescricaoUploadadas.length} imagens na descrição`);
  
  router.push(`/admin/bokunohero/publicar-evento/complemento?evento=${eventoIdCriado}`);
  
} catch (error) {
  console.error('💥 ERRO:', error);
  alert(`❌ Erro ao criar evento: ${error.message}`);
  
  if (eventoIdCriado) {
    await supabase.from('eventos').delete().eq('id', eventoIdCriado);
  }
  
  if (uploadedFilePath) {
    await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
  }

  for (const img of imagensDescricaoUploadadas) {
    await supabase.storage.from('imagens_eventos').remove([img.filePath]);
  }
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
<h1>Publicar Novo Evento (Admin) - Passo 1/2</h1>
  
  <form onSubmit={handleSubmit}>
    <div className="form-section">
      <h2>Informações Básicas</h2>
      
      <div className="form-group">
        <label>Título do Evento *</label>
        <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} placeholder="Ex: Show da Banda X" required />
      </div>

      <div className="form-group">
        <label>Descrição do Evento *</label>
        <textarea name="descricao" value={formData.descricao} onChange={handleFormChange} placeholder="Descreva seu evento..." required />
      </div>

      <div className="form-group">
        <label>Imagem Principal do Evento *</label>
        <div className="image-upload-container">
          <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif" onChange={handleImageChange} className="image-input" />
          
          {imagemPreview ? (
            <div className="image-preview-container">
              <img src={imagemPreview} alt="Preview" className="image-preview" />
              <div className="image-info">
                <p>✅ {imagem?.name}</p>
                <button type="button" onClick={removeImage} className="btn-remove-image">Remover</button>
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

      <div className="form-group">
        <label>Imagens Adicionais na Descrição (opcional)</label>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
          Adicione imagens com textos opcionais antes e depois de cada uma
        </p>
        
        <input 
          type="file" 
          ref={imagemDescricaoInputRef} 
          accept="image/jpeg,image/png,image/gif" 
          onChange={handleImagemDescricaoChange}
          multiple
          style={{ display: 'none' }}
        />
        
        <button 
          type="button" 
          onClick={() => imagemDescricaoInputRef.current.click()}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '15px'
          }}
        >
          📸 Adicionar Imagens
        </button>

        {imagensDescricao.map((img, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '6px', 
            padding: '15px', 
            marginBottom: '15px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong>Imagem {index + 1}</strong>
              <div style={{ display: 'flex', gap: '5px' }}>
                {index > 0 && (
                  <button 
                    type="button" 
                    onClick={() => moverImagemDescricao(index, 'up')}
                    style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ⬆️
                  </button>
                )}
                {index < imagensDescricao.length - 1 && (
                  <button 
                    type="button" 
                    onClick={() => moverImagemDescricao(index, 'down')}
                    style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ⬇️
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => removerImagemDescricao(index)}
                  style={{ 
                    padding: '5px 10px', 
                    fontSize: '12px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Texto antes da imagem:
              </label>
              <textarea
                value={img.textoAntes}
                onChange={(e) => atualizarTextoImagem(index, 'textoAntes', e.target.value)}
                placeholder="Texto que aparece antes da imagem (opcional)"
                rows="2"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>

            <img 
              src={img.preview} 
              alt={`Preview ${index + 1}`} 
              style={{ 
                width: '100%', 
                maxHeight: '300px', 
                objectFit: 'contain',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }} 
            />

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Texto depois da imagem:
              </label>
              <textarea
                value={img.textoDepois}
                onChange={(e) => atualizarTextoImagem(index, 'textoDepois', e.target.value)}
                placeholder="Texto que aparece depois da imagem (opcional)"
                rows="2"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <CategoriaSelector onCategoriasChange={setCategorias} />

      <div className="form-group">
        <label>Nome do Local *</label>
        <input type="text" name="localNome" value={formData.localNome} onChange={handleFormChange} placeholder="Ex: Teatro Maria Della Costa" required />
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
          <label>Endereço do Local (opcional)</label>
          <input type="text" name="localEndereco" value={formData.localEndereco} onChange={handleFormChange} placeholder="Ex: Rua Exemplo, 123" />
        </div>
      </div>

      <div className="form-group">
        <label>Datas e Horários do Evento *</label>
        <span className="label-info-text">
          Para eventos com temporada, adicione múltiplas datas
        </span>
        
        {datasHorarios.map((dh, index) => (
          <div key={index} className="data-horario-row">
            <input 
              type="date" 
              value={dh.data} 
              onChange={(e) => handleDataHorarioChange(index, 'data', e.target.value)}
              required
            />
            <input 
              type="time" 
              value={dh.hora} 
              onChange={(e) => handleDataHorarioChange(index, 'hora', e.target.value)}
              required
            />
            {datasHorarios.length > 1 && (
              <button 
                type="button" 
                onClick={() => removerDataHorario(index)}
                className="btn-remover-pequeno"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={adicionarDataHorario}
          className="btn-adicionar"
        >
          ➕ Adicionar Outra Data/Horário
        </button>
      </div>
    </div>

    <div className="form-section">
      <h2>Configuração de Assentos</h2>
      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={temLugarMarcado} onChange={(e) => setTemLugarMarcado(e.target.checked)} />
          Evento com lugar marcado
        </label>
      </div>
    </div>

    <div className="form-section">
      <h2>👤 Visibilidade do Produtor</h2>
      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', border: '2px solid #2196f3' }}>
        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" checked={aparecerComoProdutor} onChange={(e) => setAparecerComoProdutor(e.target.checked)} style={{ width: '20px', height: '20px' }} />
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1976d2' }}>Aparecer como produtor</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#555' }}>Seu nome será exibido publicamente</p>
          </div>
        </label>
      </div>
    </div>

    <div className="form-section">
      <h2>Setores e Ingressos *</h2>
      <SetorManager onSetoresChange={setSetoresIngressos} />
    </div>

    <button type="submit" className="btn-submit" disabled={isSubmitting}>
      {isSubmitting ? '⏳ Salvando...' : '➡️ Avançar'}
    </button>
  </form>
</div>
);
};
