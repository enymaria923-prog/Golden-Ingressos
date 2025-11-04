import { supabase } from './client';

export async function getPendingEvents() {
  try {
    console.log('🔄 Buscando eventos pendentes...');
    
    const { data, error } = await supabase
      .from('eventos') // Certifique-se que esta tabela existe
      .select('*')
      .eq('status', 'pendente') // Ou a coluna que você usa para status
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return [];
    }

    console.log(`✅ ${data?.length || 0} eventos encontrados`);
    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return [];
  }
}

export async function updateEventStatus(eventId, status) {
  try {
    const { error } = await supabase
      .from('eventos')
      .update({ status })
      .eq('id', eventId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao atualizar:', error);
    return false;
  }
}
