# Card Origins Codex — Versão pública (sem links pessoais)

Site estático feito para publicar no GitHub Pages. Não é uma wiki oficial de Card Origins.

## Arquivos principais

- `index.html` — página inicial, catálogo, time builder, skill tree, guia
- `styles.css` e `app.js` — interface e filtros
- `data.js` — catálogo local, 371 cartas principais e 37 suportes
- `catalog.json` e `catalogo.csv` — exportações do catálogo para manutenção
- `infinite-engine.js`, `infinite-panel.js`, `infinite.css` — simulador interativo de Infinite Tower
- `docs/` — fontes, transcricoes, historico, pendencias e documentacao dos modelos
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

**Não há cartas de suporte neste modo.** `Buscar vitória` otimiza oito cartas principais, quatro por fase. `Buscar 3 estrelas` testa até **100.000 equipes diferentes sem suportes**, em blocos para manter a interface responsiva. A busca só considera sucesso se **uma mesma simulação** vencer as duas fases, não perder nenhuma carta e terminar cada fase em no máximo 22 turnos. **Cada candidata com 3 estrelas passa por 120 batalhas independentes**, até ter pelo menos quatro vitórias nas 120 repetições ou esgotar as 100.000 equipes. Há contador, barra de progresso e botão de parada. Uma batalha bem-sucedida continua sendo só um resultado do modelo, sem garantia de vitória no Roblox.

**Catálogo:** há 371 cartas principais com nome, raridade, elemento e imagem. Apenas 26 têm HP, DMG e habilidade transcritos. O seletor de Memory of Chaos exibe **todas as 371**; quem escolher uma carta ainda sem atributos pode preencher HP máximo, DMG e o texto da habilidade no editor. Isso é salvo apenas no navegador e habilita a carta para comparação numérica. Texto de habilidades novas não é executado automaticamente; seus gatilhos precisam ser incorporados ao motor. **Não se inventam atributos das 345 restantes.**

**Atenção:** oito prints dos inimigos confirmaram o HP **máximo** e o DMG de Apothecary Cat (6160/1540), Fire Soldier (9240/2310), The Ancient Flame (12320/2763), Star Warrior Raised On… (15400/3454), Omniscient Reader (7084/1771), The Sky-Reaching Student (10624/2656), Horned Maid (14168/3542) e Scythe Tactician (17708/4427). Os HPs menores vistos nas barras são HP atual durante a luta, não HP inicial. Em pressão 1.00×, o modelo usa os HPs máximos e os danos informados, efeitos de inimigos com descrição legível e habilidades selecionadas das cartas (cura, mitigação, contra-ataque, Burn, Stun, Blind, Fatigue e marcas). **Ainda faltam partes cortadas de habilidades, a ordem real de ações, chances e multiplicadores.** O ciclo elemental completo, danos de certos debuffs e o contra-ataque de Star Warrior são aproximações. Traits e relíquias não são simulados. As porcentagens são apenas do modelo, sem calibração contra partidas reais.

**Rotação de inimigos:** o painel `Atualizar rotação` permite alterar os oito nomes, elementos individuais, HP máximo, DMG, elemento de cada fase e a habilidade inimiga reconhecida. A rotação editada fica salva no navegador e é usada nas próximas simulações; há restauração dos prints iniciais e um aviso após mais de três dias. **Não existe predição automática de inimigos futuros**: o usuário deve conferir o painel do jogo e informar os novos dados, principalmente o texto das novas habilidades. Um efeito não confirmado recebe a opção `Não confirmado` em vez de inventar uma habilidade.

### Novas cartas

- Silverfox Vanguard — Astral / Imaginary, HP 4258, DMG 1420
- Black Flame Heir — Calamity / Lightning, HP 3105, DMG 1035
- Magician — Astral / Lightning, HP 4383, DMG 1462

As três imagens foram salvas primeiro na pasta Drive `Card Origins — Minhas Cartas` e depois adicionadas a `assets/cards/` no GitHub, junto com as cinco cartas anteriores.

## Infinite Tower — simulador de ascensao

A aba `#infinite` possui um laboratorio para o print **Floor 261**, com HP maximo 6.061 e DMG 2.648 da inimiga **Game Princess**, e compara os sete Paths: Destruction, Remembrance, Nihility, Erudition, Harmony, Hunt e Abundance. A captura mostra Destruction Tier 5; os demais estao Tier 0. A troca de Path em uma run em andamento so vale na run seguinte.

