/* Shared, seeded effects for both sides. Unknown rules remain explicit omissions. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_COMBAT=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const BEATS={Fire:'Ice',Ice:'Lightning',Lightning:'Wind',Wind:'Fire',Quantum:'Imaginary',Imaginary:'Physical',Physical:'Quantum'};
const ENEMIES=['CHAIN AVENGER','WALKER','CURSED KING VESSEL','FIRE DRAGON SLAYER','DEATH LEDGER GOD'];
const IMPLEMENTED=new Set(['infinite-second-wind','infinite-relentless','infinite-destruction-unbound','debuffs-deep-silence','debuffs-blackout','debuffs-searing-flames','debuffs-inferno','debuffs-pyre','debuffs-unquenchable','elements-fire-burn','elements-fire-mastery','elements-wind-bleed','debuffs-hemorrhage']);
function actor(card,gear={},tree={ids:[]}){return {name:String(card.name||'').toUpperCase(),element:card.element||'Unknown',max:+card.hp,hp:+card.hp,dmg:+card.dmg,shield:0,gear,skills:new Set(tree.ids||[]),statuses:{},hits:0,turn:0,chain:0,chainBy:null,once:new Set(),sanctuaryUntil:0,sanctuaryNext:0,ward:0,focused:null,focusedHits:0,firstTargets:new Set(),battleHits:0};}
const has=(a,id)=>a.skills.has(id);
const num=(a,k)=>Math.max(0,Math.min(1000,+a.gear[k]||0))/100;
const live=(a,k)=>a.statuses[k]&&a.statuses[k].until>=a.turn;
function ability(a,dice){return !live(a,'Silence')&&(!live(a,'Confusion')||dice()>=.75);}
function apply(a,key,turns,value=0,source=null){if(!(turns>0))return false;const old=a.statuses[key];a.statuses[key]={until:a.turn+turns,value:Math.max(value,old?.value||0),source};return true;}
function begin(a,dice){a.turn++;a.battleHits=0;for(const k in a.statuses)if(a.statuses[k].until<a.turn)delete a.statuses[k];return !(live(a,'Stun')||live(a,'Freeze')||(live(a,'Stroke')&&dice()<.3));}
function reduction(a,allowed=true){if(!allowed||live(a,'Inferno'))return 0;let r=a.gear.trait==='Guard'?(has(a,'traits-bulwark')?.1:.05):0;if(a.name==='CURSED KING VESSEL')r=Math.max(r,.1);return r;}
function heal(a,amount,allowed=true){if(!(amount>0)||a.hp<=0)return 0;const old=a.hp;a.hp=Math.min(a.max,a.hp+amount*(1+num(a,'healing')));if(allowed&&a.gear.hollow&&old<a.max*.6&&a.turn>=a.sanctuaryNext){a.sanctuaryUntil=a.turn+2;a.sanctuaryNext=a.turn+3;a.ward=1;}return a.hp-old;}
function grantShield(a,amount){if(live(a,'Inferno'))return 0;const gained=amount*(1+num(a,'shield'));a.shield+=gained;if(a.gear.hollow&&a.hp<a.max*.6&&a.turn>=a.sanctuaryNext){a.sanctuaryUntil=a.turn+2;a.sanctuaryNext=a.turn+3;a.ward=1;}return gained;}
function receive(a,amount,dice,allow=true,direct=true,attacker=null){
 if(!(amount>0))return 0;
 if(direct&&allow&&a.name==='WALKER'&&dice()<.35){a.dmg*=1.10;return 0;}
 let dr=reduction(a,allow);if(direct&&allow&&a.name==='VECTOR STORM')dr=Math.max(dr,.35);if(direct&&a.ward&&a.turn<=a.sanctuaryUntil){dr=Math.max(dr,.18);a.ward=0;a.sanctuaryRestore=true;}
 if(direct&&allow&&a.name==='VECTOR STORM'&&attacker){receive(attacker,Math.min(amount*.35,a.dmg*.6),dice,false,false);if(!a.once.has(attacker)){a.once.add(attacker);apply(attacker,'Shock',1,has(a,'debuffs-overcharge')?.075:.05,a);apply(attacker,'Blind',1,has(a,'debuffs-blackout')?.5:.4,a);}}
 if(direct)amount*=1-dr;
 if(live(a,'Inferno'))a.shield=0;
 const absorbed=Math.min(a.shield,amount);a.shield-=absorbed;const loss=Math.max(0,amount-absorbed);a.hp-=loss;
 if(a.sanctuaryRestore){a.sanctuaryRestore=false;if(a.hp>0&&a.hp<a.max*.2)heal(a,a.max*.06,allow);}
 return loss;
}
function outgoing(a,target,damage,dice,allow=true){
 if(live(a,'Fatigue')||live(a,'Stroke'))damage*=.9;
 if(live(a,'Shock'))damage*=1-a.statuses.Shock.value;
 if(a.chain>0)damage*=Math.max(0,1-a.chain*(a.gear.boss?.04:.08));
 if(a.focused!==target){a.focused=target;a.focusedHits=0;}
 if(allow&&a.gear.trait==='Focused'){a.focusedHits++;damage*=1+Math.min(has(a,'traits-locked-on')?.2:.12,a.focusedHits*(has(a,'traits-locked-on')?.1:.04));}
 if(allow&&a.gear.trait==='Opportunist')damage*=1+Math.min(has(a,'traits-seize-the-moment')?.24:.16,Object.keys(target.statuses).length*(has(a,'traits-seize-the-moment')?.02:.04));
 if(allow&&a.gear.trait==='Afflictor'&&Object.keys(target.statuses).length)damage*=has(a,'traits-deep-affliction')?1.10:1.05;
 if(live(target,'Fatigue')||live(target,'Stroke'))damage*=1.10;
 if(allow&&a.name==='FIRE DRAGON SLAYER'){if(!a.firstTargets.has(target)){a.firstTargets.add(target);damage*=1.25;}damage*=1+.1*Math.min(3,target.fireDragonStacks||0);}
 const miss=(live(a,'Blind')?a.statuses.Blind.value:0)+(live(a,'Stroke')?.3:0);if(dice()<miss)return {damage:0,crit:false};
 const crit=allow&&dice()<Math.min(1,num(a,'crit'));if(crit)damage*=1.5+num(a,'critDmg');
 // The elemental bonus applies to a confirmed strong/weak matchup, not unknown/neutral.
 if(a.element!=='Unknown'&&target.element!=='Unknown'&&(BEATS[a.element]===target.element||BEATS[target.element]===a.element))damage*=1+num(a,'element');
 return {damage,crit};
}
function directHit(a,target,damage,dice,allow=true){
 const out=outgoing(a,target,damage,dice,allow);if(out.damage<=0)return 0;
 const lost=receive(target,out.damage,dice,ability(target,dice),true,a);a.hits++;a.battleHits++;
 if(!allow)return lost;
 if(a.name==='CHAIN AVENGER'&&!live(a,'Notebook')){
   if(target.chainBy!==a){target.chainBy=a;target.chain=0;}target.chain=Math.min(3,target.chain+1);
   if(target.chain===3){target.chain=0;apply(target,'Silence',has(a,'debuffs-deep-silence')?2:1);receive(target,a.dmg*.6,dice,ability(target,dice),false);}
 }
 if(a.name==='CURSED KING VESSEL'&&a.hits>=3&&!a.once.has('divergence')){a.once.add('divergence');receive(target,a.dmg*(dice()<.025?1.5:1.1),dice,ability(target,dice),true);}
 if(a.name==='DEATH LEDGER GOD'&&!a.once.has(target)){a.once.add(target);apply(target,'Notebook',1,.4,a);}
 if(a.name==='FIRE DRAGON SLAYER'&&!live(a,'Notebook'))target.fireDragonStacks=Math.min(3,(target.fireDragonStacks||0)+1);
 if(!live(a,'Notebook')&&a.gear.debuff&&dice()<Math.max(0,Math.min(1,(+a.gear.chance||0)/100))){const value=a.gear.debuff==='Blind'?.4:0;apply(target,a.gear.debuff,+a.gear.duration||0,value,a);}
 return lost;
}
function tick(a,dice){for(const key of ['Burn','Inferno','Immolation','Bleed']){if(!live(a,key))continue;const st=a.statuses[key],src=st.source;if(!src)continue;let damage=st.value;if(key==='Bleed'){const heavy=has(src,'debuffs-hemorrhage');if(dice()<(heavy?.5:.75))damage=a.max*(heavy?.1:.075);else{apply(a,'Bandage',1,heavy?.1:.05);damage=0;}}receive(a,damage*(st.thermal?1.6:1)*(1+num(src,'dot')),dice,false,false);st.thermal=false;}}
function end(a,dice,allow=true){
 if(live(a,'Notebook')){const src=a.statuses.Notebook.source;if(src)receive(a,src.dmg*.6,dice,false,false);delete a.statuses.Notebook;}
 if(allow&&has(a,'infinite-second-wind')&&dice()<.15)heal(a,a.max*.1,allow);
}
function basicDamage(a){return a.dmg*(live(a,'Notebook')?.6:1)*(live(a,'Bandage')?1-a.statuses.Bandage.value:1);}
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
function audit(team,supports,context={},gear={},enemies=[]){
 const rows=[];for(const n of context.nodes||[]){const passive=/^(General|Colosseum)$/.test(n.path)||/harvest|infinite-core|exile|scavenger|spoils|crystal-thrift|crystal-fortune/.test(n.id);const flat=n.path==='Border Stats'||/endless-vigor|endless-might/.test(n.id);rows.push({name:n.name,state:passive?'Fora do combate':flat?'Já incluído em HP/DMG':IMPLEMENTED.has(n.id)?'Executado':'Parcial / pendente',detail:n.effect});}
 for(const c of team)rows.push({name:c.name,state:'Parcial / pendente',detail:'A transcrição é preservada. Nem todos os gatilhos e durações da habilidade estão implementados.'});
 for(const id of supports.filter(Boolean))rows.push({name:'Suporte · '+id,state:'Parcial / pendente',detail:'Executa apenas a parte documentada no motor. Ashen usa o bônus sobre DoT, sem transformar +10%/+12,5% em um novo coeficiente de Burn. Sem duração ou coeficiente-base confirmado, o efeito é omitido. Suportes uma vez por batalha ainda usam o limite conservador de uma vez por run.'});
 for(const c of team){const g=gear[c.id]||{};rows.push({name:'Equipamento · '+c.name,state:g.hollow?'Executado':'Parcial / pendente',detail:g.hollow?'Hollow 4: gatilho abaixo de 60%, proteção 18%, cura 6%, intervalo 3 turnos. HP/DMG não são somados novamente.':'Crítico, dano crítico, DoT, elemento, cura, escudo e trait usam somente os campos informados; o restante permanece desconhecido.'});}
 rows.push({name:'Inimigos',state:enemies.some(e=>ENEMIES.includes(e.name))?'Parcial / pendente':'Pendente',detail:'Passivas selecionadas executam nos dois lados. Os quatro inimigos reais e seus bônus não são conhecidos. Scarlet Eyes depende de aliados inimigos derrotados, ausentes no print de 822.'});
 rows.push({name:'Origin Circuits',state:'Parcial / pendente',detail:'Ressonância, Whiteout e próximo tick de Thermal Shock executados. Outros gatilhos, cópias, consumo de Frostbite e regras por rodada ainda pendentes.'});
 rows.push({name:'Paths',state:'Parcial / pendente',detail:'Números transcritos do Path já incluem melhorias mostradas no jogo; não se reaplica Wayfarer. Abundance e partes dos Unbound permanecem pendentes.'});
 rows.push({name:'Durações e crítico-base',state:'Pendente',detail:'Sem duração confirmada, procs elementais são omitidos; o campo de duração permite uma hipótese explícita. Crítico informado é chance total; fora de Ashey, o crítico-base desconhecido não é inventado. Multiplicador-base de crítico 1,5 é hipótese do modelo.'});
 rows.push({name:'Reações, habilidades não transcritas e escala dos andares',state:'Pendente',detail:'Não são simuladas todas as 74 reações. 345 cartas sem atributos continuam excluídas. Crescimento e turnos precisam de calibração real.'});return rows;
}
return {ENEMIES,IMPLEMENTED,actor,has,num,live,ability,apply,begin,heal,grantShield,receive,outgoing,directHit,tick,end,basicDamage,elemental,burn,circuitHit,audit};
});
