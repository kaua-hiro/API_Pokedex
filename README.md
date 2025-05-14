# Pokédex - 1ª Geração

![Pokédex Preview](https://via.placeholder.com/800x400/1B2735/FFFFFF?text=Pok%C3%A9dex+1%C2%AA+Gera%C3%A7%C3%A3o)

## 📋 Descrição do Projeto

A Pokédex da 1ª Geração é uma aplicação web interativa que exibe informações sobre os 151 Pokémon originais. O projeto foi desenvolvido com HTML, CSS e JavaScript puro, consumindo dados da [PokeAPI](https://pokeapi.co/). A interface apresenta um design moderno com tema espacial/galáxia, onde os cards dos Pokémon são exibidos em um formato de grade responsiva.

O objetivo principal da aplicação é proporcionar uma experiência nostálgica para fãs da série Pokémon, permitindo a visualização e filtragem dos monstrinhos da região de Kanto.

## ✨ Funcionalidades Principais

- **Listagem Completa**: Exibe todos os 151 Pokémon da primeira geração em cards individuais.
- **Sistema de Busca**: Permite buscar Pokémon por nome ou número na Pokédex.
- **Filtragem por Tipo**: Possibilita filtrar os Pokémon por seus tipos (Fogo, Água, Grama, etc.).
- **Cards Interativos**: Cada card exibe:
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

### CSS
- Layout responsivo com CSS Grid para organização dos cards
- Animações e transições para melhorar a experiência do usuário
- Efeitos visuais como fundo com tema espacial e estrelas animadas
- Media queries para responsividade em diferentes dispositivos
- Esquema de cores definido para cada tipo de Pokémon
- Estilização moderna com sombras, bordas arredondadas e efeitos de hover

### JavaScript
- Consumo da API REST (PokeAPI) via Fetch API
- Manipulação dinâmica do DOM para criar e atualizar os cards
- Implementação de funcionalidades de busca e filtragem
- Tratamento assíncrono de dados com async/await
- Eventos para interatividade do usuário

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Um navegador web moderno (Chrome, Firefox, Edge, etc.)
- Conexão com a internet (necessária para acessar a PokeAPI)

### Passos para Execução
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/pokedex-primeira-geracao.git
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

- **index.html**: Contém a estrutura básica da aplicação, incluindo o cabeçalho com título, campo de busca, seletor de filtro por tipo, container da Pokédex e rodapé.

- **styles.css**: Implementa todos os estilos visuais da aplicação, incluindo o tema espacial de fundo, animações de estrelas, cards dos Pokémon, esquema de cores para os tipos e responsividade.

- **script.js**: Responsável pela lógica de programação, incluindo o consumo da PokeAPI, criação dinâmica dos cards dos Pokémon, implementação dos filtros de busca e por tipo.

## 🎨 Design e Responsividade

### Layout
- Design moderno com tema espacial/galáxia como plano de fundo
- Cards com visual clean e informativo
- Esquema de cores baseado nos tipos oficiais dos Pokémon
- Interface intuitiva com busca e filtros de fácil acesso

### Responsividade
- Layout adaptável que se ajusta a diferentes tamanhos de tela:
  - Desktop: Grid com múltiplas colunas
  - Tablet: Redução no número de colunas
  - Mobile: Cards menores e menos colunas para melhor visualização

### Animações
- Efeito de elevação nos cards quando o mouse passa por cima
- Fundo de galáxia com estrelas em movimento
- Transições suaves nos elementos interativos

## 🔍 Possíveis Melhorias

1. **Detalhamento dos Pokémon**: Implementar uma página ou modal de detalhes ao clicar em um Pokémon, exibindo informações como estatísticas, habilidades, evoluções, etc.

2. **Paginação**: Adicionar sistema de paginação para melhorar o desempenho em conexões mais lentas.

3. **Modo Escuro/Claro**: Implementar alternância entre tema escuro (atual) e claro.

4. **Filtros Avançados**: Adicionar filtros por outras características como peso, altura, estatísticas, etc.

5. **Animações de Carregamento**: Implementar animações de loading enquanto os dados são carregados.

6. **Gerações Adicionais**: Expandir o projeto para incluir outras gerações de Pokémon.

7. **Favoritos**: Sistema para marcar Pokémon como favoritos (utilizando localStorage).

8. **Comparação**: Funcionalidade para comparar estatísticas entre diferentes Pokémon.

9. **Compartilhamento**: Opção para compartilhar um Pokémon específico em redes sociais.

10. **Melhorias de Performance**: Implementar lazy loading para imagens e otimizar a renderização da lista.

## 🔗 Créditos e Fontes

- **Dados dos Pokémon**: [PokeAPI](https://pokeapi.co/)
- **Imagens de Fundo**: 
  - Plano de fundo da galáxia: [Imgur](https://i.imgur.com/0Sz8rCM.gif)
  - Imagem complementar: [Unsplash](https://images.unsplash.com/photo-1534796636912-3b95b3ab5986)
- **Inspiração de Design**: Pokédex oficial dos jogos Pokémon

---

Desenvolvido com ❤️ por Kauã Hiro
