# Deploy self-hosted (Docker)

O app é servido por Node (Nitro `node-server`) e conversa com o seu PocketBase pela rede local.

## 1. Defina o endereço do PocketBase

O valor é embutido no build, então precisa estar disponível na hora do `docker compose build`.
Crie um arquivo `.env` ao lado do `docker-compose.yml`:

```sh
VITE_POCKETBASE_URL=http://192.168.0.10:8090
```

Use o IP do servidor na sua rede (não `127.0.0.1`, senão o navegador dos outros dispositivos não acha o PocketBase).

## 2. Suba o container

```sh
docker compose up -d --build
```

## 3. Acesse

```
http://SEU_IP:3080
```

Para atualizar após mudar o código ou o IP do PocketBase: `docker compose up -d --build`.
