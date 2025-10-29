// app/publicar-evento/SubmitFormClient.js
'use client';

// Este componente é o formulário, forçando a interatividade no cliente.
export default function SubmitFormClient({ criarEvento, userEmail }) {
    
    // O hook useFormStatus faz o botão ficar desabilitado enquanto a ação é processada.
    // Isso é a MELHOR prática e é o que garante que o botão responda.
    // Se o seu Next.js for mais antigo, pode dar erro; se der, APAGUE estas duas linhas:
    // import { useFormStatus } from 'react-dom';
    // const { pending } = useFormStatus();
    
    // Por enquanto, vamos manter o código o mais limpo possível.

    return (
        <form 
            action={criarEvento} 
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
            
            <label htmlFor="preco">Preço (Ex: 50,00 ou "Gratuito"):</label>
            <input id="preco" name="preco" type="text" style={{ padding: '10px' }} required />
            
            <label htmlFor="descricao">Descrição do Evento:</label>
            <textarea id="descricao" name="descricao" rows="5" style={{ padding: '10px' }}></textarea>

            {/* BOTÃO FINAL (Mantemos a força de estilo) */}
            <button 
                type="submit"
                // disabled={pending} // Remover se der erro de pending
                style={{ 
                    backgroundColor: '#f1c40f', 
                    color: 'black', 
                    padding: '15px', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    fontSize: '16px',
                    display: 'block', 
                    width: '100%',
                    cursor: 'pointer', // Garantir que o ponteiro funcione
                    position: 'relative',
                    zIndex: 999 
                }}
            >
                Publicar Evento
            </button>

        </form>
    );
}
