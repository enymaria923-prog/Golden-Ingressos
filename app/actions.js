// app/actions.js - VERSÃO COM DIAGNÓSTICO COMPLETO
'use server';

import { createClient } from '../utils/supabase/server'; 
import { revalidatePath } from 'next/cache'; 
import { redirect } from 'next/navigation'; 

export async function criarEvento(formData) {
  console.log('🔍 === FUNÇÃO criarEvento INICIADA ===');
  
  try {
    const supabase = createClient();
    console.log('✅ Supabase client criado');

    // 1. VERIFICAR USUÁRIO LOGADO
    console.log('🔍 Verificando usuário...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ Erro de autenticação:', userError);
      redirect('/login');
      return;
    }
    
    const user_id = userData.user.id;
    console.log('✅ Usuário logado:', user_id);

    // 2. EXTRAIR DADOS DO FORMULÁRIO
    console.log('🔍 Extraindo dados do formulário...');
    const nome = formData.get('nome');
    const capaFile = formData.get('capa');  
    const categoria = formData.get('categoria');
    const data = formData.get('data');
    const hora = formData.get('hora');
    const local = formData.get('local');
    const descricao = formData.get('descricao');
    
    console.log('📝 Dados básicos:', { nome, categoria, data, hora, local });

    // 3. EXTRAIR MÚLTIPLOS INGRESSOS
    console.log('🔍 Extraindo ingressos...');
    const quantidadeIngressos = parseInt(formData.get('quantidade_ingressos')) || 1;
    const ingressos = [];
    
    for (let i = 0; i < quantidadeIngressos; i++) {
      const tipo = formData.get(`ingresso_tipo_${i}`);
      const valor = formData.get(`ingresso_valor_${i}`);
      
      console.log(`🎫 Ingresso ${i}:`, { tipo, valor });
      
      if (tipo && valor) {
        ingressos.push({ tipo, valor });
      }
    }
    
    console.log('✅ Total de ingressos:', ingressos.length);

    // Verificar se temos pelo menos um ingresso
    if (ingressos.length === 0) {
      console.error('❌ Nenhum ingresso válido');
      return { error: 'É necessário adicionar pelo menos um tipo de ingresso.' };
    }

    let imagem_url = null;

    // 4. UPLOAD DA IMAGEM (se existir)
    if (capaFile && capaFile.size > 0) {
      console.log('🖼️ Iniciando upload da imagem...');
      try {
        const fileExtension = capaFile.name.split('.').pop();
        const fileName = `${user_id}_${Date.now()}.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagens_eventos') 
          .upload(fileName, capaFile, {
            cacheControl: '3600',
            upsert: false 
          });

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          return { error: 'Falha ao fazer upload da imagem: ' + uploadError.message };
        }

        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(fileName); 

        imagem_url = publicUrlData.publicUrl;
        console.log('✅ Imagem upload concluído:', imagem_url);
        
      } catch (e) {
        console.error('❌ Erro no upload:', e);
        return { error: 'Ocorreu uma exceção inesperada durante o upload.' };
      }
    } else {
      console.log('ℹ️ Nenhuma imagem fornecida');
    }
    
    // 5. INSERIR EVENTO
    console.log('💾 Inserindo evento no banco...');
    const { data: eventoInserido, error: insertError } = await supabase
      .from('eventos')
      .insert([
        {
          nome,
          imagem_url: imagem_url,  
          user_id: user_id,
          categoria,
          data,
          hora,
          local,
          descricao,
          preco: ingressos[0].valor, // Primeiro preço para compatibilidade
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir evento:', insertError);
      return { error: 'Falha ao publicar o evento: ' + insertError.message };
    }

    console.log('✅ Evento inserido com ID:', eventoInserido.id);

    // 6. INSERIR INGRESSOS
    console.log('💾 Inserindo ingressos no banco...');
    const ingressosParaInserir = ingressos.map(ingresso => ({
      evento_id: eventoInserido.id,
      tipo: ingresso.tipo,
      valor: ingresso.valor,
      user_id: user_id
    }));

    const { error: ingressosError } = await supabase
      .from('ingressos')
      .insert(ingressosParaInserir);

    if (ingressosError) {
      console.error('❌ Erro ao inserir ingressos:', ingressosError);
      // Continua mesmo com erro nos ingressos
    } else {
      console.log('✅ Ingressos inseridos com sucesso');
    }
    
    // 7. SUCESSO - REDIRECIONAR
    console.log('🎉 EVENTO CRIADO COM SUCESSO! Redirecionando...');
    revalidatePath('/');  
    redirect('/');
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO NA FUNÇÃO:', error);
    return { error: 'Erro interno do servidor: ' + error.message };
  }
}
