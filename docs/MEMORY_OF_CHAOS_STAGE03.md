# Memory of Chaos — Stage 03, Broken Mind

**Estado documentado: 09/11/2026.** Baseado em capturas tiradas **durante a batalha**. O conteudo muda com as rotacoes do jogo. As habilidades cortadas nas imagens foram transcritas apenas em sua parte visivel.

## Regras necessarias para 3 estrelas

1. Montar **duas equipes diferentes de quatro cartas principais**, uma para cada fase.
2. **Nenhuma carta de suporte** pode ser usada neste modo.
3. Completar as **duas fases**.
4. Terminar sem **nenhuma carta derrotada**.
5. Vencer **cada fase em ate 22 turnos**.

As tres condicoes sao cumulativas e precisam acontecer em uma mesma tentativa. Nao basta que uma simulacao termine sem derrotas e outra seja rapida; nao basta vencer so uma fase. A mesma copia nao deve ser usada em dois slots; personagens homonimos de bordas diferentes sao registros distintos.

## Inimigos — equipe 1

Fase registrada: **Fire**, vantagem indicada **Wind**. O elemento individual de cada inimigo prevalece na comparacao elemental.

| Inimigo | Elemento | HP maximo | HP atual no print | DMG | Habilidade visivel / limite |
|---|---|---:|---:|---:|---|
| Apothecary Cat | Wind | 6.160 | 2.575 | 1.540 | Aprende o primeiro debuff que recebe; restante do texto cortado. |
| Fire Soldier | Fire | 9.240 | 9.240 | 2.310 | Cada ataque acerta duas vezes: primeiro golpe cheio, segundo com 50% do dano; restante cortado. |
| The Ancient Flame | Fire | 12.320 | 11.582 | 2.763 | 20% do HP removido pelo dano vira **Charred HP**, nao curavel; restante cortado. |
| Star Warrior Raised On… | Imaginary | 15.400 | 14.572 | 3.454 | **55% de esquiva**, cada esquiva bem-sucedida contra-ataca; dano/condicao do contra-ataque cortados. |

Prints: `prints/team1_apothecary_cat.png`, `team1_fire_soldier.png`, `team1_ancient_flame.png`, `team1_star_warrior.png`.

## Inimigos — equipe 2

Fase registrada: **Imaginary**, vantagem indicada **Quantum**.

| Inimigo | Elemento | HP maximo | HP atual no print | DMG | Habilidade visivel / limite |
|---|---|---:|---:|---:|---|
| Omniscient Reader | Quantum | 7.084 | 2.758 | 1.771 | Esquiva a primeira vez que cada habilidade inimiga o danifica e a aprende; restante cortado. |
| The Sky-Reaching Student | Fire | 10.624 | 7.458 | 2.656 | Aplica **Crossed Out** no inimigo atual ao entrar, alterando suas habilidades; funcionamento completo cortado. |
| Horned Maid | Fire | 14.168 | 10.426 | 3.542 | Ao entrar e a cada 3 turnos, aplica **Fatigue** e **Confusion** por 2 turnos; restante cortado. |
| Scythe Tactician | Wind | 17.708 | 7.220 | 4.427 | Ataques aplicam **Bleed** por 2 turnos; acertar alvo ja sangrando acrescenta 1 stack de **Execution**; restante cortado. |

Prints: `prints/team2_omniscient_reader.png`, `team2_sky_reaching_student.png`, `team2_horned_maid.png`, `team2_scythe_tactician.png`.

**Atencao ao HP:** o denominador das barras mostra o HP **maximo**; o numerador mostra dano que o inimigo ja tinha sofrido quando o print foi tirado. Na simulacao inicial, usar HP maximo, nunca HP atual da captura.

## Debuff do stage e conflito entre fontes

