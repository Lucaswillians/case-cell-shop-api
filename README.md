# Case Cell Shop API

API backend do projeto Case Cell Shop.

---

## 🚀 Como rodar o projeto

### 1. Instalar dependências

```bash
npm install
```

---

### 2. Subir o banco de dados (PostgreSQL)

```bash
docker compose up -d
```

---

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=admin
DB_PASSWORD=admin
DB_NAME=casecell
```

---

### 4. Rodar a aplicação

```bash
npm run start:dev
```

---

## 🧪 Rodar testes

```bash
npm run test
```

---

## 📦 Insomnia (opcional)

O projeto inclui uma collection do Insomnia para testes da API:

```txt
/insomnia/case-cell-shop.yaml
```

Importe no Insomnia para acessar todas as rotas prontas.

---

## 📌 Observação

Certifique-se de que o Docker está rodando antes de iniciar a aplicação.
