class IniciaNovaClassificação {

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
}