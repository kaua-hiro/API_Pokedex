# Pokédex - Todas as Gerações

## 📋 Descrição do Projeto

Uma Pokédex web interativa que exibe Pokémon de todas as 9 gerações (Kanto a Paldea), consumindo dados em tempo real da [PokeAPI](https://pokeapi.co/). Construída com HTML, CSS e JavaScript puro (ES Modules), sem dependências externas. A interface tem um tema espacial/galáxia, com cards responsivos, scroll infinito, busca global, filtros por tipo/geração e modo claro/escuro.

## ✨ Funcionalidades Principais

- **Scroll Infinito**: carrega os Pokémon em lotes conforme o usuário rola a página.
- **Busca Global**: busca por nome em qualquer geração, mesmo fora do filtro atual.
- **Filtragem por Geração e Tipo**: navegue por geração (Kanto a Paldea) e por tipo (Fogo, Água, Grama, etc.).
- **Modal de Detalhes**: imagem ampliada, estatísticas (HP, Ataque, Defesa, Ataque/Defesa Especial, Velocidade) com barras visuais, altura, peso e habilidades.
- **Modo Claro/Escuro**: alternância de tema persistida em `localStorage`, com detecção da preferência do sistema operacional.
- **Estados de Carregamento e Erro**: skeleton loaders durante o carregamento e mensagens de erro com botão de "tentar novamente".
- **Acessibilidade**: navegação por teclado nos cards e modal (Enter/Espaço/Esc), `aria-live` no grid de resultados, labels e `aria-label` nos controles.
- **Design Responsivo**: adaptado para mobile, tablet e desktop.

## 🛠️ Tecnologias Utilizadas

- **HTML5** semântico, com metatags de SEO/Open Graph e favicon inline (SVG).
- **CSS3**: Grid responsivo, variáveis para os temas claro/escuro, animações e `prefers-reduced-motion`.
- **JavaScript (ES Modules)**: sem build step, sem dependências. Módulos separados por responsabilidade:
  - `js/api.js` — chamadas à PokeAPI e tratamento de erros de rede.
  - `js/state.js` — estado global da aplicação (lista atual, paginação, flags de loading).
  - `js/ui.js` — criação e atualização dos elementos de interface (cards, modal, loaders, tema).
  - `js/main.js` — orquestração: eventos, filtros, scroll infinito e busca.
  - `js/constants.js` — configuração de gerações e paginação.

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Um navegador web moderno (Chrome, Firefox, Edge, etc.)
- Conexão com a internet (necessária para acessar a PokeAPI)

### Passos para Execução
1. Clone o repositório:
   ```bash
   git clone https://github.com/kaua-hiro/API_Pokedex.git
   ```
2. Navegue até a pasta do projeto:
   ```bash
   cd API_Pokedex
   ```
3. Abra o arquivo `index.html` em seu navegador (recomendado usar um servidor local, já que o projeto usa ES Modules):
   - Extensão **Live Server** do VS Code, ou
   - `npx http-server .`, ou
   - `python -m http.server`

**Observação**: como o projeto consome uma API externa (PokeAPI), é necessário ter conexão com a internet para que funcione corretamente.

## 📁 Estrutura de Arquivos

```
API_Pokedex/
│
├── index.html          # Estrutura HTML principal e elementos da interface
├── 404.html             # Página de erro 404 personalizada
├── styles.css           # Estilos, animações, temas e responsividade
├── js/
│   ├── api.js           # Consumo da PokeAPI
│   ├── constants.js      # Gerações e configuração de paginação
│   ├── state.js          # Estado global da aplicação
│   ├── ui.js             # Renderização de UI (cards, modal, loaders, tema)
│   └── main.js           # Orquestração de eventos e fluxo da aplicação
├── LICENSE
└── README.md
```

## 🔍 Possíveis Melhorias Futuras

1. **Favoritos**: sistema para marcar Pokémon como favoritos usando `localStorage`.
2. **Comparação**: funcionalidade para comparar estatísticas entre diferentes Pokémon.
3. **Cadeia Evolutiva**: exibir a linha de evolução no modal de detalhes.
4. **Testes automatizados**: cobertura de testes unitários para `api.js` e `state.js`.
5. **Cache local**: reduzir chamadas repetidas à PokeAPI com cache em `localStorage`/IndexedDB.

## 🔗 Créditos e Fontes

- **Dados dos Pokémon**: [PokeAPI](https://pokeapi.co/)
- **Sprites da página 404**: [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
- **Inspiração de Design**: Pokédex oficial dos jogos Pokémon

## 📄 Licença

Distribuído sob a licença MIT. Veja [LICENSE](./LICENSE) para mais detalhes.

---

Desenvolvido por Kauã Hiro Mizumoto
