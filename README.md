# Golden Compass Leads

# PROJETO: GARIMPO

Crie um aplicativo web chamado **Garimpo**.

O Garimpo é uma ferramenta simples de prospecção B2B que permite ao usuário pesquisar empresas no Google/Google Maps através da API da Apify, identificar principalmente empresas estabelecidas que **não possuem site próprio**, coletar os contatos públicos disponíveis e transformar os resultados em uma lista organizada de prospecção.

O foco deste primeiro desenvolvimento é um **MVP funcional, rápido e extremamente simples**.

Não transformar o projeto em CRM completo, plataforma de automação comercial ou sistema complexo.

---

# 1. OBJETIVO PRINCIPAL

O fluxo principal deve ser:

**Definir nicho → definir localização → buscar empresas → filtrar empresas sem site → coletar/enriquecer contatos → visualizar resultados → exportar para Google Planilhas ou CSV.**

O usuário deve conseguir encontrar empresas de determinado nicho e região que tenham boa presença comercial, mas ainda não possuam website.

Essas empresas serão potenciais clientes para prospecção.

---

# 2. IDENTIDADE DO PRODUTO

Nome:

**Garimpo**

Conceito visual:

O nome representa o ato de "garimpar" boas oportunidades comerciais em meio a milhares de empresas.

A identidade deve transmitir:

* busca;
* descoberta;
* mineração de oportunidades;
* empresas;
* leads;
* produtividade.

O produto deve ter personalidade própria e não pode parecer um dashboard genérico gerado por IA.

---

# 3. ESTILO VISUAL

Toda a interface deve seguir uma estética inspirada em **pixel art / interfaces retrô de computador**, porém mantendo qualidade profissional e excelente usabilidade.

A referência visual principal é a imagem de pasta pixel art fornecida junto com este projeto.

A estética pixel deve aparecer de maneira consistente em:

* logotipo;
* ícones;
* botões;
* bordas;
* cards;
* inputs;
* selects;
* tabelas;
* loaders;
* barras de progresso;
* estados vazios;
* pequenos elementos gráficos.

Não fazer uma interface infantil ou de videogame exagerado.

Queremos algo como:

**software profissional moderno com identidade visual pixel art.**

---

# 4. PALETA

A cor predominante é:

**AMARELO.**

Usar principalmente:

* amarelo ouro;
* amarelo claro;
* amarelo queimado;
* preto;
* grafite;
* off-white/creme.

Sugestão de direção:

```text
Amarelo principal: #FFC928
Amarelo destaque: #FFD84D
Amarelo escuro: #E5A900

Preto: #0B0B0B
Grafite: #171717
Cinza escuro: #262626

Creme: #FFF8E7
Branco quente: #FFFDF7
```

Não criar vários cards com cores aleatórias.

Amarelo deve ser claramente a identidade da marca.

---

# 5. LOGOTIPO

Criar uma identidade simples para:

**GARIMPO**

Pode utilizar como símbolo:

* pasta pixel;
* lupa pixel;
* pequena pepita;
* baú;
* elemento relacionado a descoberta.

Preferência por uma **pasta amarela pixel art**, semelhante à referência fornecida.

Ao lado:

**GARIMPO**

E opcionalmente uma tagline pequena:

**Encontre empresas. Descubra oportunidades.**

Não utilizar emojis.

Os elementos visuais devem ser SVG/CSS ou assets próprios consistentes.

---

# 6. ESTRUTURA DO APLICATIVO

O MVP deve possuir somente as áreas realmente necessárias:

1. Buscar
2. Resultados
3. Histórico
4. Configurações/Integrações

Não criar dashboard analítico complexo.

Não criar gráficos.

Não criar CRM completo.

---

# 7. TELA PRINCIPAL — BUSCAR

Essa é a principal tela do Garimpo.

Criar um formulário central de pesquisa.

Título:

**Garimpar empresas**

Descrição:

**Encontre empresas com potencial comercial e transforme sua busca em uma lista pronta para prospecção.**

Campos:

### Nicho

Input/select pesquisável.

Exemplos:

