(() => {
  'use strict';
  const data=window.CARDO_SKILLS;
  if(!data||!Array.isArray(data.nodes))return;
  const safe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
  const statusLabels={learned:'Aprendido',ready:'Pronto para aprender',locked:'Bloqueado'};
  const statusOrders={learned:0,ready:1,locked:2};
  let category='General',state='all',search='',sort='branch';
  function card(node){
    const shown=node.effect.includes('não')&&node.effect.includes('captura')?' sk-unverified':'';
    return '<details class="sk-talent '+node.status+shown+'"><summary><span class="sk-status-icon" aria-hidden="true">'+(node.status==='learned'?'✓':node.status==='ready'?'✦':'◇')+'</span><span class="sk-talent-core"><strong>'+safe(node.name)+'</strong><small>'+safe((node.tier||'node').toUpperCase())+' · '+(node.cost==null?'Custo desconhecido':node.cost+' '+(node.cost===1?'ponto':'pontos'))+'</small></span><span class="sk-talent-status">'+statusLabels[node.status]+'</span><span class="sk-expand-symbol" aria-hidden="true">⌄</span></summary><div class="sk-talent-body"><p>'+safe(node.effect)+'</p>'+(node.notes?'<p class="sk-footnote">'+safe(node.notes)+'</p>':'')+'</div></details>';
  }
  function update(){
    const view=document.getElementById('skillCatalogRows');if(!view)return;
    let list=data.nodes.filter(x=>(category==='all'||x.path===category)&&(state==='all'||x.status===state)&&(!search||(x.name+' '+x.effect+' '+x.path).toLowerCase().includes(search)));
    if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    if(sort==='state')list.sort((a,b)=>statusOrders[a.status]-statusOrders[b.status]||a.name.localeCompare(b.name,'pt-BR'));
    if(sort==='branch')list.sort((a,b)=>data.categories.findIndex(c=>c.name===a.path)-data.categories.findIndex(c=>c.name===b.path));
    const grouped=new Map();
    for(const talent of list){if(!grouped.has(talent.path))grouped.set(talent.path,[]);grouped.get(talent.path).push(talent)}
    view.innerHTML=list.length?[...grouped.entries()].map(([path,nodes])=>{
      const c=data.categories.find(x=>x.name===path);
      return '<section class="sk-branch-group" style="--sk-accent:'+safe(c.color)+'"><header><div><span class="sk-branch-kicker">CAMINHO</span><h3>'+safe(path)+'</h3></div><span class="sk-branch-count">'+nodes.length+' talento'+(nodes.length===1?'':'s')+'</span></header><div class="sk-talent-grid">'+nodes.map(card).join('')+'</div></section>';
    }).join(''):'<div class="sk-empty">Nenhum talento encontrado com estes filtros.</div>';
    const n=document.getElementById('skillFoundCount');if(n)n.textContent=list.length+' de 146 talentos';
    document.querySelectorAll('[data-sk-category]').forEach(b=>{b.classList.toggle('active',b.dataset.skCategory===category);b.setAttribute('aria-pressed',String(b.dataset.skCategory===category))});
    document.querySelectorAll('[data-sk-state]').forEach(b=>{b.classList.toggle('active',b.dataset.skState===state);b.setAttribute('aria-pressed',String(b.dataset.skState===state))});
  }
  function init(){
    const root=document.getElementById('skillCodex');if(!root)return;
    const badges=[['all','Todos',146],...data.categories.map(c=>[c.name,c.name,c.total])];
    root.innerHTML='<div class="sk-browser-head"><div><span class="overline">TALENT CODEX / 146</span><h2>Todos os talentos, <em>com efeitos e custos.</em></h2><p>Escolha uma árvore, consulte as descrições e separe o que já está ativo do que falta desbloquear.</p></div><span id="skillFoundCount" class="sk-results-count">146 talentos</span></div>'
      +'<div class="sk-branch-tabs" role="group" aria-label="Selecionar árvore">'+badges.map(([key,label,n])=>'<button type="button" data-sk-category="'+safe(key)+'" aria-pressed="false">'+safe(label)+' <small>'+n+'</small></button>').join('')+'</div>'
      +'<div class="sk-controls"><label class="sk-search"><span>⌕</span><input id="skillQuery" type="search" autocomplete="off" placeholder="Buscar talento, bônus, porcentagem..." aria-label="Buscar talentos"></label><div class="sk-state-buttons" role="group" aria-label="Estado dos talentos">'+[['all','Todos'],['learned','Aprendidos'],['ready','Disponíveis'],['locked','Bloqueados']].map(([k,l])=>'<button type="button" data-sk-state="'+k+'" aria-pressed="false">'+l+'</button>').join('')+'</div><select id="skillSort" aria-label="Ordenação"><option value="branch">Ordem dos prints</option><option value="name">Nome A-Z</option><option value="state">Estado de desbloqueio</option></select></div>'
      +'<div class="sk-status-guide"><span>✓ Aprendido: efeito ativo</span><span>✦ Pronto: ainda não ativo</span><span>◇ Bloqueado: ainda não ativo</span></div><div id="skillCatalogRows"></div>';
    root.addEventListener('click',event=>{
      const c=event.target.closest('[data-sk-category]'),st=event.target.closest('[data-sk-state]');
      if(c){category=c.dataset.skCategory;update()}
      if(st){state=st.dataset.skState;update()}
    });
    root.querySelector('#skillQuery').addEventListener('input',e=>{search=e.target.value.toLowerCase().trim();update()});
    root.querySelector('#skillSort').addEventListener('change',e=>{sort=e.target.value;update()});
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();