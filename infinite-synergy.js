/* Confirmed event-based tree/circuit rules. No coefficients are inferred from names. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./infinite-combat.js'):root.CARDO_COMBAT);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_SYNERGY=api;})(typeof window!=='undefined'?window:null,function(C){
'use strict';
const SUPPORTED=['elements-quantum-extra-turn','elements-lightning-chain','elements-lightning-mastery','elements-elemental-attunement','debuffs-feast-on-misery','debuffs-cruel-momentum','debuffs-tormentor-s-ward','debuffs-crushing-fatigue','debuffs-concussion'];
function create(){return {used:new Set(),seen:new WeakMap(),events:[]};}
const event=(s,name)=>{if(s.events.length<100)s.events.push(name);};
const pair=(a,b,x,y)=>[a?.element,b?.element].sort().join('+')===[x,y].sort().join('+');
function neighbors(allies,slot){return [slot-1,slot+1].filter(i=>i>=0&&i<allies.length);}
function onShield(s,allies,slot,gained,round){if(!(gained>0))return;for(const j of neighbors(allies,slot)){const a=allies[slot],b=allies[j],key='shield:'+Math.min(slot,j)+':'+round;if(b.hp<=0||!pair(a,b,'Ice','Ice')||s.used.has(key))continue;s.used.add(key);C.grantShield(b,gained*.4);event(s,'Cryostasis Link');}}
function onHit(s,allies,slot,target,foes,round){const a=allies[slot];for(const j of neighbors(allies,slot)){const b=allies[j];
 if(pair(a,b,'Wind','Fire')&&a.element==='Wind'){const burn=target.statuses.Inferno||target.statuses.Burn,next=foes.slice(foes.indexOf(target)+1).find(f=>f.hp>0);if(burn&&!burn.circuitCopy&&next){const turns=burn.until-target.turn;if(turns>0){const key=target.statuses.Inferno?'Inferno':'Burn';C.apply(next,key,turns,burn.value*.9,burn.source);next.statuses[key].circuitCopy=true;event(s,'Wildfire');}}}
 if(pair(a,b,'Wind','Imaginary')&&a.element==='Wind'&&Object.keys(target.statuses).filter(k=>C.live(target,k)).length>=2){const bleed=target.statuses.Bleed,key='wither:'+Math.min(slot,j)+':'+round;if(bleed&&!s.used.has(key)){bleed.until=Math.min(target.turn+4,bleed.until+1);s.used.add(key);event(s,'Withering Sky');}}
 }
}
function onDebuffs(s,allies,slot,target,round,dice){const a=allies[slot];let seen=s.seen.get(target);if(!seen){seen={};s.seen.set(target,seen);}
 for(const [key,status]of Object.entries(target.statuses)){if(status.source!==a||seen[key]===status)continue;seen[key]=status;
  if((key==='Burn'||key==='Inferno')&&neighbors(allies,slot).some(j=>pair(a,allies[j],'Fire','Fire'))){const mark='combustion:'+slot+':'+round;if(!s.used.has(mark)){status.until=Math.min(target.turn+4,status.until+1);s.used.add(mark);event(s,'Combustion Link');}}
  if(key==='Fatigue'&&C.has(a,'debuffs-crushing-fatigue')){C.receive(target,target.max*.05,dice,false,false);event(s,'Crushing Fatigue');}
  if(key==='Stun'&&C.has(a,'debuffs-concussion')&&dice()<.1){status.until++;event(s,'Concussion');}
 }
 const n=Object.keys(target.statuses).filter(k=>C.live(target,k)).length;if(n<4)return;
 if(C.has(a,'debuffs-feast-on-misery')&&!a.once.has('feast')){a.once.add('feast');C.heal(a,a.max*.25);event(s,'Feast on Misery');}
 if(C.has(a,'debuffs-cruel-momentum')&&!a.once.has('cruel')){a.once.add('cruel');C.gainDamage(a,a.dmg*.25);event(s,'Cruel Momentum');}
 if(C.has(a,'debuffs-tormentor-s-ward')&&!a.once.has('tormentor')){a.once.add('tormentor');const gained=C.grantShield(a,a.max*.3);a.treeWardReduction=.15;onShield(s,allies,slot,gained,round);event(s,"Tormentor's Ward");}
}
function chain(s,a,target,foes,baseDamage,dice,hit,options={}){if(!options.enabled||a.element!=='Lightning'||!C.ability(a,dice))return;if(C.BEATS[target.element]===a.element)return;const chance=(C.has(a,'elements-lightning-chain')?.05:.025)+(C.has(a,'elements-elemental-attunement')?.05:0)+C.num(a,'proc');if(dice()>=chance)return;const rest=foes.filter(f=>f!==target&&f.hp>0),rates=C.has(a,'elements-lightning-mastery')?[.5,.25,.1]:[];for(let i=0;i<Math.min(rest.length,rates.length);i++)hit(rest[i],baseDamage*rates[i]);if(rates.length)event(s,'Chain Lightning');}
function quantumExtra(a,dice,enabled=true){if(!enabled||a.element!=='Quantum'||!C.ability(a,dice))return false;return dice()<(C.has(a,'elements-quantum-extra-turn')?.03:.005)+(C.has(a,'elements-elemental-attunement')?.05:0)+C.num(a,'proc');}
function afterExtra(s,allies,slot,dice){const a=allies[slot];for(const j of neighbors(allies,slot)){const b=allies[j];if(b.hp<=0)continue;if(pair(a,b,'Quantum','Quantum')&&dice()<.2){b.nextCircuitCritDmg=.25;event(s,'Entangled Link');}if(pair(a,b,'Quantum','Physical')){b.nextCircuitCrit=.15;event(s,'Breakpoint');}if(pair(a,b,'Quantum','Ice')){b.nextCircuitCrit=.15;event(s,'Fractured Moment');}}}
return {SUPPORTED,create,onShield,onHit,onDebuffs,chain,quantumExtra,afterExtra};
});