* Clínicas odontológicas
* Academias
* Imobiliárias
* Construtoras
* Contabilidades
* Autopeças
* Oficinas
* Restaurantes
* Hotéis
* Escolas
* Lojas de móveis

Também permitir que o usuário escreva manualmente qualquer nicho.

Não limitar o sistema somente aos exemplos.

---

### Localização

Permitir informar:

* cidade;
* estado;
* região.

Exemplo:

**Curitiba, PR**

Não obrigar GPS.

---

### Quantidade de resultados

Permitir escolher, por exemplo:

* 50
* 100
* 250
* 500
* 1.000

A arquitetura deve permitir outros limites posteriormente.

---

### Potencial mínimo

Opções:

* Todos
* Médio+
* Alto

O padrão pode ser:

**Médio+**

---

# 8. FILTROS DA BUSCA

Disponibilizar:

**Somente empresas sem site**

Ativado por padrão.

**Somente empresas com telefone**

Ativado por padrão.

**Buscar e-mail**

Ativado por padrão.

**Buscar Instagram**

Ativado por padrão.

Não criar dezenas de filtros no MVP.

---

# 9. DEFINIÇÃO DE EMPRESA SEM SITE

Esse é um requisito central.

Quando a fonte retornar um website válido para a empresa, ela não deve entrar nos resultados quando:

**Somente empresas sem site = ativado.**

Não confundir:

* link do Google Maps;
* perfil do Instagram;
* Facebook;
* link de WhatsApp;

com website próprio.

Uma empresa pode possuir Instagram e continuar sendo classificada como:

**Sem site**

---

# 10. TELEFONE

Telefone é um dado prioritário.

Coletar o telefone público disponibilizado pela fonte.

Normalizar números brasileiros quando possível.

Manter separadamente:

```text
telefoneOriginal
telefoneNormalizado
```

Não alterar silenciosamente o dado original retornado pela fonte.

Quando houver número compatível, permitir uma ação:

**Abrir WhatsApp**

utilizando link apropriado.

Porém:

**não afirmar que um telefone possui WhatsApp confirmado se isso não tiver sido realmente validado.**

Se a fonte fornecer especificamente um WhatsApp, armazenar separadamente.

---

# 11. E-MAIL

E-mail é um dado extremamente importante para o Garimpo.

O sistema deve tentar encontrar e-mail público relacionado à empresa através das fontes/enriquecimentos disponíveis na integração escolhida.

Priorizar e-mails comerciais como:

```text
contato@
comercial@
atendimento@
vendas@
```

Porém:

**NUNCA inventar um e-mail.**

Não gerar automaticamente:

```text
contato@nomedaempresa.com.br
```

apenas porque parece provável.

Se nenhum e-mail real for encontrado:

**Não encontrado**

---

# 12. INSTAGRAM

Quando disponível, coletar:

* username;
* URL.

Exemplo:

```text
@empresa
```

Permitir abrir o perfil.

Instagram é enriquecimento desejável, mas sua ausência não elimina a empresa.

---

# 13. RESPONSÁVEL

Se alguma fonte retornar publicamente um responsável/proprietário/contato relacionado à empresa, armazenar.

Campo:

**Responsável**

Porém esse campo é opcional.

Se não existir evidência:

**Não encontrado**

Nunca inferir nomes.

---

# 14. DADOS QUE DEVEM SER COLETADOS

Normalizar os resultados para uma estrutura interna semelhante a:

```text
id
placeId
nomeEmpresa
categoria
endereco
cidade
estado
telefone
telefoneNormalizado
whatsapp
email
instagram
responsavel
website
googleMapsUrl
nota
quantidadeAvaliacoes
potencial
fonte
dataColeta
```

Campos ausentes devem ser `null`/vazios conforme o contrato definido.

Não inventar informações.

---

# 15. SCORE DE POTENCIAL

Não afirmar que uma empresa é juridicamente "média" ou "grande" apenas com dados do Google.

O Garimpo deve calcular um:

**Potencial comercial**

com base nos sinais disponíveis.

Inicialmente utilizar principalmente:

