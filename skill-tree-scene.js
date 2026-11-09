(() => {
 'use strict';
 const data=window.CARDO_SKILLS;
 if(!data||!Array.isArray(data.nodes))return;
 const cats=data.categories;
 const root=document.getElementById('skillScene');
 if(!root)return;
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&quot;':'&quot;',"'":'&#39;'}[ch]));
 const glyphs={General:'✥',Elements:'❖',Debuffs:'⊘',Traits:'♢',Colosseum:'⚔',Infinite:'∞','Border Stats':'▣'};
 const descriptions={
   General:'The foundations every card builds on. Sorte, velocidade de rolagem e chance de bordas.',
   Elements:'Every element gets its own arm: chance de proc, dano elemental e defesa.',
   Debuffs:'The marks that bend a battle your way. Potência e evolução dos estados negativos.',
   Traits:'Sharpen the facets that define your cards. Melhorias dos Traits e economia de cristais.',
   Colosseum:'Upgrades para moeda, Blessings, Elite Dice e suportes do Colosseum.',
   Infinite:'Mais cartas, recursos, sustain e aprimoramentos dos Paths para as runs Infinite.',
   'Border Stats':'The framework behind every border. Stats adicionais por categoria de borda.'
 };
 const positionsCfg={
  General:{angle:-90,spread:34,rows:[3,3,3,4]},
  Elements:{angle:-25,spread:42,rows:[4,5,5,5,5,5]},
  Debuffs:{angle:40,spread:42,rows:[5,6,6,6,7,7]},
  Traits:{angle:102,spread:34,rows:[3,4,4,4]},
  Colosseum:{angle:153,spread:28,rows:[3,3,3,2]},
  Infinite:{angle:192,spread:26,rows:[4,4,5,5]},
  'Border Stats':{angle:229,spread:26,rows:[4,4,4,4]}
 };
 const state={category:'General',selectedId:null,layout:'expanded',scale:1,cx:500,cy:405,simulation:false,webView:false,readyIndex:-1};
 const allById=new Map(data.nodes.map(x=>[x.id,x]));
 const readyNodes=data.nodes.filter(x=>x.status==='ready');
 const positions=new Map();
 const segments=[];
 const rad=d=>d*Math.PI/180;
 const polar=(angle,radius)=>({x:500+Math.cos(rad(angle))*radius,y:405+Math.sin(rad(angle))*radius});
 const effective=x=>state.simulation?'learned':x.status;
 const totalLearned=()=>state.simulation?data.nodes.length:data.nodes.filter(x=>effective(x)==='learned').length;
 function locate(){
   positions.clear();segments.length=0;
   if(state.layout==='overview'){
     cats.forEach((cat,i)=>{
       const core=data.nodes.find(n=>n.path===cat.name);
       const p=polar(-90+i*360/cats.length,275);
       positions.set(core.id,{...p,layer:0,cat:cat.name});
       segments.push({from:{x:500,y:405},to:p,cat:cat.name,fromNode:null,toNode:core});
     });
     return;
   }
   // Enlarged four-ring layout: each talent keeps a generous
   // radial/arc gap so both the icon and its name can be read.
   const members=data.nodes.filter(x=>x.path===state.category);
   if(!members.length)return;
   const core=members[0],origin={x:500,y:405};
   positions.set(core.id,{...origin,layer:0,cat:state.category});
   const rest=members.slice(1),count=rest.length;
   const ringSizes=count>=33?[6,9,11,count-26]:
     count>=25?[6,8,8,count-22]:
     count>=17?[5,6,count-11]:
     count>=14?[4,5,count-9]:
     count>=11?[4,4,count-8]:
     [3,Math.min(4,count-3),Math.max(0,count-7)];
   const radii=[208,388,568,748],rotations=[-91,-73,-91,-73];
   let offset=0,previous=[core];
   for(let ringIndex=0;ringIndex<ringSizes.length;ringIndex++){
     const membersInRing=rest.slice(offset,offset+ringSizes[ringIndex]);
     offset+=membersInRing.length;
     if(!membersInRing.length)continue;
     membersInRing.forEach((node,i)=>{
       const p=polar(rotations[ringIndex]+360*i/membersInRing.length,radii[ringIndex]);
       positions.set(node.id,{...p,layer:ringIndex+1,cat:state.category});
       const closest=previous.reduce((best,prev)=>{
          const q=positions.get(prev.id),dist=Math.hypot(q.x-p.x,q.y-p.y);
          return dist<best.dist?{node:prev,dist}:best;
       },{node:previous[0],dist:Infinity});
       segments.push({from:positions.get(closest.node.id),to:p,cat:state.category,fromNode:closest.node,toNode:node});
     });
     previous=membersInRing;
   }
 }
 function color(cat){return cats.find(c=>c.name===cat)?.color||'#baa4e4'}
 function svgDefs(){
   const stars=Array.from({length:145},(_,i)=>{
     const x=(Math.sin(i*124.119)*43758.5453)%1,y=(Math.cos(i*91.131)*39211.12)%1;
     const px=40+Math.abs(x)*920,py=20+Math.abs(y)*760;
     return '<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(i%13===0?1.9:.6).toFixed(1)+'" fill="#f0e1ff" opacity="'+(i%8===0?.45:.09)+'"/>';
   }).join('');
   const rings=[115,208,388,568,748,925].map(r=>'<circle cx="500" cy="405" r="'+r+'" fill="none" stroke="#a47dc1" stroke-width=".8" opacity=".16"/>').join('');
   return '<defs><radialGradient id="stNucleus"><stop stop-color="#55528f" offset="0"/><stop stop-color="#25264e" offset=".6"/><stop stop-color="#070c1b" offset="1"/></radialGradient><filter id="stNodeGlow"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="stCoreEdge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe0a3"/><stop stop-color="#9872ce" offset=".5"/><stop stop-color="#e9b8e0" offset="1"/></linearGradient></defs>'
   +'<rect x="0" y="0" width="1000" height="800" fill="transparent"/>'
   +'<ellipse cx="500" cy="405" rx="780" ry="780" fill="url(#stNucleus)" opacity=".66"/>'
   +rings+'<g class="st-stars">'+stars+'</g>';
 }
 function renderLinks(){
   return '<g class="st-link-layer">'+segments.map(s=>{
      const on=state.category===s.cat,learned=s.toNode&&effective(s.toNode)==='learned'&&(!s.fromNode||effective(s.fromNode)==='learned');
      const faint=!on&&state.scale>1.08;
      const c=color(s.cat),alpha=faint?.11:(learned?.55:.18);
      const mx=(s.from.x+s.to.x)/2,my=(s.from.y+s.to.y)/2;
      const curve='M'+s.from.x.toFixed(2)+' '+s.from.y.toFixed(2)+' Q'+(mx+((s.to.y-s.from.y)*.045)).toFixed(2)+' '+(my-((s.to.x-s.from.x)*.045)).toFixed(2)+' '+s.to.x.toFixed(2)+' '+s.to.y.toFixed(2);
      return '<path d="'+curve+'" stroke="'+c+'" stroke-width="'+(learned?2:1.1)+'" opacity="'+alpha+'" fill="none" stroke-linecap="round"/>';
   }).join('')+'</g>';
 }
 function renderNodes(){
   return '<g class="st-node-layer">'+data.nodes.filter(node=>positions.has(node.id)).map(node=>{
     const p=positions.get(node.id);if(!p)return '';
     const status=effective(node),isSelected=state.selectedId===node.id,hasFocus=state.category===node.path,highlight=hasFocus?'st-focus':'st-unfocus';
     const r=state.layout==='overview'?37:node.tier==='capstone'?34:node.tier==='core'?42:29;
     const fill=status==='learned'?color(node.path):status==='ready'?'#b7a0f0':'#48405b';
     const cost=Number(node.cost||0);
     const icon=node.tier==='capstone'?'♛':node.tier==='core'?glyphs[node.path]:'◇';
     const label=esc(node.name.length>25?node.name.slice(0,23)+'…':node.name);
     const activeLabel=state.layout==='expanded'&&state.scale>=0.82;
     return '<g class="st-node '+status+' '+highlight+(isSelected?' st-selected':'')+'" role="button" tabindex="0" aria-label="'+esc(node.name+', '+(node.cost||'?')+' pontos, '+status)+'" data-st-node="'+esc(node.id)+'" transform="translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')">'
       +'<title>'+esc(node.name+' • '+(node.cost||'?')+' pontos • '+({learned:'Aprendido',ready:'Pronto',locked:'Bloqueado'}[status]))+'</title>'
       +(status==='learned'?'<circle r="'+(r+8)+'" fill="'+fill+'" opacity=".21" filter="url(#stNodeGlow)"/>':'')
       +'<circle r="'+(r+7)+'" fill="none" stroke="'+fill+'" stroke-width="2.5" stroke-dasharray="'+(status==='locked'?'2 7':'6 3')+'" opacity="'+(status==='locked'?.28:.85)+'"/>'
       +'<circle r="'+(r+2.6)+'" fill="'+(status==='learned'?'#161a32':'#151325')+'" stroke="'+fill+'" stroke-width="'+(isSelected?4:2.2)+'" opacity="'+(status==='locked'?.55:1)+'"/>'
       +'<circle r="'+(r-3)+'" fill="'+(status==='learned'?fill:'#26253f')+'" fill-opacity="'+(status==='learned'?.45:.38)+'" stroke="none"/>'
       +'<text class="st-node-icon" x="0" y="5" text-anchor="middle" fill="'+(status==='locked'?'#827a99':'#fff4d8')+'" font-size="'+(state.layout==='overview'?29:node.tier==='core'?34:25)+'">'+icon+'</text>'
       +(status==='locked'?'<text x="'+(r+2)+'" y="'+(r+7)+'" font-size="10" fill="#c4bada">⌑</text>':'')
       +(activeLabel?'<text class="st-svg-node-label" y="'+(r+35)+'" text-anchor="middle" fill="#f9f2ff">'+label+'</text>':'')+'</g>';
   }).join('')+'</g>';
 }
 function renderPathLabels(){
   if(state.layout==='expanded'){
     const c=color(state.category),cat=cats.find(x=>x.name===state.category);
     return '<g class="st-path-labels" pointer-events="none">'
      +'<text x="500" y="31" fill="'+c+'" font-size="24" text-anchor="middle" font-weight="900" font-style="italic" letter-spacing="3">'+esc(state.category.toUpperCase())+'</text>'
      +'<text x="500" y="49" fill="#e3d9ee" font-size="11" text-anchor="middle" font-weight="800">'+(state.simulation?cat.total:cat.learned)+' / '+cat.total+' TALENTOS · SEPARADOS POR NÍVEL</text></g>';
   }
   return '<g class="st-path-labels" pointer-events="none">'+cats.map((cat,i)=>{
     const p=polar(-90+i*360/cats.length,343),c=color(cat.name);
     return '<g transform="translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')"><text x="0" y="0" text-anchor="middle" fill="'+c+'" font-size="17" font-style="italic" font-weight="900" letter-spacing="1">'+esc(cat.name.toUpperCase())+'</text><text x="0" y="16" text-anchor="middle" fill="#d9cde9" font-size="10" letter-spacing="2">'+(state.simulation?cat.total:cat.learned)+' / '+cat.total+'</text></g>';
   }).join('')+'</g>';
 }
 function renderCore(){
   if(state.layout==='expanded'){
     const col=color(state.category);
     return '<g class="st-core-group" pointer-events="none"><circle cx="500" cy="405" r="63" fill="'+col+'" opacity=".16" filter="url(#stNodeGlow)"/>'
       +'<circle cx="500" cy="405" r="56" fill="none" stroke="'+col+'" stroke-width="2" stroke-dasharray="5 7" opacity=".65"/>'
       +'<circle cx="500" cy="405" r="40" fill="#17162e" stroke="'+col+'" stroke-width="1.2" opacity=".9"/></g>';
   }

   return '<g class="st-core-group"><circle cx="500" cy="405" r="55" fill="#9a76c8" opacity=".26" filter="url(#stNodeGlow)"/>'
     +'<circle cx="500" cy="405" r="49" stroke="url(#stCoreEdge)" stroke-width="4" fill="#1d1738"/>'
     +'<circle cx="500" cy="405" r="40" stroke="#f3d8a2" stroke-width="1.7" fill="#14192e"/>'
     +'<circle cx="500" cy="405" r="30" fill="#343356" stroke="#a88dc1" stroke-width="1.5"/>'
     +'<text x="500" y="414" font-size="27" font-weight="900" text-anchor="middle" fill="#fff0cf">CO</text>'
     +'<text x="500" y="470" font-size="9" text-anchor="middle" fill="#ead5f4" font-weight="900">CARD ORIGINS</text></g>';
 }
 function renderMap(){
  const svg=$('stTreeSvg');if(!svg)return;
  svg.innerHTML=svgDefs()+renderCore()+renderLinks()+renderNodes()+renderPathLabels();
  applyViewBox();
  const lab=$('stMapMode');if(lab)lab.textContent=state.layout==='expanded'?state.category.toUpperCase()+' / TALENTOS EXPANDIDOS':'VISÃO GERAL / 7 CAMINHOS';
  const learned=$('stMapLearned');if(learned)learned.textContent=totalLearned();
 }
 function applyViewBox(){
  const svg=$('stTreeSvg');
  if(!svg)return;
  const w=1000/state.scale,h=800/state.scale;
  svg.setAttribute('viewBox',[(state.cx-w/2).toFixed(2),(state.cy-h/2).toFixed(2),w.toFixed(2),h.toFixed(2)].join(' '));
  const z=$('stZoomLevel');if(z)z.textContent=Math.round(state.scale*100)+'%';
 }
 function setZoom(next){state.scale=Math.min(3.5,Math.max(.51,next));applyViewBox();renderMap();}
 function focusPath(){
   state.layout='expanded';state.cx=500;state.cy=405;state.scale=1.12;
   locate();renderMap();
 }
 function resetView(){
   state.layout='overview';state.scale=1;state.cx=500;state.cy=405;
   state.selectedId=null;locate();renderMap();showPath();
 }
 function renderSidebar(){
   const pathHolder=$('skillPaths');if(!pathHolder)return;
   pathHolder.innerHTML=cats.map(cat=>{
    const ready=data.nodes.filter(n=>n.path===cat.name&&effective(n)==='ready').length;
    const learned=state.simulation?cat.total:cat.learned;
    const selected=state.category===cat.name;
    return '<button type="button" class="st-path-item '+(selected?'selected':'')+'" style="--st-color:'+cat.color+'" data-st-path="'+esc(cat.name)+'" aria-pressed="'+selected+'">'
      +'<span class="st-path-symbol">'+glyphs[cat.name]+'</span>'
      +'<span class="st-path-middle"><strong>'+esc(cat.name)+'</strong><span class="st-meter"><i style="width:'+(learned/cat.total*100).toFixed(1)+'%"></i></span></span>'
      +(ready?'<span class="st-path-ready" title="'+ready+' talento(s) disponíveis">'+ready+'</span>':'')
      +'<span class="st-path-count">'+learned+'/'+cat.total+'</span></button>';
   }).join('');
   const num=$('stPathOverall');if(num)num.textContent=totalLearned()+' / 146';
   const next=$('stNextReady');if(next)next.textContent='NEXT READY ('+(state.simulation?0:readyNodes.length)+') [F]';
   const available=$('stPointCount');if(available)available.textContent=state.simulation?'–':String(data.skillPointsLatestScreenshot||5);
   const sim=$('stSimulationTip');if(sim)sim.hidden=!state.simulation;
 }
 function showPath(){
  const cat=cats.find(x=>x.name===state.category);if(!cat)return;
  const learned=state.simulation?cat.total:cat.learned;
  const ready=data.nodes.filter(n=>n.path===cat.name&&effective(n)==='ready');
  const locked=data.nodes.filter(n=>n.path===cat.name&&effective(n)==='locked').length;
  const p=(100*learned/cat.total).toFixed(0);
  const detail=$('stDetail');if(!detail)return;
  detail.style.setProperty('--st-current',cat.color);
  detail.innerHTML='<div class="st-detail-emblem"><span>'+glyphs[cat.name]+'</span></div>'
   +'<h2>'+esc(cat.name)+'</h2><div class="st-detail-badges"><span>PATH</span><span>'+cat.total+' TALENTS</span></div>'
   +'<div class="st-detail-separator">◇</div><p class="st-description">'+esc(descriptions[cat.name])+'</p>'
   +'<div class="st-detail-stats"><p class="st-green">◆ <b>'+learned+' / '+cat.total+'</b> learned</p>'
   +(ready.length?'<p class="st-gold">◆ '+ready.length+' ready to learn</p>':'')
   +(locked?'<p>◆ '+locked+' locked</p>':'')
   +'<p>◆ '+p+'% of this path complete</p></div>'
   +(ready.length?'<div class="st-detail-section"><strong>READY NOW (click to inspect)</strong>'+ready.slice(0,7).map(n=>'<button type="button" class="st-ready-btn" data-st-inspect="'+esc(n.id)+'"><span>'+esc(n.name)+'</span><b>'+esc(String(n.cost||'?'))+' POINT'+(n.cost===1?'':'S')+'</b></button>').join('')+'</div>':'')
   +'<p class="st-detail-note">Start from the Core. Each talent unlocks those connected to it in the game. You earn 1 Skill Point every 8,500 rolls.</p>'
   +'<div class="st-detail-footer"><button type="button" class="st-detail-btn st-detail-btn-purple" id="stOpenLearned">LEARNED ('+totalLearned()+')</button></div>';
 }
 function inspect(nodeId){
   const n=allById.get(nodeId);
   if(!n)return;
   state.category=n.path;state.selectedId=n.id;
   if(state.layout!=='expanded'||!positions.has(n.id)){state.layout='expanded';locate();state.cx=500;state.cy=405;state.scale=1.12;}
   renderSidebar();
   renderMap();
   const s=effective(n),cat=cats.find(c=>c.name===n.path),col=color(n.path);
   const detail=$('stDetail');if(!detail)return;
   detail.style.setProperty('--st-current',col);
   detail.innerHTML='<div class="st-detail-emblem"><span>'+glyphs[n.path]+'</span></div>'
     +'<h2>'+esc(n.name)+'</h2><div class="st-detail-badges"><span>'+esc((n.tier||'TALENT').toUpperCase())+'</span><span>'+esc(String(n.cost??'?'))+' POINT'+(n.cost===1?'':'S')+'</span></div>'
     +'<div class="st-detail-separator">◇</div>'
     +'<p class="st-description">'+esc(n.path)+' • '+esc(cat?cat.learned+'/'+cat.total:'')+'</p>'
     +'<div class="st-talent-effect"><strong>O QUE FAZ</strong><p>'+esc(n.effect)+'</p></div>'
     +(n.notes?'<p class="st-detail-note st-notverified">'+esc(n.notes)+'</p>':'')
     +'<div class="st-talent-state '+s+'">'+(s==='learned'?(n.notes&&n.notes.includes('mais compatível')?'✓ PROVÁVEL APRENDIDO — CONFIRMAR':'✓ APRENDIDO NO PRINT'):s==='ready'?'✦ DISPONÍVEL — AINDA NÃO ATIVO':'◇ BLOQUEADO — AINDA NÃO ATIVO')+'</div>'
     +'<p class="st-detail-note">Reconstituição visual da árvore. As conexões dos nós são ilustrativas; consulte o jogo para requisitos exatos.</p>'
     +'<div class="st-detail-footer"><button type="button" class="st-detail-btn st-detail-btn-purple" id="stBackToPath">VOLTAR AO PATH</button></div>';
 }
 function selectPath(name,focus=true){
  if(!cats.some(c=>c.name===name))return;
  state.category=name;state.selectedId=null;
  renderSidebar();showPath();
  if(focus)focusPath();else renderMap();
 }
 function toggleCatalog(show){
  state.webView=show;
  const panel=$('stCatalogPanel');if(panel)panel.hidden=!show;
  const button=$('stWebView');if(button)button.textContent=show?'WEB VIEW: OFF [V]':'WEB VIEW: ON [V]';
 }
 function nextReady(){
  if(state.simulation||!readyNodes.length)return;
  state.readyIndex=(state.readyIndex+1)%readyNodes.length;
  const node=readyNodes[state.readyIndex];inspect(node.id);
  const p=positions.get(node.id);if(p){state.cx=500;state.cy=405;state.scale=1.12;renderMap()}
 }
 function closeScene(){
  if(state.webView){toggleCatalog(false);return}
  const home=document.querySelector('.side-nav [data-nav="home"]');if(home)home.click();
  else window.location.hash='home';
 }
 function init(){
  locate();
  renderSidebar();showPath();renderMap();
  const svg=$('stTreeSvg');
  svg.addEventListener('click',event=>{
   const g=event.target.closest('[data-st-node]');
   if(g){const n=allById.get(g.getAttribute('data-st-node'));if(n){if(state.layout==='overview')selectPath(n.path);else inspect(n.id)}}
  });
  svg.addEventListener('keydown',event=>{
   const g=event.target.closest('[data-st-node]');
   if(g&&(event.key==='Enter'||event.key===' ')){event.preventDefault();const n=allById.get(g.getAttribute('data-st-node'));if(n){if(state.layout==='overview')selectPath(n.path);else inspect(n.id)}}
  });
  let drag=null;
  svg.addEventListener('pointerdown',event=>{
   if(event.button!==0||event.target.closest('[data-st-node]'))return;
   drag={x:event.clientX,y:event.clientY,cx:state.cx,cy:state.cy};
   if(svg.setPointerCapture)svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener('pointermove',event=>{
   if(!drag)return;
   const rect=svg.getBoundingClientRect(),ratio=Math.min(rect.width/1000,rect.height/800);
   if(!ratio)return;
   state.cx=drag.cx-(event.clientX-drag.x)/(ratio*state.scale);
   state.cy=drag.cy-(event.clientY-drag.y)/(ratio*state.scale);
   applyViewBox();
  });
  const stop=()=>{drag=null};
  svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);svg.addEventListener('lostpointercapture',stop);
  svg.addEventListener('wheel',event=>{event.preventDefault();setZoom(state.scale*(event.deltaY<0?1.13:1/1.13))},{passive:false});
  root.addEventListener('click',event=>{
    const path=event.target.closest('[data-st-path]'),
          inspectBtn=event.target.closest('[data-st-inspect]');
    if(path){selectPath(path.dataset.stPath);return}
    if(inspectBtn){inspect(inspectBtn.dataset.stInspect);return}
    if(event.target.closest('#stZoomIn')){setZoom(state.scale*1.2);return}
    if(event.target.closest('#stZoomOut')){setZoom(state.scale/1.2);return}
    if(event.target.closest('#stCenterPath')){focusPath();return}
    if(event.target.closest('#stFitAll')){state.cx=500;state.cy=405;setZoom(state.layout==='overview'?1:.51);return}
    if(event.target.closest('#stOverview')){resetView();return}
    if(event.target.closest('#stNextReady')){nextReady();return}
    if(event.target.closest('#stWebView')){toggleCatalog(!state.webView);return}
    if(event.target.closest('#stBackToMap')){toggleCatalog(false);return}
    if(event.target.closest('#stClose')){closeScene();return}
    if(event.target.closest('#stBackToPath')){state.selectedId=null;showPath();renderMap();return}
    if(event.target.closest('#stOpenLearned')){toggleCatalog(true);const button=root.querySelector('[data-sk-state="learned"]');if(button)button.click();return}
    if(event.target.closest('#stLearnAll')){state.simulation=true;renderSidebar();state.selectedId=null;showPath();renderMap();return}
    if(event.target.closest('#stResetSkills')){state.simulation=false;renderSidebar();resetView();return}
  });
  document.addEventListener('keydown',event=>{
    if(!document.getElementById('page-skill')?.classList.contains('active'))return;
    if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(event.key==='Escape'){event.preventDefault();closeScene()}
    if(event.key.toLowerCase()==='v'){event.preventDefault();toggleCatalog(!state.webView)}
    if(event.key.toLowerCase()==='c'){event.preventDefault();focusPath()}
    if(event.key.toLowerCase()==='g'){event.preventDefault();resetView()}
    if(event.key.toLowerCase()==='a'){event.preventDefault();state.cx=500;state.cy=405;setZoom(.51)}
    if(event.key.toLowerCase()==='f'){event.preventDefault();nextReady()}
    if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(state.scale*1.2)}
    if(event.key==='-'){event.preventDefault();setZoom(state.scale/1.2)}
    if(event.key>='1'&&event.key<='7'){const cat=cats[Number(event.key)-1];if(cat)selectPath(cat.name)}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();