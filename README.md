# Card Origins Codex — Versão pública (sem links pessoais)

Site estático feito para publicar no GitHub Pages. Não é uma wiki oficial de Card Origins.

## Arquivos principais

- `index.html` — página inicial, catálogo, time builder, skill tree, guia
- `styles.css` e `app.js` — interface e filtros
- `data.js` — catálogo local, 365 cartas e 37 suportes
- `catalog.json` e `catalogo.csv` — exportações do catálogo para manutenção
- `assets/` — artes verificadas e diagrama ilustrativo da skill tree

## Dados e direitos

Esta edição remove links e identificadores dos arquivos pessoais do Google Drive, URLs privadas e captura da Skill Tree com nome da conta. Os registros de nome, elemento e borda são derivados dos nomes dos arquivos de origem. As 8 cartas recebidas em 09/11/2026 tiveram seus atributos e efeitos conferidos por prints, e suas imagens originais foram adicionadas a `assets/cards/`. Esta é uma wiki de fã, independente do Roblox e dos criadores do jogo.

## Publicar com GitHub Pages

1. Crie um repositório **público** no GitHub, por exemplo `card-origins-codex`.
2. Extraia o conteúdo deste ZIP e envie **os arquivos que estão nesta pasta** à raiz do repositório (não envie apenas o ZIP).
3. Nas configurações do repositório, abra **Pages**. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`. Salve.
4. O endereço normalmente será `https://SEU-USUARIO.github.io/card-origins-codex/` depois que o GitHub Pages publicar.

Nenhum backend nem senha é necessário; esta edição não faz login no Drive e não sincroniza automaticamente com a coleção. Favoritos e o time são locais do navegador.

## Atualizações

As novas cartas exigem atualizar `catalog.json`, `data.js`, e enviar as novas artes quando disponíveis. Não existem uploads automáticos neste site.

## Cartas novas de 09/11/2026

Foram cadastrados Sorcerer Killer (Normal/Physical), Silver Star User (Calamity/Imaginary), The Grinning Spectator (Normal/Imaginary), Demonic Swordsaint (Normal/Ice) e Black Eyepatch (Calamity/Physical). As versões anteriores de Silver Star User e Black Eyepatch continuam separadas.

O número das novas cartas não estava visível nas capturas e não foi inventado. Os PNGs originais estão no repositório com os nomes definidos em `data.js`.

## Memory of Chaos — Stage 03 (Broken Mind)

A seção `#chaos` é um laboratório de estratégias para o Stage 03 conforme os prints recebidos em 09/11/2026. Inclui duas equipes de 4 cartas, seletor de cartas, debuff do stage, descrição dos oito inimigos, condições das 3 estrelas, busca de composições, plano por fase e um registro ilustrativo da batalha.

**Atenção:** o jogo não forneceu HP/DMG dos inimigos nem um simulador oficial. A função compara cenários assumidos e não deve ser interpretada como probabilidade real de vitória. São usadas apenas cartas do catálogo com HP/DMG identificados. As habilidades das cartas recentes foram parcialmente aproximadas (por exemplo, a frequência das habilidades inimigas é desconhecida). Suportes, traits e relíquias não são aplicados ao cálculo. O resultado fica salvo localmente e não é sincronizado com Roblox.

### Novas cartas

- Silverfox Vanguard — Astral / Imaginary, HP 4258, DMG 1420
- Black Flame Heir — Calamity / Lightning, HP 3105, DMG 1035
- Magician — Astral / Lightning, HP 4383, DMG 1462

As três imagens foram salvas primeiro na pasta Drive `Card Origins — Minhas Cartas` e depois adicionadas a `assets/cards/` no GitHub, junto com as cinco cartas anteriores.
