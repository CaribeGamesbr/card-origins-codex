(() => {
 'use strict';
 const data=window.CARDO_SKILLS;
 if(!data||!Array.isArray(data.nodes))return;
 const cats=data.categories;
 const topology=window.CARDO_SKILL_TOPOLOGY||{};
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
  General:{angle:-90,spread:26,radii:[350,510,670,830],rows:[3,3,3,4]},
  Elements:{angle:-35,spread:42,radii:[350,510,670,830,990,1150],rows:[4,5,5,5,5,5]},
  Debuffs:{angle:29,spread:48,radii:[390,550,710,870,1030,1190],rows:[5,6,6,6,7,7]},
  Traits:{angle:91,spread:35,radii:[320,480,640,800],rows:[3,4,4,4]},
  Colosseum:{angle:146,spread:30,radii:[320,480,640,800],rows:[3,3,3,2]},
  Infinite:{angle:192,spread:30,radii:[450,610,770,930],rows:[4,4,5,5]},
  'Border Stats':{angle:233,spread:30,radii:[450,610,770,930],rows:[4,4,4,4]}
 };
 const state={category:'General',selectedId:null,layout:'overview',scale:.38,cx:500,cy:405,simulation:false,webView:true,catalogOpen:false,readyIndex:-1};
 const normalize=s=>String(s??'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const allById=new Map(data.nodes.map(x=>[x.id,x]));
 const positions=new Map();
 const segments=[];
 const rad=d=>d*Math.PI/180;
 const polar=(angle,radius)=>({x:500+Math.cos(rad(angle))*radius,y:405+Math.sin(rad(angle))*radius});
 const initialPoints=Math.max(0,Number(data.skillPointsLatestScreenshot)||0);
 const progressKey='card-origins-codex-skill-progress-v1';
 const originalLearned=new Set(data.nodes.filter(n=>n.status==='learned').map(n=>n.id));
 const hiddenIds=new Set();
 const predecessors=new Map(data.nodes.map(n=>[n.id,[]]));
 for(const cat of cats){
   const nodes=data.nodes.filter(n=>n.path===cat.name);
   const spec=topology[cat.name];
   for(const index of spec?.hidden||[])if(nodes[index])hiddenIds.add(nodes[index].id);
   for(const [source,target] of spec?.edges||[]){
     const from=nodes[source],to=nodes[target];
     if(from&&to&&from.id!==to.id)predecessors.get(to.id)?.push(from.id);
   }
 }
 function loadProgress(){
   const empty={purchased:[],added:0};
   try{
     const saved=JSON.parse(window.localStorage.getItem(progressKey)||'null');
     if(!saved||saved.version!==1||!Array.isArray(saved.purchased))return empty;
     let balance=initialPoints;
     const added=Number(saved.added);
     empty.added=Number.isSafeInteger(added)?Math.min(100000,Math.max(0,added)):0;
     balance+=empty.added;
     const seen=new Set();
     for(const id of saved.purchased.slice(0,146)){
       const n=allById.get(id),cost=Number(n?.cost);
       if(!n||originalLearned.has(id)||hiddenIds.has(id)||seen.has(id)||!Number.isSafeInteger(cost)||cost<=0||balance<cost)continue;
       seen.add(id);balance-=cost;empty.purchased.push(id);
     }
   }catch(_){/* localStorage may be blocked in private browsing */ }
   return empty;
 }
 const progress=loadProgress();
 function saveProgress(){
   try{window.localStorage.setItem(progressKey,JSON.stringify({version:1,added:progress.added,purchased:progress.purchased}));return true}
   catch(_){return false}
 }
 const purchased=()=>new Set(progress.purchased);
 const costOf=n=>Math.max(0,Number(n?.cost)||0);
 const pointsSpent=()=>progress.purchased.reduce((sum,id)=>sum+costOf(allById.get(id)),0);
 const pointsLeft=()=>Math.max(0,initialPoints+progress.added-pointsSpent());
 const isLearned=n=>!!n&&(originalLearned.has(n.id)||progress.purchased.includes(n.id));
 // A screenshot-ready talent is always available. Further talents are unlocked
 // by simulator purchases of a directly linked prerequisite. The graph itself
 // was reconstructed from screenshots and is not an official dependency API.
 function isAvailable(n){
   if(!n||isLearned(n)||hiddenIds.has(n.id)||String(n.name).includes('não identificado'))return false;
   if(n.status==='ready')return true;
   if(n.status!=='locked')return false;
   const parents=predecessors.get(n.id)||[];
   return parents.length>0&&parents.some(id=>progress.purchased.includes(id));
 }
 const effective=n=>isLearned(n)?'learned':isAvailable(n)?'ready':'locked';
 const totalLearned=()=>data.nodes.filter(isLearned).length;
 const readyNodes=()=>data.nodes.filter(isAvailable);
 function notice(message){
   const label=$('stSimulationTip');if(!label)return;
   label.textContent=message;label.hidden=false;
 }
 function updateAfterChange(focusId){
   renderSidebar();
   if(focusId&&allById.has(focusId))inspect(focusId);
   else if(state.selectedId)inspect(state.selectedId);
   else{showPath();renderMap()}
   renderStats();
 }
 function learnTalent(id){
   const n=allById.get(id);
   if(!n)return;
   if(isLearned(n)){notice(n.name+' já está aprendido no simulador.');return}
   if(!isAvailable(n)){notice('Este talento ainda está bloqueado na simulação.');return}
   const cost=costOf(n);
   if(!cost||pointsLeft()<cost){notice('Pontos insuficientes. Precisa de '+cost+' e tem '+pointsLeft()+'.');return}
   progress.purchased.push(n.id);
   saveProgress();
   updateAfterChange(n.id);
   notice('✓ '+n.name+' aprendido por '+cost+' ponto(s). Saldo: '+pointsLeft()+'. Somente no simulador.');
 }
 function addSkillPoints(){
   const input=$('stGrantPoints'),amount=Number(input?.value);
   if(!Number.isSafeInteger(amount)||amount<1||amount>1000){
     notice('Digite uma quantidade inteira entre 1 e 1000 pontos.');return;
   }
   if(progress.added+amount>100000){notice('Limite do simulador: 100.000 pontos adicionais.');return}
   progress.added+=amount;saveProgress();updateAfterChange();
   notice('+'+amount+' pontos adicionados à simulação. Disponíveis: '+pointsLeft()+'.');
 }
 function resetSkills(){
   if(!progress.purchased.length&&!progress.added){notice('A simulação já está igual ao print.');return}
   if(typeof window.confirm==='function'&&!window.confirm('Reiniciar a simulação e voltar aos 5 pontos e talentos do último print?'))return;
   progress.purchased=[];progress.added=0;saveProgress();
   state.selectedId=null;renderSidebar();showPath();renderMap();renderStats();
   notice('Simulação reiniciada para o último print. Nenhuma alteração no Roblox.');
 }

 function locate(){
   positions.clear();segments.length=0;
   cats.forEach(cat=>{
     if(state.webView&&cat.name!==state.category)return;
     const spec=topology[cat.name];
     const members=data.nodes.filter(node=>node.path===cat.name);
     const layout=positionsCfg[cat.name];
     if(!spec||spec.points.length!==members.length||!layout)return;
     const hidden=new Set(spec.hidden||[]);
     if(state.webView){
       // Apply only gentle collision separation to coordinates read from the
       // original screenshots. Never derive a relationship from proximity.
       const pts=spec.points.map(([x,y])=>({x,y}));
       const minDist=78;
       for(let pass=0;pass<26;pass++){
         let changes=0;
         for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
           if(hidden.has(i)||hidden.has(j))continue;
           const p=pts[i],q=pts[j];
           const dx=q.x-p.x,dy=q.y-p.y,d=Math.max(.01,Math.hypot(dx,dy));
           if(d>=minDist)continue;
           const push=(minDist-d)/2+.04;
           const ux=dx/d,uy=dy/d;
           p.x-=push*ux;p.y-=push*uy;q.x+=push*ux;q.y+=push*uy;
           changes++;
         }
         if(!changes)break;
       }
       members.forEach((node,i)=>{
         if(hidden.has(i))return;
         const p=pts[i];
         positions.set(node.id,{...p,layer:0,cat:cat.name});
       });
     }else{
       // The overview preserves the seven familiar radial sectors.
       const base=polar(layout.angle,140);
       positions.set(members[0].id,{...base,layer:0,cat:cat.name});
       let offset=1;
       layout.rows.forEach((count,level)=>{
         const radius=layout.radii[level];
         members.slice(offset,offset+count).forEach((node,i)=>{
           const angle=layout.angle+(count===1?0:(i/(count-1)-.5)*layout.spread)+((level%2)?1.8:-1.8);
           if(!hidden.has(offset+i))positions.set(node.id,{...polar(angle,radius),layer:level+1,cat:cat.name});
         });
         offset+=count;
       });
     }
     // Only explicit source-grounded edges: never link by nearest neighbor.
     for(const [a,b] of spec.edges){
       const from=positions.get(members[a]?.id);
       const to=positions.get(members[b]?.id);
       if(!from||!to)continue;
       segments.push({from,to,cat:cat.name,fromNode:members[a],toNode:members[b]});
     }
   });
 }
 function color(cat){return cats.find(c=>c.name===cat)?.color||'#baa4e4'}
 function svgDefs(){
   const stars=Array.from({length:145},(_,i)=>{
     const x=(Math.sin(i*124.119)*43758.5453)%1,y=(Math.cos(i*91.131)*39211.12)%1;
     const px=40+Math.abs(x)*920,py=20+Math.abs(y)*760;
     return '<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="'+(i%13===0?1.9:.6).toFixed(1)+'" fill="#f0e1ff" opacity="'+(i%8===0?.45:.09)+'"/>';
   }).join('');
   const rings=[140,280,460,650,840,1030].map(r=>'<circle cx="500" cy="405" r="'+r+'" fill="none" stroke="#a47dc1" stroke-width=".8" opacity=".16"/>').join('');
   return '<defs><radialGradient id="stNucleus"><stop stop-color="#55528f" offset="0"/><stop stop-color="#25264e" offset=".6"/><stop stop-color="#070c1b" offset="1"/></radialGradient><filter id="stNodeGlow"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="stCoreEdge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe0a3"/><stop stop-color="#9872ce" offset=".5"/><stop stop-color="#e9b8e0" offset="1"/></linearGradient></defs>'
   +'<rect x="0" y="0" width="1000" height="800" fill="transparent"/>'
   +'<ellipse cx="500" cy="405" rx="890" ry="890" fill="url(#stNucleus)" opacity=".66"/>'
   +rings+'<g class="st-stars">'+stars+'</g>';
 }
 function renderLinks(){
   return '<g class="st-link-layer">'+segments.filter(s=>!state.webView||s.cat===state.category).map(s=>{
      const on=state.category===s.cat,learned=s.toNode&&effective(s.toNode)==='learned'&&(!s.fromNode||effective(s.fromNode)==='learned');
      const faint=!on&&state.scale>1.08;
      const c=color(s.cat),alpha=state.webView?(learned?.85:.42):(faint?.11:(learned?.55:.18));
      const mx=(s.from.x+s.to.x)/2,my=(s.from.y+s.to.y)/2;
      const curve='M'+s.from.x.toFixed(2)+' '+s.from.y.toFixed(2)+' Q'+(mx+((s.to.y-s.from.y)*.045)).toFixed(2)+' '+(my-((s.to.x-s.from.x)*.045)).toFixed(2)+' '+s.to.x.toFixed(2)+' '+s.to.y.toFixed(2);
      return (state.webView&&learned?'<path d="'+curve+'" stroke="'+c+'" stroke-width="7" opacity=".11" filter="url(#stNodeGlow)" fill="none"/>':'')+'<path d="'+curve+'" stroke="'+c+'" stroke-width="'+(state.webView?(learned?3.2:2):(learned?2:1.1))+'" opacity="'+alpha+'" fill="none" stroke-linecap="round"/>'; 
   }).join('')+'</g>';
 }
 function renderNodes(){
   return '<g class="st-node-layer">'+data.nodes.filter(node=>!state.webView||node.path===state.category).map(node=>{
     const p=positions.get(node.id);if(!p)return '';
     const status=effective(node),isSelected=state.selectedId===node.id,hasFocus=state.category===node.path,highlight=hasFocus?'st-focus':'st-unfocus';
     const r=state.webView?(node.tier==='core'?31:node.tier==='capstone'?28:24):(node.tier==='capstone'?23:node.tier==='core'?25:19);
     const fill=status==='learned'?color(node.path):status==='ready'?'#b7a0f0':'#48405b';
     const cost=Number(node.cost||0);
     const icon=node.tier==='capstone'?'♛':node.tier==='core'?glyphs[node.path]:'◇';
     const label=esc(node.name.length>25?node.name.slice(0,23)+'…':node.name);
     const activeLabel=isSelected;
     return '<g class="st-node '+status+' '+highlight+(isSelected?' st-selected':'')+'" role="button" tabindex="0" aria-label="'+esc(node.name+' / '+(node.ptName||'')+', '+(node.cost||'?')+' pontos, '+status)+'" data-st-node="'+esc(node.id)+'" transform="translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')">'
       +'<title>'+esc(node.name+' / '+(node.ptName||'')+' • '+(node.cost||'?')+' pontos • '+({learned:'Aprendido',ready:'Pronto',locked:'Bloqueado'}[status]))+'</title>'
       +(status==='learned'?'<circle r="'+(r+8)+'" fill="'+fill+'" opacity=".21" filter="url(#stNodeGlow)"/>':'')
       +'<circle r="'+(r+7)+'" fill="none" stroke="'+fill+'" stroke-width="2.5" stroke-dasharray="'+(status==='locked'?'2 7':'6 3')+'" opacity="'+(status==='locked'?.28:.85)+'"/>'
       +'<circle r="'+(r+2.6)+'" fill="'+(status==='learned'?'#161a32':'#151325')+'" stroke="'+fill+'" stroke-width="'+(isSelected?4:2.2)+'" opacity="'+(status==='locked'?.55:1)+'"/>'
       +'<circle r="'+(r-3)+'" fill="'+(status==='learned'?fill:'#26253f')+'" fill-opacity="'+(status==='learned'?.45:.38)+'" stroke="none"/>'
       +'<text class="st-node-icon" x="0" y="5" text-anchor="middle" fill="'+(status==='locked'?'#827a99':'#fff4d8')+'" font-size="'+(node.tier==='core'?24:19)+'">'+icon+'</text>'
       +(status==='locked'?'<text x="'+(r+2)+'" y="'+(r+7)+'" font-size="10" fill="#c4bada">⌑</text>':'')
       +(activeLabel?'<text class="st-svg-node-label" y="'+(r+26)+'" text-anchor="middle" fill="#f9f2ff">'+label+'</text>':'')+'</g>';
   }).join('')+'</g>';
 }
 function renderPathLabels(){
   if(state.webView)return '';
   return '<g class="st-path-labels" pointer-events="none">'+cats.map(cat=>{
     const set=positionsCfg[cat.name],p=polar(set.angle,set.radii[set.radii.length-1]+66),c=color(cat.name);
     return '<g transform="translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')"><text x="0" y="0" text-anchor="middle" fill="'+c+'" font-size="26" font-style="italic" font-weight="900" letter-spacing="2">'+esc(cat.name.toUpperCase())+'</text><text x="0" y="21" text-anchor="middle" fill="#d9cde9" font-size="14" letter-spacing="2">'+(state.simulation?cat.total:cat.learned)+' / '+cat.total+'</text></g>';
   }).join('')+'</g>';
 }
 function renderCore(){
   if(state.webView)return '';
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
  const map=svg.closest?.('.st-map');
  if(map){map.dataset.single=state.webView?'true':'false';map.style.setProperty('--st-branch-color',color(state.category))}
  applyViewBox();
  const lab=$('stMapMode');if(lab){const visible=data.nodes.filter(n=>n.path===state.category&&positions.has(n.id)).length;const total=data.nodes.filter(n=>n.path===state.category).length;
    lab.textContent=state.webView?'WEB VIEW • '+state.category.toUpperCase()+' • '+visible+(visible<total?'/'+total+' IDENTIFICADOS':' TALENTOS'):'VISÃO GERAL • 7 CAMINHOS';}
  const learned=$('stMapLearned');if(learned)learned.textContent=totalLearned();
 }
 function applyViewBox(){
  const svg=$('stTreeSvg');
  if(!svg)return;
  const w=1000/state.scale,h=800/state.scale;
  svg.setAttribute('viewBox',[(state.cx-w/2).toFixed(2),(state.cy-h/2).toFixed(2),w.toFixed(2),h.toFixed(2)].join(' '));
  const z=$('stZoomLevel');if(z)z.textContent=Math.round(state.scale*100)+'%';
 }
 function setZoom(next){state.scale=Math.min(3.5,Math.max(.33,next));applyViewBox();renderMap();}
 function focusPath(){
   // Zoom/pan only; preserve each branch's original shape and connections.
   const current=data.nodes.filter(n=>n.path===state.category).map(n=>positions.get(n.id)).filter(Boolean);
   if(!current.length)return;
   // Include the central hub; reserve space for the search field at the top
   // and zoom controls at the bottom without changing the skill positions.
   const xs=current.map(p=>p.x),ys=current.map(p=>p.y);
   const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
   const padX=140,topPad=180,bottomPad=110;
   const left=minX-padX,right=maxX+padX,top=minY-topPad,bottom=maxY+bottomPad;
   state.cx=(left+right)/2;state.cy=(top+bottom)/2;
   state.scale=Math.min(1.45,Math.max(.33,Math.min(1000/(right-left),800/(bottom-top))));
   renderMap();
 }
 function resetView(){
   state.scale=.38;state.cx=500;state.cy=405;
   state.webView=false;state.selectedId=null;locate();updateWebViewButton();renderMap();showPath();
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
   +'<p class="st-detail-note">Linhas reconstruídas das capturas do jogo. Algumas habilidades não mostram ligações e permanecem isoladas; o site não as conecta automaticamente.</p>'
   +((topology[cat.name]?.hidden||[]).length?'<p class="st-detail-note st-notverified">'+topology[cat.name].hidden.length+' talento(s) sem nome/posição legível foram omitidos do mapa, mas permanecem no catálogo.</p>':'')
   +'<div class="st-detail-footer"><button type="button" class="st-detail-btn st-detail-btn-purple" id="stOpenLearned">LEARNED ('+totalLearned()+')</button></div>';
 }
 function inspect(nodeId){
   const n=allById.get(nodeId);
   if(!n)return;
   const changed=state.category!==n.path;
   state.category=n.path;state.selectedId=n.id;
   if(changed||!positions.has(n.id))locate();
   updateWebViewButton();
   renderSidebar();
   renderMap();
   const s=effective(n),cat=cats.find(c=>c.name===n.path),col=color(n.path);
   const detail=$('stDetail');if(!detail)return;
   detail.style.setProperty('--st-current',col);
   detail.innerHTML='<div class="st-detail-emblem"><span>'+glyphs[n.path]+'</span></div>'
     +'<h2>'+esc(n.name)+'</h2>'+(n.ptName?'<p class="st-talent-ptname">'+esc(n.ptName)+' <small>(tradução livre)</small></p>':'')+'<div class="st-detail-badges"><span>'+esc((n.tier||'TALENT').toUpperCase())+'</span><span>'+esc(String(n.cost??'?'))+' POINT'+(n.cost===1?'':'S')+'</span></div>'
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
  locate();renderSidebar();showPath();updateWebViewButton();
  if(focus)focusPath();else renderMap();
 }
 function updateWebViewButton(){
   const button=$('stWebView');if(button){
     button.textContent=state.webView?'WEB VIEW: ON [V]':'WEB VIEW: OFF [V]';
     button.setAttribute('aria-pressed',String(state.webView));
     button.title=state.webView?'Exibindo apenas '+state.category+' — clique para mostrar todos':'Clique para mostrar somente a árvore selecionada';
   }
   const map=$('stTreeSvg')?.closest?.('.st-map');
   if(map)map.dataset.single=String(state.webView);
 }
 function toggleWebView(on){
   state.webView=!!on;state.selectedId=null;
   locate();updateWebViewButton();
   if(state.webView)focusPath();
   else{state.cx=500;state.cy=405;state.scale=.38;renderMap()}
   showPath();
 }
 function toggleCatalog(show){
   state.catalogOpen=!!show;
   const panel=$('stCatalogPanel');if(panel)panel.hidden=!state.catalogOpen;
 }
 function nextReady(){
  if(state.simulation||!readyNodes.length)return;
  state.readyIndex=(state.readyIndex+1)%readyNodes.length;
  const node=readyNodes[state.readyIndex];inspect(node.id);
  const p=positions.get(node.id);if(p){state.cx=p.x;state.cy=p.y;state.scale=1.15;renderMap()}
 }
 function closeScene(){
  if(state.catalogOpen){toggleCatalog(false);return}
  const home=document.querySelector('.side-nav [data-nav="home"]');if(home)home.click();
  else window.location.hash='home';
 }

 let matches=[],cursor=-1;
 const index=data.nodes.map(node=>({
  node,english:normalize(node.name),portuguese:normalize(node.ptName||''),
  path:normalize(node.path),effect:normalize(node.effect)
 }));
 function closeSearch(){
  const box=$('stSkillSearchResults'),field=$('stSkillSearch');if(!box||!field)return;
  box.hidden=true;box.innerHTML='';cursor=-1;
  field.setAttribute('aria-expanded','false');field.removeAttribute('aria-activedescendant');
 }
 function refreshSearch(){
  const field=$('stSkillSearch'),box=$('stSkillSearchResults'),clear=$('stSearchClear');
  if(!field||!box)return;
  const raw=field.value,q=normalize(raw);
  if(clear)clear.hidden=!raw;
  if(!q){matches=[];closeSearch();return}
  const scored=index.map(item=>{
   const {english:a,portuguese:b,path,effect}=item;
   const words=(a+' '+b).split(' ');
   let score=0;
   if(a===q||b===q)score=200;
   else if(a.startsWith(q)||b.startsWith(q))score=160;
   else if(words.some(w=>w.startsWith(q)))score=140;
   else if(a.includes(q)||b.includes(q))score=110;
   else if(path.includes(q))score=45;
   else if(effect.includes(q))score=20;
   return {...item,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.node.name.localeCompare(b.node.name,'pt-BR'));
  matches=scored.slice(0,14).map(x=>x.node);cursor=-1;
  box.hidden=false;field.setAttribute('aria-expanded','true');
  box.innerHTML='<div class="st-search-results-count">'+scored.length+' talento'+(scored.length===1?'':'s')+' encontrado'+(scored.length===1?'':'s')+'</div>'
   +(matches.length?matches.map((n,i)=>'<button type="button" role="option" aria-selected="false" id="stSearchOption'+i+'" data-st-search-node="'+esc(n.id)+'"><span><strong>'+esc(n.name)+'</strong><small>'+esc(n.ptName||n.name)+'</small></span><em>'+esc(n.path)+'</em></button>').join(''):'<p class="st-search-none">Nenhum talento encontrado.</p>')
   +(scored.length>14?'<div class="st-search-results-count">Mostrando 14 de '+scored.length+'. Continue digitando.</div>':'')
   +'<div class="st-search-translation">Traduções livres dos nomes originais do jogo.</div>';
 }
 function moveSearch(delta){
  if(!matches.length)return;
  cursor=(cursor+delta+matches.length)%matches.length;
  const field=$('stSkillSearch'),results=$('stSkillSearchResults');
  results.querySelectorAll('[data-st-search-node]').forEach((button,i)=>{
   const selected=i===cursor;
   button.classList.toggle('active',selected);
   button.setAttribute('aria-selected',String(selected));
   if(selected){field.setAttribute('aria-activedescendant',button.id);button.scrollIntoView?.({block:'nearest'})}
  });
 }
 function chooseSearch(id){
  const talent=allById.get(id);if(!talent)return;
  inspect(id);
  const p=positions.get(id);
  if(p){state.cx=p.x;state.cy=p.y;state.scale=1.15;renderMap()}
  const field=$('stSkillSearch'),clear=$('stSearchClear');
  if(field){field.value=talent.name;field.blur?.()}
  if(clear)clear.hidden=false;
  closeSearch();
 }
 function init(){
  locate();
  renderSidebar();showPath();updateWebViewButton();
  if(state.webView)focusPath();else renderMap();
  const field=$('stSkillSearch');
  if(field){
   field.addEventListener('input',refreshSearch);
   field.addEventListener('focus',()=>{if(field.value.trim())refreshSearch()});
   field.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'){event.preventDefault();moveSearch(1)}
    if(event.key==='ArrowUp'){event.preventDefault();moveSearch(-1)}
    if(event.key==='Enter'&&matches.length){event.preventDefault();chooseSearch(matches[cursor<0?0:cursor].id)}
    if(event.key==='Escape'){event.preventDefault();closeSearch();field.blur?.()}
   });
  }
  const svg=$('stTreeSvg');
  svg.addEventListener('click',event=>{
   const g=event.target.closest('[data-st-node]');
   if(g){const n=allById.get(g.getAttribute('data-st-node'));if(n)inspect(n.id)}
  });
  svg.addEventListener('keydown',event=>{
   const g=event.target.closest('[data-st-node]');
   if(g&&(event.key==='Enter'||event.key===' ')){event.preventDefault();const n=allById.get(g.getAttribute('data-st-node'));if(n)inspect(n.id)}
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
    const result=event.target.closest('[data-st-search-node]');
    if(result){chooseSearch(result.dataset.stSearchNode);return}
    if(event.target.closest('#stSearchClear')){
      const input=$('stSkillSearch');if(input){input.value='';input.focus?.()}
      refreshSearch();return;
    }
    if(!event.target.closest('.st-skill-search'))closeSearch();
    const path=event.target.closest('[data-st-path]'),
          inspectBtn=event.target.closest('[data-st-inspect]');
    if(path){selectPath(path.dataset.stPath);return}
    if(inspectBtn){inspect(inspectBtn.dataset.stInspect);return}
    if(event.target.closest('#stZoomIn')){setZoom(state.scale*1.2);return}
    if(event.target.closest('#stZoomOut')){setZoom(state.scale/1.2);return}
    if(event.target.closest('#stCenterPath')){focusPath();return}
    if(event.target.closest('#stFitAll')){if(state.webView)focusPath();else{state.cx=500;state.cy=405;setZoom(.38)}return}
    if(event.target.closest('#stOverview')){resetView();return}
    if(event.target.closest('#stNextReady')){nextReady();return}
    if(event.target.closest('#stWebView')){toggleWebView(!state.webView);return}
    if(event.target.closest('#stBackToMap')){toggleCatalog(false);return}
    if(event.target.closest('#stOpenCatalog')){toggleCatalog(true);return}
    if(event.target.closest('#stClose')){closeScene();return}
    if(event.target.closest('#stBackToPath')){state.selectedId=null;showPath();renderMap();return}
    if(event.target.closest('#stOpenLearned')){toggleCatalog(true);const button=root.querySelector('[data-sk-state="learned"]');if(button)button.click();return}
    if(event.target.closest('#stLearnAll')){state.simulation=true;renderSidebar();state.selectedId=null;showPath();renderMap();return}
    if(event.target.closest('#stResetSkills')){state.simulation=false;renderSidebar();resetView();return}
  });
  document.addEventListener('keydown',event=>{
    if(!document.getElementById('page-skill')?.classList.contains('active'))return;
    if(event.ctrlKey||event.metaKey||event.altKey){
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('stSkillSearch')?.focus?.()}
      return;
    }
    if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(event.key==='/'){event.preventDefault();$('stSkillSearch')?.focus?.();return}
    if(event.key==='Escape'){event.preventDefault();closeScene()}
    if(event.key.toLowerCase()==='v'){event.preventDefault();toggleWebView(!state.webView)}
    if(event.key.toLowerCase()==='c'){event.preventDefault();focusPath()}
    if(event.key.toLowerCase()==='g'){event.preventDefault();resetView()}
    if(event.key.toLowerCase()==='a'){event.preventDefault();if(state.webView)focusPath();else{state.cx=500;state.cy=405;setZoom(.38)}}
    if(event.key.toLowerCase()==='f'){event.preventDefault();nextReady()}
    if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(state.scale*1.2)}
    if(event.key==='-'){event.preventDefault();setZoom(state.scale/1.2)}
    if(event.key>='1'&&event.key<='7'){const cat=cats[Number(event.key)-1];if(cat)selectPath(cat.name)}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();