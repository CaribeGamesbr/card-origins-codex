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

**Dois modos de busca:** `Buscar vitória` faz uma otimização curta para concluir as duas fases; `Buscar 3 estrelas` testa até **100.000 combinações únicas de oito cartas, posições e suportes**, em blocos para manter a interface responsiva. A busca só considera sucesso se **uma mesma simulação** vencer as duas fases, não perder nenhuma carta e terminar cada fase em no máximo 22 turnos. **Cada candidata com 3 estrelas passa por 120 batalhas independentes**; a busca continua até encontrar ao menos quatro vitórias nas 120 repetições ou esgotar o limite de combinações. Se apenas houver vitórias raras, isso é dito explicitamente. Há contador, barra de progresso e botão de parada. Uma batalha bem-sucedida continua sendo só um resultado do modelo, sem garantia de vitória no Roblox.

**Atenção:** oito prints dos inimigos confirmaram o HP **máximo** e o DMG de Apothecary Cat (6160/1540), Fire Soldier (9240/2310), The Ancient Flame (12320/2763), Star Warrior Raised On… (15400/3454), Omniscient Reader (7084/1771), The Sky-Reaching Student (10624/2656), Horned Maid (14168/3542) e Scythe Tactician (17708/4427). Os HPs menores vistos nas barras são HP atual durante a luta, não HP inicial. Em pressão 1.00×, o modelo usa os HPs máximos e os danos informados, os efeitos de inimigos com descrição legível e várias habilidades das cartas (cura, bloqueios, contra-ataques, Burn, Bleed, Stun, Blind, Fatigue e marcas). Seis suportes com efeito identificado são equipáveis e reordenados na busca: Ashen Arcanum, Unbeatable Flavor, Binding Vow, Limit Breaker, Divine Spirit Waters e Serenity. **Ainda faltam partes cortadas de habilidades, a ordem real de ações, chances e multiplicadores de efeitos.** Inclusive o ciclo elemental completo, o dano de certos debuffs e o contra-ataque de Star Warrior são aproximações do modelo. Suportes restantes, traits e relíquias não são simulados. As porcentagens são apenas do modelo, sem calibração contra partidas reais.

**Rotação de inimigos:** o painel `Atualizar rotação` permite alterar os oito nomes, elementos individuais, HP máximo, DMG, elemento de cada fase e a habilidade inimiga reconhecida. A rotação editada fica salva no navegador e é usada nas próximas simulações; há restauração dos prints iniciais e um aviso após mais de três dias. **Não existe predição automática de inimigos futuros**: o usuário deve conferir o painel do jogo e informar os novos dados, principalmente o texto das novas habilidades. Um efeito não confirmado recebe a opção `Não confirmado` em vez de inventar uma habilidade.

### Novas cartas

- Silverfox Vanguard — Astral / Imaginary, HP 4258, DMG 1420
- Black Flame Heir — Calamity / Lightning, HP 3105, DMG 1035
- Magician — Astral / Lightning, HP 4383, DMG 1462

As três imagens foram salvas primeiro na pasta Drive `Card Origins — Minhas Cartas` e depois adicionadas a `assets/cards/` no GitHub, junto com as cinco cartas anteriores.
