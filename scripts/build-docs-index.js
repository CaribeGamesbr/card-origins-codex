/* Regenera indices publicos somente a partir de data.js. Nao inventa valores. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const target = path.join(root, 'docs');
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), box, { filename: 'data.js' });
const records = Array.from(box.window.CARDO_DATA || []);
const main = records.filter(x => x.type === 'card');
const supports = records.filter(x => x.type === 'support');
const confirmed = main.filter(x => Number(x.hp) > 0 && Number(x.dmg) > 0 && x.ability && x.effect);
const cell = x => String(x ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const link = x => x.image ? `[arte](../${encodeURI(x.image).replaceAll('%25','%')})` : '—';

const details = [
  '# Cartas principais com atributos e habilidades registrados',
  '',
  `Gerado automaticamente de \`data.js\` em 09/11/2026. **${confirmed.length} cartas com HP, DMG e habilidade** entre ${main.length} cartas principais. Transcricoes em portugues associadas aos prints; efeitos com partes faltantes/alteracoes de patch exigem nova verificacao.`,
  ''
];
for (const c of confirmed) {
  details.push(`## ${c.name} — ${c.border} / ${c.element}`,'',
    `- ID do registro: \`${c.id}\`; HP maximo: **${c.hp}**; DMG: **${c.dmg}**.`,
    `- Habilidade: **${c.ability}**.`,
    `- Efeito registrado: ${c.effect}`,
    `- Arte no repositorio: \`${c.image || 'nao registrada'}\`.`,
    `- Origem do campo: ${c.source || 'catalogo local, verificar print'}.`,'');
}
fs.writeFileSync(path.join(target, 'CARTAS_CONFIRMADAS.md'), details.join('\n')+'\n');

const index = [
  '# Catalogo das 402 cartas registradas', '',
  'Gerado de `data.js`; nao e uma lista de cartas existentes em todo o jogo, mas dos **registros desta colecao**. Nomes iguais em bordas diferentes podem ser cartas distintas.', '',
  `**Total:** ${records.length} registros = ${main.length} principais + ${supports.length} suportes. ${confirmed.length} principais tem HP/DMG/habilidade; ${main.length-confirmed.length} estao com campos mecanicos incompletos.`, '',
  '## Cartas principais', '',
  '| ID | Carta | Borda | Elemento | HP max | DMG | Habilidade | Arte |',
  '|---|---|---|---|---:|---:|---|---|'
];
for (const c of main) index.push(`| ${cell(c.id)} | ${cell(c.name)} | ${cell(c.border)} | ${cell(c.element)} | ${c.hp || '?'} | ${c.dmg || '?'} | ${cell(c.ability || 'NAO TRANSCRITA')} | ${link(c)} |`);
index.push('', '## Cartas de suporte — fora de Memory of Chaos', '',
  '**Importante:** todos os suportes sao catalogados, mas **nenhum** e selecionavel nas duas equipes do Memory of Chaos.', '',
  '| ID | Suporte | Tipo | Efeito conhecido | Arte |', '|---|---|---|---|---|');
for (const c of supports) index.push(`| ${cell(c.id)} | ${cell(c.name)} | ${cell(c.kind)} | ${cell(c.effect || c.ability || 'NAO TRANSCRITO')} | ${link(c)} |`);
index.push('', '## Campos em falta', '',
  'Registro sem HP/DMG ou habilidade nao foi usado em calculo numerico; imagens e nomes **nao permitem inferir automaticamente** estatisticas ou probabilidades. Quando houver novo print, atualizar `data.js`, depois rodar `node scripts/build-docs-index.js`.','');
fs.writeFileSync(path.join(target, 'CATALOGO_402_CARTAS.md'), index.join('\n')+'\n');
console.log(`Generated ${confirmed.length} confirmed cards and ${records.length} catalog rows.`);