O usuario pode montar quatro cartas principais com ate quatro suportes, editar os atributos de referencia e o crescimento hipotetico do andar, simular 120 batalhas, comparar os sete Paths ou buscar ate **21.000 tentativas de composicao** com botao de parada. A melhor formacao passa por uma rodada independente de 120 simulacoes e pode ser aplicada ao Team Builder ou copiada. A busca nao e exaustiva.

**Atencao:** os resultados sao estimativas, nao partidas reais. O crescimento padrao de 1% por andar e hipotese; a habilidade *No Continue* da Game Princess foi cortada no print e nao e simulada. A busca numerica atual so usa as **26 cartas principais com HP/DMG confirmados** e **6 suportes com efeitos legiveis**, com implementacoes aproximadas. Ver [`docs/INFINITE_TOWER_SIMULADOR.md`](docs/INFINITE_TOWER_SIMULADOR.md) para as fontes, regras e lacunas.

Adicionadas quatro variantes novas: King of Curses (Calamity/Fire; 3871 HP, 1290 DMG), Little Owl Man (Calamity/Wind; 3450 HP, 1151 DMG), Rabbit Ghoul (Umbral/Fire; 4812 HP, 1603 DMG) e Half Ghoul (Normal/Physical; 2937 HP, 978 DMG). Total atual: **408 registros = 371 principais + 37 suportes**.

## Cartas adicionadas em 09/11/2026 — Sherlock e Two Timing Pro

Sherlock (Normal/Fire; HP 1.460, DMG 486; Perfect Deduction) e Two Timing Pro (Astral/Physical; HP 6.913, DMG 2.305; Double Cross) foram adicionadas com os prints originais. As outras bordas de Two Timing Pro foram preservadas. As novas habilidades estão transcritas no catálogo, mas seus gatilhos ainda não foram implementados nos simuladores. Total: **408 registros = 371 principais + 37 suportes**, sendo **26 principais transcritas e 345 pendentes**.

Registro: [Atualização das duas cartas](docs/ATUALIZACAO_2026-11-09_SHERLOCK_TWO_TIMING_PRO.md).

### Painel visual do Infinite

A equipe agora usa um painel inspirado no Deck Builder, com prints ampliáveis, troca por busca, ordenação com suportes, circuitos, totais base e sete Paths visuais. A formação do Infinite fica salva separadamente do Deck. As ações de simular, comparar Paths e buscar até 21.000 tentativas foram preservadas. Ver [documentação do painel](docs/INFINITE_TOWER_SIMULADOR.md).

## Planejar árvore por time e pontos

O menu **Planejar árvore** (`#planner`) compara distribuições de talentos e Paths com orçamento de pontos, reserva, objetivo e marcações de aprendidos/disponíveis. Há perfis separados para o time pessoal e o time externo do amigo. Os critérios são heurísticos; não são simulação de combate nem garantia de melhor árvore. Os pré-requisitos desconhecidos ficam explícitos. Ver [documentação e limites](docs/PLANEJADOR_ARVORE.md).

O painel segue a interface da **Skill Tree**: ramos à esquerda, mapa no centro e detalhes à direita. Use **Configurar** para time/pontos e **Lista / Paths** para comparar resultados. Azul identifica sugestões e verde identifica aprendidos do perfil; a árvore pessoal e seus dados permanecem separados.

A configuração usa o painel visual do Infinite, com quatro cartas grandes, busca para trocar, ampliação, ordem, circuitos, totais parciais e suportes por slot. Suportes e circuitos são referências da formação e não entram no índice de recomendação da árvore; dados pendentes permanecem explícitos.

## Cadastro de cartas

Em 10/11/2026, a pedido do proprietário, o menu Adicionar carta, os botões + Nova carta e o formulário automático foram retirados. As próximas aquisições serão enviadas pelo chat para transcrição e atualização manual, com registro no GitHub e no Google Docs. Todas as cartas, suportes, imagens e formações existentes foram preservadas.

### Cartas confirmadas em 10/11/2026

