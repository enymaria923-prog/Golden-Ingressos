const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Você precisa dessa chave no .env
);

async function migrarEventosParaSessoes() {
  try {
    console.log('🚀 Iniciando migração...');

    // Buscar todos os eventos
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*');

    if (eventosError) throw eventosError;

    console.log(`📋 Encontrados ${eventos.length} eventos`);

    for (const evento of eventos) {
      console.log(`\n📍 Migrando evento: ${evento.nome}`);

      // Verificar se já existe sessão para este evento
      const { data: sessaoExistente } = await supabase
        .from('sessoes')
        .select('id')
        .eq('evento_id', evento.id)
        .eq('is_original', true)
        .single();

      if (sessaoExistente) {
        console.log(`  ⏭️  Sessão original já existe, pulando...`);
        continue;
      }

      // Criar sessão original
      const { data: sessao, error: sessaoError } = await supabase
        .from('sessoes')
        .insert({
          evento_id: evento.id,
          data: evento.data,
          hora: evento.hora,
          numero: 1,
          is_original: true
        })
        .select()
        .single();

      if (sessaoError) {
        console.error(`❌ Erro ao criar sessão para evento ${evento.nome}:`, sessaoError);
        continue;
      }

      console.log(`✅ Sessão original criada: ${sessao.id}`);

      // Atualizar setores que ainda não têm sessao_id
      const { error: setoresError } = await supabase
        .from('setores')
        .update({ sessao_id: sessao.id })
        .eq('eventos_id', evento.id)
        .is('sessao_id', null);

      if (setoresError) console.error('❌ Erro ao atualizar setores:', setoresError);
      else console.log('  ✅ Setores vinculados à sessão');

      // Atualizar ingressos
      const { error: ingressosError } = await supabase
        .from('ingressos')
        .update({ sessao_id: sessao.id })
        .eq('evento_id', evento.id)
        .is('sessao_id', null);

      if (ingressosError) console.error('❌ Erro ao atualizar ingressos:', ingressosError);
      else console.log('  ✅ Ingressos vinculados à sessão');

      // Atualizar lotes
      const { error: lotesError } = await supabase
        .from('lotes')
        .update({ sessao_id: sessao.id })
        .eq('evento_id', evento.id)
        .is('sessao_id', null);

      if (lotesError) console.error('❌ Erro ao atualizar lotes:', lotesError);
      else console.log('  ✅ Lotes vinculados à sessão');

      // Atualizar cupons
      const { error: cuponsError } = await supabase
        .from('cupons')
        .update({ sessao_id: sessao.id })
        .eq('evento_id', evento.id)
        .is('sessao_id', null);

      if (cuponsError) console.error('❌ Erro ao atualizar cupons:', cuponsError);
      else console.log('  ✅ Cupons vinculados à sessão');
    }

    console.log('\n🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('💥 Erro fatal na migração:', error);
  }
}

migrarEventosParaSessoes();
