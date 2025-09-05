# Pokédex - 1ª Geração

![Pokédex Preview](https://github.com/kaua-hiro/API_Pokedex/issues/1#issue-3069681761)

## 📋 Descrição do Projeto

A Pokédex da 1ª Geração é uma aplicação web interativa que exibe informações sobre os 151 Pokémon originais. O projeto foi desenvolvido com HTML, CSS e JavaScript puro, consumindo dados da [PokeAPI](https://pokeapi.co/). A interface apresenta um design moderno com tema espacial/galáxia, onde os cards dos Pokémon são exibidos em um formato de grade responsiva.

O objetivo principal da aplicação é proporcionar uma experiência nostálgica para fãs da série Pokémon, permitindo a visualização e filtragem dos monstrinhos da região de Kanto.

## ✨ Funcionalidades Principais

- **Listagem Completa**: Exibe todos os 151 Pokémon da primeira geração em cards individuais.
- **Sistema de Busca**: Permite buscar Pokémon por nome ou número na Pokédx.
- **Filtragem por Tipo**: Possibilita filtrar os Pokémon por seus tipos (Fogo, Água, Grama, etc.).
- **Modal de Detalhes do Pokémon**: Ao clicar em um card, abre uma janela modal com informações detalhadas do Pokémon, incluindo:
  - Imagem em tamanho maior
  - Estatísticas completas (HP, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade)
  - Barras de progresso visuais para cada estatística
  - Informações adicionais como altura, peso e habilidades
- **Cards Interativos**: Cada card exibe informações básicas e é clicável para visualizar detalhes:
  - Imagem do Pokémon
  - Número da Pokédex (formatado com três dígitos)
  - Nome do Pokémon
  - Tipo(s) do Pokémon com cores correspondentes
- **Animações**: Interface com animações de hover nos cards e um fundo de galáxia animado.
- **Design Responsivo**: Adaptação para diferentes tamanhos de tela, desde dispositivos móveis até desktops.

## 🛠️ Tecnologias Utilizadas

### HTML
- Estruturação semântica com tags como `<header>`, `<main>` e `<footer>`
- Formulários para busca e filtros
- Estrutura base para exibição dinâmica de conteúdo via JavaScript
- Modal para exibição de detalhes dos Pokémon

### CSS
- Layout responsivo com CSS Grid para organização dos cards
- Animações e transições para melhorar a experiência do usuário
- Efeitos visuais como fundo com tema espacial e estrelas animadas
- Media queries para responsividade em diferentes dispositivos
- Esquema de cores definido para cada tipo de Pokémon
- Estilização moderna com sombras, bordas arredondadas e efeitos de hover
- Estilização do modal com overlay e animações de abertura/fechamento

### JavaScript
- Consumo da API REST (PokeAPI) via Fetch API
- Manipulação dinâmica do DOM para criar e atualizar os cards
- Implementação de funcionalidades de busca e filtragem
- Tratamento assíncrono de dados com async/await
- Eventos para interatividade do usuário
- Sistema de modais para exibição de detalhes dos Pokémon
- Renderização de barras de progresso para estatísticas

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Um navegador web moderno (Chrome, Firefox, Edge, etc.)
- Conexão com a internet (necessária para acessar a PokeAPI)

### Passos para Execução
1. Clone o repositório:
   ```bash
   git clone https://github.com/kaua-hiro/API_Pokedex
   ```
2. Navegue até a pasta do projeto:
   ```bash
   cd pokedex-primeira-geracao
   ```
3. Abra o arquivo `index.html` em seu navegador:
   - Duplo clique no arquivo, ou
   - Arraste o arquivo para uma janela do navegador aberta, ou
   - Utilize um servidor local como Live Server (extensão do VS Code) ou http-server (Node.js)

**Observação**: Como o projeto consome uma API externa (PokeAPI), é necessário ter conexão com a internet para que funcione corretamente.

## 📁 Estrutura de Arquivos

```
pokedex-primeira-geracao/
│
├── index.html         # Estrutura HTML principal e elementos da interface
├── styles.css         # Estilos CSS, animações e responsividade
├── script.js          # Lógica JavaScript, consumo da API e interatividade
└── README.md          # Documentação do projeto
```

### Detalhamento dos Arquivos:

- **index.html**: Contém a estrutura básica da aplicação, incluindo o cabeçalho com título, campo de busca, seletor de filtro por tipo, container da Pokédex, modal de detalhes e rodapé.

- **styles.css**: Implementa todos os estilos visuais da aplicação, incluindo o tema espacial de fundo, animações de estrelas, cards dos Pokémon, esquema de cores para os tipos, modal de detalhes com barras de progresso e responsividade.

- **script.js**: Responsável pela lógica de programação, incluindo o consumo da PokeAPI, criação dinâmica dos cards dos Pokémon, implementação dos filtros de busca e por tipo, além do sistema de modais com informações detalhadas.

## 🎨 Design e Responsividade

### Layout
- Design moderno com tema espacial/galáxia como plano de fundo
- Cards com visual clean e informativo
- Modal elegante para exibição de detalhes com barras de progresso animadas
- Esquema de cores baseado nos tipos oficiais dos Pokémon
- Interface intuitiva com busca e filtros de fácil acesso

### Responsividade
- Layout adaptável que se ajusta a diferentes tamanhos de tela:
  - Desktop: Grid com múltiplas colunas e modal centralizado
  - Tablet: Redução no número de colunas e ajuste do modal
  - Mobile: Cards menores, menos colunas e modal responsivo para melhor visualização

### Animações
- Efeito de elevação nos cards quando o mouse passa por cima
- Fundo de galáxia com estrelas em movimento
- Transições suaves nos elementos interativos
- Animações de abertura e fechamento do modal
- Barras de progresso animadas para as estatísticas

## 🔍 Possíveis Melhorias

1. **Paginação**: Adicionar sistema de paginação para melhorar o desempenho em conexões mais lentas.

2. **Modo Escuro/Claro**: Implementar alternância entre tema escuro (atual) e claro.

3. **Filtros Avançados**: Adicionar filtros por outras características como peso, altura, estatísticas, etc.

4. **Animações de Carregamento**: Implementar animações de loading enquanto os dados são carregados.

5. **Gerações Adicionais**: Expandir o projeto para incluir outras gerações de Pokémon.

6. **Favoritos**: Sistema para marcar Pokémon como favoritos (utilizando localStorage).

7. **Comparação**: Funcionalidade para comparar estatísticas entre diferentes Pokémon.

8. **Compartilhamento**: Opção para compartilhar um Pokémon específico em redes sociais.

9. **Melhorias de Performance**: Implementar lazy loading para imagens e otimizar a renderização da lista.

10. **Evoluções no Modal**: Adicionar informações sobre a cadeia evolutiva do Pokémon no modal de detalhes.

## 🔗 Créditos e Fontes

- **Dados dos Pokémon**: [PokeAPI](https://pokeapi.co/)
- **Imagens de Fundo**: 
  - Plano de fundo da galáxia: [Imgur](https://i.imgur.com/0Sz8rCM.gif)
  - Imagem complementar: [Unsplash](https://images.unsplash.com/photo-1534796636912-3b95b3ab5986)
- **Inspiração de Design**: Pokédx oficial dos jogos Pokémon

---

Desenvolvido por Kauã Hiro