* quantidade de avaliações;
* nota;
* existência de telefone;
* empresa sem website.

Sugestão inicial:

### ALTO

* 100 ou mais avaliações;
* nota >= 4,0;
* telefone encontrado;
* sem website.

### MÉDIO

* 30 a 99 avaliações;
* nota >= 4,0;
* telefone encontrado;
* sem website.

### BAIXO

* menos de 30 avaliações;
* ou sinais insuficientes.

Implementar a regra em função isolada para poder ser alterada posteriormente.

Não espalhar números mágicos pela aplicação.

---

# 16. EXECUÇÃO DA BUSCA

Ao clicar:

**Garimpar empresas**

mostrar uma tela/estado de execução.

Não utilizar spinner genérico como única informação.

Mostrar etapas, por exemplo:

```text
Garimpando oportunidades...

Buscando empresas
312 / 500

Analisando websites
187 encontradas sem site

Verificando telefones
169 encontrados

Buscando contatos
91 e-mails encontrados

Buscando Instagram
117 encontrados

Calculando potencial
153 leads qualificados
```

Usar barras de progresso pixeladas e animações discretas.

Não mostrar progresso falso se o backend não tiver informação real para calcular aquela etapa.

Quando não houver percentual real, utilizar estado indeterminado.

---

# 17. INTEGRAÇÃO COM APIFY

A coleta deve utilizar a API da Apify.

IMPORTANTE:

**Não inventar o contrato do Actor.**

Criar uma camada de integração isolada para Apify.

Exemplo conceitual:

```text
services/
  apify/
```

ou equivalente adequado à arquitetura existente.

A aplicação deve permitir configurar posteriormente:

```text
APIFY_ACTOR_ID
APIFY_API_TOKEN
```

A API Token da Apify deve existir **somente no backend/server-side**.

PROIBIDO:

```text
VITE_APIFY_TOKEN
NEXT_PUBLIC_APIFY_TOKEN
token hardcoded no React
token salvo no localStorage
token enviado para o navegador
```

O frontend chama nosso backend.

Nosso backend chama Apify.

Fluxo:

```text
Browser
   ↓
Backend Garimpo
   ↓
Apify
   ↓
Actor
   ↓
Dataset/resultados
   ↓
Backend Garimpo
   ↓
normalização
   ↓
Frontend
```

Antes de finalizar a integração real, utilizar o schema/documentação do Actor efetivamente escolhido.

---

# 18. RESULTADOS

Após finalizar a busca, abrir:

**Resultados**

Mostrar inicialmente um resumo compacto:

```text
153 empresas encontradas

153 sem site
153 com telefone
91 com e-mail
117 com Instagram
```

Não transformar isso em dashboard cheio de cards.

A informação principal é a tabela.

---

# 19. TABELA

Colunas principais:

**Empresa**

**Nicho**

**Cidade**

**Telefone**

**WhatsApp**

**E-mail**

**Instagram**

**Avaliações**

**Nota**

**Potencial**

**Ações**

Website pode aparecer como indicador:

**Sem site**

O link do Google Maps pode ficar nas ações/detalhes para evitar uma tabela excessivamente larga.

---

# 20. AÇÕES

Cada empresa pode possuir:

**Detalhes**

**Google Maps**

**WhatsApp**

**Instagram**

quando disponíveis.

Não renderizar ação quebrada para informação inexistente.

---

# 21. DETALHES DA EMPRESA

Ao clicar na empresa, abrir drawer/modal responsivo.

Mostrar:

```text
Nome da empresa

Categoria
Endereço
Cidade / Estado

Telefone
WhatsApp
E-mail
Instagram

Google Maps

Nota
Quantidade de avaliações

Website
SEM SITE

Potencial
ALTO

Responsável
Não encontrado
```

Não adicionar informações fictícias.

---

# 22. BUSCA NOS RESULTADOS

Adicionar busca local:

**Buscar empresa...**

Permitir pesquisar por:

* nome;
* telefone;
* e-mail;
* cidade.

Adicionar filtro simples:

**Potencial**

