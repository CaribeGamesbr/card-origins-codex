# Fontes, limites de confiabilidade e pendencias

Data de consolidacao: **09/11/2026**.

## Fontes de primeira mao

| Fonte | Conteudo | Estado |
|---|---|---|
| Prints de cartas e inimigos enviados nesta conversa | Elementos, bordas, HP, DMG, efeitos legiveis e valores atuais das barras | Arquivados em `prints/`; texto cortado = desconhecido. |
| `data.js` | 365 cartas principais e 37 suportes, 20 principais com numeros e habilidades | Fonte tecnica atualmente sincronizada com o site; 345 principais sem HP/DMG confiaveis. |
| `chaos-engine.js` | Modificadores, inimigos, simulacao aproximada, algoritmo e fases | **Nao e mecanica oficial**; representa hipoteses operacionais. |
| `chaos-ui.js` | Editor, busca de times, reavaliacao de 3 estrelas, edicao de rotacoes | Salva ajustes localmente no navegador, sem sincronizacao com Google Drive/GitHub. |
| Google Docs pessoal anterior | Wiki historica em 27 capitulos: combate, raridade, elementos, debuffs/reacoes, traits, 5 reliquias, sets, circuitos, builds, 146 talentos, Infinite Tower, Colosseum | Preservado integralmente no proprio Google Docs; copia **sanitizada** no GitHub. Dados antigos exigem revalidacao apos patch/rotacao. |
| Conversa compartilhada `chatgpt.com/share/6af17d52-a67c-83ea-bf72-3af40b11d138` | Contexto de que houve uma conversa longa sobre cartas e simulador | A pagina/screenshot relatam **erro/limite de leitura**. Nao foi possivel garantir recuperacao integral de cada mensagem/imagem da sessao perdida. |

## Confusoes ja corrigidas

1. **Suporte no Memory of Chaos:** nao permitido. Analise anterior com suportes e invalida.
2. **HP atual ≠ HP maximo**: numerador da barra no print de batalha pode estar baixo; para entrar numa fase usar denominador.
3. **Vitoria de uma fase ≠ tres estrelas**: exigir as duas fases, zero KO e ate 22 turnos por fase no mesmo teste.
4. **Carta com imagem ≠ carta com habilidade conhecida**: so 20 de 365 principais possuem stats completos, 345 exigem novas capturas.
5. **Resultado do simulador ≠ resultado confirmado no Roblox**.
6. **Stage 03 Burn vs Bleed**: fontes divergem, ver `MEMORY_OF_CHAOS_STAGE03.md`; nao mesclar os dois efeitos em regra unica sem nova captura.
7. **Dano do ataque basico**: anotacao historica citava HP/3; doc mais recente faz outras aproximacoes. Essa divisao nao foi suficientemente validada como formula universal do jogo.
8. **Poder de elementos**: `Fire > Ice` foi explicitamente corrigido; demais vantagens e numeros do motor sao hipoteses ate nova verificacao.

## Links publicos

- Site: https://caribegamesbr.github.io/card-origins-codex/#chaos
- Codigo: https://github.com/CaribeGamesbr/card-origins-codex
- Jogo Roblox (link registrado na wiki): https://www.roblox.com/games/start?placeId=78312396550517

## Rotina de continuidade

Na proxima conversa, abrir `docs/README.md` e a wiki Google Docs antes de alterar resultados. Cada novo print entra com data, carta/rotacao, origem, numeros e transcricao do efeito. Manter `data.js` como base do catalogo e regenerar `CARTAS_CONFIRMADAS.md`/`CATALOGO_402_CARTAS.md`. Nunca sobrepor os dados confirmados por novas conjecturas. O GitHub Pages e copia publica: nao incluir links privados do Drive, IDs pessoais ou tokens.