Sete novas variantes foram transcritas dos prints originais, preservando todos os 408 registros anteriores. Catálogo atual: **415 registros = 378 cartas principais + 37 suportes; 33 principais transcritas e 345 pendentes**. Os prints repetidos de Reality's Worst Duet e Irregular Climber não geraram duplicatas. Habilidades novas estão descritas no catálogo; seus gatilhos específicos ainda não foram implementados no combate.

Detalhes: [registro das sete cartas](docs/CARTAS_2026-11-10.md).


Segunda remessa de 10/11/2026: 2 cartas principais e 2 suportes novos, mais 3 suportes pendentes completados nos mesmos IDs. Total atual: **419 registros = 380 principais + 39 suportes; 35 principais transcritas e 345 pendentes**. As versões-base dos suportes foram preservadas; valores Calamity não as substituem.


### Leitor experimental retirado

O leitor automático de prints foi retirado em 10/11/2026. O código histórico e a documentação foram preservados para consulta, mas não são carregados no site. O endereço do cadastro foi removido da configuração pública e a implantação privada foi desativada. [Registro histórico](docs/CADASTRO_CARTAS.md).

**Experimento privado com Gemini, ainda inativo no site:** chave configurada em propriedades protegidas e conexão confirmada. As três leituras reais de imagem falharam com HTTP 503; nenhuma extração visual foi validada. O código experimental preserva campos desconhecidos, revisão manual e as gravações existentes, com limite de 30 tentativas/dia e sem repetição automática. O menu de cadastro continua retirado até uma leitura real funcionar e ser conferida. Veja o estado atual em [Cadastro de cartas](docs/CADASTRO_CARTAS.md).


Terceira remessa de 10/11/2026: 4 variantes principais novas e 2 imagens mais nítidas, sem duplicar as cartas existentes. Total atual: **423 registros = 384 principais + 39 suportes; 39 principais transcritas e 345 pendentes**. Referências do Infinite: andar 1 (Widow, HP 18, DMG 10) e andar 2 (Sinner Ruler of Life, HP 22, DMG 11); inimigos diferentes não confirmam uma taxa de crescimento.

**Infinite Tower — busca por objetivo:** entrada simplificada com **Chegar mais longe** e **Rush · limpar os 4**. Ambos usam quatro inimigos por wave. Alcance compara resistência com uma referência real e um cenário hipotético, sem prever o andar máximo real; rush compara dez waves e prioriza completar a sequência com poucas ações aliadas. Ajustes de batalha e referências ficam recolhidos. As finalistas são reavaliadas em 120 testes cada. Splash de Erudition agora alcança os outros inimigos vivos da wave; habilidades ainda não implementadas permanecem parciais. [Funcionamento e limitações](docs/INFINITE_TOWER_SIMULADOR.md#busca-simplificada-alcance-e-rush--10112026).

**Revisão de confiança do Infinite:** o teto hipotético de 1.000 deixou de ser apresentado como previsão de alcance. A recomendação exibe os três Origin Circuits e quatro suportes com imagens, além de teste independente contra **um Chain Avenger do andar 822 (HP máximo 104.144; DMG exibido 35.991)**. Alcance real continua **não calibrado**. Foram retirados o Overhealth ilimitado e a transferência não confirmada do bônus por abates entre waves, além de outras aproximações não sustentadas. Abundance fica fora da busca enquanto a duração de seu efeito não for confirmada. [Correções e limites](docs/INFINITE_TOWER_SIMULADOR.md#correção-do-resultado-e-referência-do-andar-822--10112026).

**Integração de combate em 10/11/2026:** o Infinite lê a Skill Tree pessoal salva, congela seus ajustes por busca e mostra um relatório dos efeitos executados, parciais e pendentes. O novo painel permite configurar atributos atuais, trait, bônus de combate e os quatro inimigos. Chains/Judgment/Silence agora executam no teste isolado de 822; o restante da wave continua desconhecido. As cinco relíquias do mesmo Blue Wolf foram transcritas e vinculadas ao ID c-1, com Hollow 4 ativo e Prism 1 inativo. HP/DMG finais não recebem novamente melhorias. [Equipamento e fontes](docs/RELIQUIAS_BLUE_WOLF_2026-11-10.md). O motor permanece parcial; não há promessa de considerar todas as habilidades ou de prever o alcance real.
