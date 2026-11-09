/* Budgeted talent priorities. Scores are heuristic, not Roblox combat odds.
 * No dependency graph is inferred from the illustrative tree map.
 */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_TREE_PLANNER=api})(typeof window!=='undefined'?window:null,function(){
'use strict';
const PATHS=['harmony','abundance','remembrance','nihility','erudition','hunt','destruction'];
const NAMES={harmony:'The Harmony',abundance:'The Abundance',remembrance:'The Remembrance',nihility:'The Nihility',erudition:'The Erudition',hunt:'The Hunt',destruction:'The Destruction'};
const slug=s=>String(s||'').toLowerCase();
function context(team,goal){
 const elements={},borders={},traits={},appliers={burn:0,frostbite:0,bleed:0,shock:0,immolation:0,decay:0};let healing=0,blocking=0,dot=0,burst=0;
 for(const c of team){elements[c.element]=(elements[c.element]||0)+1;borders[c.border]=(borders[c.border]||0)+1;traits[c.trait]=(traits[c.trait]||0)+1;const effect=slug(c.effect+' '+c.ability);
  healing+=c.role==='heal'||/heal|cura|regenera/.test(effect)?1:0;
  blocking+=c.role==='defense'||/block|bloque|redução de dano|menos dano/.test(effect)?1:0;
  dot+=c.role==='dot'||/burn|bleed|poison|immolation/.test(effect)?1:0;
  burst+=c.role==='damage'||/on entry|ao entrar|dmg for 2|dano por 2/.test(effect)?1:0;
  if(c.element==='Fire'||/burn|queimadura/.test(effect))appliers.burn++;
  if(c.element==='Ice'||/frostbite/.test(effect))appliers.frostbite++;
  if(c.element==='Wind'||/bleed|sangramento/.test(effect))appliers.bleed++;
  if(/shock|choque/.test(effect))appliers.shock++;
  if(/immolation|imolação/.test(effect))appliers.immolation++;
  if(/decay|decaimento/.test(effect))appliers.decay++;
 }
 return {elements,borders,traits,appliers,healing,blocking,dot,burst,farm:goal==='farm'};
}
function pathAffinity(path,c){const e=c.elements;return ({harmony:12+c.blocking*3,abundance:5+c.healing*6+c.blocking,remembrance:5+(e.Ice||0)*3+(e.Quantum||0)*2,nihility:5+c.dot*4+(e.Fire||0)+(e.Wind||0),erudition:4+(e.Lightning||0)*3+c.burst*2+(c.farm?7:0),hunt:5+c.burst*2+(c.farm?8:0),destruction:5+c.blocking*2})[path]||0}
function knownEffect(n){return typeof n.effect==='string'&&!/não (?:conferid|exibid|mostrad|identificad)|não apareceu|não confirmado|pendente|efeito específico não|não legível/i.test(n.effect+' '+n.name)&&Number.isInteger(n.cost)&&n.cost>0}
function rate(n,c,path){
 const id=n.id,e=c.elements,b=c.borders;let value=0,reason='';
 const set=(v,r)=>{value=v;reason=r};
 if(n.path==='Colosseum')return null;
 if(n.path==='Infinite'){
  const k=id.replace('infinite-','');
  if(k==='endless-vigor'||k==='endless-might')set(34,'Bônus de atributos para as quatro cartas no Infinite.');
  else if(k==='second-wind')set(c.farm?17:28,'Recuperação de HP durante a luta.');
  else if(k==='relentless')set(29,'Chance de outra ação da carta ativa.');
  else if(k==='wayfarer')set(23,'Fortalece o Path e acelera sua progressão.');
  else if(k===path+'-unbound')set(23+pathAffinity(path,c),'Especialização do Path comparado nesta distribuição.');
  else if(k.endsWith('-unbound')||k==='infinite-origin')return null;
  else if(['infinite-core','abundant-harvest','bountiful-harvest'].includes(k))set(c.farm?21:5,'Aumenta a geração de cartas; não é dano de combate.');
  else if(k==='scavenger'||k==='spoils-of-the-climb')set(c.farm?11:2,'Recompensas da run, sem bônus direto de combate.');
  else if(k==='exile')set(1,'Utilidade de banimento; impacto depende da run.');
 }
 if(n.path==='Border Stats'){
  const hit=id.match(/^border-stats-(calamity|umbral|astral|paradox|origin)-(i|ii|iii)$/);
  if(hit){const border=Object.keys(b).find(x=>slug(x)===hit[1]);const count=b[border]||0;if(count)set(12*count,`Beneficia ${count} carta(s) de borda ${border} neste time.`)}
  else if(id==='border-stats-unframed-strength'&&b.Normal)set(17*b.Normal,'Beneficia as cartas Normal do time.');
  else if(id==='border-stats-border-stats-origin')set(13*Object.entries(b).filter(([k])=>k!=='Unknown').reduce((s,[,v])=>s+v,0),'Bônus para as bordas informadas; conferir o caminho de desbloqueio.');
 }
 if(n.path==='Elements'){
  if(id==='elements-elemental-attunement')set(23,'Chance e potência dos efeitos elementais do time.');
  else for(const element of ['Fire','Ice','Lightning','Wind','Quantum','Imaginary','Physical']){
   const count=e[element]||0;if(!count||!id.startsWith('elements-'+slug(element)+'-'))continue;
   let mult=14;if(/-guard$/.test(id))mult=c.farm?6:11;if(/-edge$/.test(id))mult=9;
   set(count*mult,`Efeito para ${count} carta(s) ${element}; vantagem e procs dependem do confronto.`);break;
  }
 }
 if(n.path==='Debuffs'){
  const a=c.appliers;
  const applicable={overcharge:a.shock,electrocution:a.shock,'searing-flames':a.burn,inferno:a.burn,hemorrhage:a.bleed,lacerating:a.bleed,permafrost:a.frostbite,hypothermia:a.frostbite,pyre:a.immolation,unquenchable:a.immolation};
  const key=id.replace('debuffs-','');
  if(applicable[key])set(13*applicable[key],`Sinergia com os efeitos elementais correspondentes; precisa de aplicação durante a luta.`);
  else if(key==='rot'&&a.decay)set(13*a.decay,'Sinergia com Decay descrito nas cartas; não presume interação com o Decay próprio do Path.');
  else if(['debuff-mastery','potent-afflictions','debuffs-origin'].includes(key))set(8+4*((e.Fire||0)+(e.Ice||0)+(e.Wind||0)+(e.Lightning||0)),'Potência dos debuffs; não presume que todo efeito percentual aumente.');
 }
 if(n.path==='Traits'){
  const map={'traits-vitality':'Vigor','traits-bulwark':'Guard','traits-iron-will':'Resilient','traits-elemental-surge':'Elemental','traits-master-specialist':'Specialist','traits-locked-on':'Focused','traits-deep-affliction':'Afflictor','traits-origin-ascendant':'Origin','traits-honed-power':'Power','traits-seize-the-moment':'Opportunist','traits-exploit-weakness':'Opportunist','traits-true-prodigy':'Prodigy','traits-hardened':'Adaptation'};
  const trait=map[id],count=c.traits[trait]||0;if(trait&&count)set(16*count,`Beneficia ${count} carta(s) com trait ${trait} informado.`);
 }
 if(n.path==='General'&&c.farm){if(/luck|fortune|border-sense|border-mastery|general-origin/.test(id))set(8,'Progressão de rolls; este índice não mede a sorte real da conta.');if(/swift-hands|tempest-hands|balance/.test(id))set(10,'Velocidade/progressão de rolls, sem dano direto de combate.')}
 return value>0?{node:n,value,reason}:null;
}
// Exact 0/1 knapsack for the stated scores and direct costs only.
function pack(items,budget){
 const dp=Array(budget+1).fill(null);dp[0]={value:0,items:[]};
 for(const item of items)for(let cost=budget;cost>=item.node.cost;cost--){const previous=dp[cost-item.node.cost];if(!previous)continue;const value=previous.value+item.value;if(!dp[cost]||value>dp[cost].value)dp[cost]={value,items:[...previous.items,item]}}
 let spent=0,best=dp[0];for(let cost=1;cost<=budget;cost++)if(dp[cost]&&dp[cost].value>best.value){spent=cost;best=dp[cost]}return {...best,spent};
}
function recommend(nodes,options){
 const {team,goal='climb',owned=[],available=[],strict=false}=options;
 if(!Array.isArray(team)||team.length!==4||team.some(c=>!c||!String(c.name||'').trim()))throw Error('Preencha o nome das quatro cartas do time.');
 const budget=Number(options.budget),reserve=Number(options.reserve||0);
 if(!Number.isInteger(budget)||budget<0||budget>500||!Number.isInteger(reserve)||reserve<0||reserve>budget)throw Error('Use de 0 a 500 pontos inteiros e uma reserva entre zero e o total disponível.');
 const c=context(team,goal),ownedSet=new Set(owned),availableSet=new Set(available),usable=nodes.filter(knownEffect);
 if(ownedSet.has('elements-fire-mastery'))c.appliers.immolation=Math.max(c.appliers.immolation,c.elements.Fire||0);
 const variants=(options.path&&options.path!=='auto'?[options.path]:PATHS);if(variants.some(p=>!PATHS.includes(p)))throw Error('Path inválido.');
 const plans=variants.map(path=>{
  const scores=usable.map(n=>rate(n,c,path)).filter(Boolean),active=scores.filter(i=>ownedSet.has(i.node.id)),items=scores.filter(i=>!ownedSet.has(i.node.id)&&(!strict||availableSet.has(i.node.id)));
  const chosen=pack(items,budget-reserve);return {path,pathName:NAMES[path],...chosen,affinity:pathAffinity(path,c),active,baseline:active.reduce((s,i)=>s+i.value,0),unspent:budget-chosen.spent,reserve,candidates:items.length};
 }).sort((a,b)=>(b.value+b.baseline+b.affinity)-(a.value+a.baseline+a.affinity)||a.spent-b.spent||a.path.localeCompare(b.path));
 return {plans,best:plans[0],budget,reserve,strict,unknownNodes:nodes.filter(n=>!knownEffect(n)).length,context:c,unknownCards:team.filter(c=>c.element==='Unknown'||c.border==='Unknown'||!Number(c.hp)||!Number(c.dmg)).length};
}
return {PATHS,NAMES,knownEffect,context,rate,pack,recommend};
});
