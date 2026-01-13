# Jogo Termo - Word Game

Um jogo de palavras similar ao Termo (https://term.ooo/), desenvolvido com React, TypeScript, Tailwind CSS e integração com OpenAI.

## Funcionalidades

- 🎮 Jogo de palavras com 6 tentativas
- 🤖 Palavras geradas pela OpenAI
- 💡 5 dicas fornecidas pela IA (a partir do segundo erro)
- 📊 Sistema de pontuação e ranking
- 💾 Banco de dados SQLite para armazenar usuários e pontuações
- 🎨 Interface moderna com Tailwind CSS

## Tecnologias

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- Vite

### Backend
- Node.js
- Express
- SQLite (better-sqlite3) - SQL puro
- OpenAI API

## Instalação

### Backend

1. Navegue até a pasta Backend:
```bash
cd Backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na pasta Backend com sua chave da OpenAI:
```env
OPENAI_API_KEY=sua_chave_aqui
PORT=3001
```

4. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

1. Navegue até a pasta Frontend:
```bash
cd Frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173` (ou outra porta se 5173 estiver ocupada)

## Como Jogar

1. Digite seu nome de usuário
2. Uma palavra de 5 letras será gerada pela OpenAI
3. Tente adivinhar a palavra em até 6 tentativas
4. As cores indicam:
   - 🟢 Verde: Letra correta na posição correta
   - 🟡 Amarelo: Letra está na palavra mas em posição errada
   - ⚫ Cinza: Letra não está na palavra
5. A partir da segunda tentativa errada, você receberá dicas da IA
6. Ganhe pontos ao acertar a palavra!

## Estrutura do Banco de Dados

O banco de dados SQLite contém duas tabelas:

### users
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `points` (INTEGER)
- `created_at` (DATETIME)

### games
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER)
- `word` (TEXT)
- `won` (INTEGER)
- `attempts` (INTEGER)
- `created_at` (DATETIME)

## API Endpoints

- `POST /api/user` - Criar ou obter usuário
- `POST /api/game/start` - Iniciar novo jogo
- `POST /api/game/guess` - Fazer tentativa
- `GET /api/user/:userId/points` - Obter pontuação do usuário
- `GET /api/ranking` - Obter ranking (top 10)

## Pontuação

- 1ª tentativa: 100 pontos
- 2ª tentativa: 85 pontos
- 3ª tentativa: 70 pontos
- 4ª tentativa: 55 pontos
- 5ª tentativa: 40 pontos
- 6ª tentativa: 25 pontos

## Notas

- As palavras são geradas pela OpenAI e podem ter acentos (que são removidos automaticamente)
- As dicas são geradas pela OpenAI e ajudam a encontrar a palavra
- O sistema suporta palavras com letras repetidas
- Acentos são preenchidos automaticamente e não são considerados nas dicas
