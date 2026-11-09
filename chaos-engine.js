/* Memory of Chaos — comparative model, NOT a recreation of Roblox combat.
   Screenshot-confirmed: two separate teams of 4, ordered phases Fire/Imaginary,
   Stage 03 Burn/Immolation/Fatigue, star conditions and the abilities below.
   VERIFIED for both phases (user's battle screenshots): enemy MAX HP and DMG,
   Fire Soldier double hit, Ancient Flame Charred HP, Star Warrior 55% dodge.
   UNKNOWN: full skill text, skill timing, cooldowns, exact battle mechanics.
   Some special-effect timing remains intentionally hypothetical.
*/
(function(root,factory){
  const engine=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=engine;
  if(root) root.CARDO_CHAOS_ENGINE=engine;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const phases=[
 {name:'Fase 1 — Fire',element:'Fire',weak:'Wind',color:'#ff9469',
  enemies:[
    {name:'Apothecary Cat',element:'Wind',hp:6160,dmg:1540,seenHp:2575,threat:'Ao receber um debuff pela primeira vez, aprende o efeito. O restante da habilidade não aparece no print.',bulk:1.05,hazard:1.02},
    {name:'Fire Soldier',element:'Fire',hp:9240,dmg:2310,seenHp:9240,threat:'Cada ataque acerta duas vezes: 100% do DMG e depois 50% do DMG. O restante da habilidade não aparece no print.',bulk:1.0,hazard:1.20},
    {name:'The Ancient Flame',element:'Fire',hp:12320,dmg:2763,seenHp:11582,threat:'20% do HP removido pelo dano vira Charred HP e não pode ser curado. O restante da habilidade não aparece no print.',bulk:1.28,hazard:1.24},
    {name:'Star Warrior Raised…',element:'Imaginary',hp:15400,dmg:3454,seenHp:14572,threat:'55% de chance de esquivar. Cada esquiva bem-sucedida causa contra-ataque, mas o valor está cortado no print.',bulk:1.07,hazard:0.97,dodge:.55}
  ]},
 {name:'Fase 2 — Imaginary',element:'Imaginary',weak:'Quantum',color:'#e9c77b',
  enemies:[
    {name:'Omniscient Reader',element:'Quantum',hp:7084,dmg:1771,seenHp:2758,threat:'A primeira vez que cada habilidade inimiga causa dano, a carta se esquiva e a aprende. Os detalhes seguintes estão cortados no print.',bulk:1.25,hazard:1.17},
    {name:'The Sky-Reaching Student',element:'Fire',hp:10624,dmg:2656,seenHp:7458,threat:'Ao entrar, o inimigo atual recebe Crossed Out; o efeito altera habilidades. O texto completo está cortado no print.',bulk:1.08,hazard:1.11},
    {name:'Horned Maid',element:'Fire',hp:14168,dmg:3542,seenHp:10426,threat:'Ao entrar e a cada 3 turnos aplica Fatigue e Confusion por 2 turnos. O restante da habilidade não aparece no print.',bulk:1.04,hazard:1.18},
    {name:'Scythe Tactician',element:'Wind',hp:17708,dmg:4427,seenHp:7220,threat:'Ataques aplicam Bleed por 2 turnos; atingir alvo já sangrando adiciona 1 stack de Execution. O texto completo não aparece no print.',bulk:1.13,hazard:1.20}
  ]}
];
const knownEnemyEffects={
 'Apothecary Cat':'learn_debuff','Fire Soldier':'double_hit','The Ancient Flame':'charred',
 'Star Warrior Raised…':'dodge_counter','Omniscient Reader':'read_ability',
 'The Sky-Reaching Student':'crossed_out','Horned Maid':'fatigue_confusion','Scythe Tactician':'bleed_execution'
};
for(const phase of phases)for(const foe of phase.enemies)foe.effectKey=knownEnemyEffects[foe.name]||'unknown';
const initialPhases=JSON.parse(JSON.stringify(phases));
const enemyEffectKeys=new Set(['unknown','learn_debuff','double_hit','charred','dodge_counter','read_ability','crossed_out','fatigue_confusion','bleed_execution']);
function applyRotation(custom){
 if(!Array.isArray(custom)||custom.length!==2||custom.some(p=>!p||!elements.includes(p.element)||!Array.isArray(p.enemies)||p.enemies.length!==4))return false;
 const prepared=[];
 for(let i=0;i<2;i++){
   const p=custom[i],enemies=[];
   for(const x of p.enemies){
     if(!x||!String(x.name||'').trim()||!elements.includes(x.element)||!Number.isFinite(Number(x.hp))||Number(x.hp)<=0||!Number.isFinite(Number(x.dmg))||Number(x.dmg)<=0)return false;
     const effectKey=enemyEffectKeys.has(x.effectKey)?x.effectKey:'unknown';
     enemies.push({name:String(x.name).trim().slice(0,85),element:x.element,hp:Number(x.hp),dmg:Number(x.dmg),
       seenHp:null,effectKey,dodge:effectKey==='dodge_counter'?.55:null,
       threat:effectKey==='unknown'?'Habilidade não conferida nesta rotação. Envie o print para acrescentar os efeitos.':String(x.threat||'Efeito selecionado pelo usuário; texto completo não foi verificado.'),
       source:'manual'});
   }
   prepared.push({name:'Fase '+(i+1)+' — '+p.element,element:p.element,
     weak:elements.find(e=>beats[e]===p.element),color:phases[i].color,enemies});
 }
 prepared.forEach((p,i)=>Object.assign(phases[i],p));
 return true;
}
function resetRotation(){initialPhases.forEach((p,i)=>Object.assign(phases[i],JSON.parse(JSON.stringify(p))));}
function currentRotation(){return JSON.parse(JSON.stringify(phases));}
const screenshotKnown=new Set([
'c-1','c-2','c-3','c-4','c-5','c-7','c-8','c-353','c-352','c-350',
'new-silver-star-user-calamity','new-sorcerer-killer-normal',
'new-black-eyepatch-calamity','new-the-grinning-spectator-normal',
'new-demonic-swordsaint-normal',
'new-silverfox-vanguard-astral','new-black-flame-heir-calamity','new-magician-astral'
]);
const pct=(value)=>Math.round(value*100);
const rank={Normal:0,Calamity:1,Umbral:2,Astral:3,Paradox:4,Origin:5};
const cardsOnly=data=>(Array.isArray(data)?data:[]).filter(x=>x.type==='card');
const hasStats=c=>c&&Number(c.hp)>0&&Number(c.dmg)>0;
function rng(seed){let s=(seed>>>0)||123456789;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
const elements=['Fire','Ice','Lightning','Wind','Quantum','Imaginary','Physical'];
const beats={Fire:'Ice',Ice:'Lightning',Lightning:'Wind',Wind:'Fire',Quantum:'Imaginary',Imaginary:'Physical',Physical:'Quantum'};
function getAdvantage(element,target){
 if(beats[element]===target)return 1.5;
 if(beats[target]===element)return .70;
 return 1;
}
const pairs=new Set(['Fire+Fire','Ice+Ice','Lightning+Lightning','Wind+Wind','Quantum+Quantum','Imaginary+Imaginary','Physical+Physical',
'Fire+Ice','Fire+Wind','Fire+Lightning','Ice+Lightning','Ice+Wind','Lightning+Wind','Quantum+Imaginary','Quantum+Physical',
'Imaginary+Physical','Fire+Physical','Ice+Quantum','Wind+Imaginary'].map(pair=>pair.split('+').sort().join('+')));
function link(a,b){if(!a||!b)return false;return pairs.has([a.element,b.element].sort().join('+'))}
function bonuses(team){return team.map((card,i)=>{
 let bonus=0;
 for(const j of [i-1,i+1]){
   if(j>=0&&j<team.length&&link(card,team[j]))bonus+=card.element===team[j].element?.06:.04;
 }
 return 1+bonus;
})}
function rosterValid(teams){
 if(!Array.isArray(teams)||teams.length!==2||teams.some(a=>!Array.isArray(a)||a.length!==4))return {ok:false,reason:'São necessários dois times de quatro cartas.'};
 const flat=teams.flat();
 if(flat.some(x=>!hasStats(x)))return {ok:false,reason:'Há slots vazios ou cartas sem HP/DMG confirmado.'};
 const ids=new Set(flat.map(x=>x.id));if(ids.size!==8)return {ok:false,reason:'Uma mesma cópia não pode ocupar dois slots.'};
 const names=new Set(flat.map(x=>x.name.toUpperCase()+'|'+x.border.toUpperCase()));
 if(names.size!==8)return {ok:false,reason:'Para repetir o mesmo personagem, use bordas diferentes, como nas regras do print.'};
 return {ok:true};
}
function modifiers(c,mode){
 const n=(c.name||'').toUpperCase(),abil=(c.ability||'').toUpperCase();
 let outgoing=1,incoming=1,heal=0,extraLife=0,shield=0,hitBonus=0;
 if(n==='VECTOR STORM')incoming*=.65;
 if(n==='SILVERFOX VANGUARD'){shield=1}
 if(n==='MAGICIAN'){extraLife=1}
 // Eye Deal belongs to the highest-DMG ally, not to the Spectator itself.
 // Black Flame Heir heals only if the burning target activates its ability.
 return {outgoing,incoming,heal,extraLife,shield,hitBonus};
}
function estimateCard(c,phase){
 const m=modifiers(c,phase===phases[1]?1:0);
 const advantage=phase.enemies.reduce((s,foe)=>s+getAdvantage(c.element,foe.element||phase.element),0)/phase.enemies.length;
 return {hp:+c.hp,damage:+c.dmg*advantage*m.outgoing,mitigation:m.incoming};
}
const supportedSupportIds=new Set(['s-360','s-365','s-366','s-371','s-372','s-374']);
function normalizeSupports(input){
 const slots=Array.isArray(input)&&input.length===2?input.flat():[];
 const seen=new Set();
 const flat=Array.from({length:8},(_,i)=>{
   const id=slots[i];
   if(!supportedSupportIds.has(id)||seen.has(id))return null;
   seen.add(id);return id;
 });
 return [flat.slice(0,4),flat.slice(4,8)];
}
function shuffleSupports(input,random,edits=1){
 const flat=normalizeSupports(input).flat();
 for(let i=0;i<edits;i++){
   const a=Math.floor(random()*8),b=Math.floor(random()*8);
   [flat[a],flat[b]]=[flat[b],flat[a]];
 }
 return [flat.slice(0,4),flat.slice(4,8)];
}
function simulatePhase(team,phase,random,hardness=1,supportIds=[]){
 const mods=team.map((c)=>modifiers(c,phase===phases[1]?1:0));
 const equipped=team.map((c,i)=>supportedSupportIds.has(supportIds[i])?supportIds[i]:null);
 const max=team.map((c,i)=>+c.hp*(equipped[i]==='s-371'?1.075:1));
 const health=max.slice(),healableMax=max.slice();
 mods.forEach((m,i)=>{if(equipped[i]==='s-371')m.outgoing*=1.075;});
 let bindingUsed=false,serenityUsed=false,divineUsed=false;
 const skillGuard=mods.map(m=>m.extraLife),clone=mods.map(m=>m.shield);
 const matter=team.map(()=>0),bloodWounds=team.map(()=>0),predatorMark=team.map(()=>false);
 const timeFreeze=team.map(()=>false),concentration=team.map(()=>50);
 const pendingPsychicPressure=team.map(()=>0);
 const pendingSplash=[0,0,0,0];
 const cloneStrikeReady=team.map(()=>false);
 const linkBoost=bonuses(team);
 const spectator=team.findIndex(c=>c.name==='THE GRINNING SPECTATOR');
 const eyeDealTarget=spectator<0?-1:team.reduce((best,c,i)=>i!==spectator&&(best<0||c.dmg>team[best].dmg)?i:best,-1);
 const meanHP=team.reduce((s,c)=>s+c.hp,0)/4;
 // Both phases use enemy MAX HP/DMG from screenshots taken mid-battle.
 // The fallback exists only for incomplete future stages or rotations.
 const estimatedEnemyHP=4650*hardness, estimatedHit=(meanHP*.074)*hardness;
 let rounds=0,active=0,defeated=0,losses=0,burn=false,immolation=0,fatigue=0,bleed=0,confusion=0,enemyTurns=0;
 const log=[],timeline=[];
 for(let k=0;k<4;k++){
   const foe=phase.enemies[k];
   let enemyHP=(foe.hp?foe.hp*hardness:estimatedEnemyHP*foe.bulk*(.85+random()*.30))-pendingSplash[k];
   const foeMaxHP=foe.hp?foe.hp*hardness:estimatedEnemyHP*foe.bulk;
   let dodges=0,flameTicks=0,flameCaster=-1,flameActions=0,disoriented=0,foeTurns=0,lastHornedDebuff=-1;
   const effect=foe.effectKey||knownEnemyEffects[foe.name]||'unknown';
   const readerLearnedAbilities=new Set();
   const enemyStatus={blind:0,shock:0,stun:0,fatigue:0,burn:0,burnPower:0,exposed:0,bleed:0};
   let reflected=false,duelActions=0,duelBonusTurn=false,bobCounterUsed=false,crossedOutApplied=false;
   while(enemyHP>0&&rounds<55&&active<4){
     rounds++;
     const c=team[active],m=mods[active];
     const adv=getAdvantage(c.element,foe.element||phase.element);
     if(c.name==='KING OF GAMES'&&m.kingEntered!==true){
       m.kingEntered=true;
       if(losses===0){m.outgoing*=1.2;log.push('Turno '+rounds+': King of Games entrou sem aliados derrotados: +20% DMG.');}
       else log.push('Turno '+rounds+': King of Games tentaria copiar uma habilidade; detalhes não simulados.');
     }
     if(effect==='crossed_out'&&!crossedOutApplied){
       crossedOutApplied=true;
       log.push('The Sky-Reaching Student aplicou Crossed Out; a alteração exata das habilidades é desconhecida.');
     }
     if(effect==='fatigue_confusion'&&foeTurns%3===0&&lastHornedDebuff!==foeTurns){
       lastHornedDebuff=foeTurns;fatigue=Math.max(fatigue,2);confusion=Math.max(confusion,2);
       log.push('Turno '+rounds+': Horned Maid aplicou Fatigue e Confusion por 2 turnos.');
     }
     if(bleed>0){
       if(random()<.75){const tick=max[active]*.075;health[active]-=tick;
         timeline.push('T'+rounds+' · Bleed causou '+Math.round(tick)+' HP de dano em '+c.name);}
       bleed--;
     }
     if(enemyStatus.burn>0){
       enemyHP-=enemyStatus.burnPower;enemyStatus.burn--;
       timeline.push('T'+rounds+' · Burn causou '+Math.round(enemyStatus.burnPower)+' DMG em '+foe.name);
       if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado por Burn no turno '+rounds);break;}
     }
     if(health[active]<=0){losses++;log.push('Turno '+rounds+': '+c.name+' caiu pelo dano periódico.');active++;burn=false;immolation=0;fatigue=0;bleed=0;confusion=0;continue;}
     if(equipped[active]==='s-365'){
       health[active]=Math.min(healableMax[active],health[active]+max[active]*.05);
       log.push('Turno '+rounds+': Unbeatable Flavor curou 5% do HP máximo de '+c.name+'.');
     }
     if(c.name==='PSYCHIC PEAK'&&pendingPsychicPressure[active]>0){
       const burst=pendingPsychicPressure[active]*.25;
       enemyHP-=burst;for(let j=k+1;j<4;j++)pendingSplash[j]+=burst;
       health[active]=Math.min(healableMax[active],health[active]+max[active]*.15);
       pendingPsychicPressure[active]=0;
       log.push('Turno '+rounds+': Psychic Peak descarregou Psychic Pressure em todos os inimigos e se curou.');
       if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado por Psychic Pressure.');break;}
     }
     // Black Eyepatch triggers when an enemy GAINS dodge or defense, not
     // merely because it starts the battle with a passive dodge stat.
     const foeDodge=enemyStatus.exposed>0?0:(foe.dodge==null?0:foe.dodge);
     let hitChance=Math.min(.99,(foeDodge?1-foeDodge:.94)+m.hitBonus);
     if(enemyStatus.exposed>0)hitChance=1;
     let amount=c.dmg*adv*m.outgoing*linkBoost[active]*(.86+.28*random());
     if(active===eyeDealTarget)amount*=1.06; // Approximate expected critical benefit of Eye Deal.
     if(effect==='dodge_counter'&&dodges>=5)amount*=.9;
     if(fatigue>0)amount*=.9;
     if(confusion>0){amount*=.85;confusion--;}
     if(c.name==='BLUE WOLF'&&bloodWounds[active]>=3){
       amount*=1.4;bloodWounds[active]=0;
       health[active]=Math.min(healableMax[active],health[active]+max[active]*.15);
       log.push('Turno '+rounds+': Blue Wolf ativou Blood Moon (1,4× DMG e +15% HP).');
     }
     if(c.name==='FULLMETAL ALCHEMIST'&&matter[active]>0){
       amount+=matter[active]*.60;
       health[active]=Math.min(healableMax[active],health[active]+matter[active]*.40);
       log.push('Turno '+rounds+': Fullmetal consumiu Matter, ganhou dano e recuperou HP.');
       matter[active]=0;
     }
     if(c.name==='SILVER STAR USER')amount*=1.25;
     if(c.name==='DEMONIC SWORDSAINT'&&concentration[active]>=100){
       amount*=.40;for(let j=k+1;j<4;j++)pendingSplash[j]+=c.dmg*.40;
       concentration[active]=50;
       log.push('Turno '+rounds+': Judgment Cut End atingiu os próximos inimigos com dano em área.');
     }
     let hit=random()<=hitChance;
     if(hit&&effect==='read_ability'){
       const abilityKey=c.name+'|'+(c.ability||'base');
       if(!readerLearnedAbilities.has(abilityKey)){
         readerLearnedAbilities.add(abilityKey);hit=false;
         log.push('Turno '+rounds+': Omniscient Reader esquivou do primeiro dano de '+c.name+' e leu sua habilidade (aproximação por carta).');
       }
     }
     if(!hit&&active===eyeDealTarget&&health[active]>max[active]*.05){
       health[active]-=max[active]*.05;hit=true;amount*=1.25;
       log.push('Turno '+rounds+': Eye Deal garantiu um crítico, consumindo 5% do HP de '+c.name+'.');
     }
     if(hit){
       if(c.name==='ASHEY'&&random()<.50){
         amount*=1.5;enemyStatus.burn=3;enemyStatus.burnPower=c.dmg*.075;
         amount+=c.dmg*.40;
         log.push('Turno '+rounds+': Ashey acertou crítico, aplicou Burn e B.O.B. atacou (+40% DMG).');
       }
       if(equipped[active]==='s-360'){
         if(c.name==='ASHEY'){
           enemyStatus.burn=2;enemyStatus.burnPower=foeMaxHP*.075*1.1;
           log.push('Turno '+rounds+': Ashen Arcanum intensificou Burn em Immolation (valor aproximado).');
         }else{
           enemyStatus.burn=2;enemyStatus.burnPower=c.dmg*.075*1.1;
           log.push('Turno '+rounds+': Ashen Arcanum aplicou Burn no inimigo.');
         }
       }
       if(c.name==='BLUE WOLF')predatorMark[active]=true;
       if(c.name==='DEMONIC SWORDSAINT'&&concentration[active]===50)concentration[active]=100;
       if(c.name==='SCARLET DUELIST'){
         duelActions++;
         if(duelActions===2){enemyStatus.blind=2;log.push('Turno '+rounds+': House of Tempo aplicou Blinding.');}
         if(duelActions===3){enemyStatus.fatigue=2;duelBonusTurn=true;log.push('Turno '+rounds+': Scarlet Duelist aplicou Fatigue e recebeu ação extra.');}
       }
       if(c.name==='SILVERFOX VANGUARD'&&cloneStrikeReady[active]){
         amount*=1.30;cloneStrikeReady[active]=false;disoriented=1;
         log.push('Turno '+rounds+': Silverfox Vanguard usou Rasengan (+30%) e aplicou Disorientation.');
       }
       enemyHP-=amount;
       if(m.heal)health[active]=Math.min(healableMax[active],health[active]+amount*m.heal);
     }else{
       dodges++;
       if(effect==='dodge_counter'&&health[active]>0){
         // Counter amount is cropped in the screenshot. This is a model
         // sensitivity assumption, not a confirmed game number.
         const counter=foe.dmg*hardness*.30;
         health[active]-=counter;
         log.push('Turno '+rounds+': esquiva de '+foe.name+' ativou contra-ataque aproximado de '+Math.round(counter)+' DMG.');
       }
     }
     if(enemyStatus.exposed>0)enemyStatus.exposed--;
     timeline.push('T'+rounds+' · '+c.name+(hit?' acertou '+Math.round(amount)+' DMG':' errou')+' em '+foe.name);
     if(c.name==='BLACK FLAME HEIR'&&hit){
       flameActions++;
       if(flameActions%2===0){flameTicks=2;flameCaster=active;
         log.push('Turno '+rounds+': Black Flame Heir aplicou chamas negras por 2 turnos.');}
     }
     if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado no turno '+rounds+' por '+c.name);break}
     if(duelBonusTurn){duelBonusTurn=false;log.push('Turno '+rounds+': Scarlet Duelist ganhou ação extra sem resposta inimiga.');continue;}
     if(enemyStatus.stun>0){enemyStatus.stun--;log.push('Turno '+rounds+': '+foe.name+' perdeu a resposta por Stun.');continue;}
     // Enemy action and stage effect; status strengths not explicitly shown on the Memory of Chaos screenshots remain model assumptions.
     enemyTurns++;
     foeTurns++;
     if(flameTicks>0&&flameCaster>=0){
       const dot=team[flameCaster].dmg*.10; // 20% DMG distributed over two ticks.
       enemyHP-=dot;flameTicks--;
       timeline.push('T'+rounds+' · chamas negras causaram '+Math.round(dot)+' DMG periódico');
       // Enemy ability timing is unknown; 30% is explicitly a model assumption.
       if(random()<.30){
         const trigger=team[flameCaster].dmg*.05;enemyHP-=trigger;
         if(health[flameCaster]>0)health[flameCaster]=Math.min(healableMax[flameCaster],health[flameCaster]+trigger);
         log.push('Turno '+rounds+': ativação inimiga hipotética disparou Black Flame Drain.');
       }
       if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado no turno '+rounds+' pelas chamas negras');break}
     }
     let amountIn=(foe.dmg?foe.dmg*hardness:estimatedHit*foe.hazard)*(.75+.5*random());
     if(effect==='double_hit')amountIn*=1.5; // Verified: 100% + 50% hit.
     if(enemyStatus.fatigue>0){amountIn*=.90;enemyStatus.fatigue--;}
     if(enemyStatus.shock>0){amountIn*=.95;enemyStatus.shock--;}
     if(enemyStatus.blind>0){
       enemyStatus.blind--;
       if(random()<.40){
         log.push('Turno '+rounds+': '+foe.name+' errou o ataque por Blinding.');
         if(c.name==='ASHEY'&&!bobCounterUsed){
           enemyHP-=c.dmg*.60;bobCounterUsed=true;enemyStatus.stun=1;
           log.push('B.O.B. contra-atacou com 60% DMG e aplicou Stun.');
         }
         if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado por B.O.B.');break;}
         continue;
       }
     }
     if(enemyTurns%2===0){
       if(!burn){burn=true}else immolation=Math.min(2,immolation+1);
       if(immolation>=2)fatigue=3;
     }
     if(burn)amountIn+=max[active]*.013;
     if(immolation)amountIn+=Math.min(3,immolation)*max[active]*.02;
     if(fatigue>0){amountIn*=1.07;fatigue--}
     if(disoriented>0){amountIn*=.85;disoriented--;}
     if(clone[active]>0){
       amountIn*=.50;clone[active]--;cloneStrikeReady[active]=true;
       log.push('Turno '+rounds+': Shadow Clone absorveu parte do golpe contra Silverfox Vanguard.');
     }
     if(c.name==='DEMONIC SWORDSAINT'&&concentration[active]===0){
       amountIn=0;concentration[active]=50;
       log.push('Turno '+rounds+': Trick Dodge evitou o ataque direto e restaurou Concentration.');
     }
     // Psychic Peak redirects 10% direct damage while off field; it does not grant an invented global mitigation buff.
     const psychic=team.findIndex((x,j)=>j>active&&x.name==='PSYCHIC PEAK'&&health[j]>0);
     if(psychic>=0&&amountIn>0){const pressure=amountIn*.10;amountIn-=pressure;pendingPsychicPressure[psychic]+=pressure;}
     amountIn*=m.incoming;
     const prevented=c.name==='VECTOR STORM'?Math.min(amountIn*(1/.65-1),c.dmg*.60):0;
     if(amountIn>=health[active]&&skillGuard[active]>0){
       skillGuard[active]--;
       enemyHP-=c.dmg;m.outgoing*=1.10;
       log.push('Turno '+rounds+': Magician evitou o golpe fatal, contra-atacou com 100% DMG e ganhou +10% DMG.');
     }else if(amountIn>=health[active]&&equipped[active]==='s-374'&&!serenityUsed&&!skillGuard[active]&&c.name!=='FULLMETAL ALCHEMIST'){
       serenityUsed=true;health[active]=1;
       log.push('Turno '+rounds+': Serenity evitou o golpe fatal; '+c.name+' permaneceu com 1 HP.');
     }else if(amountIn>=health[active]&&equipped[active]==='s-366'&&!bindingUsed){
       bindingUsed=true;health[active]=Math.min(healableMax[active],max[active]*.65);m.outgoing*=.50;
       log.push('Turno '+rounds+': Binding Vow reviveu '+c.name+' com 65% HP e reduziu seu dano em 50%.');
     }else{
       const applied=Math.min(health[active],amountIn);
       health[active]-=amountIn;
       if(c.name==='FULLMETAL ALCHEMIST'&&applied>0){
         matter[active]=Math.min(max[active]*.25,matter[active]+applied*.20);
         log.push('Turno '+rounds+': Fullmetal armazenou '+Math.round(applied*.20)+' de Matter.');
         if(health[active]<=0&&matter[active]>0){
           health[active]=1;enemyHP-=Math.min(matter[active],foeMaxHP*.12);matter[active]=0;
           log.push('Turno '+rounds+': Fullmetal resistiu ao golpe fatal com 1 HP e descarregou Matter.');
         }
       }
       if(effect==='charred'){
         healableMax[active]=Math.max(0,healableMax[active]-applied*.20);
         log.push('Turno '+rounds+': '+foe.name+' tornou '+Math.round(applied*.20)+' HP incurável (Charred HP).');
       }
       if(c.name==='BLUE WOLF'&&predatorMark[active]){
         health[active]=Math.min(healableMax[active],health[active]+amountIn*.10);
         bloodWounds[active]++;predatorMark[active]=false;
         log.push('Turno '+rounds+': Blue Wolf consumiu Prey, recuperou HP e aplicou Blood Wound ('+bloodWounds[active]+'/3).');
       }
       if(c.name==='SILVER STAR USER'&&health[active]<max[active]*.5&&!timeFreeze[active]){
         timeFreeze[active]=true;enemyStatus.stun=1;
         log.push('Turno '+rounds+': Silver Star User congelou o tempo inimigo por 1 turno (efeito não aplicável a bosses).');
       }
       if(c.name==='DEMONIC SWORDSAINT'&&applied>0)concentration[active]=0;
     }
     if(equipped[active]==='s-372'&&!divineUsed&&health[active]>0&&health[active]<max[active]*.50){
       divineUsed=true;
       max[active]*=1.10;healableMax[active]*=1.10;health[active]*=1.10;
       health[active]=Math.min(healableMax[active],Math.max(health[active],max[active]*.70));
       m.outgoing*=1.10;
       log.push('Turno '+rounds+': Divine Spirit Waters curou até 70% HP e concedeu +10% Stats.');
     }
     if(prevented>0){
       enemyHP-=prevented;
       log.push('Turno '+rounds+': Vector Storm refletiu '+Math.round(prevented)+' DMG.');
       if(!reflected){reflected=true;enemyStatus.shock=1;enemyStatus.blind=1;enemyStatus.stun=1;
         log.push('Primeira reflexão aplicou Shock e Blinding por 1 turno.');}
     }
     if(effect==='bleed_execution'&&health[active]>0){
       if(bleed>0)log.push('Turno '+rounds+': Scythe Tactician acumulou Execution (dano final desconhecido).');
       bleed=2;
     }
     timeline.push('T'+rounds+' · '+foe.name+' respondeu com '+Math.round(amountIn)+' DMG '+(foe.dmg?'(base do print, efeitos aproximados)':'(estimativa)'));
     if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado no turno '+rounds+' pelo contra-ataque');break}
     if(health[active]<=0){
       losses++;log.push('Turno '+rounds+': '+c.name+' foi derrotado.');
       active++;burn=false;immolation=0;fatigue=0;bleed=0;confusion=0;
       if(active>=4)break;
     }
   }
 }
 return {clear:defeated===4,turns:rounds,losses,defeated,remaining:health.reduce((v,h)=>v+Math.max(0,h),0),
  log,timeline,withinLimit:rounds<=22};
}
function simulate(teams,opts={}){
 const valid=rosterValid(teams);if(!valid.ok)return {error:valid.reason};
 const seed=opts.seed==null?Date.now():Number(opts.seed);
 const random=rng(seed);
 const hardness=Math.max(.6,Math.min(2.4,Number(opts.hardness)||1));
 const results=teams.map((team,i)=>simulatePhase(team,phases[i],random,hardness,opts.supports?.[i]||[]));
 const clear=results.every(x=>x.clear);
 const noLoss=clear&&results.every(x=>x.losses===0);
 const time=clear&&results.every(x=>x.withinLimit);
 return {clear,stars:(clear?1:0)+(noLoss?1:0)+(time?1:0),
  phases:results,seed,hardness,limits:{clearBoth:clear,loseNoCards:noLoss,eachPhase22:time}};
}
function trials(teams,opts={}){
 const valid=rosterValid(teams);if(!valid.ok)return {error:valid.reason};
 const samples=Math.min(500,Math.max(1,Math.trunc(opts.samples||100)));
 let clears=0,threeStars=0,noLoss=0,turns=[0,0],deaths=[0,0],last=null,bestExample=null,bestExampleScore=-1,stars=[0,0,0,0];
 for(let i=0;i<samples;i++){
   const r=simulate(teams,{seed:(Number(opts.seed)||39170)+(i*9973),hardness:opts.hardness||1,supports:opts.supports});
   last=r;clears+=r.clear?1:0;threeStars+=r.stars===3?1:0;noLoss+=r.limits.loseNoCards?1:0;stars[r.stars]++;
   const exampleScore=r.stars*100-r.phases.reduce((sum,phase)=>sum+phase.turns,0)*.01;
   if(exampleScore>bestExampleScore){bestExample=r;bestExampleScore=exampleScore;}
   r.phases.forEach((x,k)=>{turns[k]+=x.turns;deaths[k]+=x.losses});
 }
 return {samples,clears,threeStars,noLoss,avgTurns:turns.map(v=>v/samples),
  avgLosses:deaths.map(v=>v/samples),clearRate:clears/samples,threeStarRate:threeStars/samples,
  starCounts:stars,example:bestExample||last,modelOnly:true};
}
function rankCard(c,phase,slot){
 if(!hasStats(c))return -999;
 const m=modifiers(c,phase===phases[1]?1:0),a=phase.enemies.reduce((sum,foe)=>sum+getAdvantage(c.element,foe.element||phase.element),0)/phase.enemies.length;
 const hpScore=Math.log2(Math.max(1,c.hp))/16,damageScore=Math.log2(Math.max(1,c.dmg*a*m.outgoing))/15;
 const extra=(m.extraLife*.3)+(m.shield*.23)+(m.heal*2.5);
 return (slot===0?hpScore*1.25+damageScore*1.5:hpScore*.32+damageScore*1.4)+extra;
}
function recommend(allData,opts={}){
 const data=cardsOnly(allData);
 const owned=data.filter(c=>screenshotKnown.has(c.id)&&hasStats(c));
 const baseline=[['c-3','c-2','c-350','new-the-grinning-spectator-normal'],['c-1','c-5','c-353','new-silverfox-vanguard-astral']]
  .map(ids=>ids.map(id=>data.find(c=>c.id===id)));
 const chosen=baseline.flat().some(x=>!x)?[...owned.sort((a,b)=>b.dmg-a.dmg).slice(0,8)].reduce((p,x,i)=>(p[Math.floor(i/4)].push(x),p),[[],[]]):baseline;
 let best=chosen,bestSupports=normalizeSupports(opts.supports);
 let bestStat=trials(best,{samples:36,hardness:opts.hardness||1,seed:91011,supports:bestSupports});
 const metric=s=>s.clearRate*.68+s.threeStarRate*.22+(s.noLoss/s.samples)*.04-((s.avgTurns[0]+s.avgTurns[1])/65)*.06;
 let bestScore=metric(bestStat);
 // Hill-climb with reproducible independent candidates; do not claim the top
 // result is optimal over all catalog cards.
 const random=rng(29819);
 const maxAttempts=Math.min(360,Math.max(20,Number(opts.attempts)||180));
 for(let i=0;i<maxAttempts;i++){
   const test=best.map(team=>team.slice());
   let testSupports=bestSupports.map(team=>team.slice());
   const type=random();
   if(type<.25){
     testSupports=shuffleSupports(testSupports,random,1+Math.floor(random()*3));
   }else if(type<.62){
     const a=Math.floor(random()*8),b=Math.floor(random()*8);
     if(a===b)continue;
     const x=test[Math.floor(a/4)][a%4];test[Math.floor(a/4)][a%4]=test[Math.floor(b/4)][b%4];test[Math.floor(b/4)][b%4]=x;
   }else{
     const a=Math.floor(random()*8),c=owned[Math.floor(random()*owned.length)];
     if(!c)continue;
     test[Math.floor(a/4)][a%4]=c;
   }
   if(!rosterValid(test).ok)continue;
   const val=trials(test,{samples:36,hardness:opts.hardness||1,seed:91011,supports:testSupports});
   const m=metric(val);
   if(m>bestScore+0.0001){best=test;bestSupports=testSupports;bestScore=m;bestStat=val}
 }
 return {teams:best,supports:bestSupports,results:trials(best,{samples:120,hardness:opts.hardness||1,seed:44455,supports:bestSupports}),
  candidates:owned.length,attempts:maxAttempts,modelOnly:true};
}
// Incremental, cancellable search. Each distinct ordered pair of four-card
// rosters is simulated at least once; success requires all three star rules
// in the SAME simulated battle, not an average of separate attempts.
function createThreeStarSearch(allData,opts={}){
 const owned=cardsOnly(allData).filter(c=>screenshotKnown.has(c.id)&&hasStats(c));
 if(owned.length<8)return {error:'São necessárias pelo menos 8 cartas com HP/DMG confirmados.'};
 const random=rng(Number(opts.seed)||Date.now());
 const hardness=Number(opts.hardness)||1;
 const maxTests=Math.max(100,Math.min(1000000,Math.trunc(opts.maxTests||100000)));
 const initial=rosterValid(opts.teams||{}).ok?opts.teams.map(t=>t.slice()):null;
 const suggested=initial?null:recommend(allData,{attempts:40,hardness,supports:opts.supports});
 const base=initial||suggested.teams;
 const baseSupports=initial?normalizeSupports(opts.supports):suggested.supports;
 const seen=new Set();
 let tested=0,bestTeams=base.map(t=>t.slice()),bestSupports=baseSupports.map(t=>t.slice()),bestRun=null,bestScore=-Infinity,found=null,clearCount=0;
 const perfectPhaseCount=[0,0];
 function shuffleRoster(){
   const pool=owned.slice();
   for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
   return [pool.slice(0,4),pool.slice(4,8)];
 }
 function proposed(){
   if(random()<.35)return {teams:shuffleRoster(),supports:shuffleSupports(baseSupports,random,3+Math.floor(random()*8))};
   const useBest=random()<.75;
   const parent=(useBest?bestTeams:base).flat().slice();
   let supports=(useBest?bestSupports:baseSupports).map(x=>x.slice());
   const edits=1+Math.floor(random()*6);
   for(let i=0;i<edits;i++){
     if(random()<.30){supports=shuffleSupports(supports,random);continue;}
     const a=Math.floor(random()*8),b=Math.floor(random()*8);
     if(random()<.75){[parent[a],parent[b]]=[parent[b],parent[a]];}
     else{
       const candidate=owned[Math.floor(random()*owned.length)];
       if(candidate&&!parent.some((c,j)=>j!==a&&c.id===candidate.id))parent[a]=candidate;
     }
   }
   return {teams:[parent.slice(0,4),parent.slice(4,8)],supports};
 }
 function score(r){
   return r.phases.reduce((sum,p)=>sum+p.defeated*24-p.losses*11-p.turns*.25,0)
     +(r.clear?45:0)+(r.limits.loseNoCards?100:0)+(r.limits.eachPhase22?22:0);
 }
 function step(size=500){
   const limit=Math.min(maxTests,tested+Math.max(1,Math.trunc(size)));
   let attempts=0;
   while(tested<limit&&!found&&attempts<(size*30)){
     attempts++;
     const candidate=tested===0?{teams:base.map(t=>t.slice()),supports:baseSupports.map(t=>t.slice())}:proposed();
     const {teams,supports}=candidate;
     if(!rosterValid(teams).ok)continue;
     const fingerprint=teams.flat().map(c=>c.id).concat(supports.flat().map(id=>id||'-')).join('|');
     if(seen.has(fingerprint))continue;
     seen.add(fingerprint);tested++;
     const seed=(Number(opts.seed)||81371)+tested*7919;
     const result=simulate(teams,{seed,hardness,supports});
     if(result.clear)clearCount++;
     result.phases.forEach((p,i)=>{if(p.clear&&p.losses===0&&p.withinLimit)perfectPhaseCount[i]++;});
     const value=score(result);
     if(value>bestScore){bestScore=value;bestTeams=teams.map(t=>t.slice());bestSupports=supports.map(t=>t.slice());bestRun=result;}
     if(result.stars===3)found={teams:teams.map(t=>t.slice()),supports:supports.map(t=>t.slice()),result};
   }
   return {tested,maxTests,candidates:owned.length,clearCount,perfectPhaseCount:perfectPhaseCount.slice(),
     bestTeams:bestTeams.map(t=>t.slice()),bestSupports:bestSupports.map(t=>t.slice()),bestRun,bestScore,found,
     done:Boolean(found)||tested>=maxTests};
 }
 return {step,get status(){return {tested,maxTests,candidates:owned.length,clearCount,found}}};
}
return {phases,initialPhases,elements,supportedSupportIds,screenshotKnown,rank,link,getAdvantage,bonuses,modifiers,hasStats,
 rosterValid,simulate,trials,recommend,createThreeStarSearch,estimateCard,applyRotation,resetRotation,currentRotation};
});