* Todos
* Alto
* Médio
* Baixo

Não criar filtros avançados desnecessários.

---

# 23. DEDUPLICAÇÃO

A mesma empresa não pode aparecer várias vezes.

Prioridade para deduplicação:

```text
placeId
```

Quando não existir, utilizar estratégia segura com combinação normalizada de:

```text
nome + telefone + endereço
```

Nunca remover registros diferentes apenas porque possuem nomes parecidos.

---

# 24. GOOGLE PLANILHAS

Esse é um recurso central do produto.

O usuário deve possuir duas opções:

### OPÇÃO 1

**Criar nova Google Planilha**

O sistema cria uma planilha e adiciona todos os leads.

### OPÇÃO 2

**Adicionar a uma planilha existente**

Permitir ao usuário selecionar/informar a planilha de destino através do fluxo de autorização adequado.

Não assumir que apenas colar qualquer URL concede permissão de escrita.

Implementar autenticação/autorização correta do Google quando a integração real for feita.

Nunca colocar credenciais privadas do Google no frontend.

---

# 25. COLUNAS DA PLANILHA

Criar:

```text
Empresa
Nicho
Endereço
Cidade
Estado
Telefone
WhatsApp
E-mail
Instagram
Responsável
Avaliações
Nota
Website
Google Maps
Potencial
Status
Data da coleta
```

A coluna:

**Status**

começa como:

**Novo**

A planilha poderá posteriormente ser utilizada pelo usuário como acompanhamento comercial.

---

# 26. STATUS COMERCIAL

Por enquanto o Garimpo não precisa administrar um CRM.

A planilha pode possuir:

```text
Novo
Contatado
Respondeu
Reunião
Sem interesse
```

Não construir pipeline de CRM dentro do aplicativo nesta versão.

---

# 27. CSV

Além do Google Planilhas, disponibilizar:

**Exportar CSV**

O CSV deve utilizar os mesmos dados normalizados apresentados na tabela.

Garantir UTF-8 e compatibilidade adequada com dados em português.

---

# 28. HISTÓRICO

Criar uma tela simples:

**Histórico**

Mostrar pesquisas realizadas.

Exemplo:

```text
Clínicas odontológicas
Curitiba, PR
500 pesquisadas
153 leads
20/08/2026 13:30

Academias
Londrina, PR
250 pesquisadas
74 leads
19/08/2026 16:42
```

Permitir abrir novamente os resultados de uma busca quando eles estiverem persistidos.

Não transformar Histórico em módulo analítico.

---

# 29. PERSISTÊNCIA

Manter a arquitetura simples.

Persistir apenas o necessário para:

* histórico;
* buscas;
* resultados;
* estado de exportação.

Se o projeto estiver utilizando Supabase, manter RLS e políticas adequadas.

Não usar Service Role no frontend.

Se um backend mais simples atender o MVP, não criar infraestrutura excessiva.

---

# 30. ESTADOS DA INTERFACE

Implementar corretamente:

* loading;
* buscando;
* enriquecendo;
* concluído;
* vazio;
* erro;
* exportando;
* exportado;
* integração não configurada.

Exemplo de empty state:

**Nenhuma oportunidade encontrada**

**Tente outro nicho, localização ou diminua o potencial mínimo.**

---

# 31. RESPONSIVIDADE

O Garimpo deve funcionar muito bem em:

* desktop;
* notebook;
* tablet;
* mobile.

Desktop é importante para manipulação de listas, mas mobile não pode ser uma adaptação quebrada.

Não permitir scroll horizontal no `body`.

Em desktop, a tabela pode possuir seu próprio container com `overflow-x-auto`.

No mobile, considerar cards/linhas adaptadas quando a tabela completa não for adequada.

Inputs e botões precisam continuar utilizáveis em telas pequenas.

---

# 32. PIXEL ART + RESPONSIVIDADE

A estética pixel não pode prejudicar legibilidade.

Utilizar pixel art principalmente em:

* identidade;
* bordas;
* ícones;
* ilustrações;
* botões;
* progress;
* badges.

Textos longos e dados de tabela devem permanecer muito legíveis.

