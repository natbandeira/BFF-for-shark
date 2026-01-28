export class NcmClassificacaoService {

    async login(): Promise<string> {
        const response = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    email: process.env.API_USER,
                    password: process.env.API_PASS
                }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Falha ao logar na API: ${response.status} = ${errorBody}`);
        }

        const json = await response.json();
        return json.user.token as string;
    }

    async novoProcesso(token: string, descricao: string): Promise<string> {
        const response = await fetch(`${process.env.API_URL}/processes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorizer': token
            },
            body: JSON.stringify({
                "provider": "gpt",
                "model": "gpt-4o-mini",
                "annotation": "Testes realizados via BFF",
                "priority": "1",
                "descriptions": [descricao],
                "email": process.env.API_USER
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Falha ao criar processo na API: ${response.statusText}`);
        }

        const json = await response.json();
        return json.process_id as string;
    }

    async sleep(milissegundos: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milissegundos));
    }

    async checaStatus(token: string, processId: string): Promise<string[]> {
        const MAX_TENTATIVAS = 10;
        const INTERVALO_MS = 8000;

        let tentativas = 0;

        while (tentativas < MAX_TENTATIVAS) {
            const response = await fetch(`${process.env.API_URL}/processes?process_id=${processId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorizer': token
                }
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Erro na comunicação com a API: ${response.status} - ${errorBody}`);
            }

            const json = await response.json();
            
            const processo = json.results && json.results[0];

            if (!processo) {
                const errorBody = await response.text();
                throw new Error(`Processo não encontrado no retorno da API.- ${errorBody}`);
            }

            const statusGeral = processo.status;

            console.log(`Tentativa ${tentativas + 1}: Status atual é ${statusGeral}`);

            if (statusGeral === 'FINISHED') {                
                if (!processo.final_result) return [];                
                const listaResultados = JSON.parse(processo.final_result);
                return listaResultados.map((item: any) => ({
                    ncm: item.NCM || "" 
                }));
            }

            if (['FAILED', 'INVALID_FILE', 'ERROR'].includes(statusGeral)) {
                throw new Error(`O processo falhou com o status: ${statusGeral}`);
            }

            tentativas++;
            await this.sleep(INTERVALO_MS);
    }

        throw new Error('Timeout: O processo demorou demais para finalizar.');
}

    async obterNcmPorDescricao(descricao: string): Promise<string[]> {
        try {
            const token = await this.login();
            const processId = await this.novoProcesso(token, descricao);            
            const ncms = await this.checaStatus(token, processId);

            console.log('O processId é: ', processId);
            console.log('NCMs obtidos com sucesso:', ncms);
            return ncms;

        } catch (error) {
            console.error('Erro no fluxo principal do BFF:', error);
            throw error;
        }
    }
}