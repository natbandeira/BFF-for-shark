const apiUrl: string = 'https://api-shark.serb-mg.com.br';

async function login(email: string, password: string): Promise<string> {
    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
    }

    let json = await response.json();
    let token = json.user.token;

    return token;
}