É aceitável combinar:

**fonte pixel para títulos**

com

**fonte sans-serif profissional para dados e textos menores**

se isso melhorar significativamente a leitura.

---

# 33. INTERAÇÕES

Adicionar microinterações discretas:

* botão afunda 1–2 px ao clicar;
* hover pixel;
* focus claro;
* progresso pixel;
* transições rápidas;
* feedback visual ao copiar/exportar.

Não utilizar animações exageradas.

Respeitar `prefers-reduced-motion`.

---

# 34. SEGURANÇA

Nunca expor:

* APIFY_API_TOKEN;
* Google Client Secret;
* Service Role;
* tokens administrativos;
* credenciais privadas.

Segredos ficam server-side.

Não colocar segredos em:

```text
VITE_*
NEXT_PUBLIC_*
frontend
localStorage
logs
bundle público
```

Validar entradas no backend.

Não confiar somente na validação React.

Não registrar tokens em logs.

---

# 35. STACK

Priorizar uma stack simples e moderna compatível com o ambiente do projeto.

Sugestão:

```text
React
TypeScript strict
Tailwind CSS
shadcn/Radix para primitives quando adequado
Lucide para ícones funcionais quando não houver equivalente pixel próprio
Zod para validação
TanStack Query se necessário para estado de servidor
```

Backend/server functions para:

* Apify;
* Google Sheets;
* qualquer integração que utilize segredo.

Não adicionar biblioteca apenas por conveniência visual.

---

# 36. REFERÊNCIAS DE DESIGN

Antes de definir os componentes finais, estudar referências profissionais em:

21st.dev Community Templates

getdesign.md

Também podem servir como referência estrutural:

* shadcn/ui
* React Bits
* awesome-design-md

Porém:

**não copiar um dashboard SaaS genérico.**

Adaptar boas práticas de layout, hierarquia, responsividade e interação para a identidade pixel art do Garimpo.

O resultado deve parecer um produto desenhado especificamente para essa marca.

---

# 37. NÃO FAZER

Não criar nesta versão:

* CRM completo;
* kanban;
* pipeline comercial;
* disparo automático de WhatsApp;
* disparo de e-mail;
* geração de mensagens com IA;
* gráficos;
* analytics complexo;
* sistema financeiro;
* equipes;
* permissões complexas;
* planos/assinaturas;
* gamificação;
* mapa interativo complexo;
* landing page enorme.

Também não:

* inventar e-mails;
* inventar WhatsApps;
* inventar responsáveis;
* inventar avaliações;
* inventar progresso;
* afirmar que empresa é média/grande juridicamente;
* expor API keys.

---

# 38. PRIORIDADE DO MVP

A prioridade absoluta é fazer muito bem:

```text
BUSCAR
    ↓
FILTRAR
    ↓
ENRIQUECER
    ↓
ORGANIZAR
    ↓
EXPORTAR
```

Se uma funcionalidade não melhora diretamente esse fluxo, provavelmente não pertence ao MVP.

---

# 39. FLUXO FINAL ESPERADO

O usuário abre o Garimpo.

Informa:

```text
Nicho:
Clínicas odontológicas

Localização:
Curitiba, PR

Quantidade:
500

Potencial:
Médio+

[x] Somente sem site
[x] Somente com telefone
[x] Buscar e-mail
[x] Buscar Instagram
```

Clica:

**GARIMPAR EMPRESAS**

O sistema executa a coleta pela Apify.

Normaliza os dados.

Remove duplicados.

Remove empresas com website quando o filtro estiver ativado.

Prioriza empresas com telefone.

Tenta enriquecer e-mail e Instagram.

Calcula o potencial.

Apresenta os resultados.

O usuário analisa os leads.

Depois clica:

**Exportar**

e escolhe:

**Google Planilhas**

ou:

**CSV**

Esse é o fluxo principal e deve estar excelente antes de qualquer funcionalidade adicional.

---

# 40. CRITÉRIOS DE ACEITE

Considerar o MVP funcional somente quando for possível demonstrar:

