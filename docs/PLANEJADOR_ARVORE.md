# Planejador de árvore por equipe e orçamento

Atualizado em 09/11/2026. Menu público: `#planner`.

## Entrada e perfis

O botão **+ Nova carta** leva ao cadastro protegido do proprietário. Depois de salvar no GitHub e no Google Docs e aguardar a publicação do catálogo, é possível atualizar um slot do Deck e de **Meu time** no planejador. Os pontos e as marcações existentes são mantidos; o time do amigo não é alterado. A ativação inicial e os estados de gravação estão em [Cadastro de cartas](CADASTRO_CARTAS.md).

O usuário escolhe quatro cartas, os pontos disponíveis (0–500), uma reserva opcional, objetivo de subir andares ou farm e um Path específico ou comparação dos sete. Há dois perfis locais independentes: Meu time e Time do amigo/externo. O perfil externo inicia com as três cartas dos prints (Umbra Witch Astral/Lightning 16480 HP/6311 DMG, Fox Contract Hunter Umbral/Fire 17765/6055 e Walker Astral/Imaginary 11859/3783), mais uma curandeira de gelo de identidade/borda não confirmadas, com orçamento de 80 pontos.

Esse exemplo externo não foi incluído em `data.js`, não altera os 408 registros da coleção e não recebe números inventados para a curandeira. Cartas podem ser copiadas do catálogo, importadas do Deck/Infinite ou editadas como registros manuais somente do perfil. Trait e função podem ser informados. Os dois perfis são persistidos em `codex-tree-planner-v1` no navegador.

## O que o cálculo faz

`tree-planner-engine.js` combina critérios explícitos de sinergia (bordas, elementos, função, trait informado, objetivo e Path) com custos registrados em `skill-data.js`. Um algoritmo de mochila 0/1 encontra a maior soma desses índices dentro do orçamento direto, em cada Path. O índice é heurístico: não é um atributo oficial, porcentagem de vitória nem resultado de combate. Não constitui prova de melhor árvore do Roblox.

O motor de combate do Infinite não foi modificado ou conectado ao índice. Tiers, suportes, ordem real dos golpes e interações incompletas não são comparados nesta análise. Os pesos estão no código e favorecem, por exemplo, bônus da borda presente, talentos dos elementos da equipe e especialização do Path correspondente. Talentos de Traits exigem que o trait correspondente tenha sido informado.

Upgrades de debuff exigem uma fonte identificada: Fire/Burn, Ice/Frostbite e Wind/Bleed usam os efeitos elementais registrados; Shock e Immolation exigem descrição correspondente nas cartas. Fire Mastery marcado como já aprendido também habilita a consideração de Immolation para Fire. Não se presume que Chain aplique Shock, que todo Fire já aplique Immolation, ou que Rot modifique o Decay específico do Path Nihility. Um talento apenas projetado não é tratado como já ativo para essas condições.

## Custos, aprendidos e pré-requisitos

- Pontos livres: talentos marcados como já aprendidos servem de contexto e não são cobrados novamente.
- Total após reset: a lista de aprendidos é ignorada para custo e todos os talentos sugeridos são cobrados.
- A reserva é subtraída do orçamento utilizável e continua incluída nos pontos não gastos. Nenhum plano ultrapassa `pontos - reserva`.
- Projeção: considera os talentos pertinentes, mas custos de caminhos intermediários desconhecidos não são inventados. A lista exibe aviso de que não garante uma árvore comprável.
- Disponíveis confirmados: considera apenas os nós que o usuário marcou como liberados no jogo; não deduz disponibilidade da reconstrução visual do mapa.
- Efeitos/custos incompletos são excluídos. Um plano compara apenas a especialização Unbound do Path correspondente.

O editor permite marcar aprendidos e disponíveis por perfil. Importar minha árvore registrada é uma ação explícita; estados inferidos, como Origin II, são excluídos dessa importação. A árvore pessoal não é aplicada silenciosamente ao amigo. A ordem da lista é prioridade por sinergia/custo, não uma ordem oficial de desbloqueio.

