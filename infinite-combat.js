/* Shared, seeded effects for both sides. Unknown rules remain explicit omissions. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_COMBAT=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const BEATS={Fire:'Ice',Ice:'Lightning',Lightning:'Wind',Wind:'Fire',Quantum:'Imaginary',Imaginary:'Physical',Physical:'Quantum'};
const ENEMIES=['CHAIN AVENGER','WALKER','CURSED KING VESSEL','FIRE DRAGON SLAYER','DEATH LEDGER GOD'];
const IMPLEMENTED=new Set(['infinite-second-wind','infinite-relentless','infinite-destruction-unbound','debuffs-deep-silence','debuffs-blackout','debuffs-searing-flames','debuffs-inferno','debuffs-pyre','debuffs-unquenchable','elements-fire-burn','elements-fire-mastery','elements-wind-bleed','debuffs-hemorrhage']);
function actor(card,gear={},tree={ids:[]}){return {id:card.id,ability:card.ability||'',name:String(card.name||'').toUpperCase(),element:card.element||'Unknown',max:+card.hp,hp:+card.hp,dmg:+card.dmg,shield:0,gear,skills:new Set(tree.ids||[]),statuses:{},hits:0,turn:0,chain:0,chainBy:null,once:new Set(),skillState:{completedTurns:0,echoSpent:new Map(),deciphered:new Set(),burnConsumed:new Set()},sanctuaryUntil:0,sanctuaryNext:0,ward:0,focused:null,focusedHits:0,firstTargets:new Set(),battleHits:0};}
const has=(a,id)=>a.skills.has(id);
const num=(a,k)=>Math.max(0,Math.min(1000,+a.gear[k]||0))/100;
const live=(a,k)=>a.statuses[k]&&a.statuses[k].until>=a.turn;
function ability(a,dice){return !live(a,'Silence')&&(!live(a,'Confusion')||dice()>=.75);}
function apply(a,key,turns,value=0,source=null){if(!(turns>0))return false;const old=a.statuses[key];a.statuses[key]={until:a.turn+turns,value:Math.max(value,old?.value||0),source};return true;}
function begin(a,dice){a.turn++;a.battleHits=0;for(const k in a.statuses)if(a.statuses[k].until<a.turn)delete a.statuses[k];return !(live(a,'Stun')||live(a,'Freeze')||(live(a,'Stroke')&&dice()<.3));}
function reduction(a,allowed=true){if(!allowed||live(a,'Inferno'))return 0;let r=a.gear.trait==='Guard'?(has(a,'traits-bulwark')?.1:.05):0;if(a.name==='CURSED KING VESSEL')r=Math.max(r,.1);if(cardSkill(a)?.key==='slayer-evolved')r=Math.max(r,.15);return Math.max(r,+a.treeWardReduction||0);}
function heal(a,amount,allowed=true,intercept=true){if(!(amount>0)||a.hp<=0)return 0;const old=a.hp,potential=Math.min(a.max-a.hp,amount*(1+num(a,'healing'))),gained=intercept&&a.opponents?skillGain(a,'heal',potential,a.opponents):potential;a.hp+=gained;if(allowed&&a.gear.hollow&&old<a.max*.6&&a.turn>=a.sanctuaryNext){a.sanctuaryUntil=a.turn+2;a.sanctuaryNext=a.turn+3;a.ward=1;}return a.hp-old;}
function grantShield(a,amount){if(live(a,'Inferno'))return 0;const potential=amount*(1+num(a,'shield')),gained=a.opponents?skillGain(a,'shield',potential,a.opponents):potential;a.shield+=gained;if(a.gear.hollow&&a.hp<a.max*.6&&a.turn>=a.sanctuaryNext){a.sanctuaryUntil=a.turn+2;a.sanctuaryNext=a.turn+3;a.ward=1;}return gained;}
function receive(a,amount,dice,allow=true,direct=true,attacker=null,meta={}){
 if(!(amount>0))return 0;
 const defend=allow&&!meta.ignoreDefenses;
 if(direct&&defend&&a.name==='WALKER'&&dice()<.35){meta.dodged=true;gainDamage(a,a.dmg*.10);return 0;}
 let dr=meta.ignoreDefenses?0:reduction(a,allow);if(direct&&defend&&a.name==='VECTOR STORM')dr=Math.max(dr,.35);if(direct&&!meta.ignoreDefenses&&a.ward&&a.turn<=a.sanctuaryUntil){dr=Math.max(dr,.18);a.ward=0;a.sanctuaryRestore=true;}
 if(direct&&defend&&a.name==='VECTOR STORM'&&attacker){receive(attacker,Math.min(amount*.35,a.dmg*.6),dice,false,false);if(!a.once.has(attacker)){a.once.add(attacker);apply(attacker,'Shock',1,has(a,'debuffs-overcharge')?.075:.05,a);apply(attacker,'Blind',1,has(a,'debuffs-blackout')?.5:.4,a);}}
 if(direct)amount*=1-dr;
 if(meta.damagingAbility&&!meta.ignoreDefenses)amount*=skillDamageReduction(a,a.allies||[a],meta);
 if(live(a,'Inferno'))a.shield=0;
 const absorbed=meta.ignoreDefenses?0:Math.min(a.shield,amount);a.shield-=absorbed;const loss=Math.max(0,amount-absorbed);a.hp-=loss;
 skillAfterDamage(a,attacker,loss,{...meta,allowed:allow});
 const sk=cardSkill(a);if(sk?.key==='flame-pillar'&&a.hp<a.max*.5)a.skillState.flameIgnited=true;
 if(a.sanctuaryRestore){a.sanctuaryRestore=false;if(a.hp>0&&a.hp<a.max*.2)heal(a,a.max*.06,allow);}
 return loss;
}
function outgoing(a,target,damage,dice,allow=true,meta={}){
 if(live(a,'Fatigue')||live(a,'Stroke'))damage*=.9;
 if(live(a,'Shock'))damage*=1-a.statuses.Shock.value;
 if(a.chain>0)damage*=Math.max(0,1-a.chain*(a.gear.boss?.04:.08));
 if(a.focused!==target){a.focused=target;a.focusedHits=0;}
 if(allow&&a.gear.trait==='Focused'){a.focusedHits++;damage*=1+Math.min(has(a,'traits-locked-on')?.2:.12,a.focusedHits*(has(a,'traits-locked-on')?.1:.04));}
 if(allow&&a.gear.trait==='Opportunist')damage*=1+Math.min(has(a,'traits-seize-the-moment')?.24:.16,Object.keys(target.statuses).length*(has(a,'traits-seize-the-moment')?.02:.04));
 if(allow&&a.gear.trait==='Afflictor'&&Object.keys(target.statuses).length)damage*=has(a,'traits-deep-affliction')?1.10:1.05;
 if(live(target,'Fatigue')||live(target,'Stroke'))damage*=1.10;
 if(allow&&a.name==='FIRE DRAGON SLAYER'){if(!a.firstTargets.has(target)){a.firstTargets.add(target);damage*=1.25;}damage*=1+.1*Math.min(3,target.fireDragonStacks||0);}
 const miss=(live(a,'Blind')?a.statuses.Blind.value:0)+(live(a,'Stroke')?.3:0);if(!meta.cannotMiss&&dice()<miss)return {damage:0,crit:false};
 const crit=!meta.noCrit&&allow&&dice()<Math.min(1,num(a,'crit'));if(crit)damage*=1.5+num(a,'critDmg');
 // The elemental bonus applies to a confirmed strong/weak matchup, not unknown/neutral.
 if(a.element!=='Unknown'&&target.element!=='Unknown'&&(BEATS[a.element]===target.element||BEATS[target.element]===a.element))damage*=1+num(a,'element');
 return {damage,crit};
}
function directHit(a,target,damage,dice,allow=true,meta={}){
 meta.landed=false;meta.dodged=false;const out=outgoing(a,target,damage,dice,allow,meta);if(out.damage<=0)return 0;
 const lost=receive(target,out.damage,dice,ability(target,dice),!meta.dot,a,meta);meta.landed=!meta.dodged;if(!meta.landed)return lost;a.hits++;a.battleHits++;
 if(!allow||meta.noProcs)return lost;
 if(a.name==='CHAIN AVENGER'&&!live(a,'Notebook')){
   if(target.chainBy!==a){target.chainBy=a;target.chain=0;}target.chain=Math.min(3,target.chain+1);
   if(target.chain===3){target.chain=0;apply(target,'Silence',has(a,'debuffs-deep-silence')?2:1);receive(target,a.dmg*.6,dice,ability(target,dice),false,a,{damagingAbility:true,abilityKey:'judgment-chain'});}
 }
 if(a.name==='CURSED KING VESSEL'&&a.hits>=3&&!a.once.has('divergence')){a.once.add('divergence');receive(target,a.dmg*(dice()<.025?1.5:1.1),dice,ability(target,dice),true);}
 if(a.name==='DEATH LEDGER GOD'&&!a.once.has(target)){a.once.add(target);apply(target,'Notebook',1,.4,a);}
 if(a.name==='FIRE DRAGON SLAYER'&&!live(a,'Notebook'))target.fireDragonStacks=Math.min(3,(target.fireDragonStacks||0)+1);
 if(!live(a,'Notebook')&&a.gear.debuff&&dice()<Math.max(0,Math.min(1,(+a.gear.chance||0)/100))){const value=a.gear.debuff==='Blind'?.4:0;apply(target,a.gear.debuff,+a.gear.duration||0,value,a);}
 return lost;
}
function tick(a,dice){for(const key of ['Burn','Inferno','Immolation','Bleed','DemonShock']){if(!live(a,key))continue;const st=a.statuses[key],src=st.source;if(!src)continue;let damage=st.value;if(key==='Bleed'){const heavy=has(src,'debuffs-hemorrhage');if(dice()<(heavy?.5:.75))damage=a.max*(heavy?.1:.075);else{apply(a,'Bandage',1,heavy?.1:.05);damage=0;}}receive(a,damage*(st.thermal?1.6:1)*(1+num(src,'dot')),dice,false,false);st.thermal=false;}}
function end(a,dice,allow=true){
 if(live(a,'Notebook')){const src=a.statuses.Notebook.source;if(src)receive(a,src.dmg*.6,dice,false,false);delete a.statuses.Notebook;}
 if(allow&&has(a,'infinite-second-wind')&&dice()<.15)heal(a,a.max*.1,allow);
}
function basicDamage(a){const sk=cardSkill(a);if(sk?.key==='flame-pillar'&&a.hp<a.max*.5)a.skillState.flameIgnited=true;const bonus=sk?.key==='flame-pillar'&&a.skillState.flameIgnited?1.5:sk?.key==='slayer-evolved'?1+.1*Math.min(3,a.skillState.deciphered.size):1;return a.dmg*bonus*(live(a,'Notebook')?.6:1)*(live(a,'Bandage')?1-a.statuses.Bandage.value:1);}
function elemental(a,target,dice,settings={}){
 if(!settings.enabled||live(a,'Notebook')||!a.element||a.element==='Unknown'||target.element==='Unknown'||BEATS[target.element]===a.element)return;
 const e=a.element.toLowerCase(),base=has(a,'elements-'+e+'-'+({fire:'burn',wind:'bleed'}[e]||''))?.05:.025;
 const chance=base+(has(a,'elements-elemental-attunement')?.05:0)+num(a,'proc');
 if(dice()>=chance)return;
 const duration=+settings.duration||0;if(!duration)return; // Unknown duration: omitted, never made permanent.
 if(e==='fire'){
 const inferno=has(a,'debuffs-inferno'),rate=inferno?.15:has(a,'debuffs-searing-flames')?.10:0;
 if(rate)apply(target,inferno?'Inferno':'Burn',duration,a.dmg*rate*(1+num(a,'potency')),a);
 if(has(a,'elements-fire-mastery')){const pyre=has(a,'debuffs-pyre'),n=Math.min(pyre?3:2,(target.immolationStacks||0)+1);target.immolationStacks=n;apply(target,'Immolation',duration,target.max*n*(pyre?.06:.075)*(target.gear.boss?(has(a,'debuffs-unquenchable')?.75:.5):1),a);}
 }else if(e==='wind')apply(target,'Bleed',duration,0,a);
}
function burn(a,target,duration,supportBonus=0,intrinsic=false){if(!(duration>0))return;const inferno=has(a,'debuffs-inferno'),rate=inferno?.15:has(a,'debuffs-searing-flames')?.10:0;if(!rate)return;const potency=num(a,'potency')+(has(a,'debuffs-debuff-mastery')?.05:0)+(has(a,'debuffs-potent-afflictions')?.1:0);if(supportBonus&&intrinsic){const pyre=has(a,'debuffs-pyre'),n=Math.min(pyre?3:2,(target.immolationStacks||0)+1);target.immolationStacks=n;apply(target,'Immolation',duration,target.max*n*(pyre?.06:.075)*(1+supportBonus)*(target.gear.boss?(has(a,'debuffs-unquenchable')?.75:.5):1),a);}else apply(target,inferno?'Inferno':'Burn',duration,a.dmg*rate*(1+potency)*(1+supportBonus),a);}
function circuitHit(a,target,cards,i){let whiteout=false,thermal=false;for(const j of [i-1,i+1]){if(!cards[j])continue;const pair=[a.element,cards[j].element].sort().join('+');if(pair==='Ice+Wind'&&(live(target,'Bleed')||live(target,'Frostbite')))whiteout=true;if(pair==='Fire+Ice'&&(live(target,'Burn')||live(target,'Inferno')))thermal=true;}if(whiteout)apply(target,'Whiteout',1,.15);if(thermal){const b=target.statuses.Inferno||target.statuses.Burn;if(b)b.thermal=true;}}

// Reviewed mechanics are bound to concrete variants, not a fuzzy card name.
// These descriptors describe coverage, not a claim that every effect is known.
const CARD_SKILLS={};
function registerSkill(ids,key,abilityName,tags,implemented,pending=[]){const descriptor=Object.freeze({key,ability:abilityName,tags:tags.split(' '),coverage:pending.length?'partial':'modelled',summary:implemented.join('; '),implemented,pending});for(const id of ids.split(' '))CARD_SKILLS[id]=descriptor;}
registerSkill('c-80','delusional-overlord','ATOMIC ANNIHILATION','aoe debuff','Segundo turno concluído: 150% DMG em cada inimigo vivo, ignorando defesas; custo de 40% Max HP'.split('; '),['Duração e coeficiente de Immolation e duração de Fatigue não informados no print.']);
registerSkill('c-162 new-the-scarlet-catalyst-calamity','scarlet-catalyst','DRAGONFIRE CONVERGENCE','aoe debuff','Sem Burn: 30% DMG no alvo e 15% em cada outro inimigo; Burn 2 turnos; com Burn: 35% DMG e um tick consumindo 1 turno'.split('; '),['Dano-base de Burn exige coeficiente confirmado da árvore ou configuração explícita.']);
registerSkill('c-220 new-abyssal-pianist-calamity','abyssal-pianist','THE LAST NOTE IS YOURS','offField teamSupport sustain','Echo de 25% DMG após acerto de outro aliado ou cura de 8% Max HP se o ataque falhar; enquanto vivo, inclusive no banco'.split('; '));
registerSkill('new-slayer-of-the-past-evolved-normal','slayer-evolved','THE SPELL ALREADY SOLVED','sustain teamSupport debuff','15% redução própria; decifra habilidades de dano sobrevividas e reduz usos futuros em 20% para a equipe; +10% DMG por habilidade até 30%; próximo hit 150% no máximo'.split('; '),['Decifrar exige habilidade de dano identificada; não trata ataque normal como habilidade.']);
registerSkill('new-king-of-curses-evolved-normal','king-curses-evolved','MALEVOLENT KITCHEN','multiHit pierce','Acima de 50% HP do alvo: quatro hits de 25%; a 50% ou menos: hit normal e 50% DMG perfurando o próximo inimigo, ignorando defesas'.split('; '),['Combo com The Guardian of Hell não executado sem suporte identificado e transcrito.']);
registerSkill('c-135 new-demon-king-calamity','demon-king','DEATH DOES NOT DISMISS ME','sustain debuff','Burn de 3 turnos; consome Burn por +50% dano uma vez por inimigo; Stun 1 turno uma vez; revive com 50% HP e limpa debuffs; após reviver cura 15% Max HP por eliminação'.split('; '),['Dano-base de Burn e duração de Shock pós-revive não confirmados no print.']);
registerSkill('new-flame-pillar-normal','flame-pillar','SET YOUR HEART ABLAZE','sustain debuff','Abaixo de 50% HP: 1,5× DMG e 20% lifesteal pelo resto da batalha'.split('; '),['Burn causa 15% do DMG, mas sua duração não está informada.']);
registerSkill('new-northern-blade-normal','northern-blade','SILENT SEVERANCE','debuff','Severance retira e armazena 40% das curas e escudos recebidos pelo marcado; libera o armazenado no próximo dano desta carta; transfere a marca ao próximo inimigo'.split('; '),['Intercepção de cura/escudo precisa do evento de cura ou escudo no alvo.']);
registerSkill('c-272 c-81 new-fallen-angel-umbral','fallen-angel',"JOKER'S VERDICT",'',[],['Joker’s Verdict ainda não executado: a probabilidade de Heart/Spade/Crown e as durações de Bleed/Confusion não foram confirmadas; roubo, redraw, Crown e bônus de morte permanecem pendentes.']);
registerSkill('c-223 new-demonic-emperor-calamity','demonic-emperor','NINE SERENITIES ART','debuff sustain','Demonic Seal: rouba 35% do DMG ganho ou HP curado pelo alvo; na morte transfere selo ao próximo e cura 10% Max HP'.split('; '),['Intercepção exige evento de aumento de DMG ou cura identificado.']);
const normalizedAbility=v=>String(v||'').toUpperCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
function cardSkill(card){const descriptor=CARD_SKILLS[card?.id];if(!descriptor)return null;if(card.ability&&normalizedAbility(card.ability)!==normalizedAbility(descriptor.ability))return null;return descriptor;}
function resetBattle(a){a.once.clear();a.skillState={completedTurns:0,echoSpent:new Map(),deciphered:new Set(),burnConsumed:new Set()};a.hits=0;a.battleHits=0;a.firstTargets.clear();return a;}
const aliveTargets=foes=>foes.filter(f=>f&&f.hp>0&&!f.defeated);
const specialHit=(target,damage,extra={})=>({target,damage,noProcs:true,...extra});
function plannedBurn(a,target,turns,options={}){const inferno=has(a,'debuffs-inferno'),rate=inferno?.15:has(a,'debuffs-searing-flames')?.10:Math.max(0,+options.burnRate||0);return {target,key:inferno?'Inferno':'Burn',turns,value:a.dmg*rate*(1+num(a,'potency')),onlyOnHit:true,coefficientKnown:rate>0};}
function skillAction(a,target,foes,options={}){
 const out={replaceNormal:false,hits:[],statuses:[],selfHpCost:0,pending:[]},sk=cardSkill(a);if(!sk||options.allowed===false)return out;
 const damage=Number.isFinite(options.baseDamage)?options.baseDamage:basicDamage(a),living=aliveTargets(foes),next=living.find(f=>f!==target),burning=live(target,'Burn')||live(target,'Inferno');
 if(sk.key==='scarlet-catalyst'){
  out.replaceNormal=true;
  if(!burning){out.hits.push(specialHit(target,damage*.30,{normalHit:true}));for(const other of living)if(other!==target)out.hits.push(specialHit(other,damage*.15));const burn=plannedBurn(a,target,2,options);out.statuses.push(burn);if(!burn.coefficientKnown)out.pending.push('Burn de 2 turnos confirmado; dano do tick omitido por coeficiente-base não confirmado.');}
  else {out.hits.push(specialHit(target,damage*.35,{normalHit:true}));const key=live(target,'Inferno')?'Inferno':'Burn',st=target.statuses[key],src=st.source||a;out.hits.push(specialHit(target,st.value*(st.thermal?1.6:1)*(1+num(src,'dot')),{dot:true,noCrit:true,consumeStatus:key,source:src}));if(!(st.value>0))out.pending.push('Tick de Burn consumido sem atribuir dano-base desconhecido.');}
 }else if(sk.key==='king-curses-evolved'){
  out.replaceNormal=true;
  if(target.hp>target.max*.5)for(let i=0;i<4;i++)out.hits.push(specialHit(target,damage*.25,{normalHit:true}));
  else {out.hits.push(specialHit(target,damage,{normalHit:true}));if(next)out.hits.push(specialHit(next,damage*.5,{ignoreDefenses:true,cannotMiss:true}));}
 }else if(sk.key==='demon-king'){
  out.replaceNormal=true;let bonus=1;
  if(burning&&!a.skillState.burnConsumed.has(target)){bonus=1.5;out.consumeBurn=true;if(!a.once.has('demon-stun'))out.statuses.push({target,key:'Stun',turns:1,value:0,onlyOnHit:true});}
  out.hits.push(specialHit(target,damage*bonus,{normalHit:true,consumeDemonBurn:bonus>1}));const burn=plannedBurn(a,target,3,options);out.statuses.push(burn);if(!burn.coefficientKnown)out.pending.push('Burn de 3 turnos confirmado; dano do tick omitido por coeficiente-base não confirmado.');
  if(a.once.has('demon-revived')){if(options.duration>0)out.statuses.push({target,key:'DemonShock',turns:options.duration,value:a.dmg*.1,onlyOnHit:true});else out.pending.push('Shock pós-revive: duração não confirmada.');}
 }else if(sk.key==='slayer-evolved'&&a.skillState.deciphered.size>=3&&!a.once.has('deciphered-strike')){
  out.replaceNormal=true;out.hits.push(specialHit(target,damage*1.5,{normalHit:true,decipheredStrike:true}));
 }else if(sk.key==='flame-pillar'){
  if(options.duration>0)out.statuses.push({target,key:'Burn',turns:options.duration,value:a.dmg*.15,onlyOnHit:true});else out.pending.push('Burn 15% DMG: duração não confirmada.');
 }else if(sk.key==='northern-blade'&&a.skillState.severanceStored>0){out.hits.push(specialHit(target,a.skillState.severanceStored,{noCrit:true,releaseSeverance:true}));}
 return out;
}
function afterSkillTurn(a,foes,options={}){
 const out={replaceNormal:false,hits:[],statuses:[],selfHpCost:0,pending:[]};if(options.normal===false)return out;a.skillState.completedTurns++;
 if(cardSkill(a)?.key!=='delusional-overlord'||options.allowed===false||a.once.has('atomic')||a.skillState.completedTurns<2||a.hp<=0||aliveTargets(foes).length===0)return out;
 a.once.add('atomic');const damage=(Number.isFinite(options.baseDamage)?options.baseDamage:basicDamage(a))*1.5;
 out.hits=aliveTargets(foes).map(t=>specialHit(t,damage,{ignoreDefenses:true,cannotMiss:true}));out.selfHpCost=a.max*.4;
 if(options.duration>0)for(const target of aliveTargets(foes)){out.statuses.push({target,key:'Fatigue',turns:options.duration,value:.1,onlyIfAlive:true});if(options.immolationRate>0)out.statuses.push({target,key:'Immolation',turns:options.duration,value:target.max*options.immolationRate,onlyIfAlive:true});}
 if(!(options.duration>0))out.pending.push('Fatigue/Immolation: duração não confirmada.');if(!(options.immolationRate>0))out.pending.push('Immolation: coeficiente não confirmado.');return out;
}
function skillHit(a,target,hit,dice,allowed=true){
 hit.landed=false;if(!target||target.hp<=0||(!(hit.damage>0)&&!hit.consumeStatus))return 0;
 const source=hit.source||a;
 const loss=hit.dot?receive(target,hit.damage,dice,false,false,source,hit):directHit(source,target,hit.damage,dice,allowed,hit);if(hit.dot)hit.landed=true;
 if(hit.landed&&hit.consumeDemonBurn){delete target.statuses.Burn;delete target.statuses.Inferno;a.skillState.burnConsumed.add(target);a.once.add('demon-stun');}
 if(hit.landed&&hit.decipheredStrike)a.once.add('deciphered-strike');
 if(hit.consumeStatus&&hit.landed){const st=target.statuses[hit.consumeStatus];if(st){st.thermal=false;st.until--;if(st.until<=target.turn)delete target.statuses[hit.consumeStatus];}}
 if(hit.releaseSeverance&&hit.landed)a.skillState.severanceStored=0;
 return loss;
}
function allyEchoes(active,allies,target,result={},hitFn){
 const events=[];if(result.normal===false||!target)return events;
 for(const source of allies){if(source===active||source.hp<=0||cardSkill(source)?.key!=='abyssal-pianist'||!ability(source,result.dice||(()=>1)))continue;
  if(active.skillState.echoSpent.get(source)===active.turn)continue;active.skillState.echoSpent.set(source,active.turn);
  if(result.landed){const hit=specialHit(target,source.dmg*.25,{noCrit:true,cannotMiss:true,echo:true});const amount=target.hp>0&&hitFn?hitFn(source,target,hit):0;events.push({kind:'echo',source:source.id,amount,planned:hit.damage});}
  else {const amount=heal(active,active.max*.08);events.push({kind:'echo-heal',source:source.id,amount});}
 }return events;
}
function skillFatal(a,allowed=true){if(!allowed||cardSkill(a)?.key!=='demon-king'||a.hp>0||a.once.has('demon-revived'))return false;a.once.add('demon-revived');a.hp=a.max*.5;a.statuses={};return true;}
function skillAfterHit(a,target,loss){if(loss>0&&cardSkill(a)?.key==='flame-pillar'&&a.skillState.flameIgnited&&a.hp>0)return heal(a,loss*.2);return 0;}
function skillOnDefeat(a,target,next=null){const key=cardSkill(a)?.key;if(a.hp<=0)return 0;if(key==='demon-king'&&a.once.has('demon-revived'))return heal(a,a.max*.15);if(key==='demonic-emperor'&&a.skillState.sealTarget===target){a.skillState.sealTarget=next;return heal(a,a.max*.1);}if(key==='northern-blade'&&a.skillState.severanceTarget===target)a.skillState.severanceTarget=next;return 0;}
function skillAfterDamage(a,source,loss,options={}){if(a.hp<=0||!(loss>0)||options.allowed===false)return;const key=cardSkill(a)?.key;if(key==='slayer-evolved'&&options.damagingAbility&&options.abilityKey)a.skillState.deciphered.add(String(options.abilityKey));}
function skillDamageReduction(active,allies,options={}){if(!options.damagingAbility||!options.abilityKey)return 1;return allies.some(a=>a.hp>0&&ability(a,()=>1)&&cardSkill(a)?.key==='slayer-evolved'&&a.skillState.deciphered.has(String(options.abilityKey)))?.8:1;}
function skillEntry(a,target){const key=cardSkill(a)?.key;if(key==='northern-blade')a.skillState.severanceTarget=target;if(key==='demonic-emperor')a.skillState.sealTarget=target;return a;}
function skillGain(target,kind,amount,opponents){let remaining=Math.max(0,amount);for(const a of opponents){if(a.hp<=0||!ability(a,()=>1))continue;const key=cardSkill(a)?.key;if(key==='northern-blade'&&a.skillState.severanceTarget===target&&['heal','shield'].includes(kind)){const taken=remaining*.4;remaining-=taken;a.skillState.severanceStored=(a.skillState.severanceStored||0)+taken;}if(key==='demonic-emperor'&&a.skillState.sealTarget===target&&['heal','dmg'].includes(kind)){const taken=remaining*.35;remaining-=taken;if(kind==='heal')heal(a,taken,true,false);else a.dmg+=taken;}}return remaining;}
function gainDamage(a,amount){const gained=a.opponents?skillGain(a,'dmg',amount,a.opponents):Math.max(0,amount);a.dmg+=gained;return gained;}
function audit(team,supports,context={},gear={},enemies=[]){
 const rows=[];for(const n of context.nodes||[]){const passive=/^(General|Colosseum)$/.test(n.path)||/harvest|infinite-core|exile|scavenger|spoils|crystal-thrift|crystal-fortune/.test(n.id);const flat=n.path==='Border Stats'||/endless-vigor|endless-might/.test(n.id);rows.push({name:n.name,state:passive?'Fora do combate':flat?'Já incluído em HP/DMG':IMPLEMENTED.has(n.id)?'Modelado · condicional':'Parcial / pendente',detail:n.effect});}
 for(const c of team){const sk=cardSkill(c);rows.push({name:c.name,state:sk?.coverage==='modelled'?'Modelado · condicional':'Parcial / pendente',detail:sk?[...sk.implemented,...sk.pending].join(' '):'A transcrição é preservada. Nem todos os gatilhos e durações da habilidade estão implementados.'});}
 for(const id of supports.filter(Boolean))rows.push({name:'Suporte · '+id,state:'Parcial / pendente',detail:'Executa apenas a parte documentada no motor. Ashen usa o bônus sobre DoT, sem transformar +10%/+12,5% em um novo coeficiente de Burn. Sem duração ou coeficiente-base confirmado, o efeito é omitido. O usuário confirmou que uma vez por batalha reinicia a cada andar.'});
 for(const c of team){const g=gear[c.id]||{};rows.push({name:'Equipamento · '+c.name,state:g.hollow?'Modelado · condicional':'Parcial / pendente',detail:g.hollow?'Hollow 4: gatilho abaixo de 60%, proteção 18%, cura 6%, intervalo 3 turnos. HP/DMG não são somados novamente.':'Crítico, dano crítico, DoT, elemento, cura, escudo e trait usam somente os campos informados; o restante permanece desconhecido.'});}
 rows.push({name:'Inimigos',state:enemies.some(e=>ENEMIES.includes(e.name))?'Parcial / pendente':'Pendente',detail:'Passivas selecionadas executam nos dois lados. Os quatro inimigos reais e seus bônus não são conhecidos. Scarlet Eyes depende de aliados inimigos derrotados, ausentes no print de 822.'});
 rows.push({name:'Origin Circuits',state:'Parcial / pendente',detail:'Ressonância, Whiteout, próximo tick Thermal Shock, Combustion Link, Cryostasis, Wildfire e Withering Sky têm gatilhos no motor. Regras por rodada são aproximadas por ação aliada. Outros circuitos e consumo de Frostbite em Thermal continuam pendentes.'});
 rows.push({name:'Paths',state:'Parcial / pendente',detail:'Números transcritos do Path já incluem melhorias mostradas no jogo; não se reaplica Wayfarer. Abundance e partes dos Unbound permanecem pendentes.'});
 rows.push({name:'Durações e crítico-base',state:'Pendente',detail:'Sem duração confirmada, procs elementais são omitidos; o campo de duração permite uma hipótese explícita. Crítico informado é chance total; fora de Ashey, o crítico-base desconhecido não é inventado. Multiplicador-base de crítico 1,5 é hipótese do modelo.'});
 rows.push({name:'Reações, habilidades não transcritas e escala dos andares',state:'Pendente',detail:'Não são simuladas todas as 74 reações. Cartas sem atributos continuam excluídas, e habilidades sem implementação não ganham comportamento pelo nome. Crescimento e turnos precisam de calibração real.'});return rows;
}
return {BEATS,ENEMIES,IMPLEMENTED,CARD_SKILLS,cardSkill,resetBattle,skillAction,afterSkillTurn,skillHit,allyEchoes,skillFatal,skillAfterHit,skillOnDefeat,skillAfterDamage,skillDamageReduction,skillEntry,skillGain,gainDamage,actor,has,num,live,ability,apply,begin,heal,grantShield,receive,outgoing,directHit,tick,end,basicDamage,elemental,burn,circuitHit,audit};
});
