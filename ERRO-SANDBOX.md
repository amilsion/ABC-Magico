# 🛠️ Erro: `{"error":"sandbox is inactive"}`

Esse erro acontece no **Windows** quando o Turbopack (bundler padrão do Next.js 16) tem problemas de permissão/sandboxing no seu sistema.

Aqui estão 4 soluções, da mais simples à mais definitiva. **Tente na ordem:**

---

## ✅ Solução 1: Usar Webpack em vez de Turbopack (recomendado)

O projeto já tem um script pronto para isso. No terminal:

```bash
npm run dev:webpack
```

Isso força o Next.js a usar o Webpack (mais antigo, porém mais compatível) em vez do Turbopack.

Se funcionar, você pode usar esse comando sempre que for rodar o projeto.

---

## ✅ Solução 2: Rodar o terminal como Administrador

Às vezes o problema é só permissão do Windows.

1. Feche o terminal atual
2. Clique com botão direito no ícone do terminal (PowerShell ou CMD)
3. Escolha **"Executar como administrador"**
4. Navegue até a pasta do projeto e rode:
   ```bash
   npm run dev
   ```

---

## ✅ Solução 3: Mover o projeto para uma pasta sem espaços/acentos

O Turbopack pode ter problemas com caminhos como:
- ❌ `C:\Users\João Silva\Meu Projeto\abc-magico`
- ❌ `C:\Documents\Área de Trabalho\abc-magico`

**Mova para algo como:**
- ✅ `C:\projetos\abc-magico`
- ✅ `D:\dev\abc-magico`

Depois:
```bash
cd C:\projetos\abc-magico
npm run dev
```

---

## ✅ Solução 4: Fazer downgrade do Next.js para versão 15 (definitivo)

Se nenhuma solução acima funcionar, podemos voltar para o Next.js 15, que usa Webpack por padrão e é mais estável no Windows.

No terminal, dentro da pasta do projeto:

```bash
# Remove versão atual
npm uninstall next

# Instala Next.js 15 (estável com Webpack)
npm install next@15

# Rode normalmente
npm run dev
```

> ⚠️ **Nota:** O Next.js 15 não tem o comando `dev:webpack`, então use apenas `npm run dev`.

---

## 🔍 Como identificar qual problema é:

### Se aparecer no terminal algo como:
```
⨯ sandbox is inactive
```
→ **Solução 1** (use `npm run dev:webpack`)

### Se aparecer:
```
Error: EPERM: operation not permitted
```
→ **Solução 2** (rode como administrador)

### Se aparecer:
```
Error: ENOENT: no such file or directory
```
→ **Solução 3** (mova para pasta sem acentos/espaços)

### Se aparecer:
```
Module not found: Can't resolve ...
```
→ Tente **Solução 4** (downgrade)

---

## 📋 Informações para me enviar se nada funcionar:

Se nenhuma solução resolver, me envie:

1. **Sistema operacional:** Windows 10? 11? Mac? Linux?
2. **Versão do Node.js:** `node --version`
3. **Versão do npm:** `npm --version`
4. **Caminho completo da pasta do projeto** (ex: `C:\Users\SeuNome\Documents\abc-magico`)
5. **Erro completo** que aparece no terminal (copie tudo)
6. **Qual comando** você usou (`npm run dev` ou `npm run dev:webpack`?)

Com essas informações eu consigo te dar a solução exata! 💪

---

## 🎯 Resumo rápido

```bash
# Tente primeiro:
npm run dev:webpack

# Se não funcionar, rode como Administrador e tente:
npm run dev

# Último caso: faça downgrade
npm uninstall next
npm install next@15
npm run dev
```
