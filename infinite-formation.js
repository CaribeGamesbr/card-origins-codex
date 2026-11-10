/* Confirmed circuit names/descriptions; displaying a link does not implement its combat trigger. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_INFINITE_FORMATION=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const CIRCUITS=[
 ['Fire','Fire','Combustion Link','Burn dura +1 turno, até 4. Primeiro Burn por rodada aliada.'],
 ['Ice','Ice','Cryostasis Link','Primeiro escudo da rodada: a parceira recebe 40% do valor. A cópia não ativa outro circuito.'],
 ['Lightning','Lightning','Conductor Link','Primeiro Chain Hit salta para um terceiro inimigo com 60% do dano do chain; não repete alvo.'],
 ['Wind','Wind','Razor Current','Ao aplicar Bleed, um Bleed em outro inimigo dura +1 turno. Uma vez por rodada.'],
 ['Quantum','Quantum','Entangled Link','Extra Turn real: 20% de chance de a parceira ganhar +25% Crit DMG na próxima ação. Não cria turno extra.'],
 ['Imaginary','Imaginary','Null Link','Primeira redução de atributo da rodada fica 40% mais forte.'],
 ['Physical','Physical','Warbound Link','Ganha pontos com Fighting Spirit. O gasto completo dos pontos ainda está pendente de transcrição.'],
 ['Fire','Ice','Thermal Shock','Hit em alvo com Burn: próximo tick +60%; consome Frostbite se houver. Uma vez por rodada.'],
 ['Fire','Wind','Wildfire','Wind atinge alvo com Burn: copia Burn para o próximo inimigo com 90% da força. A cópia não se espalha novamente.'],
 ['Fire','Lightning','Flashover','Chain a partir de alvo com Burn causa +20% de dano. Detalhes adicionais com Shock ainda pendentes.'],
 ['Ice','Lightning','Superconductor','Efeito ainda não confirmado; nome e combinação registrados.'],
 ['Ice','Wind','Whiteout','Hit em alvo com Frostbite ou Bleed: próximo ataque inimigo causa 15% menos DMG. Não acumula.'],
 ['Lightning','Wind','Stormfront','Chain a partir de alvo com Bleed: copia Bleed ao alvo do chain com 80% da força. Uma vez por rodada.'],
 ['Quantum','Imaginary','Paradox','Extra Turn real de Quantum: redução removível no alvo fica 30% mais forte. Uma vez por rodada.'],
 ['Quantum','Physical','Breakpoint','Ao terminar o Extra Turn de Quantum, o próximo hit da Physical ganha +15% Crit Chance.'],
 ['Imaginary','Physical','Oppression','Redução de atributo por Imaginary gera Pressure; com 2, Physical ganha Fighting Spirit.'],
 ['Fire','Physical','Blood and Ash','Physical atinge Burn: ganha Ember. Com 2, próximo Burn de Fire fica 35% mais forte.'],
 ['Ice','Quantum','Fractured Moment','Extra Turn de Quantum: próximo hit de Ice no mesmo alvo ganha +15% Crit Chance.'],
 ['Wind','Imaginary','Withering Sky','Wind atinge alvo com 2+ debuffs: Bleed dura +1 turno, até 4. Primeiro hit elegível da rodada.']
].map(([a,b,name,description])=>Object.freeze({elements:[a,b],key:[a,b].sort().join('+'),name,description,resonance:a===b}));
function connection(a,b){if(!a||!b)return null;return CIRCUITS.find(r=>r.key===[a.element,b.element].sort().join('+'))||null;}
function describe(candidate,catalog){if(!Array.isArray(candidate?.team)||candidate.team.length!==4)throw Error('Formação precisa de quatro cartas.');const byId=new Map(catalog.map(c=>[c.id,c])),cards=candidate.team.map(c=>typeof c==='string'?byId.get(c):c);if(cards.some(c=>!c))throw Error('Carta não encontrada no catálogo.');const supports=cards.map((_,i)=>{const s=candidate.supports?.[i];return s?typeof s==='object'?byId.get(s.id)||s:byId.get(s)||{id:s,name:'Suporte não encontrado',effect:'Dados indisponíveis.'}:null;}),links=[0,1,2].map(i=>({from:i+1,to:i+2,circuit:connection(cards[i],cards[i+1])}));return {cards,supports,links,activeLinks:links.filter(l=>l.circuit).length,resonance:cards.map((_,i)=>[links[i-1],links[i]].filter(l=>l?.circuit?.resonance).length*6),hp:cards.reduce((s,c)=>s+(+c.hp||0),0),dmg:cards.reduce((s,c)=>s+(+c.dmg||0),0)};}
return Object.freeze({CIRCUITS,connection,describe});
});
