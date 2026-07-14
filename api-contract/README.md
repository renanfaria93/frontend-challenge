# Contrato de API

Este diretório contém a especificação formal da API que você deve implementar para o desafio.

- [`openapi.yaml`](./openapi.yaml) — especificação OpenAPI 3.0 completa (schemas, exemplos de request/response, códigos de status). É a fonte da verdade: qualquer divergência entre este README (ou o README raiz) e o `openapi.yaml` deve ser resolvida a favor do `openapi.yaml`.
- [`index.html`](./index.html) — Swagger UI estático que lê o `openapi.yaml` local, para consulta interativa sem precisar de build.

## Como visualizar interativamente

Abrir `index.html` diretamente como arquivo (`file://`) pode falhar ao carregar o `openapi.yaml` por restrição de CORS do navegador em arquivos locais. Sirva o diretório com qualquer servidor estático, por exemplo:

```bash
npx serve api-contract -l 4000
```

Depois abra `http://localhost:4000` no navegador.

## Como consumir

Qualquer ferramenta que leia OpenAPI 3.0 funciona com `openapi.yaml` — por exemplo, para gerar código cliente, importar em Postman/Insomnia, ou validar sua implementação de backend contra o contrato.
