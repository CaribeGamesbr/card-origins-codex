# Arquivo-mestre — Card Origins

Atualizado em **09/11/2026**. Base comunitaria de trabalho, nao oficial. Este diretorio e a copia publica, sem links pessoais, dos dados reunidos neste projeto. A copia pessoal integral e mantida no Google Docs.

## Por onde comecar

- [`MEMORY_OF_CHAOS_STAGE03.md`](MEMORY_OF_CHAOS_STAGE03.md): dois times, tres estrelas, oito inimigos, habilidades visiveis, rotacao e resultados das simulacoes.
- [`CARTAS_CONFIRMADAS.md`](CARTAS_CONFIRMADAS.md): atributos e habilidades de todas as cartas principais atualmente conferidas nos prints (gerado de `data.js`).
- [`CATALOGO_ATUAL_CARTAS.md`](CATALOGO_ATUAL_CARTAS.md): indice das **369 cartas principais + 37 suportes**, com sinalizacao explicita de dados ausentes (gerado de `data.js`).
- [`INFINITE_TOWER_SIMULADOR.md`](INFINITE_TOWER_SIMULADOR.md): capturas do andar 261, sete Paths, modelo de combate, comandos de busca e limitacoes.
- [`WIKI_PUBLICA_HISTORICO.md`](WIKI_PUBLICA_HISTORICO.md): espelho sanitizado dos 27 capitulos do documento-mestre Google Docs, incluindo combate, elementos, debuffs, traits, reliquias, circuitos, modos, skill tree, Colosseum e Infinite Tower. **O texto historico nao foi inteiramente revalidado no patch atual**.
- [`FONTES_E_PENDENCIAS.md`](FONTES_E_PENDENCIAS.md): fontes, divergencias, testes e o que precisa ser confirmado.
- [`prints/`](prints/): capturas originais fornecidas pelo usuario, sem editar os numeros ou efeitos.

## Fonte canonica de dados do simulador

- `../data.js`: os 406 registros atuais das cartas.
- `../chaos-engine.js`: **modelo aproximado** de combate, regras elementais e inimigos da rotacao registrada.
- `../chaos-ui.js`: interface e algoritmo de busca; dados de cartas completados no navegador nao se sincronizam automaticamente.
- `../infinite-engine.js`: modelo comparativo de combate sequencial do Infinite Tower, com sete Paths e busca de time.
- `../infinite-ui.js`: painel interativo de simulacao, parametros editaveis e recomendacao.

## Regra de atualizacao

1. Preservar a imagem original e anotar sua data e origem.
2. Transcrever literalmente numeros (HP maximo versus HP atual) e somente a habilidade que estiver legivel.
3. Separar `confirmado no print`, `extraido da configuracao` e `hipotese do simulador`.
4. Registrar cada rotacao de Memory of Chaos como instantaneo proprio, nunca sobrescrever o anterior sem copia.
5. Simular as **duas equipes de quatro cartas principais**; nao adicionar suportes ao Memory of Chaos.
6. Para marcar 3 estrelas, exigir na **mesma partida**: vencer ambas as fases, zero cartas derrotadas e no maximo 22 turnos em cada fase.
7. Nunca afirmar vitoria no jogo a partir de um resultado exclusivamente simulado.

## Escopo e limites

O link antigo de conversa compartilhada e a captura de erro nao fornecem, por si so, as mensagens e os dados de todas as imagens perdidas. Reunimos o historico **acessivel nesta sessao**, os registros no codigo e o documento anterior. Uma carta sem atributos lidos continua sem atributos, mesmo que possua arte e nome catalogados. Os conflitos entre fontes nao sao resolvidos por suposicao.
