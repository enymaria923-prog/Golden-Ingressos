import supabase from './client';

export async function getPendingEvents() {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado:', error);
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
