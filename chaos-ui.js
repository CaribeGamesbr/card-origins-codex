/* Memory of Chaos: UI for the screenshot-grounded Stage 03.
   Uses CARDO_CHAOS_ENGINE; never pretends to connect to the Roblox game.
*/
(function(){
'use strict';
const E=window.CARDO_CHAOS_ENGINE;
const catalog=Array.isArray(window.CARDO_DATA)?window.CARDO_DATA:[];
const cards=catalog.filter(c=>c.type==='card'&&E.hasStats(c));
const byId=new Map(cards.map(c=>[c.id,c]));
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const storageKey='card-origins-chaos-stage03-v1';
const preset=[
 ['c-3','c-350','new-black-flame-heir-calamity','new-the-grinning-spectator-normal'],
 ['c-1','c-353','new-silver-star-user-calamity','c-5']
];
const state={teams:preset.map(t=>t.slice()),difficulty:1,samples:100,selection:null,filter:'',result:null,fit:null};
try{
 const old=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(old&&Array.isArray(old.teams)&&old.teams.length===2&&old.teams.every(t=>Array.isArray(t)&&t.length===4)){
   const value=old.teams.map(t=>t.map(id=>byId.has(id)?id:null));
   if(E.rosterValid(value.map(t=>t.map(id=>byId.get(id)))).ok)state.teams=value;
 }
 // v1 saved pressure 1.70 as a relative guess before enemy stats arrived.
 // Keep saved teams but recalibrate pressure to 1.00 for screenshot-based HP/DMG.
 if(old?.calibrationVersion===2&&Number.isFinite(old.difficulty))state.difficulty=Math.min(2,Math.max(.7,old.difficulty));
}catch(_){}
const el=id=>document.getElementById(id);
const actual=()=>state.teams.map(t=>t.map(id=>byId.get(id)||null));
function save(){try{localStorage.setItem(storageKey,JSON.stringify({teams:state.teams,difficulty:state.difficulty,calibrationVersion:2}))}catch(_){}}
function cardType(c){return E.screenshotKnown.has(c.id)?'VISTA NOS SEUS PRINTS':'COLEÇÃO — CONFIRA POSSE'}
function cardArt(c){
 const fallback='<span class="cx-placeholder" aria-hidden="true">✧</span>';
 if(!c?.image)return fallback;
 // All images use local relative paths. Missing images remain a graceful placeholder.
 return '<img src="'+esc(c.image)+'" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">'+
   '<span class="cx-placeholder" hidden aria-hidden="true">✧</span>';
}
function box(c,index,slot){
 return '<button type="button" class="cx-slot'+(!c?' is-empty':'')+'" data-cx-slot="'+index+'-'+slot+'" aria-label="'+(c?'Trocar '+esc(c.name):'Selecionar carta')+'">'
 +'<span class="cx-slot-index">'+(slot+1)+'</span>'
 +(c?'<span class="cx-card-cover">'+cardArt(c)+'</span><span class="cx-slot-info"><strong>'+esc(c.name)+'</strong><small>'+esc(c.border)+' · '+esc(c.element)+'</small><small>HP '+Number(c.hp).toLocaleString('pt-BR')+' · DMG '+Number(c.dmg).toLocaleString('pt-BR')+'</small></span>'
 :'<span class="cx-slot-plus">+</span><span>Escolher carta</span>')
 +'</button>';
}
function renderTeams(){
 const data=actual();
 const valid=E.rosterValid(data),stats=data.map(team=>({links:E.bonuses(team).filter(v=>v>1).length,rawDamage:team.reduce((s,c)=>s+(c?.dmg||0),0)}));
 const teamBox=el('cxTeams');if(!teamBox)return;
 teamBox.innerHTML=data.map((team,i)=>{
   const phase=E.phases[i],all=team.every(Boolean);
   return '<article class="cx-team">'+
   '<div class="cx-team-top"><div><span class="cx-caption">TIME '+(i+1)+' / FASE '+(i+1)+'</span><h3 style="--cx-phase:'+phase.color+'">'+esc(phase.name)+'</h3><p><b>Vantagem:</b> '+esc(phase.weak)+' causa +50% contra '+esc(phase.element)+' no modo.</p></div><span class="cx-counter">'+team.filter(Boolean).length+' / 4</span></div>'+
   '<div class="cx-slots">'+team.map((c,j)=>box(c,i,j)).join('')+'</div>'+
   '<div class="cx-links"><span>◈ CIRCUITOS ADJACENTES <b>'+stats[i].links+'/3</b></span><span>DMG base somado <b>'+stats[i].rawDamage.toLocaleString('pt-BR')+'</b></span></div>'+
   '<div class="cx-team-hint">'+(i===0?'Fire Soldier pune combates demorados; a fase tem inimigo com esquiva de 55%.':'Omniscient Reader copia habilidades; Scythe Tactician aplica Bleed.')+'</div></article>';
 }).join('');
 const warning=el('cxRosterWarning');
 if(warning){warning.textContent=valid.ok?'Equipes completas. Prontas para testar no modelo.':valid.reason;warning.className='cx-warning'+(valid.ok?' valid':'')}
}
function renderEnemies(){
 const root=el('cxEnemyInfo');if(!root)return;
 root.innerHTML=E.phases.map((phase,i)=>'<article class="cx-enemy-group">'+
 '<div class="cx-enemy-head"><span>FASE '+(i+1)+'</span><strong>'+esc(phase.name)+'</strong><small>Fraco contra '+esc(phase.weak)+'</small></div>'+
 phase.enemies.map((x,k)=>'<details class="cx-enemy"'+(k===0?' open':'')+'><summary><span class="cx-enemy-number">'+(k+1)+'</span><strong>'+esc(x.name)+'</strong><span>'+esc(x.element)+'</span></summary>'+
 (x.hp?'<p><strong>HP máximo '+x.hp.toLocaleString('pt-BR')+' · DMG '+x.dmg.toLocaleString('pt-BR')+'</strong> — confirmados no print. HP no momento da captura: '+x.seenHp.toLocaleString('pt-BR')+'.</p>':'<p><strong>HP/DMG ainda não informados.</strong> O simulador usa estimativas nesta fase.</p>')+
 '<p>'+esc(x.threat)+'</p></details>').join('')+'</article>').join('');
}
function options(){
 const ready=cards.slice().sort((a,b)=>(E.screenshotKnown.has(b.id)?1:0)-(E.screenshotKnown.has(a.id)?1:0)||
  (Number(b.dmg)||0)-(Number(a.dmg)||0));
 const query=state.filter.trim().toLowerCase();
 return ready.filter(c=>!query||(c.name+' '+c.border+' '+c.element+' '+c.ability).toLowerCase().includes(query));
}
function renderPicker(){
 const root=el('cxPickerResults');
 if(!root||!state.selection)return;
 const [which,slot]=state.selection,team=actual();
 const used=team.flat().filter(Boolean);
 const list=options();
 root.innerHTML=list.slice(0,180).map(c=>{
  const dup=used.some(x=>(x.id===c.id||x.name===c.name&&x.border===c.border)&&!(team[which][slot]?.id===c.id));
  const chosen=team[which][slot]?.id===c.id;
  return '<button class="cx-pick-card" type="button" data-cx-pick="'+esc(c.id)+'"'+(dup?' disabled':'')+'>'+
   '<span class="cx-pick-img">'+cardArt(c)+'</span>'+
   '<span><strong>'+esc(c.name)+(chosen?' ✓':'')+'</strong><small>'+esc(c.border)+' · '+esc(c.element)+' · DMG '+c.dmg.toLocaleString('pt-BR')+'</small><small class="cx-pick-origin">'+cardType(c)+'</small></span>'
   +(dup?'<b>EM USO</b>':'<i>+</i>')+'</button>';
 }).join('')+(list.length>180?'<p class="cx-note">Mostrando 180 resultados. Refine a pesquisa.</p>':'')+
 (!list.length?'<p class="cx-note">Nenhuma carta com HP e DMG verificados corresponde à pesquisa.</p>':'');
}
function showPicker(index,slot){
 state.selection=[index,slot];state.filter='';
 el('cxPicker').hidden=false;el('cxPickerHeading').textContent='Time '+(index+1)+' · Slot '+(slot+1);
 el('cxPickerSearch').value='';renderPicker();el('cxPickerSearch').focus();
}
function closePicker(){state.selection=null;el('cxPicker').hidden=true}
function pick(id){
 if(!state.selection)return;
 const c=byId.get(id);if(!c)return;
 const [t,j]=state.selection;
 const dup=actual().flat().some(x=>x&&(x.id===c.id||x.name===c.name&&x.border===c.border));
 if(dup&&state.teams[t][j]!==id)return;
 state.teams[t][j]=id;save();closePicker();state.result=null;renderTeams();renderResults();
}
function setTeams(teams){state.teams=teams.map(t=>t.map(c=>c?.id||null));state.result=null;save();renderTeams();renderResults()}
function estimateResult(){
 const rosters=actual();
 const validity=E.rosterValid(rosters);if(!validity.ok){
  el('cxRosterWarning').textContent=validity.reason;el('cxRosterWarning').className='cx-warning';return
 }
 state.result=E.trials(rosters,{samples:state.samples,seed:53791,hardness:state.difficulty});
 renderResults();
}
function resultsBar(label,part,kind){
 const percent=Math.round(part*100);
 return '<div class="cx-result-row"><span>'+label+'</span><strong>'+percent+'% <small>no modelo</small></strong>'+
 '<div class="cx-progress '+kind+'"><i style="width:'+percent+'%"></i></div></div>';
}
function battlePlan(result){
 const teams=actual();
 const p1=teams[0].filter(c=>c.element==='Wind').map(c=>c.name);
 const p2=teams[1].filter(c=>c.element==='Quantum').map(c=>c.name);
 const objectives=[
  result.clearRate>0?'O modelo encontrou vitórias nas duas fases.':'O modelo ainda não encontrou uma vitória nas duas fases. Experimente mais mitigação, cura e dano.',
  result.threeStarRate>0?'Há exemplos com 3 estrelas no modelo; teste a ordem indicada no jogo.':'Ainda não houve 3 estrelas nos testes. Priorize sobreviver sem KOs e terminar cada fase em 22 rodadas.'
 ];
 const phaseNotes=[
  'Fase 1: '+(p1.length?'aproveite a vantagem Wind de '+p1.join(' e ')+'. ':'faltam cartas Wind nessa formação. ')+
  'Fire Soldier dá golpes de 100%+50%; Ancient Flame impede recuperar parte do HP; o último inimigo tem 55% de esquiva. Evite prolongar Burn, Immolation e Fatigue.',
  'Fase 2: '+(p2.length?'aproveite o dano Quantum de '+p2.join(' e ')+'. ':'considere incluir dano Quantum. ')+
  'Omniscient Reader copia habilidades e Scythe Tactician aplica Bleed. Leve proteção contra debuffs e golpes fatais.'
 ];
 const example=result.example;
 const replay=example?'<details class="cx-replay"><summary>Ver batalha ilustrativa ('+example.stars+' estrela'+(example.stars===1?'':'s')+')</summary>'+
  example.phases.map((phase,i)=>'<section><h5>'+esc(E.phases[i].name)+' · '+phase.defeated+'/4 inimigos · '+phase.turns+' turnos · '+phase.losses+' KOs</h5>'+
   '<ol>'+phase.log.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>'+
   '<details class="cx-replay-turns"><summary>Ver ações dos turnos</summary><ol>'+phase.timeline.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol></details></section>').join('')+'</details>':'';
 return '<div class="cx-battle-plan"><h4>Como tentar vencer no Roblox</h4><ol>'+
  objectives.concat(phaseNotes).map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>'+
  '<p>Depois de testar os dois times no jogo, compare os KOs e turnos reais. O HP máximo e DMG dos quatro inimigos da fase 1 vieram dos prints; a fase 2 ainda é estimada. Suportes, traits, relíquias e vários gatilhos não são simulados.</p></div>'+replay;
}
function renderResults(){
 const mount=el('cxResultPanel');
 if(!mount)return;
 const r=state.result;
 if(!r){mount.innerHTML='<div class="cx-result-empty"><span>✦</span><h3>Prepare dois times e inicie a simulação</h3><p>Os resultados são comparações baseadas em suposições, não previsão de vitória no Roblox.</p></div>';return}
 mount.innerHTML='<div class="cx-result-head"><div><span class="cx-caption">TESTE ESTATÍSTICO · '+r.samples+' TENTATIVAS</span><h3>'+(r.clearRate>.5?'Boa composição no modelo':'Composição com riscos no modelo')+'</h3></div><span class="cx-pill">PRESSÃO '+state.difficulty.toFixed(2)+'×</span></div>'+
 resultsBar('Concluiu as 2 fases',r.clearRate,'cx-teal')+
 resultsBar('Cumpriu as 3 condições',r.threeStarRate,'cx-gold')+
 '<div class="cx-result-stats"><div><span>FASE 1</span><strong>'+r.avgTurns[0].toFixed(1)+' turnos</strong><small>'+r.avgLosses[0].toFixed(2)+' KOs médios</small></div>'+
 '<div><span>FASE 2</span><strong>'+r.avgTurns[1].toFixed(1)+' turnos</strong><small>'+r.avgLosses[1].toFixed(2)+' KOs médios</small></div></div>'+
 '<div class="cx-insight"><strong>O que precisa para as 3 estrelas:</strong><p>Vencer ambas as fases, não perder nenhuma carta e finalizar cada fase em até 22 rodadas. O HP máximo e o DMG dos inimigos da fase 1 são os números dos prints; os da fase 2 são estimados. A porcentagem é do modelo, não do jogo.</p></div>'+
 battlePlan(r);
}
function optimize(){
 const button=el('cxOptimize');button.disabled=true;
 try{
  const candidate=E.recommend(catalog,{attempts:220,hardness:state.difficulty});
  if(!candidate?.teams||!E.rosterValid(candidate.teams).ok)return;
  setTeams(candidate.teams);
  state.result=candidate.results;
  renderResults();
  const info=el('cxOptimizationNote');
  info.textContent='Testadas '+candidate.attempts+' variações entre '+candidate.candidates+' cartas com HP/DMG conferidos nos prints. '+
   (candidate.results.clearRate>0?'Foi encontrada uma formação que venceu no modelo. ':'Não foi encontrada uma vitória no modelo. ')+
   'Veja o plano e o exemplo de batalha abaixo. O resultado não garante vitória no Roblox.';
 }finally{button.disabled=false}
}
function copyTeams(){
 const data=actual();
 const text=data.map((team,i)=>'TIME '+(i+1)+' — '+E.phases[i].name+'\n'+team.map((c,k)=>(k+1)+'. '+(c?c.name+' ('+c.border+'/'+c.element+')':'[vazio]')).join('\n')).join('\n\n');
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{el('cxOptimizationNote').textContent='Equipes copiadas.'}).catch(()=>window.prompt('Copie as equipes:',text));}
 else window.prompt('Copie as equipes:',text);
}
function init(){
 if(!el('cxTeams')||!E)return;
 el('cxPressure').value=String(state.difficulty);
 el('cxPressureValue').textContent=state.difficulty.toFixed(2)+'×';
 el('cxSamples').value=String(state.samples);
 renderEnemies();renderTeams();renderResults();
 document.getElementById('page-chaos').addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.dataset.cxSlot){const [t,j]=target.dataset.cxSlot.split('-').map(Number);showPicker(t,j);return}
  if(target.dataset.cxPick){pick(target.dataset.cxPick);return}
  if(target.id==='cxClearSlot'){if(!state.selection)return;const [t,j]=state.selection;state.teams[t][j]=null;save();closePicker();state.result=null;renderTeams();renderResults();return}
  if(target.id==='cxClosePicker'){closePicker();return}
  if(target.id==='cxSimulate'){estimateResult();return}
  if(target.id==='cxOptimize'){optimize();return}
  if(target.id==='cxReset'){setTeams(preset.map(ids=>ids.map(id=>byId.get(id)||null)));el('cxOptimizationNote').textContent='Exemplo inicial restaurado.';return}
  if(target.id==='cxCopy'){copyTeams();return}
 });
 el('cxPickerSearch').addEventListener('input',event=>{state.filter=event.target.value;renderPicker()});
 el('cxPressure').addEventListener('input',event=>{state.difficulty=Number(event.target.value);el('cxPressureValue').textContent=state.difficulty.toFixed(2)+'×';state.result=null;renderResults();save()});
 el('cxSamples').addEventListener('change',event=>{state.samples=Number(event.target.value);state.result=null;renderResults()});
 el('cxPicker').addEventListener('click',event=>{if(event.target.id==='cxPicker')closePicker()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el('cxPicker').hidden)closePicker()});
 window.CARDO_CHAOS_UI={simulate:estimateResult,optimize,render:renderTeams};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