- A versao Stage 03 implementada no painel `#chaos` indica: a cada 2 turnos inimigos, aplica **Burn**; Burn repetido vira **Immolation**; em 2 Immolation, aplica **Fatigue**.
- Uma anotacao antiga chamada `experiencia.txt` descreve **Bleed** a cada 2 golpes, **Lifeleech** ao consumir Bleed e **Shock** por Bandages, tambem com referencia ao Stage 03.
- **Nao presumir que as duas versoes sao simultaneamente verdadeiras.** Pode ser diferenca de rotacao/patch/captura ou erro de anotacao. Conferir uma captura atual do modificador do stage antes de tomar decisoes irreversiveis.

## Rotacao

O relato e a interface registram troca periodica de **elementos, cartas inimigas e efeitos**; o painel existente avisa apos **tres dias** e permite editar manualmente os 8 inimigos e as duas fases. Nao ha sincronizacao ou previsao automatica do futuro. Para uma nova rotacao, atualizar separadamente nome, elemento, HP maximo, DMG e habilidade de cada inimigo, bem como o modificador de stage.

No modelo local o ciclo elemental atualmente codificado e `Fire > Ice > Lightning > Wind > Fire` e `Quantum > Imaginary > Physical > Quantum`, com multiplicadores aproximados `1,5x` favoravel e `0,70x` desfavoravel. Confirmado explicitamente no historico: **Fire vence Ice**. Os demais pares e multiplicadores devem ser confrontados com a regra oficial atual antes de serem tratados como fato do Roblox.

## Simulador e dados em falta

- A interface lista 365 cartas principais, mas somente **20** possuem HP/DMG e efeitos verificados no registro `data.js`. **345** ainda nao podem ser simuladas numericamente de modo fiel.
- O texto de habilidade editado no navegador nao implica automaticamente comportamento novo no motor: cada gatilho precisa de implementacao especifica.
- O motor implementa parte das 20 habilidades e efeitos inimigos. Ordem real de golpes, timing, chance de ativacao, contras, relíquias, traits, buffs e danos de certos debuffs continuam incompletos ou hipoteticos.
- A mesma carta em bordas diferentes pode ser um registro distinto; preservar `id`, `border`, `element`.
- Critico, esquiva, quantidade de golpes e cadeia de debuffs importam especialmente contra **Star Warrior**, **Omniscient Reader**, **Horned Maid** e **Scythe Tactician**.

## Resultado real da ultima busca conhecida

**100.000 equipes diferentes testadas sem suportes** no modelo conhecido:

| Medida | Resultado |
|---|---:|
| Venceram as duas fases na tentativa modelada | 9.161 |
| Cumpriram simultaneamente as 3 condicoes | **0** |

Melhor composicao **parcial** registrada no modelo, **nao uma vitoria de 3 estrelas**:

- Time 1: **King of Games** (Calamity), **The Grinning Spectator** (Normal), **Vector Storm** (Normal), **Blue Wolf** (Astral).
- Time 2: **Fullmetal Alchemist** (Umbral), **Ashey** (Calamity), **Vector Storm** (Calamity), **Magician** (Astral).

Um relato anterior de cerca de **8% de 3 estrelas** usou indevidamente cartas de suporte no Memory of Chaos. **Resultado invalidado** porque o modo nao permite suportes. Nenhuma formacao foi comprovada como vencedora no jogo por esta busca.

## Proximo passo para uma solucao confiavel

1. Capturar as partes **completas** das 8 habilidades inimigas e o modificador ativo de Stage 03.
2. Coletar HP, DMG, habilidade e efeitos das demais 345 cartas que se pretenda comparar; preferir cartas fortes primeiro.
3. Registrar um replay real: ordem de turno, alvo, dano recebido/causado, bloqueios, esquivas, stacks, KO, tempo por fase e resultado das estrelas.
4. Calibrar o motor com esse replay. Executar varias simulacoes por composicao; classificar taxa de sucesso **do modelo** separada da vitoria confirmada no Roblox.
