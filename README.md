# BFF – Shark

Este projeto é um serviço **Backend For Frontend (BFF)** desenvolvido com **Node.js**, **TypeScript** e **Express**.  
Seu objetivo principal é atuar como intermediário entre o cliente e o serviço externo de **classificação de NCM (Nomenclatura Comum do Mercosul)**, sendo responsável por gerenciar a autenticação, a criação de processos e a consulta do status da classificação.

---

## Endpoints

### `POST /ncm-classificacao`

Envia a descrição de um produto para obter a classificação NCM correspondente.

#### Corpo da Requisição

```json
{
  "descricao": "Descrição do produto aqui"
}
```

## Fluxo Interno

1. Realiza a autenticação na API externa.
2. Cria um novo processo de classificação.
3. Executa polling (consultas periódicas) até que o status do processo seja `FINISHED`.
4. Retorna a lista de NCMs encontrados.

## Tecnologias Utilizadas

- Node.js
- Express
- TypeScript

