export class NcmClassificacaoService {

    async login(): Promise<string> {
        const response = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    email: process.env.API_USER,
                    password: process.env.API_PASS
                }),
        });

        if (!response.ok) {
            throw new Error(`Falha ao logar na API: ${response.statusText}`);
        }

        let json = await response.json();
        let token = json.user.token;

        return token;
    }

    async novoProcesso(token: string, descricao: string): Promise<string> {
        const response = await fetch(`${process.env.API_URL}/processes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Authorizer ${token}`
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
            throw new Error(`Falha ao criar processo na API: ${response.statusText}`);
        }

        let json = await response.json();
        let processId = json.id;

        return processId;
    }

    async sleep(milissegundos: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milissegundos));
    }

    async checaStatus(token: string, processId: string): Promise<string> {

        const MAX_TENTATIVAS = 10;
        const INTERVALO_MS = 6000; 

        let tentativas = 0;
        let statusProcesso = '';

        while (tentativas < MAX_TENTATIVAS) {
            const response = await fetch(`${process.env.API_URL}/processes?process_id=${processId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Authorizer ${token}`
            }
          }
       );

       if(!response.ok) {
            throw new Error (`Falha ao checar status do processo: ${response.statusText}`);
       } 

        const json = await response.json();
        statusProcesso = json.results.status;

        if (statusProcesso === 'FINISHED' || statusProcesso === 'FAILED') {
            return statusProcesso;
        }

        tentativas++;
        await this.sleep(INTERVALO_MS);
        }
    
        throw new Error('Timeout: processo não finalizou dentro do tempo esperado');
    }

    async obterNcmPorDescricao(descricao: string): Promise<number> {

        const STATUS_FINAIS = ['FINISHED', 'FAILED', 'INVALID_FILE', 'ERROR']

        try {
            const token = await this.login();
            const processId = await this.novoProcesso(token, descricao);
            const status = await this.checaStatus(token, processId);

            if (status === 'FINISHED') {
                console.log('Processo finalizado com sucesso.');
                return 0;
            } else {
                console.error('Processo falhou.');
                return 2;
            }
        } catch (error) {
            console.error('Erro ao obter NCM por descrição:', error);
            throw error;
        }
    }
}