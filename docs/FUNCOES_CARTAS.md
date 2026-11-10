# Funções das cartas e ajuda a aliados

Menu **Funções / aliados** (`#roles`), acrescentado em 10/11/2026. O filtro inicial mostra somente as cinco cartas principais com ajuda a aliados explícita nas transcrições revisadas. Também é possível mostrar todas as 40 funções revisadas ou as 345 habilidades pendentes. O catálogo continua com 424 registros (385 principais e 39 suportes), sem alterações nos dados das cartas.

## Quem ajuda aliados

| Carta e variante registrada | Ajuda confirmada | Alvo e momento |
| --- | --- | --- |
| The Grinning Spectator · Normal | Eye Deal: +20% Crit Chance e +25% Crit DMG; pode pagar 5% do Max HP do aliado para transformar um ataque normal que erraria em crítico garantido, sem custo fatal | Aliado de maior DMG. Não é um buff dirigido automaticamente ao próximo slot. |
| Psychic Peak · Calamity | Enquanto fora de campo, recebe como Psychic Pressure 10% do dano sofrido pelo aliado ativo. Ao entrar, libera 25% da pressão contra cada inimigo e cura a si mesmo em 15% do Max HP | **Fora de campo explícito.** Os slots 2–4 são uma opção para ajudar quem entra antes. A cura da própria Psychic Peak não é cura do time. |
| Emy (Evolved) · Calamity | Ice Flower armazena 40% da perda de HP de aliados, limitada a 150% do seu DMG. No início do próprio turno, causa o valor ao inimigo e cura o aliado com menor HP pela metade | Depende de armazenar a perda e chegar ao início do próprio turno. A descrição não confirma agir enquanto espera fora de campo. |
| Reality's Worst Duet · Umbral | Registra ação aliada; repete dano a 40% ou cura/escudo no aliado com menor HP a 60%, limitados a 15% do Max HP desse aliado | Uma ação aliada precisa acontecer depois do seu turno; a repetição ocorre ao fim da sua próxima ação normal. Não garante repetir depois de cair. |
| The Last Hunting Party · Normal | Salt bloqueia o primeiro Stun ou Charm inimigo em um aliado. Holy Water remove o primeiro escudo criado pelo inimigo após o início, até o valor do DMG da carta. Devil's Trap reduz em 30% o DMG do primeiro inimigo revivido por 2 turnos | Cada ferramenta é de uso único. O texto não define o próximo slot e não confirma atuação fora de campo. |

Não foi confirmada persistência dessas ajudas depois da derrota da carta. Só Psychic Peak recebeu o filtro **ajuda fora de campo confirmada**. Essa regra não foi estendida a Emy, Spectator, Duet ou Hunting Party por suposição.

## Como a classificação funciona

As funções são uma leitura editorial da habilidade, não categorias oficiais, uma recomendação de melhor time ou uma afirmação de implementação integral no simulador. Cada carta pode ter mais de uma função:

- **ATK:** efeitos ofensivos, dano adicional, DoT, crítico ou ataques adicionais na habilidade.
- **Tank / sustain:** resistência, redução de dano, esquiva, proteção própria ou recuperação própria. Não foi classificado apenas por ter HP alto.
- **Buff:** ganho de atributo concedido a um aliado. A única transcrição revisada desse tipo é The Grinning Spectator.
- **Cura aliada:** a descrição cura outro aliado; Emy e Reality's Worst Duet.
- **Proteção aliada:** prevenção de efeito, escudo ou redirecionamento para proteger aliado; Psychic Peak, Hunting Party e Duet.
- **Controle:** efeitos no inimigo, como redução de dano, impedimento de cura, remoção de defesa ou bloqueio de habilidades. Isso não é um buff direto de aliados.
- **Cópia:** repetição ou herança de efeitos, com as condições próprias da habilidade.

Blue Wolf, Fullmetal Alchemist e Two Timing Pro recuperam HP da própria carta; por isso não entram em **Cura aliada**. Ghost Communicator e King of Games herdam/copiam para si; não dão essa habilidade ao aliado que morreu. No Longer Human remove efeitos e não recebe buffs temporários: isso não o transforma em buffer de equipe. As interações específicas entre Eye Deal e cartas que rejeitam buffs continuam sem confirmação.

Os circuitos adjacentes são outra mecânica e não foram promovidos a habilidades dessas cartas. As referências antigas do Docs sem transcrição atual conferida não recebem classificação pelo nome ou elemento. Não se atribuiu habilidade às 345 cartas pendentes.

## Uso no site

O menu possui busca por nome, habilidade, borda e elemento, filtro de público, filtros de função e a opção de mostrar só a ajuda fora de campo confirmada. Cada registro exibe os atributos do catálogo, a explicação da ajuda e os limites de posição/gatilho, além do texto integral da habilidade. Há acesso no menu lateral e no Deck.

Os seletores de carta do **Deck** e do **Infinite** também receberam filtro de função. O seletor do Deck mantém as cartas pendentes acessíveis; o Infinite continua aceitando somente cartas com atributos conhecidos. Esses filtros não mudam o ranking, o motor de combate ou os perfis do planejador.

Para colocar uma carta no Deck, o usuário precisa clicar em **Escolher slot no Deck** e então escolher a posição concreta. Não há troca automática. A carta ocupante é substituída, os demais slots são preservados e os suportes permanecem nos seus slots. Duplicatas do mesmo ID são bloqueadas. O menu não altera dados no Roblox nem a árvore pessoal.

## Revisão e validação

`card-roles.js` registra as funções pelos IDs exatos e confere uma assinatura do texto da habilidade. Uma carta nova ou uma habilidade alterada volta a ficar pendente até revisão; não herda uma função apenas por ter o mesmo nome. Os dados originais do catálogo permanecem intactos.

`node scripts/test-card-roles.js` verifica as cinco ajudas diretas, a única ajuda fora de campo explícita, separação entre autocura e cura aliada, cópia para si, invalidação de habilidade alterada, variantes desconhecidas, busca e filtros combinados, exportação para o navegador, limites/duplicatas de slots e preservação de catálogo, suportes e árvore. Testes existentes de busca, formação e perfil do planejador também passaram.
