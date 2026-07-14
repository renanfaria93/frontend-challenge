# Contrato de API

Este diretório contém a especificação formal da API que você deve implementar para o desafio.

- [`openapi.yaml.template`](./openapi.yaml.template) — especificação OpenAPI 3.0 completa (schemas, exemplos de request/response, códigos de status). É a fonte da verdade: qualquer divergência entre este README (ou o README raiz) e o `openapi.yaml.template` deve ser resolvida a favor dele. O único trecho dinâmico é `servers.url`, que usa o placeholder `${CONTRACT_API_URL}` (ver seção abaixo).
- [`index.html`](./index.html) — Swagger UI estático que lê `./openapi.yaml`, para consulta interativa sem precisar de build.

## Como visualizar interativamente

A forma recomendada é via Docker, que já resolve o placeholder e serve tudo pronto:

```bash
docker compose up --build api-contract
```

Depois abra `http://localhost:4000` no navegador (veja o [README raiz](../README.md) para detalhes de configuração).

Para rodar sem Docker (ex. `npx serve`), gere antes um `openapi.yaml` a partir do template substituindo o placeholder (requer `gettext`/`envsubst`):

```bash
CONTRACT_API_URL=http://localhost:5000 envsubst < openapi.yaml.template > openapi.yaml
npx serve . -l 4000
```

## URL da API no Swagger UI

O campo `servers.url` (usado pelo Swagger UI para montar as chamadas de "Try it out") vem do placeholder `${CONTRACT_API_URL}` em `openapi.yaml.template`. Ao rodar via Docker, a própria imagem `nginx:alpine` resolve esse placeholder em runtime usando seu mecanismo nativo de templating (`envsubst` sobre arquivos `*.template`, configurado no `Dockerfile`) — não há script de entrypoint customizado. O default, se `CONTRACT_API_URL` não for definida, é `http://localhost:5000`.

## Como consumir

Qualquer ferramenta que leia OpenAPI 3.0 funciona com o `openapi.yaml` gerado — por exemplo, para gerar código cliente, importar em Postman/Insomnia, ou validar sua implementação de backend contra o contrato.
