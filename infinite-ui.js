(function(){
'use strict';
const E=window.CARDO_INFINITE_ENGINE,all=Array.isArray(window.CARDO_DATA)?window.CARDO_DATA:[],cards=all.filter(c=>c.type==='card'),supports=all.filter(c=>c.type==='support');
const byId=new Map(all.map(x=>[x.id,x]));const known=cards.filter(c=>Number(c.hp)>0&&Number(c.dmg)>0);
const el=id=>document.getElementById(id),escape=x=>String(x??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(x);
const pct=x=>fmt(x*100)+'%';
let activeSearch=null,lastBest=null,runSeed=261;
function getSaved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function remember(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}
const sortCards=known.slice().sort((a,b)=>b.dmg+b.hp*.12-(a.dmg+a.hp*.12));
function build(){
 const pathOptions=E.PATHS.map(p=>`<option value="${p.id}">${escape(p.name)} · Tier ${p.tier}</option>`).join('');
 const cardOptions=['<option value="">— Escolher carta —</option>',...sortCards.map(c=>`<option value="${escape(c.id)}">${escape(c.name)} · ${escape(c.border)} · HP ${fmt(c.hp)} / DMG ${fmt(c.dmg)}</option>`)].join('');
 const supportOptions=['<option value="">Sem suporte</option>',...supports.filter(s=>E.SUPPORT_IDS.includes(s.id)).map(s=>`<option value="${s.id}">${escape(s.name)}</option>`)].join('');
 el('infiniteLab').innerHTML=`
 <div class="if-head"><div><span>LABORATÓRIO / INFINITE TOWER · FLOOR 261</span><h2>Simulador de <em>ascensão</em></h2><p>Monte quatro cartas e até quatro suportes, teste os 7 Paths ou procure automaticamente uma formação. Os cálculos são um modelo comparativo.</p></div><div class="if-sticker">${known.length}<small>CARTAS COM STATS</small></div></div>
 <div class="if-alert"><strong>Print recebido:</strong> andar <b>261</b>, inimiga <b>Game Princess</b>, HP máximo <b>6.061</b>, DMG <b>2.648</b>. <b>The Destruction</b> está Tier 5 (+8% Power); demais Paths Tier 0. O texto de <i>No Continue</i> está cortado: <b>efeito não modelado</b>. Alterações no Path durante uma run entram somente na próxima run.</div>
 <div class="if-columns"><div class="if-panel"><h3>01 · Alvo e inimigos <small>CENÁRIO EDITÁVEL</small></h3><div class="if-inputgrid">
 <label>Andar atual<input id="ifFrom" type="number" min="1" max="20000" value="261"></label>
 <label>Objetivo<input id="ifTo" type="number" min="1" max="20000" value="300"></label>
 <label>HP máximo no andar-base<input id="ifHp" type="number" min="1" value="6061"></label>
 <label>DMG no andar-base<input id="ifDmg" type="number" min="1" value="2648"></label>
 <label>Crescimento por andar (%)<input id="ifGrowth" type="number" min="0" max="8" step="0.1" value="1"></label>
 <label>Inimigos por andar<select id="ifEnemies"><option value="1">1 (modelo inicial)</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
 <label>Elemento do inimigo<select id="ifElement"><option value="Unknown">Não confirmado</option>${['Fire','Ice','Lightning','Wind','Quantum','Imaginary','Physical'].map(x=>`<option>${x}</option>`).join('')}</select></label>
 <label>Dodge inimigo (%)<input id="ifDodge" type="number" min="0" max="90" step="5" value="0"></label>
 </div><label class="if-check"><input id="ifElementsMode" type="checkbox"> Elements Mode (+20% HP/DMG inimigo; +10% recompensas)</label>
 <p class="if-note">O crescimento de 1%/andar, quantidade de inimigos e ordem de ações são <b>hipóteses ajustáveis</b>. A captura comprova somente os números da Game Princess no andar 261. Traits, relíquias e efeitos cortados ainda faltam.</p></div>
 <div class="if-panel"><h3>02 · Time e Path <small>4 CARTAS PRINCIPAIS + SUPORTES</small></h3><div id="ifTeam" class="if-team">${Array.from({length:4},(_,i)=>`<div class="if-slot"><span class="if-index">0${i+1}</span><label>Carta principal<select class="if-card" data-slot="${i}">${cardOptions}</select></label><label>Suporte equipado<select class="if-support" data-slot="${i}">${supportOptions}</select></label></div>`).join('')}</div>
 <div class="if-pathrow"><label>Path da próxima run<select id="ifPath">${pathOptions}</select></label><label>Tier selecionado<select id="ifTier">${Array.from({length:6},(_,i)=>`<option value="${i}">${i}</option>`).join('')}</select></label></div>
 <div class="if-actions"><button id="ifCurrentTeam" type="button" class="if-outline">Importar meu Team Builder</button><button id="ifSimulate" type="button" class="if-primary">▶ Simular meu time</button><button id="ifCompare" type="button" class="if-outline">Comparar 7 Paths</button></div>
 <p class="if-note"><b>${cards.length} principais catalogadas</b>, mas apenas <b>${known.length}</b> têm HP/DMG para entrar na simulação; ${cards.length-known.length} aguardam transcrição. Os outros ${supports.length-E.SUPPORT_IDS.length} suportes não têm efeitos verificáveis no motor.</p></div></div>
 <div class="if-panel if-search"><div><h3>03 · Procurar a melhor formação</h3><p>Busca equipes de 4 cartas, compara Paths e configura suportes conhecidos. Reavalia a melhor formação em 120 partidas com sementes diferentes.</p></div><div class="if-search-row"><label>Quantidade de composições<select id="ifTrials"><option value="1400">1.400 · rápido</option><option value="7000" selected>7.000 · detalhado</option><option value="21000">21.000 · intenso</option></select></label><button id="ifSearch" type="button" class="if-primary">✦ Buscar melhor time</button><button id="ifStop" type="button" class="if-outline" disabled>Parar busca</button></div><div id="ifProgress" class="if-progress" hidden><div class="if-track"><span id="ifProgressFill"></span></div><span id="ifProgressText"></span></div></div>
 <div id="ifResults" class="if-results" aria-live="polite"><p class="if-placeholder">Faça uma simulação ou inicie a busca para ver o time recomendado, resultado por Path e registro dos combates.</p></div>`;
 const d=getSaved('codex-infinite-config',null);if(d){for(const [k,v]of Object.entries(d)){if(!el(k))continue;if(el(k).type==='checkbox')el(k).checked=!!v;else el(k).value=v;}}
 el('ifPath').addEventListener('change',()=>el('ifTier').value=E.PATHS.find(p=>p.id===el('ifPath').value).tier);
 el('ifTier').value='5';
 el('ifCurrentTeam').addEventListener('click',loadTeam);
 el('ifSimulate').addEventListener('click',simulateManual);
 el('ifCompare').addEventListener('click',comparePaths);
 el('ifSearch').addEventListener('click',startSearch);
 el('ifStop').addEventListener('click',()=>{activeSearch?.stop();el('ifStop').disabled=true;});
 el('ifResults').addEventListener('click',e=>{const t=e.target.closest('[data-if-apply],[data-if-copy]');if(t?.hasAttribute('data-if-apply')&&lastBest)applyResult();if(t?.hasAttribute('data-if-copy')&&lastBest)copyResult();});
 loadTeam();
}
function loadTeam(){const ids=getSaved('codex-team',['c-1','c-2','c-3','c-5']);const sups=getSaved('codex-support-team',E.defaultSupports());document.querySelectorAll('.if-card').forEach((s,i)=>{s.value=known.some(c=>c.id===ids[i])?ids[i]:(['c-1','c-2','c-3','c-5'][i]||'');});document.querySelectorAll('.if-support').forEach((s,i)=>{s.value=E.SUPPORT_IDS.includes(sups[i])?sups[i]:E.defaultSupports()[i]});}
function options(){const o={from:+el('ifFrom').value,to:+el('ifTo').value,baseFloor:261,enemyHp:+el('ifHp').value,enemyDmg:+el('ifDmg').value,growth:+el('ifGrowth').value/100,enemyElement:el('ifElement').value,enemyDodge:+el('ifDodge').value/100,enemiesPerFloor:+el('ifEnemies').value,elementsMode:el('ifElementsMode').checked,pressure:1,seed:runSeed};
 for(const id of ['ifFrom','ifTo','ifHp','ifDmg','ifGrowth','ifEnemies','ifElement','ifDodge','ifElementsMode'])o[id]=el(id).type==='checkbox'?el(id).checked:el(id).value;
 remember('codex-infinite-config',Object.fromEntries(Object.entries(o).filter(([k])=>k.startsWith('if'))));
 for(const k of Object.keys(o))if(k.startsWith('if'))delete o[k];
 if(!(o.to>=o.from&&o.to<=o.from+150))throw Error('O objetivo deve estar entre o andar atual e 150 andares acima.');
 if(!(o.enemyHp>0&&o.enemyDmg>0))throw Error('Informe HP e DMG inimigos maiores que zero.');
 return o;
}
function selection(){return {team:[...document.querySelectorAll('.if-card')].map(s=>byId.get(s.value)),supports:[...document.querySelectorAll('.if-support')].map(s=>s.value||null),path:el('ifPath').value,tier:+el('ifTier').value};}
function error(e){el('ifResults').innerHTML='<div class="if-error">'+escape(e.message||e)+'</div>';}
function metrics(s){return `<div class="if-kpis"><div><small>CHEGADA MÉDIA</small><strong>${fmt(s.avgFloor)}</strong></div><div><small>PASSOU O OBJETIVO</small><strong>${pct(s.clearRate)}</strong></div><div><small>MELHOR ANDAR</small><strong>${fmt(s.maxFloor)}</strong></div><div><small>CARTAS PERDIDAS (MÉDIA)</small><strong>${fmt(s.avgKos)}</strong></div></div>`;}
function teamDisplay(team,sup){return `<div class="if-team-results">${team.map((c,i)=>`<article class="if-result-card"><span class="if-card-order">0${i+1}</span>${c.image?`<img src="${escape(c.image)}" alt="" loading="lazy">`:''}<strong>${escape(c.name)}</strong><small>${escape(c.border)} · ${escape(c.element)}</small><span>HP ${fmt(c.hp)} · DMG ${fmt(c.dmg)}</span><em>${escape(byId.get(sup[i])?.name||'Sem suporte')}</em></article>`).join('')}</div>`;}
function trace(s){return `<details class="if-trace"><summary>Ver sequência da melhor partida modelada</summary><ol>${(s.example?.log||[]).map(x=>`<li>${escape(x)}</li>`).join('')}</ol></details>`;}
function renderResult(title,card,stats,extra=''){
 lastBest=card;
 const p=E.PATHS.find(x=>x.id===card.path),warning=stats.clearRate===0?'Não foi encontrada uma vitória completa nesta configuração. A melhor chegada é parcial.':'Vitórias encontradas somente no modelo; valide no Roblox.';
 el('ifResults').innerHTML=`<div class="if-result-head"><div><span>RESULTADO / MODELO INDEPENDENTE</span><h3>${escape(title)}</h3><p><strong>${escape(p.name)}</strong> · Tier ${card.tier} · ${stats.trials} testes</p></div><span class="if-state ${stats.clearRate?'if-good':'if-warn'}">${stats.clearRate?pct(stats.clearRate)+' estimado':'NENHUM CLEAR'}</span></div>${metrics(stats)}<p class="if-warning">${warning} Crescimento, ordem de ações e habilidades não verificadas continuam aproximados.</p>${teamDisplay(card.team,card.supports)}<div class="if-actions"><button data-if-apply type="button" class="if-primary">Aplicar no Team Builder</button><button data-if-copy type="button" class="if-outline">Copiar formação</button></div>${extra}${trace(stats)}`;
}
function simulateManual(){try{const cfg=options(),sel=selection();if(!E.valid(sel.team))throw Error('Preencha os 4 slots com cartas distintas e atributos conhecidos.');const s=E.assess({...cfg,...sel},120);if(s.error)throw Error(s.error);renderResult('Sua equipe',sel,s);}catch(e){error(e);}}
function comparePaths(){try{const cfg=options(),sel=selection();if(!E.valid(sel.team))throw Error('Preencha os 4 slots com cartas distintas e atributos conhecidos.');const ranking=E.PATHS.map(p=>{const tier=p.id===sel.path?sel.tier:p.tier;const s=E.assess({...cfg,...sel,path:p.id,tier},60);return {p,tier,s};}).sort((a,b)=>b.s.clearRate-a.s.clearRate||b.s.avgFloor-a.s.avgFloor);const best={...sel,path:ranking[0].p.id,tier:ranking[0].tier};const result=E.assess({...cfg,...best},120);renderResult('Melhor Path para este time',best,result,`<div class="if-path-ranking"><h4>Comparação dos sete Paths (60 testes cada)</h4>${ranking.map((r,i)=>`<div><strong>${i+1}. ${escape(r.p.name)} · Tier ${r.tier}</strong><span>${fmt(r.s.avgFloor)} andar médio · ${pct(r.s.clearRate)} até o objetivo</span></div>`).join('')}</div>`);}catch(e){error(e);}}
function startSearch(){if(activeSearch)return;try{
 const cfg=options(),maxTests=+el('ifTrials').value;
 activeSearch=E.makeSearch(known,{...cfg,maxTests,tierDestruction:5,tierOther:0});
 el('ifSearch').disabled=true;el('ifStop').disabled=false;el('ifProgress').hidden=false;
 const progress=el('ifProgressFill'),caption=el('ifProgressText');
 function chunk(){if(!activeSearch)return;const state=activeSearch.step(35);progress.style.width=(state.checked/state.maxTests*100)+'%';caption.textContent=fmt(state.checked)+' / '+fmt(state.maxTests)+' composições · '+(state.best?'melhor: '+fmt(state.best.stats.avgFloor)+'º andar médio':'calculando…');
 if(!state.done){setTimeout(chunk,0);return;}
 const search=activeSearch;activeSearch=null;el('ifSearch').disabled=false;el('ifStop').disabled=true;
 if(!state.best){error('Nenhuma equipe válida encontrada.');return;}
 const best=state.best;const s=E.assess({...cfg,team:best.team,supports:best.supports,path:best.path,tier:best.tier,seed:cfg.seed+211},120);
 const rank=Object.values(state.paths).filter(x=>x.best).map(x=>x.best).sort((a,b)=>b.score-a.score);
 const extras=`<div class="if-path-ranking"><h4>Melhor candidatura de cada Path na busca</h4>${rank.map((r,i)=>`<div><strong>${i+1}. ${escape(E.PATHS.find(p=>p.id===r.path).name)}</strong><span>${fmt(r.stats.avgFloor)}º médio nos testes rápidos</span></div>`).join('')}</div><p class="if-note">${search.result.checked} composições candidatas avaliadas (inclui Path e suporte). Ranking preliminar com 3 amostras; formação vencedora reavaliada em 120. ${search.result.checked<maxTests?'Busca interrompida pelo usuário.':''}</p>`;
 renderResult('Melhor time encontrado',best,s,extras);
 }
 setTimeout(chunk,0);
}catch(e){activeSearch=null;error(e);}}
function applyResult(){if(!lastBest)return;const ids=lastBest.team.map(c=>c.id);window.CARDO_DECK_API?.setTeam(ids);remember('codex-support-team',lastBest.supports);window.dispatchEvent(new Event('codex-support-team-changed'));document.querySelectorAll('.if-card').forEach((s,i)=>s.value=ids[i]);document.querySelectorAll('.if-support').forEach((s,i)=>s.value=lastBest.supports[i]);el('ifPath').value=lastBest.path;el('ifTier').value=lastBest.tier;window.alert('Time salvo no Team Builder. Se houver uma run ativa, a troca de Path no Roblox só será usada na próxima run.');}
function copyResult(){if(!lastBest)return;const s=lastBest.team.map((c,i)=>`Slot ${i+1}: ${c.name} (${c.border}, ${c.element}) — suporte: ${byId.get(lastBest.supports[i])?.name||'nenhum'}`).join('\n');const path=E.PATHS.find(x=>x.id===lastBest.path).name;const txt=`Infinite Tower — ${path}, Tier ${lastBest.tier}\n${s}\nResultado do modelo (não confirmado no Roblox).`;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(()=>window.alert('Formação copiada!')).catch(()=>window.prompt('Copie a formação:',txt));else window.prompt('Copie a formação:',txt);}
function init(){if(!el('infiniteLab')||!E)return;build();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
