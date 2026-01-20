
# Torneio do Lerner 2.0 (lerners-tournament)

Bem-vindo à evolução do sistema de gestão para noites de jogos. Esta aplicação web foi desenvolvida para substituir a versão antiga em Python, trazendo uma interface moderna, responsiva e integrada com inteligência artificial para tornar o Torneio do Lerner ainda mais épico.

## 🚀 Principais Recursos

- **Dashboard Realtime**: Acompanhamento instantâneo do ranking conforme as partidas são registradas.
- **Narrador AI (Lerner Bot)**: Integrado ao Google Gemini, o narrador analisa o ranking e solta comentários sarcásticos ou encorajadores sobre o desempenho dos jogadores.
- **Histórico de 2025**: Acesse os dados do torneio do ano passado para manter viva a competitividade.
- **Gestão de Jogadores**: Upload de avatares personalizados e controle total de estatísticas.
- **Otimizado para Celular**: Ideal para ser usado na mesa de jogo sem complicações.

## 🛠️ Conexões e Configuração

Para hospedar e rodar o seu próprio torneio, você precisará configurar as seguintes plataformas:

### 1. GitHub (Projeto: `lerners-tournament`)
- Repositório para versionamento do código.
- Conecte este repositório à Vercel para deploy automático.

### 2. Supabase (Projeto: `torneio-do-lerner`)
Backend em nuvem para armazenamento dos dados.
- **Database**: Crie as tabelas `players` (jogadores) e `matches` (partidas).
- **Políticas (RLS)**: Certifique-se de que a tabela permite acesso `INSERT`, `UPDATE` e `DELETE` para a role `anon` (ou configure autenticação se preferir).
- **Campos Importantes**: A coluna `edition_id` separa os dados de `2025` e `2026`.

### 3. Vercel
Hospedagem gratuita da aplicação.
- **Variáveis de Ambiente**:
    - `API_KEY`: Sua chave de API do Google Gemini (necessária para o Lerner Bot).
    - `SUPABASE_URL`: Endpoint do seu projeto no Supabase.
    - `SUPABASE_KEY`: Chave pública do Supabase.

## 🎲 Regras de Pontuação Atualizadas

- **King of Tokyo (6 a 8 jogadores)**:
    - 8 jogadores: 1º (100 pts), 2º (50 pts), 3º (33 pts).
    - 7 jogadores: 1º (90 pts), 2º (45 pts), 3º (30 pts).
    - 6 jogadores: 1º (80 pts), 2º (40 pts), 3º (26 pts).
    *Cálculo: 2º lugar recebe metade do 1º; 3º lugar recebe um terço, arredondado para baixo.*

- **Quartz & Paper Town**:
    - 4 jogadores: 1º (50 pts), 2º (25 pts), 3º (13 pts).
    - 3 jogadores: 1º (40 pts), 2º (20 pts), 3º (0 pts).

## 🔒 Acesso de Administrador
O painel de configuração (`Config`) exige senha para evitar alterações indesejadas.
- **Senha Padrão**: `lerner2026`

---
*Que os dados rolem a seu favor e que vença o maior mestre de tabuleiro!*
