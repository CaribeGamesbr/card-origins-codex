# Infinite: habilidades, banco e busca de combinações — 11/11/2026

A revisão anterior de funções leu os prints e organizou o catálogo, mas não implementou todas essas habilidades no combate. A busca anterior também sorteava a maioria das cartas com peso em DMG/HP; uma passiva útil no banco e com atributos baixos era pouco explorada. Esta alteração executa gatilhos de combate e faz a busca experimentar combinações antes de comparar os resultados.

## Dados preservados e novas cartas

433 registros: 394 principais e 39 suportes. Nove variantes novas; Delusional Overlord `c-80` recebeu a transcrição completa no mesmo registro, com HP 2.209 e DMG 838. Agora são 50 principais com atributos/transcrições completas e 344 ainda pendentes nesse aspecto. As outras 423 entradas anteriores foram preservadas integralmente. As imagens dos nove prints foram copiadas sem edição e guardadas no Drive da coleção. A miniatura sem nome foi desconsiderada a pedido do proprietário.

## Habilidades que passaram a executar

| Carta / forma | Comportamento no motor | Limites mantidos explícitos |
|---|---|---|
| Delusional Overlord | Depois de completar dois turnos, 150% DMG em cada inimigo vivo, ignorando esquiva, escudos e redução de dano; perde 40% Max HP. Não explode nem paga esse custo se a ação normal já encerrou a batalha. | Duração de Fatigue/Immolation permanece pendente; duração configurada é hipótese explícita. |
| The Scarlet Catalyst | Sem Burn: 30% no alvo e 15% em cada outro inimigo; aplica Burn por dois turnos. Com Burn: 35% no alvo e um tick, reduzindo um turno. | Sem coeficiente de Burn confirmado no contexto, preserva presença e duração com tick de dano omitido. Não se usa o valor conflitante de 75% de uma referência antiga. |
| Abyssal Pianist | Enquanto vivo, inclusive no banco: um Echo de 25% do seu DMG depois do acerto de outro aliado; se errar ou for esquivado, cura esse aliado em 8% Max HP. | Echo não dá crítico nem dispara outro Echo. Acerto absorvido por escudo não é tratado como erro. |
| King of Curses Evolved | Acima de 50% HP: quatro hits de 25%. A 50% ou menos: ataque e pierce de 50% ao próximo inimigo, ignorando defesas. | Combo Guardian of Hell não executa: suporte não identificado/transcrito. |
| Demon King | Burn de três turnos; consome Burn após acerto para +50% uma vez por inimigo; Stun de um turno uma vez; revive com 50% HP e limpa debuffs; após reviver, cura 15% Max HP por eliminação própria. | Coeficientes de Burn e duração do Shock usam somente dados confirmados ou hipótese indicada. Errar não consome o Burn. |
| Slayer of the Past Evolved | 15% redução própria; aprende habilidades de dano identificadas às quais sobreviveu; futuros usos identificados causam 20% menos dano ao time. Ganho de DMG e hit de 150% condicionado à decifração. | Ataque normal não é convertido em habilidade. Inimigos sem habilidade identificada não fornecem decifração inventada. |
| Flame Pillar | Abaixo de 50% HP, 1,5× DMG e lifesteal de 20% pelo resto da batalha. | Burn de 15% tem duração não informada: omitido sem hipótese de duração. |
| Northern Blade / Demonic Emperor | Interceptam eventos reais de cura, escudo ou ganho de DMG, conforme cada selo, guardam/roubam a parcela indicada e transferem marcas na derrota do alvo. | Não são inventadas ações de cura, escudo ou buffs para inimigos desconhecidos. |
| Fallen Angel | Transcrição e classificação preservadas. | Sorteio e gatilhos ainda não implementados; nenhuma probabilidade foi presumida. |

Os handlers novos usam IDs e a habilidade da forma exata. Uma evolução não herda automaticamente o comportamento de outra versão. As passivas inimigas conhecidas continuam executando nos dois lados; os quatro inimigos reais de cada andar continuam desconhecidos.

## Reinício por andar

Em 11/11/2026 o proprietário confirmou que “uma vez por batalha” reinicia em cada andar do Infinite. Contadores, habilidades de uso único e suportes recebem esse reinício. Não se recupera HP perdido nem se revive uma carta derrotada gratuitamente ao passar de andar. Buffs de combate não formam um banco ilimitado entre waves.

## Árvore, elementos e circuitos

A busca captura a árvore pessoal salva, sem ler o perfil do amigo no planejador. HP/DMG já exibidos na carta não recebem de novo percentuais de ascensão, Curse, árvore ou relíquias. O mesmo contexto congelado acompanha todas as candidatas e finalistas.

Foram ligados ao combate os gatilhos confirmados de Quantum Extra Turn, Chain Lightning com a distribuição documentada de Lightning Mastery, Crushing Fatigue, Concussion e os três efeitos de quatro ou mais debuffs (cura, dano e escudo/redução). O coeficiente do Chain básico permanece omitido quando não confirmado. Elemental Attunement participa da chance de proc já existente; sua cobertura de potência e as demais regras incompletas continuam indicadas no relatório. Elements Mode controla o aumento inimigo e as vantagens elementares; não é usado como chave para apagar toda passiva elemental.

Ressonância, Whiteout e Thermal Shock continuam presentes; Combustion Link, Cryostasis, Wildfire e Withering Sky têm gatilhos por evento. Cópias não se espalham recursivamente. Os limites “por rodada” são aproximados por ação aliada; vários outros circuitos, o consumo de Frostbite de Thermal Shock e as reações restantes continuam parciais. Um circuito mostrado na formação não é uma alegação de implementação integral.

## Busca e relatório

A lista elegível aplica primeiro os HP/DMG que o usuário informou e só depois filtra cartas sem atributos. A tela permite configurar qualquer variante do catálogo. Não há preenchimento automático de HP/DMG a partir da borda, da arte ou de outra forma.

A exploração inclui dano em área, passivas do banco, controle antes/depois do atacante, sustain, multi-hit/pierce e ordens alternativas para os mesmos quatro slots. Cada composição é testada com os Paths; a escolha final usa combate semeado e reavaliação, não apenas a etiqueta de função. Não é busca exaustiva nem prova de melhor time absoluto.

O resultado mostra as habilidades e os gatilhos de árvore/circuitos que dispararam em uma execução de exemplo, além das pendências. A taxa e velocidade continuam agregadas sobre os testes. Nem aparecer no catálogo nem ter uma função revisada significa que a passiva inteira foi executada.

## Validação

Passaram os testes de remessa/preservação, funções, habilidades individuais, integração, busca por sinergias, combate, busca, relatório e equipe do planejador. Regressões cobrem: oito inimigos em dois andares com duas explosões e custo real de HP; Catalyst com 15% nos outros alvos; Echo do banco sem crítico/recursão; habilidades especiais preservando Path/debuff; escudos distinguindo acerto de esquiva; circuitos registrados mesmo em derrota; Atomic sem cobrança quando não há alvo; atributos manuais liberando variante pendente; árvore salva alterando o combate; preservação do catálogo e formações.

O crescimento de inimigos, ordem de ações e muitas regras ainda precisam de batalhas reais para calibração. O teste de 822 continua sendo contra somente um Chain Avenger confirmado, não contra uma wave real inteira. Nenhuma alteração autoriza prever que a equipe alcança um andar específico do jogo.
