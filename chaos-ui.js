/* Memory of Chaos: UI for the screenshot-grounded Stage 03.
   Uses CARDO_CHAOS_ENGINE; never pretends to connect to the Roblox game.
*/
(function(){
'use strict';
const E=window.CARDO_CHAOS_ENGINE;
const catalog=Array.isArray(window.CARDO_DATA)?window.CARDO_DATA:[];
const cards=catalog.filter(c=>c.type==='card'&&E.hasStats(c));
const byId=new Map(cards.map(c=>[c.id,c]));
const supportCards=catalog.filter(c=>c.type==='support'&&E.supportedSupportIds?.has(c.id));
const supportById=new Map(supportCards.map(c=>[c.id,c]));
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const storageKey='card-origins-chaos-stage03-v1';
const rotationStorageKey='card-origins-chaos-rotation-v1';
const enemyEffects=[
 ['unknown','Não confirmado'],['learn_debuff','Aprende debuffs'],['double_hit','Ataque duplo 100% + 50%'],
 ['charred','Charred HP (20%)'],['dodge_counter','55% Dodge + Counter'],['read_ability','Lê habilidades'],
 ['crossed_out','Crossed Out'],['fatigue_confusion','Fatigue + Confusion'],['bleed_execution','Bleed + Execution']
];
const preset=[
 ['c-3','c-2','c-350','new-the-grinning-spectator-normal'],
 ['c-1','c-5','c-353','new-silverfox-vanguard-astral']
];
const previousPreset=[
 ['c-3','c-350','new-black-flame-heir-calamity','new-the-grinning-spectator-normal'],
 ['c-1','c-353','new-silver-star-user-calamity','c-5']
];
const supportPreset=[['s-372','s-365','s-371',null],['s-366','s-360','s-374',null]];
const state={teams:preset.map(t=>t.slice()),supports:supportPreset.map(x=>x.slice()),difficulty:1,samples:100,selection:null,filter:'',result:null,fit:null,
 searching:false,searchToken:0,searchSnapshot:null,searchMeta:null,
 rotationLabel:'Rotation 3 · prints de 09/11/2026',rotationSavedAt:'2026-11-09T00:00:00Z'};
try{
 const old=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(old&&Array.isArray(old.teams)&&old.teams.length===2&&old.teams.every(t=>Array.isArray(t)&&t.length===4)){
   const value=old.teams.map(t=>t.map(id=>byId.has(id)?id:null));
   if(E.rosterValid(value.map(t=>t.map(id=>byId.get(id)))).ok&&JSON.stringify(value)!==JSON.stringify(previousPreset))state.teams=value;
 }
 if(old&&Array.isArray(old.supports)&&old.supports.length===2&&old.supports.every(t=>Array.isArray(t)&&t.length===4)){
   const flat=old.supports.flat().filter(Boolean);
   if(flat.every(id=>supportById.has(id))&&new Set(flat).size===flat.length)state.supports=old.supports.map(t=>t.slice());
 }
 // v1 saved pressure 1.70 as a relative guess before enemy stats arrived.
 // Keep saved teams but recalibrate pressure to 1.00 for screenshot-based HP/DMG.
 if(old?.calibrationVersion===2&&Number.isFinite(old.difficulty))state.difficulty=Math.min(2,Math.max(.7,old.difficulty));
}catch(_){}
const el=id=>document.getElementById(id);
const actual=()=>state.teams.map(t=>t.map(id=>byId.get(id)||null));
function save(){try{localStorage.setItem(storageKey,JSON.stringify({teams:state.teams,supports:state.supports,difficulty:state.difficulty,calibrationVersion:2}))}catch(_){}}
function renderSupports(){
 const root=el('cxSupportSlots');if(!root)return;
 root.innerHTML=state.supports.map((team,i)=>'<section class="cx-support-group"><h4>Time '+(i+1)+'</h4>'+
 team.map((id,j)=>'<label>Slot '+(j+1)+' — '+esc(actual()[i][j]?.name||'Vazio')+'<select data-cx-support="'+i+'-'+j+'">'+
 '<option value="">Sem suporte</option>'+supportCards.map(s=>'<option value="'+esc(s.id)+'"'+(id===s.id?' selected':'')+'>'+esc(s.name)+'</option>').join('')+
 '</select></label>').join('')+'</section>').join('');
}
function chooseSupport(index,slot,id){
 if(id&&!supportById.has(id))return;
 if(id&&state.supports.flat().some((used,j)=>j!==index*4+slot&&used===id)){
   el('cxOptimizationNote').textContent='Este suporte já está em outro slot. Use cópias distintas se você tiver mais de uma.';
   renderSupports();return;
 }
 state.supports[index][slot]=id||null;state.result=null;state.searchMeta=null;save();renderSupports();renderResults();
}
function loadRotation(){
 try{
  const stored=JSON.parse(localStorage.getItem(rotationStorageKey)||'null');
  if(stored&&E.applyRotation(stored.phases)){
    state.rotationLabel=String(stored.label||'Rotação personalizada').slice(0,80);
    state.rotationSavedAt=stored.savedAt||state.rotationSavedAt;
  }
 }catch(_){}
}
function rotationOptions(selected,values){return values.map(([value,title])=>'<option value="'+esc(value)+'"'+(selected===value?' selected':'')+'>'+esc(title)+'</option>').join('')}
function renderRotationEditor(){
 const root=el('cxRotationFields');if(!root)return;
 el('cxRotationLabel').value=state.rotationLabel;
 root.innerHTML=E.currentRotation().map((phase,i)=>'<section class="cx-rotation-phase"><div class="cx-rotation-phase-head"><h4>Time inimigo '+(i+1)+'</h4>'+
 '<label>Elemento da fase <select data-cx-rotation-phase="'+i+'">'+rotationOptions(phase.element,E.elements.map(x=>[x,x]))+'</select></label></div>'+
 phase.enemies.map((foe,j)=>'<div class="cx-rotation-foe" data-cx-foe="'+i+'-'+j+'">'+
 '<label>Inimigo '+(j+1)+'<input data-cx-foe-name type="text" value="'+esc(foe.name)+'" maxlength="85"/></label>'+
 '<label>Elemento<select data-cx-foe-element>'+rotationOptions(foe.element,E.elements.map(x=>[x,x]))+'</select></label>'+
 '<label>HP máximo<input data-cx-foe-hp type="number" min="1" step="1" value="'+Number(foe.hp||0)+'"/></label>'+
 '<label>DMG<input data-cx-foe-dmg type="number" min="1" step="1" value="'+Number(foe.dmg||0)+'"/></label>'+
 '<label>Habilidade<select data-cx-foe-effect>'+rotationOptions(foe.effectKey||'unknown',enemyEffects)+'</select></label></div>').join('')+
 '</section>').join('');
 const passed=Date.now()-Date.parse(state.rotationSavedAt);
 el('cxRotationNote').textContent=state.rotationLabel+(passed>3*86400000?' — já passaram mais de 3 dias desde o registro; confira se os inimigos mudaram.':' — dados carregados para os dois times.');
}
function saveRotation(){
 const phases=E.currentRotation();
 const next=phases.map((phase,i)=>({element:el('cxRotationFields').querySelector('[data-cx-rotation-phase="'+i+'"]').value,
   enemies:phase.enemies.map((old,j)=>{
     const row=el('cxRotationFields').querySelector('[data-cx-foe="'+i+'-'+j+'"]');
     return {name:row.querySelector('[data-cx-foe-name]').value,element:row.querySelector('[data-cx-foe-element]').value,
       hp:Number(row.querySelector('[data-cx-foe-hp]').value),dmg:Number(row.querySelector('[data-cx-foe-dmg]').value),
       effectKey:row.querySelector('[data-cx-foe-effect]').value,
       threat:row.querySelector('[data-cx-foe-name]').value.trim()===old.name?old.threat:'Efeito selecionado pelo usuário; texto completo ainda não foi verificado.'};
   })}));
 if(!E.applyRotation(next)){el('cxRotationNote').textContent='Revise a rotação: os oito inimigos precisam de nome, elemento, HP e DMG válidos.';return;}
 state.rotationLabel=el('cxRotationLabel').value.trim()||'Rotação personalizada';state.rotationSavedAt=new Date().toISOString();
 try{localStorage.setItem(rotationStorageKey,JSON.stringify({label:state.rotationLabel,savedAt:state.rotationSavedAt,phases:E.currentRotation()}))}catch(_){}
 state.result=null;state.searchMeta=null;renderTeams();renderEnemies();renderResults();renderRotationEditor();
 el('cxOptimizationNote').textContent='Rotação atualizada. As próximas buscas usam os novos inimigos e elementos.';
}
function resetRotation(){
 E.resetRotation();state.rotationLabel='Rotation 3 · prints de 09/11/2026';state.rotationSavedAt='2026-11-09T00:00:00Z';
 try{localStorage.removeItem(rotationStorageKey)}catch(_){}
 state.result=null;state.searchMeta=null;renderTeams();renderEnemies();renderResults();renderRotationEditor();
 el('cxOptimizationNote').textContent='Restaurados os oito inimigos dos prints da Rotation 3.';
}
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
 const valid=E.rosterValid(data),stats=data.map(team=>({links:team.slice(0,3).reduce((s,c,j)=>s+(E.link(c,team[j+1])?1:0),0),rawDamage:team.reduce((s,c)=>s+(c?.dmg||0),0)}));
 const teamBox=el('cxTeams');if(!teamBox)return;
 teamBox.innerHTML=data.map((team,i)=>{
   const phase=E.phases[i],all=team.every(Boolean);
   return '<article class="cx-team">'+
   '<div class="cx-team-top"><div><span class="cx-caption">TIME '+(i+1)+' / FASE '+(i+1)+'</span><h3 style="--cx-phase:'+phase.color+'">'+esc(phase.name)+'</h3><p><b>Ciclo:</b> '+esc(phase.weak)+' tem +50% contra '+esc(phase.element)+'. Cada inimigo tem seu próprio elemento, usado na simulação.</p></div><span class="cx-counter">'+team.filter(Boolean).length+' / 4</span></div>'+
   '<div class="cx-slots">'+team.map((c,j)=>box(c,i,j)).join('')+'</div>'+
   '<div class="cx-links"><span>◈ CIRCUITOS ADJACENTES <b>'+stats[i].links+'/3</b></span><span>DMG base somado <b>'+stats[i].rawDamage.toLocaleString('pt-BR')+'</b></span></div>'+
   '<div class="cx-team-hint">Inimigos desta rotação: '+phase.enemies.map(x=>esc(x.name)).join(' · ')+'</div></article>';
 }).join('');
 const warning=el('cxRosterWarning');
 if(warning){warning.textContent=valid.ok?'Equipes completas. Prontas para testar no modelo.':valid.reason;warning.className='cx-warning'+(valid.ok?' valid':'')}
 renderSupports();
}
function renderEnemies(){
 const root=el('cxEnemyInfo');if(!root)return;
 root.innerHTML=E.phases.map((phase,i)=>'<article class="cx-enemy-group">'+
 '<div class="cx-enemy-head"><span>FASE '+(i+1)+'</span><strong>'+esc(phase.name)+'</strong><small>Ciclo favorece '+esc(phase.weak)+' contra '+esc(phase.element)+'</small></div>'+
 phase.enemies.map((x,k)=>'<details class="cx-enemy"'+(k===0?' open':'')+'><summary><span class="cx-enemy-number">'+(k+1)+'</span><strong>'+esc(x.name)+'</strong><span>'+esc(x.element)+'</span></summary>'+
 (x.hp?'<p><strong>HP máximo '+x.hp.toLocaleString('pt-BR')+' · DMG '+x.dmg.toLocaleString('pt-BR')+'</strong> — '+(x.source==='manual'?'valores informados para esta rotação.':'confirmados no print. HP no momento da captura: '+x.seenHp.toLocaleString('pt-BR')+'.')+'</p>':'<p><strong>HP/DMG ainda não informados.</strong> O simulador usa estimativas nesta fase.</p>')+
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
 state.teams[t][j]=id;save();closePicker();state.result=null;state.searchMeta=null;renderTeams();renderResults();
}
function setTeams(teams,supports){
 state.teams=teams.map(t=>t.map(c=>c?.id||null));
 if(supports)state.supports=supports.map(t=>t.slice());
 state.result=null;state.searchMeta=null;save();renderTeams();renderResults();
}
function estimateResult(){
 const rosters=actual();
 const validity=E.rosterValid(rosters);if(!validity.ok){
  el('cxRosterWarning').textContent=validity.reason;el('cxRosterWarning').className='cx-warning';return
 }
 state.result=E.trials(rosters,{samples:state.samples,seed:53791,hardness:state.difficulty,supports:state.supports});
 renderResults();
}
function resultsBar(label,part,kind){
 const percent=Math.round(part*100);
 return '<div class="cx-result-row"><span>'+label+'</span><strong>'+percent+'% <small>no modelo</small></strong>'+
 '<div class="cx-progress '+kind+'"><i style="width:'+percent+'%"></i></div></div>';
}
function battlePlan(result){
 const teams=actual();
 const objectives=[
  result.clearRate>0?'O modelo encontrou vitórias nas duas fases.':'O modelo ainda não encontrou uma vitória nas duas fases. Experimente mais mitigação, cura e dano.',
  result.threeStarRate>0?'Há exemplos com 3 estrelas no modelo; teste a ordem indicada no jogo.':'Ainda não houve 3 estrelas nos testes. Priorize sobreviver sem KOs e terminar cada fase em 22 rodadas.'
 ];
 const effectTips={double_hit:'golpe duplo',charred:'HP incurável (Charred)',dodge_counter:'55% de esquiva e contra-ataque',
  fatigue_confusion:'Fatigue e Confusion',bleed_execution:'Bleed e Execution',read_ability:'leitura de habilidades (parcial)',
  crossed_out:'Crossed Out (parcial)',learn_debuff:'aprendizado de debuffs (parcial)'};
 const phaseNotes=E.phases.map((phase,i)=>{
   const matching=phase.enemies.map(foe=>{
     const strong=teams[i].filter(c=>E.getAdvantage(c.element,foe.element)>1).map(c=>c.name);
     return foe.name+': '+(strong.length?strong.join(', '):'nenhuma carta com vantagem elemental');
   }).join('; ');
   const hazards=phase.enemies.filter(foe=>effectTips[foe.effectKey]).map(foe=>foe.name+' ('+effectTips[foe.effectKey]+')').join('; ');
   return 'Fase '+(i+1)+' — vantagens contra cada inimigo: '+matching+'. '+(hazards?'Atenção: '+hazards+'.':'As habilidades desta rotação ainda precisam ser confirmadas por prints.');
 });
 const supports=state.supports.map((slots,i)=>'Time '+(i+1)+': '+slots.map((id,j)=>id?('slot '+(j+1)+' '+supportById.get(id)?.name):null).filter(Boolean).join(', ')).join(' | ');
 const example=result.example;
 const replay=example?'<details class="cx-replay"><summary>Ver batalha ilustrativa ('+example.stars+' estrela'+(example.stars===1?'':'s')+')</summary>'+
  example.phases.map((phase,i)=>'<section><h5>'+esc(E.phases[i].name)+' · '+phase.defeated+'/4 inimigos · '+phase.turns+' turnos · '+phase.losses+' KOs</h5>'+
   '<ol>'+phase.log.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>'+
   '<details class="cx-replay-turns"><summary>Ver ações dos turnos</summary><ol>'+phase.timeline.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol></details></section>').join('')+'</details>':'';
 return '<div class="cx-battle-plan"><h4>Como tentar vencer no Roblox</h4><ol>'+
  objectives.concat(phaseNotes).map(item=>'<li>'+esc(item)+'</li>').join('')+'</ol>'+
  '<p><b>Suportes usados no cálculo:</b> '+esc(supports)+'.</p>'+
  '<p>Compare KOs e turnos com o jogo. HP/DMG da rotação inicial vieram dos prints; valores manuais são informados por você. Simulamos 6 suportes e gatilhos selecionados, mas traits, relíquias, parte dos debuffs e a ordem real de ações permanecem desconhecidos. A proteção de reviver também pode contar como KO nas regras do jogo.</p></div>'+replay;
}
function renderResults(){
 const mount=el('cxResultPanel');
 if(!mount)return;
 const r=state.result;
 if(!r){mount.innerHTML='<div class="cx-result-empty"><span>✦</span><h3>Prepare dois times e inicie a simulação</h3><p>Os resultados são comparações baseadas em suposições, não previsão de vitória no Roblox.</p></div>';return}
 const searchNote=state.searchMeta?'<div class="cx-search-verdict '+(state.searchMeta.found?'is-found':'')+'"><strong>'+
  (state.searchMeta.found?'★ As 3 condições foram cumpridas em uma batalha simulada.':'★ Nenhuma batalha de 3 estrelas encontrada nesta busca.')+'</strong><p>'+
  state.searchMeta.tested.toLocaleString('pt-BR')+' combinações de cartas, posições e suportes analisadas; '+state.searchMeta.clearCount.toLocaleString('pt-BR')+' passaram pelas duas fases em suas tentativas. '+
  'Fases sem perda de cartas: Time 1 '+state.searchMeta.perfectPhaseCount[0].toLocaleString('pt-BR')+', Time 2 '+state.searchMeta.perfectPhaseCount[1].toLocaleString('pt-BR')+'. '+
  (state.searchMeta.found?'O exemplo de 3 estrelas aparece no registro abaixo. Ele ainda precisa ser testado no jogo.':state.searchMeta.stopped?'Busca interrompida. A melhor formação parcial está selecionada.':'A melhor formação parcial está selecionada. Você pode buscar novamente ou adicionar dados de cartas e suportes.')+
  '</p></div>':'';
 mount.innerHTML=searchNote+'<div class="cx-result-head"><div><span class="cx-caption">TESTE ESTATÍSTICO · '+r.samples+' TENTATIVAS</span><h3>'+(r.clearRate>.5?'Boa composição no modelo':'Composição com riscos no modelo')+'</h3></div><span class="cx-pill">PRESSÃO '+state.difficulty.toFixed(2)+'×</span></div>'+
 resultsBar('Concluiu as 2 fases',r.clearRate,'cx-teal')+
 resultsBar('Cumpriu as 3 condições',r.threeStarRate,'cx-gold')+
 '<div class="cx-result-stats"><div><span>FASE 1</span><strong>'+r.avgTurns[0].toFixed(1)+' turnos</strong><small>'+r.avgLosses[0].toFixed(2)+' KOs médios</small></div>'+
 '<div><span>FASE 2</span><strong>'+r.avgTurns[1].toFixed(1)+' turnos</strong><small>'+r.avgLosses[1].toFixed(2)+' KOs médios</small></div></div>'+
 '<div class="cx-insight"><strong>O que precisa para as 3 estrelas:</strong><p>Vencer ambas as fases, não perder nenhuma carta e finalizar cada fase em até 22 rodadas. O HP máximo e o DMG dos oito inimigos são os números dos prints, mas os efeitos de habilidades ainda são aproximados. A porcentagem é do modelo, não do jogo.</p></div>'+
 battlePlan(r);
}
function optimize(){
 const button=el('cxOptimize');button.disabled=true;
 try{
  const candidate=E.recommend(catalog,{attempts:360,hardness:state.difficulty,supports:state.supports});
  if(!candidate?.teams||!E.rosterValid(candidate.teams).ok)return;
  setTeams(candidate.teams,candidate.supports);
  state.result=candidate.results;
  renderResults();
  const info=el('cxOptimizationNote');
  info.textContent='Testadas '+candidate.attempts+' variações de equipes e suportes entre '+candidate.candidates+' cartas com HP/DMG conferidos nos prints. '+
   (candidate.results.clearRate>0?'Foi encontrada uma formação que venceu no modelo. ':'Não foi encontrada uma vitória no modelo. ')+
   'Veja o plano e o exemplo de batalha abaixo. O resultado não garante vitória no Roblox.';
 }finally{button.disabled=false}
}
function setSearchControls(running){
 state.searching=running;
 ['cxSearchThreeStars','cxOptimize','cxSimulate','cxReset','cxPressure','cxSamples','cxAutoSupports','cxSaveRotation','cxResetRotation'].forEach(id=>{const node=el(id);if(node)node.disabled=running;});
 el('cxSupportSlots').querySelectorAll('select').forEach(node=>node.disabled=running);
 el('cxRotationFields').querySelectorAll('input,select').forEach(node=>node.disabled=running);
 el('cxRotationLabel').disabled=running;
 el('cxStopSearch').hidden=!running;
}
function updateSearchProgress(snapshot){
 const status=el('cxSearchStatus');status.hidden=false;
 el('cxSearchProgress').max=snapshot.maxTests;
 el('cxSearchProgress').value=snapshot.tested;
 el('cxSearchStatusText').textContent='Testando '+snapshot.tested.toLocaleString('pt-BR')+' / '+snapshot.maxTests.toLocaleString('pt-BR')+
  ' combinações de cartas e suportes ('+snapshot.candidates+' cartas) · '+snapshot.clearCount.toLocaleString('pt-BR')+' vitórias completas · fase 1 perfeita: '+snapshot.perfectPhaseCount[0]+' · fase 2 perfeita: '+snapshot.perfectPhaseCount[1]+'.';
}
function finishThreeStarSearch(snapshot,stopped=false){
 setSearchControls(false);
 if(!snapshot)return;
 let selected=snapshot.found?.teams||snapshot.bestTeams;
 let selectedSupports=snapshot.found?.supports||snapshot.bestSupports;
 // The single luckiest sampled fight is not necessarily a reliable roster.
 // When no 3-star proof exists, compare the search winner, current team and
 // standard optimizer on the SAME 120 seeds before selecting a fallback.
 let verified=null;
 if(!snapshot.found){
   const recommended=E.recommend(catalog,{attempts:360,hardness:state.difficulty,supports:state.supports});
   const shortlist=[{teams:snapshot.bestTeams,supports:snapshot.bestSupports},
     {teams:actual(),supports:state.supports},{teams:recommended.teams,supports:recommended.supports}]
     .filter(x=>E.rosterValid(x.teams).ok);
   const rated=shortlist.map(x=>({...x,results:E.trials(x.teams,{samples:120,seed:53791,hardness:state.difficulty,supports:x.supports})}));
   const metric=s=>s.threeStarRate*300+s.clearRate*100-(s.avgLosses[0]+s.avgLosses[1])*.5-(s.avgTurns[0]+s.avgTurns[1])*.02;
   rated.sort((a,b)=>metric(b.results)-metric(a.results));
   if(rated.length){selected=rated[0].teams;selectedSupports=rated[0].supports;verified=rated[0].results;}
 }
 if(!E.rosterValid(selected).ok)return;
 setTeams(selected,selectedSupports);
 state.searchMeta={found:Boolean(snapshot.found),stopped,tested:snapshot.tested,clearCount:snapshot.clearCount,perfectPhaseCount:snapshot.perfectPhaseCount};
 state.result=verified||E.trials(selected,{samples:120,seed:53791,hardness:state.difficulty,supports:selectedSupports});
 // Keep the actual successful battle as replay evidence. Independent trials
 // may show 0% if this was a rare outcome; the banner separates these claims.
 if(snapshot.found)state.result.example=snapshot.found.result;
 else if(snapshot.bestRun&&snapshot.bestRun.stars>state.result.example?.stars)state.result.example=snapshot.bestRun;
 renderResults();
 const message=snapshot.found?'Encontrou um exemplo de 3 estrelas no modelo após '+snapshot.tested.toLocaleString('pt-BR')+' combinações de cartas e suportes! Confira o registro por turno; não é garantia no Roblox.':
   'Testou '+snapshot.tested.toLocaleString('pt-BR')+' combinações de cartas e suportes sem cumprir as 3 condições juntas. '+
   (stopped?'Busca interrompida. ':'')+'A melhor tentativa foi carregada. Tente novamente para explorar outras combinações.';
 el('cxOptimizationNote').textContent=message;
 el('cxSearchStatusText').textContent=message;
}
function searchThreeStars(){
 if(state.searching)return;
 const run=E.createThreeStarSearch(catalog,{teams:actual(),supports:state.supports,hardness:state.difficulty,seed:Date.now(),maxTests:100000});
 if(run.error){el('cxOptimizationNote').textContent=run.error;return;}
 setSearchControls(true);
 state.searchSnapshot=null;
 const token=++state.searchToken;
 el('cxOptimizationNote').textContent='Buscando 3 estrelas entre cartas com HP/DMG confirmados, trocando também os seis suportes entre slots. Você pode parar a qualquer momento.';
 el('cxSearchStatus').hidden=false;
 el('cxSearchProgress').value=0;
 el('cxSearchStatusText').textContent='Preparando teste de até 100.000 combinações de cartas e suportes…';
 function tick(){
   if(token!==state.searchToken||!state.searching)return;
   const progress=run.step(1000);
   state.searchSnapshot=progress;
   updateSearchProgress(progress);
   if(progress.done)finishThreeStarSearch(progress);
   else setTimeout(tick,12);
 }
 setTimeout(tick,12);
}
function stopThreeStarSearch(){
 if(!state.searching)return;
 state.searchToken++;
 finishThreeStarSearch(state.searchSnapshot,true);
}
function copyTeams(){
 const data=actual();
 const text=data.map((team,i)=>'TIME '+(i+1)+' — '+E.phases[i].name+'\n'+team.map((c,k)=>(k+1)+'. '+(c?c.name+' ('+c.border+'/'+c.element+')':'[vazio]')+' | Suporte: '+(supportById.get(state.supports[i][k])?.name||'nenhum')).join('\n')).join('\n\n');
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{el('cxOptimizationNote').textContent='Equipes copiadas.'}).catch(()=>window.prompt('Copie as equipes:',text));}
 else window.prompt('Copie as equipes:',text);
}
function init(){
 if(!el('cxTeams')||!E)return;
 loadRotation();
 el('cxPressure').value=String(state.difficulty);
 el('cxPressureValue').textContent=state.difficulty.toFixed(2)+'×';
 el('cxSamples').value=String(state.samples);
 renderEnemies();renderTeams();renderResults();renderRotationEditor();
 document.getElementById('page-chaos').addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.id==='cxStopSearch'){stopThreeStarSearch();return}
  if(state.searching)return;
  if(target.dataset.cxSlot){const [t,j]=target.dataset.cxSlot.split('-').map(Number);showPicker(t,j);return}
  if(target.dataset.cxPick){pick(target.dataset.cxPick);return}
  if(target.id==='cxClearSlot'){if(!state.selection)return;const [t,j]=state.selection;state.teams[t][j]=null;save();closePicker();state.result=null;state.searchMeta=null;renderTeams();renderResults();return}
  if(target.id==='cxClosePicker'){closePicker();return}
  if(target.id==='cxSimulate'){estimateResult();return}
  if(target.id==='cxOptimize'){optimize();return}
  if(target.id==='cxSearchThreeStars'){searchThreeStars();return}
  if(target.id==='cxAutoSupports'){state.supports=supportPreset.map(t=>t.slice());state.result=null;state.searchMeta=null;save();renderSupports();renderResults();el('cxOptimizationNote').textContent='Seis suportes com efeito conferido foram distribuídos nos dois times. Rode a busca para comparar as composições.';return}
  if(target.id==='cxSaveRotation'){saveRotation();return}
  if(target.id==='cxResetRotation'){resetRotation();return}
  if(target.id==='cxReset'){setTeams(preset.map(ids=>ids.map(id=>byId.get(id)||null)));el('cxOptimizationNote').textContent='Exemplo inicial restaurado.';return}
  if(target.id==='cxCopy'){copyTeams();return}
 });
 el('cxPickerSearch').addEventListener('input',event=>{state.filter=event.target.value;renderPicker()});
 el('cxSupportSlots').addEventListener('change',event=>{
  if(state.searching)return;
  const key=event.target.dataset.cxSupport;
  if(key){const [t,j]=key.split('-').map(Number);chooseSupport(t,j,event.target.value);}
 });
 el('cxRotationFields').addEventListener('input',event=>{
  if(event.target.matches('[data-cx-foe-name]'))event.target.closest('[data-cx-foe]').querySelector('[data-cx-foe-effect]').value='unknown';
 });
 el('cxPressure').addEventListener('input',event=>{state.difficulty=Number(event.target.value);el('cxPressureValue').textContent=state.difficulty.toFixed(2)+'×';state.result=null;renderResults();save()});
 el('cxSamples').addEventListener('change',event=>{state.samples=Number(event.target.value);state.result=null;renderResults()});
 el('cxPicker').addEventListener('click',event=>{if(event.target.id==='cxPicker')closePicker()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el('cxPicker').hidden)closePicker()});
 window.CARDO_CHAOS_UI={simulate:estimateResult,optimize,searchThreeStars,stopThreeStarSearch,render:renderTeams};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
