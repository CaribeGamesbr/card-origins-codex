(() => {
  'use strict';
  const entries=Array.isArray(window.CARDO_DATA)?window.CARDO_DATA:[];
  const byId=new Map(entries.map(x=>[x.id,x]));
  const DEFAULT_TEAM=['c-3','c-5','c-1','c-2'];
  const DEFAULT_SUPPORTS=['s-366','s-374','s-360','s-372'];
  const number=new Intl.NumberFormat('pt-BR');
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glyph={Fire:'🔥',Ice:'❄',Lightning:'⚡',Wind:'✧',Quantum:'◇',Imaginary:'◈',Physical:'◆'};
  const circuits={
    'Fire+Fire':['Combustion Link','Ressonância','Burn dura +1 turno (máx. 4). Ativa uma vez por rodada aliada.','+1 turno de Burn'],
    'Ice+Ice':['Cryostasis Link','Ressonância','Quando uma carta Ice vinculada recebe escudo, a parceira recebe outro com 40% do valor. Primeiro escudo por rodada aliada. O escudo copiado não ativa outro circuito.','40% do escudo compartilhado'],
    'Lightning+Lightning':['Conductor Link','Ressonância','O primeiro Chain Hit da rodada aliada salta uma vez adicional para um terceiro inimigo com 60% do dano do chain. Não atinge o mesmo inimigo duas vezes.','60% do Chain Hit'],
    'Wind+Wind':['Razor Current','Ressonância','Quando uma carta Wind vinculada aplica Bleed, um Bleed em outro inimigo dura +1 turno. Uma vez por rodada aliada.','+1 turno de Bleed'],
    'Quantum+Quantum':['Entangled Link','Ressonância','Quando uma carta Quantum vinculada ganha um turno extra real, a parceira tem 20% de chance de ganhar +25% de dano crítico na próxima ação. Não acumula nem cria turno extra.','20% chance · +25% dano crítico'],
    'Imaginary+Imaginary':['Null Link','Ressonância','Quando uma carta Imaginary vinculada aplica redução de atributo, o efeito é 40% mais forte. Primeiro efeito por rodada aliada.','40% mais forte na redução'],
    'Physical+Physical':['Warbound Link','Ressonância','Ganha pontos Warbound ao obter Fighting Spirit; os pontos expiram após três rodadas aliadas sem novo ponto. Detalhe completo do gasto de pontos ainda não confirmado.','Efeito condicional'],
    'Fire+Ice':['Thermal Shock','Conversão','Quando uma carta vinculada atinge inimigo com Burn, o próximo tick do Burn causa +60% de dano (consome 1 stack de Frostbite, se houver). Uma vez por rodada aliada; a duração do Burn não muda.','+60% próximo tick de Burn'],
    'Ice+Fire':['Thermal Shock','Conversão','Quando uma carta vinculada atinge inimigo com Burn, o próximo tick do Burn causa +60% de dano (consome 1 stack de Frostbite, se houver). Uma vez por rodada aliada; a duração do Burn não muda.','+60% próximo tick de Burn'],
    'Fire+Wind':['Wildfire','Conversão','Quando Wind atinge inimigo com Burn, espalha uma cópia desse Burn para o próximo inimigo com 90% da força. Uma vez por rodada aliada; a cópia é secundária e não se espalha novamente.','90% força do Burn copiado'],
    'Fire+Lightning':['Flashover','Conversão','Quando Lightning desencadeia um chain a partir de inimigo com Burn, o Chain Hit recebe +20% de dano. Outros detalhes do efeito ainda precisam ser conferidos.','+20% dano do chain'],
    'Ice+Lightning':['Superconductor','Conversão','O efeito exato deste circuito ainda precisa ser transcrito e verificado na captura do jogo.','Efeito não conferido'],
    'Ice+Wind':['Whiteout','Conversão','Quando uma carta vinculada acerta inimigo com Frostbite ou Bleed, o próximo ataque desse inimigo causa 15% menos dano. Primeiro alvo elegível por rodada aliada; não acumula.','−15% DMG do próximo ataque inimigo'],
    'Lightning+Wind':['Stormfront','Conversão','Se Lightning desencadeia chain de um inimigo com Bleed, uma cópia do Bleed passa ao alvo do chain com 80% da força. Uma vez por rodada aliada; a cópia é secundária e não pode ser copiada.','80% força do Bleed copiado'],
    'Quantum+Imaginary':['Paradox','Conversão','Quando Quantum ganha um turno extra real, uma redução de atributo removível no alvo fica 30% mais forte. Uma vez por rodada aliada.','+30% força da redução'],
    'Quantum+Physical':['Breakpoint','Conversão','Quando o turno extra de Quantum acaba, o próximo ataque da carta Physical ganha +15% de chance crítica. Não acumula e é consumido em uma ação.','+15% chance crítica (condicional)'],
    'Imaginary+Physical':['Oppression','Conversão','Quando Imaginary aplica uma redução de atributo, ganha 1 Pressure. Com 2 Pressure, a carta Physical ganha Fighting Spirit. Máximo de um Fighting Spirit desse link por rodada aliada.','Fighting Spirit ao juntar 2 Pressure'],
    'Fire+Physical':['Blood and Ash','Conversão','Quando Physical atinge inimigo com Burn, ganha 1 Ember. Em 2 Ember, o próximo Burn da carta Fire é 35% mais forte, e Ember reinicia. Primeiro acerto elegível por rodada aliada.','+35% próximo Burn (após 2 Ember)'],
    'Ice+Quantum':['Fractured Moment','Conversão','Quando Quantum ganha um turno extra, o próximo acerto de Ice no mesmo inimigo recebe +15% de chance crítica. Uma vez por rodada aliada.','+15% chance crítica de Ice'],
    'Wind+Imaginary':['Withering Sky','Conversão','Quando Wind atinge um inimigo com 2 ou mais debuffs diferentes, um Bleed no alvo dura mais 1 turno (máximo 4). Primeiro acerto elegível por rodada aliada.','+1 turno de Bleed']
  };
  const knownSupportTags={
    'BINDING VOW':['Revive com 65% de HP','−50% DMG após reviver'],
    'SERENITY':['Resiste ao golpe fatal: 1 HP'],
    'ASHEN ARCANUM':['+10% dano de Burn/Immolation'],
    'DIVINE SPIRIT WATERS':['Cura até 70% de HP','+10% Stats após gatilho'],
    'UNBEATABLE FLAVOR':['Cura 5% de HP máximo por turno'],
    'LIMIT BREAKER':['Erudition: +6% dano de splash','Erudition: +7,5% DMG']
  };
  const personalTags={
    'c-3':['−35% dano recebido','Reflexão: até 60% do DMG'],
    'c-5':['+50% chance crítica','Crítico: 1,5× DMG'],
    'c-1':['Cura: 15% HP máximo após 3 Blood Wounds','Ataque especial: 1,4× DMG'],
    'c-2':['20% dano recebido → Matter','60% Matter em dano / 40% em cura']
  };
  function stored(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)&&value.length===4?value:fallback.slice()}catch{return fallback.slice()}}
  function team(){const ids=window.CARDO_DECK_API?.getTeam?.()||stored('codex-team',DEFAULT_TEAM);return ids.map(id=>byId.get(id)||null)}
  function support(){return stored('codex-support-team',DEFAULT_SUPPORTS).map(id=>byId.get(id)||null)}
  function circuit(a,b){
    if(!a||!b)return null;
    const key=[a.element+'+'+b.element,b.element+'+'+a.element].find(x=>circuits[x]);
    return key?{name:circuits[key][0],kind:circuits[key][1],description:circuits[key][2],badge:circuits[key][3],elements:[a.element,b.element]}:null;
  }
  const tag=(v,type='conditional')=>'<span class="ts-tag ts-'+type+'">'+escape(v)+'</span>';
  function skillTags(card){if(!card?.verified)return[];return personalTags[card.id]||[]}
  function printValue(card,kind){return Number.isFinite(Number(card?.[kind]))&&card?.verified?number.format(Number(card[kind])):'—'}
  function render(){
    const panel=document.getElementById('deckStatsPanel');if(!panel)return;
    const active=team(),equipped=support();
    const links=[0,1,2].map(i=>({slot:i,data:circuit(active[i],active[i+1])}));
    const resonance=Array(4).fill(0);
    links.forEach(({slot,data})=>{if(data?.kind==='Ressonância'){resonance[slot]+=6;resonance[slot+1]+=6}});
    const verified=active.filter(card=>card?.verified&&Number.isFinite(Number(card.hp))&&Number.isFinite(Number(card.dmg)));
    const hp=verified.reduce((v,c)=>v+Number(c.hp),0),dmg=verified.reduce((v,c)=>v+Number(c.dmg),0);
    const selected=active.filter(Boolean).length, complete=verified.length===selected&&selected===4;
    const countLink=links.filter(x=>x.data).length;
    const ress=links.filter(x=>x.data?.kind==='Ressonância').length;
    const countSupport=equipped.filter(Boolean).length;
    const statsNote=complete?'Todos os 4 prints conferidos':'Parcial: '+verified.length+'/'+selected+' cartas com atributos conferidos';
    const summary=[
      ['HP TOTAL DOS PRINTS',number.format(hp),statsNote],
      ['DMG TOTAL DOS PRINTS',number.format(dmg),statsNote],
      ['CIRCUITOS ATIVOS',countLink+'/3',ress+' de ressonância · '+(countLink-ress)+' de conversão'],
      ['SUPORTES EQUIPADOS',countSupport+'/4','Efeitos por slot abaixo']
    ].map(([label,value,detail])=>'<div class="ts-kpi"><small>'+escape(label)+'</small><strong>'+escape(value)+'</strong><span>'+escape(detail)+'</span></div>').join('');
    const cards=active.map((card,slot)=>{
      const sup=equipped[slot];
      const name=card?card.name:'Slot vazio';
      const buffs=[];
      if(resonance[slot])buffs.push(tag('+'+resonance[slot]+'% DMG de ressonância','passive'));
      else if(card)buffs.push(tag('Sem bônus passivo de ressonância','neutral'));
      buffs.push(...skillTags(card).map(b=>tag(b)));
      return '<article class="ts-member"><header><span class="ts-slot">0'+(slot+1)+'</span><strong>'+escape(name)+'</strong><small>'+escape(card?card.border+' · '+card.element:'Escolha uma carta')+'</small></header><div class="ts-member-stats"><span>HP <b>'+printValue(card,'hp')+'</b></span><span>DMG <b>'+printValue(card,'dmg')+'</b></span><span>DMG por link <b>'+(card?'+'+resonance[slot]+'%':'—')+'</b></span></div><div class="ts-tags">'+buffs.join('')+'</div><div class="ts-support-inline">SUPORTE '+(slot+1)+': <strong>'+escape(sup?.name||'Nenhum')+'</strong></div></article>';
    }).join('');
    const circuitsHtml=links.map(({slot,data})=>{
      if(!data)return '<div class="ts-circuit is-empty"><span class="ts-linknum">LINK '+(slot+1)+'</span><strong>Sem circuito ativo</strong><p>Para habilitar, selecione duas cartas com uma combinação de elementos registrada.</p></div>';
      const passive=data.kind==='Ressonância'?'<div class="ts-tags">'+tag('+6% DMG em cada uma das duas cartas','passive')+'</div>':'';
      return '<div class="ts-circuit"><div class="ts-circuit-head"><span class="ts-linknum">LINK '+(slot+1)+' · SLOT '+(slot+1)+' ↔ '+(slot+2)+'</span><span class="ts-kind">'+escape(data.kind)+'</span></div><strong>'+escape(data.name)+'</strong><small>'+escape(data.elements.join(' + '))+'</small><div class="ts-tags">'+tag(data.badge)+'</div>'+passive+'<p>'+escape(data.description)+'</p></div>';
    }).join('');
    const supportRows=equipped.map((sup,slot)=>{
      if(!sup)return '<article class="ts-support-row"><span class="ts-slot">0'+(slot+1)+'</span><div><strong>Nenhum suporte equipado</strong></div></article>';
      const verifiedEffect=sup.verified&&sup.effect;
      let tags=verifiedEffect?(knownSupportTags[sup.name]||[]):[];
      const effect=verifiedEffect?sup.effect:'Efeito ainda não transcrito a partir da imagem original. Não incluído no cálculo de bônus.';
      return '<article class="ts-support-row"><span class="ts-slot">0'+(slot+1)+'</span><div><strong>'+escape(sup.name)+'</strong><small>'+escape(sup.kind||'Suporte')+'</small><div class="ts-tags">'+(tags.length?tags.map(b=>tag(b)).join(''):tag(verifiedEffect?'Efeito sem porcentagem fixa':'Não verificado','neutral'))+'</div><p>'+escape(effect)+'</p></div></article>';
    }).join('');
    const uniqueElements=new Set(active.filter(Boolean).map(card=>card.element)).size;
    panel.innerHTML='<div class="ts-title"><div><span class="deck-eyebrow">TEAM CHECK / SUMMARY</span><h3>STATUS TOTAL <em>// TEAM 1</em></h3></div><span class="ts-team-complete">'+selected+'/4 CARTAS · '+uniqueElements+' ELEMENTOS</span></div>'
      +'<div class="ts-kpis">'+summary+'</div>'
      +'<div class="ts-section-title"><h4>STATUS POR CARTA</h4><span>HP e DMG dos prints · bônus por ressonância</span></div>'
      +'<div class="ts-members">'+cards+'</div>'
      +'<div class="ts-section-title"><h4>ORIGIN CIRCUITS — 3 LINKS</h4><span>Os bônus condicionais só ativam quando seus gatilhos acontecem</span></div>'
      +'<div class="ts-circuits">'+circuitsHtml+'</div>'
      +'<div class="ts-section-title"><h4>EFEITOS DOS SUPORTES</h4><span>Vinculados às cartas nos respectivos slots</span></div>'
      +'<div class="ts-supports">'+supportRows+'</div>'
      +'<div class="ts-calculation-note"><strong>COMO LER ESTES VALORES:</strong> HP e DMG são a soma dos números exibidos nos prints das cartas conferidas, não a vida simultânea disponível em batalha. Só uma carta luta por vez. Bônus condicionais, buffs de habilidades, suportes, Traits, Ascension, Curse, Relics e Path não são somados diretamente a HP/DMG sem fórmula confirmada. O +6% de ressonância se aplica a dano de hits das cartas vinculadas, não à estatística DMG exibida.</div>';
    const toggle=document.getElementById('deckStatusToggle');
    if(toggle){panel.hidden=toggle.getAttribute('aria-expanded')==='false'}
  }
  function init(){
    const toggle=document.getElementById('deckStatusToggle');
    toggle?.addEventListener('click',()=>{
      const expanded=toggle.getAttribute('aria-expanded')!=='true';
      toggle.setAttribute('aria-expanded',String(expanded));
      toggle.textContent=expanded?'◈ Ocultar status total':'◈ Ver status total do time';
      const panel=document.getElementById('deckStatsPanel');if(panel)panel.hidden=!expanded;
    });
    if(toggle){toggle.textContent='◈ Ocultar status total';toggle.setAttribute('aria-expanded','true')}
    window.addEventListener('codex-team-changed',render);
    window.addEventListener('codex-support-changed',render);
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();