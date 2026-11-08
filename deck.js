(() => {
'use strict';
const all=Array.isArray(window.CARDO_DATA)?window.CARDO_DATA:[];
const byId=new Map(all.map(item=>[item.id,item]));
const supports=all.filter(item=>item.type==='support');
const PRESET_TEAM=['c-3','c-5','c-1','c-2'];
const PRESET_SUPPORT=['s-366','s-374','s-360','s-372'];
const emotes={Fire:'🔥',Ice:'❄',Lightning:'⚡',Wind:'✧',Quantum:'◇',Imaginary:'◈',Physical:'◆'};
const circuitMap={
 'Fire+Fire':'COMBUSTION LINK','Ice+Ice':'CRYOSTASIS LINK','Lightning+Lightning':'CONDUCTOR LINK',
 'Wind+Wind':'RAZOR CURRENT','Quantum+Quantum':'ENTANGLED LINK','Imaginary+Imaginary':'NULL LINK',
 'Physical+Physical':'WARBOUND LINK','Fire+Ice':'THERMAL SHOCK','Fire+Wind':'WILDFIRE',
 'Fire+Lightning':'FLASHOVER','Ice+Lightning':'SUPERCONDUCTOR','Ice+Wind':'WHITEOUT',
 'Lightning+Wind':'STORMFRONT','Quantum+Imaginary':'PARADOX','Quantum+Physical':'BREAKPOINT',
 'Imaginary+Physical':'OPPRESSION','Fire+Physical':'BLOOD AND ASH',
 'Ice+Quantum':'FRACTURED MOMENT','Wind+Imaginary':'WITHERING SKY'
};
const circuitInfo={
 'WHITEOUT':'Quando uma carta vinculada acerta inimigo com Frostbite ou Bleed, o próximo ataque desse inimigo causa 15% menos dano. Primeiro inimigo elegível por rodada aliada; não acumula.',
 'CRYOSTASIS LINK':'Quando uma carta Ice vinculada recebe um Shield, a outra recebe um Shield de 40% desse valor. Primeiro Shield por rodada aliada; o Shield copiado não ativa outro circuito.',
 'THERMAL SHOCK':'Quando uma carta vinculada atinge inimigo com Burn, o próximo tick de Burn causa +60% de dano (consome 1 stack de Frostbite, se houver). Uma vez por rodada aliada; a duração do Burn não muda.'
};
const safe=str=>String(str==null?'':str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const getStored=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)&&v.length===4?v:fallback.slice()}catch{return fallback.slice()}};
let equipped=getStored('codex-support-team',PRESET_SUPPORT);
let openSlot=-1;
let filterValue='';
function currentTeam(){
  if(window.CARDO_DECK_API&&window.CARDO_DECK_API.getTeam)return window.CARDO_DECK_API.getTeam();
  return getStored('codex-team',PRESET_TEAM);
}
function connection(a,b){
  if(!a||!b)return null;
  const key=[a.element+'+'+b.element,b.element+'+'+a.element].find(key=>circuitMap[key]);
  if(!key)return null;
  return {name:circuitMap[key],kind:a.element===b.element?'RESSONÂNCIA':'CONVERSÃO',elements:[a.element,b.element]};
}
function imgMarkup(item){return item&&item.image?'<img loading="lazy" src="'+safe(item.image)+'" alt="">':'<span class="deck-no-art">✧</span>'}
const formatNum=x=>new Intl.NumberFormat('pt-BR').format(x);
const summarySupportEffects={
 'BINDING VOW':'Revive com 65% HP (−50% DMG)',
 'SERENITY':'Sobrevive ao fatal: 1 HP',
 'ASHEN ARCANUM':'+10% dano de Burn / Immolation',
 'DIVINE SPIRIT WATERS':'Cura até 70% HP · +10% Stats',
 'UNBEATABLE FLAVOR':'Cura 5% HP por turno'
};
const conditionalCircuit={
 'WHITEOUT':'−15% DMG no próximo golpe inimigo',
 'CRYOSTASIS LINK':'40% do Shield replicado',
 'THERMAL SHOCK':'+60% próximo tick de Burn',
 'COMBUSTION LINK':'+1 turno de Burn',
 'FLASHOVER':'+20% no Chain Hit',
 'FRACTURED MOMENT':'+15% de chance crítica em Ice',
 'WITHERING SKY':'+1 turno de Bleed (máx. 4)'
};
function fullImage(card){
 if(!card||!card.image)return;
 const overlay=document.createElement('div');
 overlay.className='deck-image-overlay';
 overlay.id='deckImageOverlay';
 overlay.innerHTML='<div class="deck-image-dialog" role="dialog" aria-modal="true" aria-label="Imagem completa da carta"><button type="button" data-deck-img-close class="deck-image-close" aria-label="Fechar">✕</button><img src="'+safe(card.image)+'" alt="'+safe(card.name)+'"><p>'+safe(card.name)+' • '+safe(card.border)+' • '+safe(card.element)+'</p></div>';
 overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('[data-deck-img-close]'))overlay.remove()});
 document.body.appendChild(overlay);
}
function render(){
  const root=document.getElementById('deckHud');if(!root)return;
  const team=currentTeam().map(id=>byId.get(id)||null);
  const main=document.getElementById('deckMainCards');
  const sup=document.getElementById('deckSupportCards');
  const link=document.getElementById('deckCircuitStrip');
  const links=[0,1,2].map(i=>connection(team[i],team[i+1]));
  let active=links.filter(Boolean).length;
  const passive=team.map((_,i)=>(links[i-1]?.kind==='RESSONÂNCIA'?6:0)+(links[i]?.kind==='RESSONÂNCIA'?6:0));
  main.innerHTML=team.map((card,i)=>{
    const art=card?imgMarkup(card):'<span class="deck-no-art">+</span>';
    const hp=card?.verified&&Number.isFinite(Number(card.hp))?formatNum(Number(card.hp)):'—';
    const dmg=card?.verified&&Number.isFinite(Number(card.dmg))?formatNum(Number(card.dmg)):'—';
    const bonus=card?(passive[i]?'<span class="deck-status-passive">+'+passive[i]+'% DMG ressonância</span>':'<span class="deck-status-conditional">Sem bônus fixo de link</span>'):'<span class="deck-status-conditional">Slot vazio</span>';
    return '<div class="deck-card-cell"><button type="button" class="deck-main-card '+(card?'filled':'empty')+'" data-deck-card="'+i+'" aria-label="Trocar carta do slot '+(i+1)+'"><span class="deck-card-number">'+(i+1)+'</span><span class="deck-card-image">'+art+'</span></button><div class="deck-card-meta"><div class="deck-card-name">'+safe(card?.name||'Escolher carta')+'</div><small>'+safe(card?card.border+' · '+card.element:'Escolha uma carta')+'</small><div class="deck-card-nums"><span>HP <strong>'+hp+'</strong></span><span>DMG <strong>'+dmg+'</strong></span></div>'+bonus+'<div class="deck-card-tools"><button type="button" data-deck-card="'+i+'">Trocar</button>'+(card?.image?'<button type="button" data-deck-view="'+i+'">Ampliar ⛶</button>':'')+'</div></div></div>';
  }).join('');
  link.innerHTML=links.map((c,i)=>{
    const name=c?c.name:'SEM CIRCUITO';
    return '<button type="button" class="deck-link '+(c?'is-active':'is-inactive')+'" data-deck-link="'+i+'" '+(c?'':'disabled')+' aria-label="Circuito entre slots '+(i+1)+' e '+(i+2)+'"><span class="deck-link-diamond">◆</span><strong>'+safe(name)+'</strong><small>SLOT '+(i+1)+' ↔ '+(i+2)+'</small></button>';
  }).join('');
  document.getElementById('deckCircuitCount').textContent=active+' / 3 CIRCUITOS';
  const complete=team.every(c=>c?.verified&&Number.isFinite(Number(c.hp))&&Number.isFinite(Number(c.dmg)));
  const verified=team.filter(c=>c?.verified&&Number.isFinite(Number(c.hp))&&Number.isFinite(Number(c.dmg)));
  const hpTotal=verified.reduce((a,c)=>a+Number(c.hp),0);
  const dmgTotal=verified.reduce((a,c)=>a+Number(c.dmg),0);
  const totalEl=document.getElementById('deckQuickStats');
  if(totalEl)totalEl.innerHTML=[
    ['HP TOTAL',formatNum(hpTotal),complete?'Soma dos 4 prints':'Parcial: '+verified.length+'/4 verificados'],
    ['DMG TOTAL',formatNum(dmgTotal),complete?'Soma dos 4 prints':'Parcial: '+verified.length+'/4 verificados'],
    ['CIRCUITOS',active+'/3','Somente vizinhos'],
    ['BUFF PASSIVO',passive.some(Boolean)?'+'+Math.max(...passive)+'% DMG':'—',passive.some(Boolean)?'Nas cartas ligadas por ressonância':'Sem ressonância ativa']
  ].map(([label,value,note])=>'<div class="deck-qkpi"><small>'+label+'</small><strong>'+value+'</strong><span>'+note+'</span></div>').join('');
  const buffs=document.getElementById('deckQuickBuffs');
  if(buffs)buffs.innerHTML='<span class="deck-buff-intro">BUFFS DOS LINKS:</span>'+links.map((c,i)=>{
    return '<button type="button" class="deck-buff-pill '+(c?'active':'inactive')+'" '+(c?'data-deck-link="'+i+'"':'disabled')+'>'+(c?'<b>'+safe(c.name)+':</b> '+safe(conditionalCircuit[c.name]||(c.kind==='RESSONÂNCIA'?'+6% DMG passivo + efeito condicional':'Efeito condicional no detalhe')):'Link '+(i+1)+' inativo')+'</button>';
  }).join('');
  sup.innerHTML=equipped.map((id,i)=>{
    const support=byId.get(id)||null;
    const effect=support?(summarySupportEffects[support.name]||'Efeito no detalhe'):'Nenhum';
    return '<button type="button" class="deck-support-card" data-deck-support="'+i+'" aria-label="Trocar suporte do slot '+(i+1)+'"><span class="deck-support-num">SUP '+(i+1)+'</span><span class="deck-support-art">'+imgMarkup(support)+'</span><span class="deck-support-caption"><strong>'+safe(support?.name||'Adicionar suporte')+'</strong><small>'+safe(support?.kind||'Vazio')+'</small><em>'+safe(effect)+'</em></span></button>';
  }).join('');
}
function setSupport(slot,id){equipped[slot]=id;try{localStorage.setItem('codex-support-team',JSON.stringify(equipped))}catch{}render();window.dispatchEvent(new Event('codex-support-changed'));closePicker()}
function closePicker(){document.getElementById('deckSupportModal')?.remove();openSlot=-1;filterValue=''}
function openPicker(slot){
  closePicker();openSlot=slot;
  const overlay=document.createElement('div');overlay.id='deckSupportModal';overlay.className='deck-support-overlay';
  overlay.innerHTML='<div class="deck-support-dialog" role="dialog" aria-modal="true" aria-labelledby="deckSupportTitle"><div class="deck-picker-title"><div><span>SUPPORT CARDS</span><h2 id="deckSupportTitle">Suporte do slot '+(slot+1)+'</h2></div><button type="button" data-deck-close aria-label="Fechar">✕</button></div><input id="deckSupportSearch" type="search" placeholder="Pesquisar por nome ou tipo..." aria-label="Pesquisar suportes"><div id="deckSupportChoices" class="deck-support-choices"></div><button class="deck-unset" type="button" data-deck-none>Retirar suporte deste slot</button></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closePicker()});
  const input=document.getElementById('deckSupportSearch');
  input.addEventListener('input',()=>{filterValue=input.value.toLowerCase().trim();drawChoices()});
  drawChoices();input.focus();
}
function drawChoices(){
  const wrap=document.getElementById('deckSupportChoices');if(!wrap)return;
  const list=supports.filter(s=>(s.name+' '+s.kind).toLowerCase().includes(filterValue));
  wrap.innerHTML=list.map(s=>'<button type="button" data-deck-option="'+safe(s.id)+'"><span class="deck-choice-image">'+imgMarkup(s)+'</span><span class="deck-choice-meta"><strong>'+safe(s.name)+'</strong><small>'+safe(s.kind)+(s.verified?' · Efeito conferido':' · Imagem do Drive')+'</small></span><span class="deck-choice-arrow">＋</span></button>').join('')||'<p>Nenhum suporte encontrado.</p>';
}
document.addEventListener('click',e=>{
  const view=e.target.closest('[data-deck-view]');if(view){const id=currentTeam()[Number(view.dataset.deckView)];fullImage(byId.get(id));return;}
  const main=e.target.closest('[data-deck-card]');
  if(main){const n=Number(main.dataset.deckCard);window.CARDO_DECK_API?.pickCard(n);return}
  const support=e.target.closest('[data-deck-support]');
  if(support){openPicker(Number(support.dataset.deckSupport));return}
  if(e.target.closest('#deckPreset')){
    window.CARDO_DECK_API?.setTeam(PRESET_TEAM);
    equipped=PRESET_SUPPORT.slice();
    try{localStorage.setItem('codex-support-team',JSON.stringify(equipped))}catch{}
    render();window.dispatchEvent(new Event('codex-support-changed'));return;
  }
  const circuit=e.target.closest('[data-deck-link]');
  if(circuit){
    const n=Number(circuit.dataset.deckLink);
    const team=currentTeam().map(id=>byId.get(id)||null);
    const c=connection(team[n],team[n+1]);if(!c)return;
    const msg=circuitInfo[c.name]||'Circuito ativo entre os elementos '+c.elements.join(' e ')+'. Consulte a seção Origin Circuits do guia para o efeito específico.';
    const banner=document.getElementById('deckCircuitDetail');
    if(banner){banner.hidden=false;banner.innerHTML='<b>'+safe(c.name)+'</b><span>'+safe(msg)+'</span><button type="button" data-deck-hide-info aria-label="Fechar detalhes">✕</button>'}return;
  }
  if(e.target.closest('[data-deck-hide-info]')){document.getElementById('deckCircuitDetail').hidden=true;return}
  if(e.target.closest('[data-deck-close]')){closePicker();return}
  const option=e.target.closest('[data-deck-option]');
  if(option){setSupport(openSlot,option.dataset.deckOption);return}
  if(e.target.closest('[data-deck-none]')){setSupport(openSlot,null);return}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePicker();document.getElementById('deckImageOverlay')?.remove()}});
window.addEventListener('codex-team-changed',render);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
