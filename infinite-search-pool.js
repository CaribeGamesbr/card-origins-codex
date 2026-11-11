/* Candidate exploration only. Combat outcomes are always decided by the seeded engine.
 * No HP/DMG is inferred from a border, a name, an image or another variant. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_SEARCH_POOL=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const positive=n=>Number.isFinite(Number(n))&&Number(n)>0;
function roster(catalog,gear={}){
 const out=[],seen=new Set();for(const c of catalog||[]){if(c?.type!=='card'||!c.id||seen.has(c.id))continue;seen.add(c.id);const g=gear[c.id]||{},hp=positive(g.hp)?Number(g.hp):Number(c.hp),dmg=positive(g.dmg)?Number(g.dmg):Number(c.dmg);if(!positive(hp)||!positive(dmg))continue;out.push({...c,hp,dmg,statsOrigin:positive(g.hp)||positive(g.dmg)?'user-displayed':'catalog-displayed'});}return out;
}
function features(card,profile){const p=typeof profile==='function'?profile(card):null,t=new Set(p?.tags||[]);return {aoe:t.has('aoe'),offField:t.has('offField')||t.has('off-field')||p?.offField===true,debuff:t.has('debuff')||t.has('control'),sustain:t.has('sustain')||t.has('tank')||t.has('heal'),support:t.has('teamSupport')||t.has('support'),multi:t.has('multiHit')||t.has('pierce'),profile:p};}
function seedTeams(pool,{profile,currentTeam=[],objective='endurance',limit=96}={}){
 const unique=Array.from(new Map((pool||[]).filter(c=>c?.type==='card'&&positive(c.hp)&&positive(c.dmg)).map(c=>[c.id,c])).values());if(unique.length<4)return [];
 const byId=new Map(unique.map(c=>[c.id,c])),meta=new Map(unique.map(c=>[c.id,features(c,profile)])),score=c=>Number(c.dmg)+Number(c.hp)*(objective==='rush'?.03:.12),rank=unique.slice().sort((a,b)=>score(b)-score(a)||String(a.id).localeCompare(String(b.id))),damage=unique.slice().sort((a,b)=>b.dmg-a.dmg||b.hp-a.hp||String(a.id).localeCompare(String(b.id))),durable=unique.slice().sort((a,b)=>b.hp-a.hp||b.dmg-a.dmg||String(a.id).localeCompare(String(b.id)));
 const tagged=k=>rank.filter(c=>meta.get(c.id)[k]),area=tagged('aoe'),bench=tagged('offField'),control=tagged('debuff'),tanks=tagged('sustain'),burst=tagged('multi');
 const groups=[],identities=new Set(),push=(team,strategy)=>{const t=team.map(c=>typeof c==='string'?byId.get(c):byId.get(c?.id));if(t.length!==4||t.some(c=>!c)||new Set(t.map(c=>c.id)).size!==4)return;const key=t.map(c=>c.id).join('|');if(identities.has(key))return;identities.add(key);groups.push({team:t.slice(),strategy});};
 function fill(chosen,list=rank){const a=chosen.filter(Boolean).slice();for(const c of list)if(a.length<4&&!a.some(x=>x.id===c.id))a.push(c);return a;}
 const base=currentTeam.map(c=>byId.get(typeof c==='string'?c:c?.id));push(base,'Seu time atual');push(rank.slice(0,4),'Atributos conhecidos');push(damage.slice(0,4),'Dano direto');push(durable.slice(0,4),'Resistência');
 // Round-robin templates keep a low-stat bench passive in the seed set. A
 // scalar HP+DMG ranking alone almost never draws such a card early enough.
 const count=Math.max(area.length,bench.length,control.length,tanks.length,burst.length);
 for(let i=0;i<count;i++){
   const a=area[i],b=bench[i],d=control[i],s=tanks[i],m=burst[i];
   if(b){const front=area[0]||damage[0],team=fill([front,...rank.filter(c=>c.id!==b.id&&c.id!==front.id).slice(0,2),b]);push(team,'Ataque em área + passiva do banco');if(team.length===4)push([team[1],team[0],team[2],team[3]],'Outra abertura com a passiva no banco');}
   if(a){push(fill([a,...bench.slice(0,1)]),'Abertura com dano em área');push(fill([tanks[0]||durable[0],a,...bench.slice(0,1)]),'Resistência antes do dano em área');}
   if(d){push(fill([d,area[0]||damage[0],bench[0]]),'Debuff antes do dano em área');push(fill([area[0]||damage[0],d,bench[0]]),'Dano em área antes do debuff');}
   if(s)push(fill([s,area[0]||damage[0],bench[0]]),'Sustain com acompanhamento');
   if(m)push(fill([m,control[0],bench[0]]),'Multi-hit ou pierce com debuff');
 }
 // Vary adjacency and order of the same promising four cards. This explores
 // elemental links without declaring an unimplemented circuit a combat buff.
 const templates=groups.slice();for(const {team,strategy} of templates){const orders=[[0,2,1,3],[1,0,2,3],[2,0,1,3],[0,1,3,2],[3,0,1,2]];for(const order of orders)push(order.map(i=>team[i]),strategy+' · ordem alternativa');}
 return groups.slice(0,Math.max(1,Math.min(512,Math.floor(limit)||96)));
}
function describe(catalog,gear={},profile){const pool=roster(catalog,gear),m=pool.map(c=>features(c,profile));return {eligible:pool.length,pending:(catalog||[]).filter(c=>c?.type==='card').length-pool.length,configured:pool.filter(c=>c.statsOrigin==='user-displayed').length,area:m.filter(p=>p.aoe).length,bench:m.filter(p=>p.offField).length,controlled:m.filter(p=>p.debuff).length};}
return {roster,features,seedTeams,describe};
});
