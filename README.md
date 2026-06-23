# ABC Mágico 🎨✨

**Projeto infantil para alfabetização** – Aplicação web interativa e divertida para crianças aprenderem o alfabeto brincando! Versão 2.0 reescrita em Vue js + TypeScript com **11 jogos educativos**.

> 🎮 Versão original (HTML único): [demo online](https://abc-magico.netlify.app/) · repositório base: [amilsion/abc-magico](https://github.com/amilsion/abc-magico)

---

## 📖 Sobre o Projeto

O **ABC Mágico** é uma ferramenta educativa pensada para crianças em fase de alfabetização (principalmente de 3 a 7 anos). Com design colorido, animações suaves e mecânicas gamificadas, a aplicação ajuda as crianças a:

- 🔤 Reconhecer as letras do alfabeto (maiúsculas e minúsculas)
- 🔊 Aprender os sons das letras e palavras
- 🧩 Formar palavras simples e completar lacunas
- 👏 Identificar sílabas e contar palmas
- 📚 Praticar a ordem alfabética
- 🎧 Desenvolver a consciência fonológica (reconhecer a letra inicial)
- ⭐ Acompanhar o próprio progresso com sistema de estrelas

---

## ✨ Funcionalidades

### 🎯 11 Jogos Educáticos

#### Jogos originais (versão 2.0 melhorada)
| Jogo | Descrição |
|------|-----------|
| 🔠 **ABC Vivo** | Explore o alfabeto com voz, imagem e palavra associada a cada letra |
| 🧩 **Monta Palavras** | Arraste letras para formar palavras com 3 níveis de dificuldade |
| 🔍 **Caça Letras** | Encontre as letras escondidas na grade 6×6 |
| 🆎 **Caça Palavras** | Encontre palavras escondidas na grade 8×8 (4 direções) |
| ✏️ **Escreva a Letra** | Escreva as letras na tela com o dedo ou mouse |
| 🧠 **Jogo da Memória** | Encontre os pares maiúscula ↔ minúscula com 5 níveis progressivos (4 → 13 pares) |

#### Novos jogos (adicionados na v2.0)
| Jogo | Descrição |
|------|-----------|
| 📝 **Complete a Palavra** | Descubra qual letra está faltando na palavra (com sistema de streak) |
| 📚 **Ordem Alfabética** | Coloque as letras em ordem de A → Z |
| 👏 **Sílabas** | Conte as sílabas batendo palmas rítmicas |
| 🎧 **Qual é a Letra?** | Ouça a palavra e adivinhe a primeira letra |
| 🎯 **Bingo das Letras** | Marque as letras na cartela 3×3 conforme são sorteadas |

### 🎨 Destaques

- 🗣️ **Voz em português (pt-BR)** para todas as letras, palavras e instruções (Web Speech API)
- 🔊 **Efeitos sonoros** para acerto, erro, vitória e cliques (Web Audio API)
- 🎉 **Confete animado** ao atingir marcos de estrelas (a cada 50 ⭐)
- ⭐ **Sistema de recompensas** com estrelas flutuantes "+N ⭐" a cada acerto
- 💾 **Progresso salvo** automaticamente no navegador (localStorage)
- 📱 **100% responsivo** – otimizado para tablets, celulares e desktops
- 🌈 **Design vibrante e amigável** para crianças
- 🚫 **Sem necessidade de login** nem cadastro
- 🔒 **Funciona offline** depois de carregado (PWA-ready)

---

## 🛠️ Tecnologias Utilizadas

- [**Vue 3 + Composition API**](https://vuejs.org/)
- [**Vite 6 como bundler**](https://v6.vite.dev/)
- [**TypeScript 5**](https://www.typescriptlang.org/)
- [**Tailwind CSS 4**](https://tailwindcss.com/)
- [**shadcn/ui**](https://ui.shadcn.com/) – componentes de interface
- **Web Speech API** – síntese de voz em pt-BR
- **Web Audio API** – efeitos sonoros
- **Canvas API** – desenho à mão livre (jogo "Escreva a Letra")

---

## 🚀 Como Usar

### Online (Recomendado)
Acesse diretamente pelo link (em breve):
👉 **[https://abc-magico.netlify.app/](https://abc-magico.netlify.app/)**

### Rodando Localmente

> 📖 **Tem problemas para rodar?** Consulte o **[INSTALACAO.md](INSTALACAO.md)** com guia passo a passo e solução de erros comuns (Windows, Mac e Linux)!

#### Pré-requisitos
- [**Node.js 18.18+**](https://nodejs.org/) (versão LTS recomendada)
- npm (já vem com Node.js) ou [Bun](https://bun.sh/)

#### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/amilsion/abc-magico.git
   cd abc-magico
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Abra no navegador:**
   ```
   http://localhost:3000
   ```

> 💡 O projeto não usa banco de dados — todo o progresso das crianças é salvo no `localStorage` do navegador. Não precisa configurar nada extra!

### Build para Produção

```bash
npm run build
npm run start
```

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run dev:turbo` | Servidor com Turbopack (mais rápido) |
| `npm run build` | Build de produção |
| `npm run start` | Roda a build de produção |
| `npm run lint` | Verifica erros de código |

---

## 🎮 Como Jogar

1. **Abra o aplicativo** no navegador (preferencialmente com som ligado 🔊)
2. **Escolha um jogo** no menu principal tocando em um dos cards coloridos
3. **Siga as instruções de voz** – cada jogo fala automaticamente o que fazer
4. **Acumule estrelas ⭐** a cada acerto – a cada 50 estrelas há uma comemoração!
5. **Acompanhe seu progresso** no topo do menu (total de estrelas e partidas)

> 💡 **Dica para pais e professores:** Para a melhor experiência em tablets/iPads, adicione o site à tela inicial como um app. O áudio funciona melhor após o primeiro toque na tela (regra de segurança dos navegadores).

---

## 🎯 Habilidades Desenvolvidas

| Habilidade | Jogos relacionados |
|------------|-------------------|
| Reconhecimento de letras | ABC Vivo, Bingo das Letras, Caça Letras |
| Correspondência maiúscula/minúscula | Jogo da Memória (5 níveis) |
| Formação de palavras | Monta Palavras, Complete a Palavra |
| Consciência fonológica | Qual é a Letra?, ABC Vivo |
| Consciência silábica | Sílabas |
| Ordem alfabética | Ordem Alfabética, ABC Vivo |
| Motricidade fina | Escreva a Letra |
| Atenção e concentração | Caça Letras, Caça Palavras, Jogo da Memória |

---

## 🤝 Como Contribuir

Contribuições são super bem-vindas! 🧡

1. Faça um fork do projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/novo-jogo
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m 'feat: adiciona jogo das vogais'
   ```
4. Push para a branch:
   ```bash
   git push origin feature/novo-jogo
   ```
5. Abra um Pull Request

### Ideias para futuras contribuições
- 🌍 Suporte a outros idiomas (inglês, espanhol)
- 👥 Múltiplos perfis de crianças
- 📊 Relatório de progresso para professores
- 🎵 Trilha sonora de fundo opcional
- 🐾 Mais palavras e imagens por nível
- 🏆 Conquistas e medalhas temáticas

---

## 📝 Licença

Este projeto é open-source e está disponível sob a licença [MIT](LICENSE).

---

## 💜 Agradecimentos

- **Amilson Monção** – criador do [projeto original](https://github.com/amilsion/abc-magico) que inspirou esta versão expandida
- Todos os educadores e pais que dedicam seu tempo à alfabetização infantil
- A comunidade open-source pelas ferramentas incríveis (Next.js, Tailwind, shadcn/ui)

---

## 📞 Contato

- 🐛 **Issues:** [abra uma issue](https://github.com/amilsion/abc-magico/issues)
- 💬 **Discussões:** use a aba Discussions do GitHub

---

<p align="center">
  Feito com 💜 para crianças de 3 a 7 anos<br>
  <strong>Aprenda brincando! 🌟</strong>
</p>
