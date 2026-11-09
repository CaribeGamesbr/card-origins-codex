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
const state={teams:preset.map(t=>t.slice()),difficulty:1.7,samples:100,selection:null,filter:'',result:null,fit:null};
try{
 const old=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(old&&Array.isArray(old.teams)&&old.teams.length===2&&old.teams.every(t=>Array.isArray(t)&&t.length===4)){
   const value=old.teams.map(t=>t.map(id=>byId.has(id)?id:null));
   if(E.rosterValid(value.map(t=>t.map(id=>byId.get(id)))).ok)state.teams=value;
 }
 if(Number.isFinite(old?.difficulty))state.difficulty=Math.min(2.4,Math.max(.7,old.difficulty));
}catch(_){}
const el=id=>document.getElementById(id);
const actual=()=>state.teams.map(t=>t.map(id=>byId.get(id)||null));
function save(){try{localStorage.setItem(storageKey,JSON.stringify({teams:state.teams,difficulty:state.difficulty}))}catch(_){}}
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
 phase.enemies.map((x,k)=>'<details class="cx-enemy"'+(k===0?' open':'')+'><summary><span class="cx-enemy-number">'+(k+1)+'</span><strong>'+esc(x.name)+'</strong><span>'+esc(x.element)+'</span></summary><p>'+esc(x.threat)+'</p></details>').join('')+'</article>').join('');
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
 '<div class="cx-insight"><strong>O que precisa para as 3 estrelas:</strong><p>Vencer ambas as fases, não perder nenhuma carta e finalizar cada fase em até 22 rodadas. Estes números são de uma simulação ilustrativa; o HP e o DMG dos oponentes não estão disponíveis nos prints.</p></div>';
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
  info.textContent='Testadas '+candidate.attempts+' variações entre '+candidate.candidates+' cartas com HP/DMG conferidos nos prints. Melhor resultado aproximado dentro dessas tentativas — não ótimo garantido.';
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
