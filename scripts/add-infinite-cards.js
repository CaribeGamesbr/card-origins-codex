/* Importa de forma idempotente quatro variantes verificadas nos prints de 09/11/2026.
 * Regrava as tres representacoes do catalogo mecanicamente, sem alterar registros antigos.
 */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
const local={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,'data.js'),'utf8'),local);
const existing=Array.from(local.window.CARDO_DATA);
const additions=[
 {id:'new-king-of-curses-calamity',name:'KING OF CURSES',border:'Calamity',element:'Fire',hp:3871,dmg:1290,ability:'CLEAVE & DISMANTLE',effect:'Ataques sempre acertam, ignorando Dodge, reducao de dano e negacao. Quando o inimigo tenta esquivar, o golpe causa +40% de dano e aplica Bleed por 1 turno. Ataques causam +20% de dano em inimigos acima de 50% de HP. Cada eliminacao concede +10% de DMG permanente.',effectEnglish:'Attacks always hit, ignoring Dodge, Damage Reduction and negation; if an enemy tries to dodge, he cuts through for 40% more DMG and inflicts Bleed for 1 turn. Attacks deal +20% DMG to enemies above 50% HP, and every kill permanently grants +10% DMG.',image:'assets/cards/KING_OF_CURSES_CALAMITY_FIRE.png',pack:'Default Pack'},
 {id:'new-little-owl-man-calamity',name:'LITTLE OWL MAN',border:'Calamity',element:'Wind',hp:3450,dmg:1151,ability:"PREDATOR'S PRESSURE",effect:'Ao entrar, aplica Dread. Cada ataque inimigo adiciona Disorientation; se errar ou sua habilidade falhar, aplica Condemnation. Com os tres debuffs presentes, consome todos para aplicar Silence por 1 turno e Rupture, que transforma a proxima cura recebida pelo alvo em dano.',effectEnglish:'On entry, inflict Dread. Each enemy attack adds Disorientation; a miss or failed ability applies Condemnation. With all 3 active, consume them to inflict Silence for 1 turn and Rupture, turning the next healing they receive into damage.',image:'assets/cards/LITTLE_OWL_MAN_CALAMITY_WIND.png',pack:'Default Pack'},
 {id:'new-rabbit-ghoul-umbral',name:'RABBIT GHOUL',border:'Umbral',element:'Fire',hp:4812,dmg:1603,ability:'WINGS THAT BURY THE LIVING',effect:'No inicio de seu turno, recebe +40% Dodge ate o proximo turno. Uma vez por batalha, ao esquivar de um golpe, revida com estilhacos causando 60% de DMG e aplica Bleed por 2 turnos, consumindo o bonus de Dodge ate o proximo turno.',effectEnglish:'At the start of her turn, gain 40% Dodge until her next turn. Once per battle, when she dodges a hit, retaliate with a shard barrage for 60% DMG and Bleed for 2 turns, which uses up this Dodge bonus until her next turn.',image:'assets/cards/RABBIT_GHOUL_UMBRAL_FIRE.png',pack:'Default Pack'},
 {id:'new-half-ghoul-normal',name:'HALF GHOUL',border:'Normal',element:'Physical',hp:2937,dmg:978,ability:'HUNGER: CENTIPEDE',effect:'40% do HP que esta carta retira dos inimigos vira Flesh (metade contra bosses). Ao cair abaixo de 35% de HP, consome todo Flesh para curar ate 50% do HP maximo e entra em Hunger por 2 turnos. Durante Hunger, cada hit tambem causa 25% de DMG ao proximo inimigo e aplica Rupture.',effectEnglish:'40% of the HP this card removes from enemies becomes Flesh (halved from Bosses). If it would fall below 35% HP, consume all Flesh to heal up to 50% Max HP and enter Hunger for 2 turns: each hit also deals 25% DMG to the next enemy and inflicts Rupture.',image:'assets/cards/HALF_GHOUL_NORMAL_PHYSICAL.png',pack:'Manga Weather'}
].map(c=>({type:'card',fullName:c.name,number:null,variant:[],verified:true,addedAt:'2026-11-09',source:'print original enviado ao Google Drive',...c}));
const missing=additions.filter(c=>!existing.some(x=>x.id===c.id));
const firstSupport=existing.findIndex(c=>c.type==='support');
if(firstSupport<0)throw new Error('Catalogo sem suportes; nao modificar.');
existing.splice(firstSupport,0,...missing);
fs.writeFileSync(path.join(base,'data.js'),'window.CARDO_DATA = '+JSON.stringify(existing)+';\n');
fs.writeFileSync(path.join(base,'catalog.json'),JSON.stringify(existing,null,2)+'\n');
const cols=['tipo','numero','nome','elemento','borda_ou_tipo','variante','hp','dmg','habilidade','descricao','verificado_em_print'];
const quote=s=>{const v=String(s??'');return /[",\n\r]/.test(v)?'"'+v.replaceAll('"','""')+'"':v};
const rows=existing.map(c=>[c.type,c.number??'',c.name,c.element||'',c.border||c.kind||'',Array.isArray(c.variant)?c.variant.join(' / '):'',c.hp||'',c.dmg||'',c.ability||'',c.effect||'',c.verified?'Sim':'Nao'].map(quote).join(','));
fs.writeFileSync(path.join(base,'catalogo.csv'),'\ufeff'+cols.join(',')+'\n'+rows.join('\n')+'\n');
console.log(`Novas variantes: ${missing.length}; principais: ${existing.filter(c=>c.type==='card').length}.`);
