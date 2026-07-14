# Frontend

Aplicação React deste monorepo. Consome exclusivamente a API REST externa descrita em [`../contract/openapi.yaml`](../contract/openapi.yaml) — não há backend, mock ou dado local aqui. Veja o [README raiz](../README.md) para o contexto completo do desafio.

## Stack

React + Vite + TypeScript, React Router, Tailwind CSS, shadcn/ui, Lucide React, React Hook Form + Zod, Axios, TanStack Query.

## Rodando localmente

Pré-requisitos: Node.js 20+ e uma API rodando localmente (ou acessível via URL).

```bash
cd frontend
npm install
cp .env.example .env
# edite .env se sua API não estiver em http://localhost:3000
npm run dev
```

Acesse `http://localhost:5173`.

## Variáveis de ambiente

| Variável       | Descrição                                        | Padrão                  |
| -------------- | ------------------------------------------------ | ----------------------- |
| `VITE_API_URL` | URL base da API REST que o frontend vai consumir | `http://localhost:3000` |

`VITE_API_URL` é embutida no bundle em **build-time** (comportamento padrão do Vite) — ao buildar a imagem Docker, ela precisa ser passada como build-arg (veja abaixo), não como variável de ambiente do container em runtime.

## Rodando com Docker (somente o frontend)

```bash
cd frontend
docker build --build-arg VITE_API_URL=http://localhost:3000 -t frontend-challenge-web .
docker run -p 8080:80 frontend-challenge-web
```

Acesse `http://localhost:8080`. A chamada HTTP para a API acontece no navegador do usuário (não dentro do container) — aponte `VITE_API_URL` para um endereço acessível pelo navegador de quem for acessar a aplicação.

Para subir o frontend junto com o Swagger UI do contrato em um único comando, use o `docker-compose.yml` na raiz do repositório (veja o [README raiz](../README.md)).