## Resultado e limites

### Interface visual no estilo da Skill Tree

**Configurar planejamento** agora apresenta a equipe no mesmo formato do painel do Infinite: quatro cartas com imagens grandes, atributos registrados, circuitos adjacentes, botões Trocar/Ampliar e setas de ordem. A troca usa busca no catálogo completo; cartas sem dados continuam identificadas como pendentes e imagens ausentes não são substituídas por outra variante. O editor de dados manuais permanece recolhido em cada carta e permite informar HP/DMG confirmados.

Os totais indicam quantas cartas têm atributos registrados e mostram **parcial** quando faltam dados. Circuitos e ressonâncias são apenas uma referência visual baseada nas regras já registradas no painel do Infinite, sem somar bônus aos atributos base nem ao índice do planejador.

Há quatro slots de suporte opcionais, salvos no respectivo perfil como referência. Ao mudar a ordem, cada suporte acompanha sua carta. A importação do Deck/Infinite copia os suportes da mesma origem, preservando a formação original. Perfis antigos recebem slots vazios; nenhum suporte é equipado silenciosamente. Os efeitos dos suportes continuam fora do cálculo da árvore. As restrições de suporte único já registradas são mantidas, e efeitos pendentes não são inventados.

Pontos, reserva, objetivo, Path e marcações ficam abaixo da formação; **Usar time e calcular** aplica a configuração ao mapa. A reorganização está em `tree-planner-team.js` e não altera o motor de recomendações, o catálogo ou o progresso pessoal da Skill Tree.

O planejador abre em tela cheia com a mesma organização do menu Skill Tree: sete ramos à esquerda, mapa de talentos no centro e detalhes à direita. O botão **Configurar** reúne time, perfil, pontos, reserva, objetivo, Path e marcações. A comparação completa e a lista de prioridades ficam em **Lista / Paths**, sem ocupar a tela principal.

O mapa diferencia **sugeridos em azul**, **já aprendidos em verde** e os demais em cinza. Clicar em um talento mostra custo, efeito registrado e motivo da sugestão, e permite marcar aprendido/disponível apenas no perfil do planejador. A busca aceita nomes em inglês e português; há visão geral dos sete ramos, enquadramento, arraste, zoom e navegação entre sugestões.

`tree-planner-map.js` reutiliza as posições e conexões visuais de `skill-tree-topology.js`, sem interpretar os traços como pré-requisitos. A interface não lê nem escreve o progresso interativo pessoal da Skill Tree. Marcações existentes do planejador permanecem salvas nos respectivos perfis; o motor de recomendações e o catálogo não foram alterados nesta reorganização.

Exibe Path recomendado pelo índice, talentos, custos individuais/acumulados, gasto direto, sobra, reserva e comparação das distribuições dos sete Paths. É possível copiar o plano. Nenhum talento é comprado no Roblox e o catálogo/Deck/Infinite existentes são preservados.

Os pré-requisitos oficiais precisam ser confirmados para que o projeto possa garantir a validade de uma árvore completa. Bônus já embutidos nos atributos dos prints não são multiplicados novamente. Cartas sem dados continuam sinalizadas como incompletas.

## Verificação

`node scripts/test-tree-planner.js` verifica orçamento/reserva, zero pontos, aprendidos e disponibilidade, exclusividade de Unbound por Path, exclusão de efeitos desconhecidos, entradas inválidas e a otimização de mochila contra enumeração exaustiva de pequenos exemplos. `node scripts/test-tree-planner-map.js` verifica os sete ramos, visão geral, nós ocultos, fidelidade das conexões e preservação dos dados de origem. Verificação de sintaxe: `node --check tree-planner-ui.js` e `node --check tree-planner-map.js`.

`node scripts/test-tree-planner-team.js` verifica movimentação conjunta carta/suporte, preservação do perfil, totais incompletos, circuitos adjacentes, compatibilidade com os nomes já registrados e migração dos slots de suporte.
