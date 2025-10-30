// app/publicar-evento/SubmitFormClient.js - VERSÃO COM OPÇÃO DE CONTROLE
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitFormClient({ criarEvento, userEmail }) {
    const [ingressos, setIngressos] = useState([{ tipo: '', valor: '' }]);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [controleQuantidade, setControleQuantidade] = useState('porTipo'); // 'porTipo' ou 'total'
    const [quantidadeTotal, setQuantidadeTotal] = useState('');
    const router = useRouter();

    // Adicionar novo campo de ingresso
    const adicionarIngresso = () => {
        setIngressos([...ingressos, { tipo: '', valor: '' }]);
    };

    // Remover campo de ingresso
    const removerIngresso = (index) => {
        if (ingressos.length > 1) {
            const novosIngressos = ingressos.filter((_, i) => i !== index);
            setIngressos(novosIngressos);
        }
    };

    // Atualizar campo específico
    const atualizarIngresso = (index, campo, valor) => {
        const novosIngressos = [...ingressos];
        novosIngressos[index][campo] = valor;
        setIngressos(novosIngressos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🎯 FORMULÁRIO ENVIADO - Iniciando processo...');
        setEnviando(true);
        setMensagem('');

        try {
            const formData = new FormData(e.target);
            // Adicionar o modo de controle e a quantidade total ao formData
            formData.append('controleQuantidade', controleQuantidade);
            if (controleQuantidade === 'total') {
                formData.append('quantidadeTotal', quantidadeTotal);
            }
            
            console.log('📤 Chamando função criarEvento...');
            
            // Chamar a Server Action
            const resultado = await criarEvento(formData);
            
            if (resultado?.error) {
                console.error('❌ Erro da Server Action:', resultado.error);
                setMensagem('❌ ' + resultado.error);
                setTipoMensagem('erro');
            } else if (resultado?.success) {
                console.log('✅ Evento publicado com sucesso!');
                setMensagem('✅ ' + resultado.message);
                setTipoMensagem('sucesso');
                
                // Limpar formulário após sucesso
                e.target.reset();
                setIngressos([{ tipo: '', valor: '' }]);
                setQuantidadeTotal('');
                
                // Redirecionar para home após 2 segundos
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        } catch (error) {
            console.error('💥 Erro ao enviar formulário:', error);
            setMensagem('💥 Erro ao publicar evento: ' + error.message);
            setTipoMensagem('erro');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit}
            style={{ 
                maxWidth: '800px', 
                margin: '40px auto', 
                padding: '30px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                marginTop: '20px' 
            }}
        >
            {/* MENSAGEM DE STATUS */}
            {mensagem && (
                <div style={{
                    padding: '15px',
                    borderRadius: '5px',
                    backgroundColor: tipoMensagem === 'sucesso' ? '#d4edda' : '#f8d7da',
                    color: tipoMensagem === 'sucesso' ? '#155724' : '#721c24',
                    border: `1px solid ${tipoMensagem === 'sucesso' ? '#c3e6cb' : '#f5c6cb'}`,
                    fontWeight: 'bold'
                }}>
                    {mensagem}
                </div>
            )}

            <p style={{ margin: '0' }}>Logado como: {userEmail}</p>

            <label htmlFor="nome">Nome do Evento:</label>
            <input id="nome" name="nome" type="text" style={{ padding: '10px' }} required />

            <label htmlFor="capa">Capa do Evento (Imagem):</label>
            <input id="capa" name="capa" type="file" accept="image/*" style={{ padding: '10px' }} required />
            
            <label htmlFor="categoria">Categoria:</label>
            <select id="categoria" name="categoria" style={{ padding: '10px' }} required>
                <option value="">Selecione...</option>
                <option value="Show">Show</option>
                <option value="Teatro">Teatro</option>
                <option value="Standup">Stand-up</option>
                <option value="Congresso">Congresso</option>
                <option value="Outro">Outro</option>
            </select>
            
            <label htmlFor="data">Data:</label>
            <input id="data" name="data" type="date" style={{ padding: '10px' }} required />
            
            <label htmlFor="hora">Hora:</label>
            <input id="hora" name="hora" type="time" style={{ padding: '10px' }} required />
            
            <label htmlFor="local">Local (Endereço completo):</label>
            <input id="local" name="local" type="text" style={{ padding: '10px' }} required />
            
            {/* CONTROLE DE QUANTIDADE */}
            <div>
                <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>
                    Como deseja controlar os ingressos?
                </label>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            value="porTipo"
                            checked={controleQuantidade === 'porTipo'}
                            onChange={(e) => setControleQuantidade(e.target.value)}
                        />
                        Controlar quantidade por tipo de ingresso
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            value="total"
                            checked={controleQuantidade === 'total'}
                            onChange={(e) => setControleQuantidade(e.target.value)}
                        />
                        Controlar quantidade total do evento
                    </label>
                </div>

                {controleQuantidade === 'total' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="quantidadeTotal" style={{ fontSize: '0.9em' }}>
                            Quantidade Total de Ingressos:
                        </label>
                        <input
                            id="quantidadeTotal"
                            name="quantidadeTotal"
                            type="number"
                            placeholder="Ex: 100"
                            min="1"
                            value={quantidadeTotal}
                            onChange={(e) => setQuantidadeTotal(e.target.value)}
                            style={{ padding: '10px', width: '100%' }}
                            required={controleQuantidade === 'total'}
                        />
                    </div>
                )}
            </div>
            
            {/* SEÇÃO DE MÚLTIPLOS INGRESSOS */}
            <div>
                <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>
                    Tipos de Ingresso{controleQuantidade === 'porTipo' ? ' e Quantidades' : ''}:
                </label>
                
                {ingressos.map((ingresso, index) => (
                    <div key={index} style={{ 
                        display: 'grid',
                        gridTemplateColumns: controleQuantidade === 'porTipo' ? '1fr 1fr 1fr auto' : '1fr 1fr auto',
                        gap: '10px', 
                        alignItems: 'end', 
                        marginBottom: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '5px'
                    }}>
                        <div>
                            <label htmlFor={`tipo-${index}`} style={{ fontSize: '0.9em' }}>
                                Tipo:
                            </label>
                            <input
                                id={`tipo-${index}`}
                                name={`ingresso_tipo_${index}`}
                                type="text"
                                placeholder="Ex: Inteira"
                                value={ingresso.tipo}
                                onChange={(e) => atualizarIngresso(index, 'tipo', e.target.value)}
                                style={{ padding: '10px', width: '100%' }}
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor={`valor-${index}`} style={{ fontSize: '0.9em' }}>
                                Valor (R$):
                            </label>
                            <input
                                id={`valor-${index}`}
                                name={`ingresso_valor_${index}`}
                                type="text"
                                placeholder="Ex: 80,00"
                                value={ingresso.valor}
                                onChange={(e) => atualizarIngresso(index, 'valor', e.target.value)}
                                style={{ padding: '10px', width: '100%' }}
                                required
                            />
                        </div>

                        {controleQuantidade === 'porTipo' && (
                            <div>
                                <label htmlFor={`quantidade-${index}`} style={{ fontSize: '0.9em' }}>
                                    Quantidade:
                                </label>
                                <input
                                    id={`quantidade-${index}`}
                                    name={`ingresso_quantidade_${index}`}
                                    type="number"
                                    placeholder="Ex: 100"
                                    min="1"
                                    value={ingresso.quantidade}
                                    onChange={(e) => atualizarIngresso(index, 'quantidade', e.target.value)}
                                    style={{ padding: '10px', width: '100%' }}
                                    required={controleQuantidade === 'porTipo'}
                                />
                            </div>
                        )}
                        
                        {ingressos.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removerIngresso(index)}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    height: 'fit-content'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                
                <button 
                    type="button"
                    onClick={adicionarIngresso}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}
                >
                    + Adicionar outro tipo de ingresso
                </button>
            </div>

            <input type="hidden" name="quantidade_ingressos" value={ingressos.length} />
            
            <label htmlFor="descricao">Descrição do Evento:</label>
            <textarea id="descricao" name="descricao" rows="5" style={{ padding: '10px' }}></textarea>

            {/* BOTÃO FINAL */}
            <button 
                type="submit"
                disabled={enviando}
                style={{ 
                    backgroundColor: enviando ? '#cccccc' : '#f1c40f', 
                    color: 'black', 
                    padding: '15px', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    fontSize: '16px',
                    display: 'block', 
                    width: '100%',
                    cursor: enviando ? 'not-allowed' : 'pointer'
                }}
            >
                {enviando ? 'Publicando...' : 'Publicar Evento'}
            </button>
        </form>
    );
}
