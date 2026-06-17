# 🚀 Guia de Instalação Local

Guia passo a passo para rodar o **ABC Mágico** no seu computador (Windows, Mac ou Linux).

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter instalado:

### 1. Node.js (obrigatório)
- **Versão mínima:** Node.js 18.18 ou superior (recomendado 20+)
- Verifique se já tem: abra o terminal e digite:
  ```bash
  node --version
  ```
  Deve aparecer algo como `v20.11.0` ou superior.
- **Download:** https://nodejs.org/ (escolha a versão LTS)

### 2. npm (vem junto com Node.js) OU Bun (opcional, mais rápido)
- npm já vem instalado com Node.js
- Para verificar:
  ```bash
  npm --version
  ```
- **Opcional - Bun** (mais rápido, mas não obrigatório): https://bun.sh/

### 3. Git (para clonar o repositório)
- **Download:** https://git-scm.com/
- Verifique:
  ```bash
  git --version
  ```

---

## 📥 Passo a Passo

### Passo 1: Baixar o projeto

**Opção A: Clonar do GitHub (recomendado)**
```bash
git clone https://github.com/SEU_USUARIO/abc-magico.git
cd abc-magico
```

**Opção B: Baixar ZIP**
1. Baixe o ZIP do repositório
2. Extraia em uma pasta
3. Abra o terminal dentro da pasta extraída

### Passo 2: Instalar as dependências

No terminal, dentro da pasta do projeto:

```bash
npm install
```

> 💡 Isso pode demorar de 2 a 5 minutos na primeira vez. É normal!
>
> Se preferir usar Bun (mais rápido):
> ```bash
> bun install
> ```

### Passo 3: Rodar o projeto! 🎉

```bash
npm run dev
```

Aguarde ver a mensagem:
```
✓ Ready in xxx ms
- Local: http://localhost:3000
```

Abra no navegador: **http://localhost:3000**

---

## 🪟 Instruções específicas para Windows

### Abrir o terminal
- **PowerShell** (recomendado): clique com botão direito na pasta + Shift → "Abrir janela do PowerShell aqui"
- **CMD**: digite `cmd` na barra de endereços do Explorer
- **VS Code**: `Ctrl + ` (crase) abre o terminal integrado

### Se der erro de "scripts desabilitados"
Se aparecer algo como `running scripts is disabled on this system`:

**Solução 1 (PowerShell como administrador):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Solução 2 (use `npx` direto):**
```bash
npx next dev
```

### Se der erro de caminho longo
Se aparecer erro sobre "caminho muito longo":
1. Abra o PowerShell como administrador
2. Execute:
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```
3. Reinicie o computador

---

## 🐛 Problemas Comuns e Soluções

### ❌ Erro: `Cannot find module 'next'`
**Causa:** Dependências não instaladas
**Solução:**
```bash
npm install
```

### ❌ Erro: `Node.js version is not compatible`
**Causa:** Node.js muito antigo
**Solução:** Atualize o Node.js para a versão 18.18+ em https://nodejs.org/

### ❌ Erro: `Port 3000 is already in use`
**Causa:** Outro programa está usando a porta 3000
**Solução:** Rode em outra porta:
```bash
npx next dev -p 3001
```
E acesse: http://localhost:3001

### ❌ Erro: `prisma: command not found` ou `P1012`
**Causa:** Versão antiga do tutorial mencionava Prisma, mas o projeto não usa mais banco de dados (tudo é salvo no navegador).
**Solução:** Atualize para a última versão do projeto. Você não precisa rodar nenhum comando `prisma`.

### ❌ Erro: `DATABASE_URL environment variable is missing`
**Causa:** Versão antiga do projeto usava Prisma/banco de dados
**Solução:** Atualize para a última versão. O projeto atual não precisa de `.env` nem banco de dados — todo o progresso é salvo no `localStorage` do navegador.

### ❌ Tela em branco ao abrir no navegador
**Causa:** Servidor ainda está iniciando
**Solução:** Aguarde 30 segundos e recarregue a página (F5)

### ❌ Erro ao instalar dependências (`npm ERR!`)
**Solução 1:** Apague `node_modules` e o arquivo `package-lock.json` e tente de novo:
```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```

**Solução 2:** Tente usar `yarn` ou `bun` como gerenciador alternativo

### ❌ Áudio não funciona
**Causa:** Navegadores bloqueiam áudio automático
**Solução:** Clique uma vez em qualquer lugar da página para "desbloquear" o áudio

---

## 🔄 Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento (com hot reload) |
| `npm run dev:turbo` | Inicia com Turbopack (mais rápido, experimental) |
| `npm run build` | Cria a build de produção |
| `npm run start` | Roda a build de produção |
| `npm run lint` | Verifica erros de código |

---

## 📦 Build para Produção

Para gerar a versão final otimizada:

```bash
npm run build
npm run start
```

O resultado estará na pasta `.next/` e o servidor rodará em http://localhost:3000

---

## 🆘 Ainda com problemas?

Cole a saída do erro no terminal e me envie! Inclua:

1. Qual sistema operacional você usa (Windows/Mac/Linux)
2. Versão do Node.js (`node --version`)
3. O erro completo que aparece no terminal
4. Em qual passo aconteceu o erro

---

## 📋 Checklist rápido

- [ ] Node.js 18.18+ instalado (`node --version`)
- [ ] Git instalado (`git --version`)
- [ ] Projeto clonado/baixado
- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` rodando
- [ ] Navegador abrindo em http://localhost:3000

Se todos os itens acima estão ✅, o projeto deve estar funcionando! 🎉
