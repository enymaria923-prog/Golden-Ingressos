'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
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
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [setores, setSetores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    // Validar campos obrigatórios
    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome || !imagem) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a imagem!');
      setEnviando(false);
      return;
    }

    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      setEnviando(false);
      return;
    }

    if (setores.length === 0) {
      alert('Por favor, adicione pelo menos um setor com tipos de ingresso!');
      setEnviando(false);
      return;
    }

    try {
      // 1. Fazer upload da imagem
      let imagemUrl = '';
      if (imagem) {
        const nomeArquivo = `${Date.now()}-${imagem.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('eventos')
          .upload(nomeArquivo, imagem);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('eventos')
          .getPublicUrl(nomeArquivo);
        
        imagemUrl = urlData.publicUrl;
      }

      // 2. Inserir evento principal
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .insert([
          {
            titulo: formData.titulo,
            descricao: formData.descricao,
            data: formData.data,
            hora: formData.hora,
            local_nome: formData.localNome,
            local_endereco: formData.localEndereco,
            categorias: categorias,
            tem_lugar_marcado: temLugarMarcado,
            taxa_comprador: taxa.taxaComprador,
            taxa_produtor: taxa.taxaProdutor,
            imagem_url: imagemUrl,
            status: 'pendente',
            // Dados do produtor (em produção, viriam do usuário logado)
            produtor_nome: 'Produtor Teste',
            produtor_email: 'produtor@teste.com',
            produtor_telefone: '(11) 99999-9999',
            produtor_documento: '123.456.789-00',
            produtor_banco: 'Banco do Brasil',
            produtor_agencia: '1234',
            produtor_conta: '56789-0',
            produtor_tipo: 'Pessoa Física'
          }
        ])
        .select()
        .single();

      if (eventoError) throw eventoError;

      // 3. Inserir setores e tipos de ingresso
      for (const setor of setores) {
        const { data: setorData, error: setorError } = await supabase
          .from('setores')
          .insert([
            {
              evento_id: evento.id,
              nome: setor.nome,
              capacidade_total: setor.capacidadeTotal
            }
          ])
          .select()
          .single();

        if (setorError) throw setorError;

        // Inserir tipos de ingresso
        const tiposIngressoData = setor.tiposIngresso.map(tipo => ({
          setor_id: setorData.id,
          nome: tipo.nome,
          preco: tipo.preco,
          quantidade: tipo.quantidade
        }));

        const { error: tiposError } = await supabase
          .from('tipos_ingresso')
          .insert(tiposIngressoData);

        if (tiposError) throw tiposError;
      }

      alert('✅ Evento enviado para moderação! Agora aparecerá na área admin.');
      
      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        data: '',
        hora: '',
        localNome: '',
        localEndereco: ''
      });
      setCategorias([]);
      setTemLugarMarcado(false);
      setTaxa({ taxaComprador: 15, taxaProdutor: 5 });
      setImagem(null);
      setImagemPreview(null);
      setSetores([]);
      
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  // ... (resto do código permanece igual)

  return (
    <div className="publicar-evento-container">
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Seções do formulário permanecem iguais */}
        
        {/* Atualize o SetorManager para receber setores e setSetores */}
        <SetorManager setores={setores} setSetores={setSetores} />

        {/* Resto do formulário */}

        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? 'Enviando...' : '🚀 Publicar Evento'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
