/* Editorial roles from confirmed transcriptions, never inferred from card names or HP. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_CARD_ROLES=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const ROLES={atk:'ATK',tank:'Tank / sustain',buff:'Buff',heal:'Cura aliada',protection:'Proteção aliada',control:'Controle',copy:'Cópia'};
const profiles={};
function add(ids,roles,scope='enemy',summary='',timing='',offField=false){for(const id of ids.split(' '))profiles[id]={roles,scope,summary,timing,offField};}
add('new-the-grinning-spectator-normal',['buff'],'ally','Dá +20% Crit Chance e +25% Crit DMG ao aliado com maior DMG. Eye Deal pode trocar 5% do Max HP desse aliado por crítico garantido quando um ataque normal erraria, sem custo fatal.','O alvo é o aliado de maior DMG, não necessariamente a carta do slot seguinte. O texto não confirma persistência depois que esta carta cai.');
add('c-352',['tank','protection','atk'],'ally','Fora de campo, recebe como Psychic Pressure 10% do dano sofrido pelo aliado ativo. Ao entrar, libera 25% da pressão em cada inimigo e cura a si mesmo em 15% do Max HP.','Fora de campo está explícito. Colocar nos slots 2–4 permite proteger quem está ativo antes de sua entrada; não é um buff que fica garantido após sua derrota.',true);
add('new-emy-evolved-calamity',['heal','control','atk'],'ally','Armazena 40% do HP perdido por aliados em Ice Flower (máximo 150% do seu DMG). No início do próprio turno, causa esse valor ao inimigo e cura o aliado com menor HP pela metade.','A cura escolhe o aliado com menor HP, não o próximo slot. Exige o gatilho da flor e o início do próprio turno; o texto não confirma atuação enquanto espera fora de campo.');
add('new-realitys-worst-duet-umbral',['copy','heal','protection','atk'],'ally','Registra uma ação aliada de dano, cura ou escudo. Repete dano a 40%; cura ou escudo vão ao aliado com menor HP a 60% da força, limitados a 15% do Max HP desse aliado.','Precisa de uma ação aliada depois do seu turno e da sua próxima ação normal para repetir. Não dá bônus de ATK a todos nem garante repetição após cair.');
add('new-last-hunting-party-normal',['protection','control','atk'],'ally','Salt bloqueia o primeiro Stun ou Charm inimigo em um aliado. Holy Water remove o primeiro escudo inimigo criado após o começo (até seu DMG); Devil’s Trap reduz em 30% o DMG do primeiro inimigo revivido por 2 turnos.','Cada ferramenta é de uso único. O texto protege um aliado, mas não define o próximo slot nem confirma funcionamento fora de campo.');
add('new-silverfox-vanguard-astral',['tank','atk','control'],'self');
add('new-black-flame-heir-calamity',['atk','tank'],'self');
add('new-magician-astral',['tank','atk'],'self');
add('new-sorcerer-killer-normal',['atk','control']);
add('new-silver-star-user-calamity',['atk','control']);
add('new-demonic-swordsaint-normal',['atk','tank'],'self');
add('new-black-eyepatch-calamity',['control']);
add('c-357',['copy','control'],'copy');
add('c-356',['control','atk']);
add('c-355',['atk']);
add('c-354 c-3',['tank','atk','control'],'self');
add('c-353',['copy','atk'],'copy');
add('c-351',['copy'],'copy');
add('c-350',['control']);
add('c-2',['tank','atk'],'self');
add('c-5',['atk','control']);
add('c-1',['atk','tank'],'self');
add('new-king-of-curses-calamity',['atk']);
add('new-little-owl-man-calamity',['control']);
add('new-rabbit-ghoul-umbral',['atk','tank'],'self');
add('new-half-ghoul-normal',['atk','tank'],'self');
add('new-sherlock-normal',['atk','control']);
add('new-two-timing-pro-astral',['atk','tank'],'self');
add('new-death-ledger-god-normal',['control','atk']);
add('new-holy-maiden-knight-calamity',['tank','atk','control'],'self');
add('new-no-longer-human-umbral new-no-longer-human-cursed-umbral',['control','atk']);
add('new-irregular-climber-normal',['control','atk']);
add('new-divine-knight-normal',['tank','atk'],'self');
add('new-cursed-king-vessel-umbral',['atk','tank'],'self');
add('new-fire-dragon-slayer-umbral',['atk']);
add('new-cyborg-gunslinger-calamity',['tank','atk','control'],'self');
add('new-the-demon-cyborg-normal',['atk']);
add('new-bomb-girl-calamity',['atk','tank'],'self');
// An updated or newly transcribed skill must be reviewed before reusing its roles.
const EXPECTED={"new-the-grinning-spectator-normal":"4649e31","c-352":"8b91a5b2","new-emy-evolved-calamity":"51deea","new-realitys-worst-duet-umbral":"69a04219","new-last-hunting-party-normal":"ecf96487","new-silverfox-vanguard-astral":"f8b75a42","new-black-flame-heir-calamity":"cfffa05","new-magician-astral":"e5d61807","new-sorcerer-killer-normal":"184bc195","new-silver-star-user-calamity":"9d6ad9f2","new-demonic-swordsaint-normal":"41f5cd35","new-black-eyepatch-calamity":"f15f929e","c-357":"d2525b9c","c-356":"7af5b007","c-355":"7f59fe4c","c-354":"2df585e","c-3":"e4c243e2","c-353":"885b937a","c-351":"567f5132","c-350":"f6ad5c8b","c-2":"11853779","c-5":"6d1dc355","c-1":"dd9b35e9","new-king-of-curses-calamity":"8d1b24a0","new-little-owl-man-calamity":"f68c1d9b","new-rabbit-ghoul-umbral":"88d10852","new-half-ghoul-normal":"f7f8648e","new-sherlock-normal":"64a5b06d","new-two-timing-pro-astral":"b8797a8d","new-death-ledger-god-normal":"bd1d51ec","new-holy-maiden-knight-calamity":"69f3ad6b","new-no-longer-human-umbral":"6a7e980e","new-no-longer-human-cursed-umbral":"6a7e980e","new-irregular-climber-normal":"5c522117","new-divine-knight-normal":"ba476576","new-cursed-king-vessel-umbral":"3f49ada0","new-fire-dragon-slayer-umbral":"8586918c","new-cyborg-gunslinger-calamity":"8d26d41b","new-the-demon-cyborg-normal":"796df9d8","new-bomb-girl-calamity":"8c726f19"};
function fingerprint(c){let h=2166136261;for(const ch of String(c?.ability||'')+'\n'+String(c?.effect||'')){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
function classify(card){const p=profiles[card?.id];if(card?.type!=='card'||!card.verified||!card.effect||!p||EXPECTED[card.id]!==fingerprint(card))return {reviewed:false,roles:[],scope:'unknown',offField:false,summary:'Habilidade ainda sem classificação confirmada. Não atribuímos função pelo nome, elemento ou quantidade de HP.',timing:'Aguardar a transcrição ou revisão da habilidade.'};const summary=p.summary||card.effect;const timing=p.timing||(p.scope==='self'?'A cura, a proteção ou o ganho são da própria carta. Isso não confirma ajuda aos outros slots.':p.scope==='copy'?'Copia para si ou reage a outra habilidade. Não concede automaticamente a habilidade aos aliados.':'Age no inimigo. Pode ajudar indiretamente conforme a duração do efeito, mas não é um buff direto de aliados.');return {...p,reviewed:true,roles:p.roles.slice(),summary,timing};}
function matches(card,filter=''){if(card?.type!=='card')return false;const p=classify(card);if(filter==='pending')return !p.reviewed;if(!p.reviewed)return !filter;if(filter==='allies')return p.scope==='ally';return !filter||p.roles.includes(filter);}
function select(catalog,{audience='allies',role='',query='',offField=false}={}){const q=String(query).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');return catalog.filter(c=>{if(c.type!=='card')return false;const p=classify(c);if(audience==='pending'?p.reviewed:!p.reviewed)return false;if(audience==='allies'&&p.scope!=='ally')return false;if(role&&!p.roles.includes(role))return false;if(offField&&!p.offField)return false;return !q||[c.fullName||c.name,c.border,c.element,c.ability,p.summary].join(' ').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q);});}
function options(pending=true){return [{id:'',name:'Todas as funções'},{id:'allies',name:'Ajuda aliados'},...Object.entries(ROLES).map(([id,name])=>({id,name})),...(pending?[{id:'pending',name:'Função pendente'}]:[])];}
function place(team,id,slot,catalog){if(!Number.isInteger(slot)||slot<0||slot>3)throw Error('Escolha um dos quatro slots.');if(!catalog.some(c=>c.id===id&&c.type==='card'))throw Error('Carta não encontrada no catálogo.');const next=Array.from({length:4},(_,i)=>team?.[i]||null),other=next.findIndex((x,i)=>x===id&&i!==slot);if(other>=0)throw Error('Esta carta já está no slot '+(other+1)+'. Reordene a formação no Deck para movê-la.');next[slot]=id;return next;}
return {ROLES,profiles,EXPECTED,fingerprint,classify,matches,select,options,place};
});
