'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';

export default function EditarEventoAdmin() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;

  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    carregarEvento();
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (error) throw error;

      setEvento(data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      alert('Erro ao carregar evento!');
      router.push('/admin/bokunohero');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvento(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('eventos')
        .update({
          nome: evento.nome,
          descricao: evento.descricao,
          data: evento.data,
          hora: evento.hora,
          local: evento.local,
          endereco: evento.endereco,
          categoria: evento.categoria,
          status: evento.status,
          TaxaCliente: parseFloat(evento.TaxaCliente) || 0,
          TaxaProdutor: parseFloat(evento.TaxaProdutor) || 0
        })
        .eq('id', eventoId);

      if (error) throw error;

      alert('✅ Evento atualizado com sucesso!');
      router.push('/admin/bokunohero');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>⚠️ Evento não encontrado</h2>
        <button onClick={() => router.push('/admin/bokunohero')}>Voltar</button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ 
        marginBottom: '30px',
        color: '#5d34a4'
      }}>
        ✏️ Editar Evento
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          
          {/* NOME */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Nome do Evento *
            </label>
            <input
              type="text"
              name="nome"
              value={evento.nome || ''}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* DESCRIÇÃO */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Descrição
            </label>
            <textarea
              name="descricao"
              value={evento.descricao || ''}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* DATA E HORA */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: 'bold' 
              }}>
                Data *
              </label>
              <input
                type="date"
                name="data"
                value={evento.data || ''}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: 'bold' 
              }}>
                Horário *
              </label>
              <input
                type="time"
                name="hora"
                value={evento.hora || ''}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* LOCAL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Local *
            </label>
            <input
              type="text"
              name="local"
              value={evento.local || ''}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* ENDEREÇO */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={evento.endereco || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* CATEGORIA */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Categoria
            </label>
            <input
              type="text"
              name="categoria"
              value={evento.categoria || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* STATUS */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Status *
            </label>
            <select
              name="status"
              value={evento.status || 'pendente'}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>

          {/* TAXAS */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: 'bold' 
              }}>
                Taxa Cliente (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="TaxaCliente"
                value={evento.TaxaCliente || 0}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: 'bold' 
              }}>
                Taxa Produtor (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="TaxaProdutor"
                value={evento.TaxaProdutor || 0}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

        </div>

        {/* BOTÕES */}
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={() => router.push('/admin/bokunohero')}
            style={{
              padding: '12px 30px',
              background: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 30px',
              background: isSubmitting ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '⏳ Salvando...' : '✅ Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