1. Informar nicho e localização.
2. Iniciar uma busca.
3. Backend chamar a integração Apify sem expor token ao navegador.
4. Receber e normalizar resultados reais do Actor escolhido.
5. Identificar corretamente empresas com e sem website.
6. Filtrar empresas sem website.
7. Filtrar empresas sem telefone quando essa opção estiver ativa.
8. Não inventar e-mail, Instagram, WhatsApp ou responsável.
9. Deduplicar empresas.
10. Calcular potencial pela regra definida.
11. Exibir resultados de forma responsiva.
12. Pesquisar dentro dos resultados.
13. Abrir Google Maps.
14. Abrir WhatsApp quando houver número apropriado.
15. Exportar CSV corretamente.
16. Exportar para Google Planilhas somente após integração/autorização válida.
17. Nenhum segredo privado aparecer no bundle/frontend.
18. Interface funcionar em desktop e mobile.
19. Não existir scroll horizontal inesperado no `body`.
20. Estados de erro/loading/vazio estarem implementados.

---

# 41. ORDEM DE IMPLEMENTAÇÃO

Não tente construir tudo simultaneamente.

Implementar nesta ordem:

**Fase 1 — Interface**

* identidade Garimpo;
* layout pixel;
* formulário;
* resultados;
* detalhes;
* responsividade.

**Fase 2 — Apify**

* endpoint server-side;
* Actor real;
* normalização;
* filtros;
* deduplicação;
* score.

**Fase 3 — Enriquecimento**

* telefone;
* e-mail;
* Instagram;
* demais dados efetivamente disponíveis.

**Fase 4 — Exportação**

* CSV;
* Google Sheets.

**Fase 5 — Histórico**

* persistência mínima das buscas.

Não criar funcionalidades fora dessas fases sem necessidade.

---

# 42. REGRA PARA DADOS REAIS

Durante desenvolvimento visual, mocks podem ser utilizados claramente como fixtures.

Porém, quando a integração estiver ativa:

**nunca apresentar dado fictício como resultado real.**

Se o Actor não retornar determinado campo:

mostrar:

**Não encontrado**

Não fabricar informação para deixar a tabela preenchida.

---

# 43. RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, informe objetivamente:

```text
GARIMPO — RELATÓRIO

Interface pixel implementada:
SIM / NÃO

Responsivo desktop:
SIM / NÃO

Responsivo mobile:
SIM / NÃO

Integração Apify:
SIM / NÃO

Actor utilizado:
[nome/id real]

Chamada Apify executada em runtime:
SIM / NÃO

Empresas reais recebidas:
SIM / NÃO

Filtro sem site testado:
SIM / NÃO

Telefone:
SIM / NÃO

E-mail:
SIM / NÃO
Fonte utilizada:
[...]

Instagram:
SIM / NÃO
Fonte utilizada:
[...]

Deduplicação:
SIM / NÃO

Score:
SIM / NÃO

CSV:
SIM / NÃO

Google Sheets:
SIM / NÃO

Google Sheets testado com escrita real:
SIM / NÃO

Segredos somente server-side:
SIM / NÃO

Build:
PASSOU / FALHOU / NÃO EXECUTADO

Testes executados:
[...]

Pendências:
[...]

Não testado em runtime:
[...]
```

Não declarar uma integração como funcional apenas porque o código compila.

Não declarar Google Sheets funcionando sem uma escrita real comprovada.

Não declarar dados vindos da Apify sem uma execução real comprovada.

---

# RESULTADO ESPERADO

Entregar um MVP chamado **Garimpo**, visualmente marcante, predominantemente amarelo, com estética pixel art profissional e extremamente simples de operar.

O produto deve fazer uma coisa muito bem:

> **Garimpar empresas com boa presença comercial, principalmente sem website, encontrar o máximo possível de contatos públicos úteis e entregar uma lista organizada pronta para prospecção.**

Priorize qualidade do fluxo principal, confiabilidade dos dados, segurança das integrações e identidade visual.

Não aumente o escopo.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://garimpoo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eb8d1a1c-b397-45ce-a113-492f435de5e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
