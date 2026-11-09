/* Memory of Chaos — comparative model, NOT a recreation of Roblox combat.
   Screenshot-confirmed: two separate teams of 4, ordered phases Fire/Imaginary,
   Stage 03 Burn/Immolation/Fatigue, star conditions and the abilities below.
   UNKNOWN: enemy HP/DMG, cooldown processing, exact battle timing.
   All synthetic power/damage estimates are intentionally adjustable.
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
    {name:'Apothecary Cat',element:'Wind',threat:'Copia até quatro debuffs aplicados; cuidado com acúmulo de efeitos.',bulk:1.05,hazard:1.02},
    {name:'Fire Soldier',element:'Fire',threat:'Dois ataques por rodada, com bônus permanente após abater uma carta.',bulk:1.0,hazard:1.20},
    {name:'The Ancient Flame…',element:'Fire',threat:'Charred HP e Cremation podem impedir cura e punir equipes lentas.',bulk:1.28,hazard:1.24},
    {name:'Star Warrior Raised…',element:'Imaginary',threat:'Chance de esquiva de 55%; depois de 5 esquivas ativa adaptação defensiva.',bulk:1.07,hazard:0.97,dodge:.55}
  ]},
 {name:'Fase 2 — Imaginary',element:'Imaginary',weak:'Quantum',color:'#e9c77b',
  enemies:[
    {name:'Omniscient Reader',element:'Quantum',threat:'Copia primeira habilidade do inimigo e pune efeitos usados repetidamente.',bulk:1.25,hazard:1.17},
    {name:'The Sky-Reaching…',element:'Fire',threat:'Crossed-Out reduz proteção externa e afeta a forma das habilidades.',bulk:1.08,hazard:1.11},
    {name:'Horned Maid',element:'Fire',threat:'Aplica Fatigue e Confusion; debuffs fortalecem seu dano.',bulk:1.04,hazard:1.18},
    {name:'Scythe Tactician',element:'Wind',threat:'Bleed e Execution; aumenta dano ao consumir efeitos.',bulk:1.13,hazard:1.20}
  ]}
];
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
function getAdvantage(element,target){
 if(target==='Fire')return element==='Wind'?1.5:element==='Ice'?.70:1;
 if(target==='Imaginary')return element==='Quantum'?1.5:element==='Physical'?.70:1;
 return 1;
}
const pairs=new Set(['Fire+Fire','Ice+Ice','Lightning+Lightning','Wind+Wind','Quantum+Quantum','Imaginary+Imaginary','Physical+Physical',
'Fire+Ice','Fire+Wind','Fire+Lightning','Ice+Lightning','Ice+Wind','Lightning+Wind','Quantum+Imaginary','Quantum+Physical',
'Imaginary+Physical','Fire+Physical','Ice+Quantum','Wind+Imaginary']);
function link(a,b){if(!a||!b)return false;return pairs.has([a.element,b.element].sort().join('+'))}
function bonuses(team){return team.map((card,i)=>{let edges=0;if(i>0&&link(team[i-1],card))edges++;if(i<team.length-1&&link(card,team[i+1]))edges++;return 1+edges*.06})}
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
 if(n==='VECTOR STORM'){incoming*=.65;outgoing*=1.08}
 if(n==='BLUE WOLF'){heal=.085}
 if(n==='FULLMETAL ALCHEMIST'){incoming*=.84;outgoing*=1.04}
 if(n==='ASHEY'){outgoing*=1.3;hitBonus=.03}
 if(n==='KING OF GAMES'){outgoing*=1.20}
 if(n==='SILVER STAR USER'){outgoing*=1.23}
 if(n==='SCARLET DUELIST'){incoming*=.92}
 if(n==='PSYCHIC PEAK'){incoming*=.93}
 if(n==='SILVERFOX VANGUARD'){shield=1;outgoing*=1.09}
 if(n==='MAGICIAN'){extraLife=1;outgoing*=1.05}
 if(n==='BLACK EYEPATCH'){hitBonus=.20;incoming*=.95}
 if(n==='THE GRINNING SPECTATOR'){outgoing*=1.05;hitBonus=.08}
 if(n==='DEMONIC SWORDSAINT'){outgoing*=1.13;incoming*=.90}
 if(n==='BLACK FLAME HEIR'){heal=.035}
 if(n==='KAIRO'){incoming*=.97;outgoing*=1.04}
 if(n==='SCARLET KNIGHT'){outgoing*=1.05}
 if(n==='GHOST COMMUNICATOR'){heal=.04}
 if(abil.includes('HEAVENLY RESTRICTION'))hitBonus=.1;
 if(mode===1&&n==='BLACK EYEPATCH')hitBonus+=.08;
 return {outgoing,incoming,heal,extraLife,shield,hitBonus};
}
function estimateCard(c,phase){
 const m=modifiers(c,phase===phases[1]?1:0);
 return {hp:+c.hp,damage:+c.dmg*getAdvantage(c.element,phase.element)*m.outgoing,mitigation:m.incoming};
}
function simulatePhase(team,phase,random,hardness=1){
 const mods=team.map((c)=>modifiers(c,phase===phases[1]?1:0));
 const health=team.map(c=>+c.hp), max=team.map(c=>+c.hp);
 const skillGuard=mods.map(m=>m.extraLife),clone=mods.map(m=>m.shield);
 const linkBoost=bonuses(team);
 const meanHP=team.reduce((s,c)=>s+c.hp,0)/4;
 // Assumed numbers, not in screenshots: enemy relative HP and damage.
 const baseEnemyHP=4650*hardness, baseHit=(meanHP*.074)*hardness;
 let rounds=0,active=0,defeated=0,losses=0,burn=false,immolation=0,fatigue=0,enemyTurns=0;
 const log=[];
 for(let k=0;k<4;k++){
   const foe=phase.enemies[k];let enemyHP=baseEnemyHP*foe.bulk*(.85+random()*.30);
   let dodges=0;
   while(enemyHP>0&&rounds<55&&active<4){
     rounds++;
     const c=team[active],m=mods[active];
     const adv=getAdvantage(c.element,phase.element);
     let hitChance=Math.min(.99,(foe.dodge==null?.94:1-foe.dodge)+m.hitBonus);
     let amount=c.dmg*adv*m.outgoing*linkBoost[active]*(.86+.28*random());
     if(k===3&&dodges>=5)amount*=.9;
     if(fatigue>0)amount*=.9;
     if(random()<=hitChance){
       if(c.name==='ASHEY'&&random()<.25)amount*=1.2;
       if(c.name==='BLACK EYEPATCH'&&foe.dodge)amount*=1.09;
       if(c.name==='SILVERFOX VANGUARD'&&!clone[active])amount*=1.12;
       enemyHP-=amount;
       if(m.heal)health[active]=Math.min(max[active],health[active]+amount*m.heal);
     }else dodges++;
     if(enemyHP<=0){defeated++;log.push(foe.name+' derrotado no turno '+rounds);break}
     // Approximate each enemy turn and stage debuff; status is treated as persisting on the active card until KO.
     enemyTurns++;
     let amountIn=baseHit*foe.hazard*(.75+.5*random());
     if(foe.name==='Fire Soldier')amountIn*=1.1;
     if(foe.name==='The Ancient Flame…')amountIn*=1.16;
     if(foe.name==='Horned Maid'&&fatigue>0)amountIn*=1.13;
     if(foe.name==='Scythe Tactician')amountIn*=1.08;
     if(enemyTurns%2===0){
       if(!burn){burn=true}else immolation=Math.min(2,immolation+1);
       if(immolation>=2)fatigue=3;
     }
     if(burn)amountIn+=max[active]*.013;
     if(immolation)amountIn+=Math.min(3,immolation)*max[active]*.02;
     if(fatigue>0){amountIn*=1.07;fatigue--}
     if(clone[active]>0){amountIn*=.50;clone[active]--}
     amountIn*=m.incoming;
     if(amountIn>=health[active]&&skillGuard[active]>0){
       skillGuard[active]--;
       health[active]=Math.max(1,health[active]*.18);
       enemyHP-=c.dmg*.65;
     }else health[active]-=amountIn;
     if(health[active]<=0){
       losses++;active++;burn=false;immolation=0;fatigue=0;
       if(active>=4)break;
     }
   }
 }
 return {clear:defeated===4,turns:rounds,losses,defeated,remaining:health.reduce((v,h)=>v+Math.max(0,h),0),
  log,withinLimit:rounds<=22};
}
function simulate(teams,opts={}){
 const valid=rosterValid(teams);if(!valid.ok)return {error:valid.reason};
 const seed=opts.seed==null?Date.now():Number(opts.seed);
 const random=rng(seed);
 const hardness=Math.max(.6,Math.min(2.4,Number(opts.hardness)||1));
 const results=teams.map((team,i)=>simulatePhase(team,phases[i],random,hardness));
 const clear=results.every(x=>x.clear);
 const noLoss=clear&&results.every(x=>x.losses===0);
 const time=clear&&results.every(x=>x.withinLimit);
 return {clear,stars:(clear?1:0)+(noLoss?1:0)+(time?1:0),
  phases:results,seed,hardness,limits:{clearBoth:clear,loseNoCards:noLoss,eachPhase22:time}};
}
function trials(teams,opts={}){
 const valid=rosterValid(teams);if(!valid.ok)return {error:valid.reason};
 const samples=Math.min(500,Math.max(1,Math.trunc(opts.samples||100)));
 let clears=0,threeStars=0,noLoss=0,turns=[0,0],deaths=[0,0],last=null,stars=[0,0,0,0];
 for(let i=0;i<samples;i++){
   const r=simulate(teams,{seed:(Number(opts.seed)||39170)+(i*9973),hardness:opts.hardness||1});
   last=r;clears+=r.clear?1:0;threeStars+=r.stars===3?1:0;noLoss+=r.limits.loseNoCards?1:0;stars[r.stars]++;
   r.phases.forEach((x,k)=>{turns[k]+=x.turns;deaths[k]+=x.losses});
 }
 return {samples,clears,threeStars,noLoss,avgTurns:turns.map(v=>v/samples),
  avgLosses:deaths.map(v=>v/samples),clearRate:clears/samples,threeStarRate:threeStars/samples,
  starCounts:stars,example:last,modelOnly:true};
}
function rankCard(c,phase,slot){
 if(!hasStats(c))return -999;
 const m=modifiers(c,phase===phases[1]?1:0),a=getAdvantage(c.element,phase.element);
 const hpScore=Math.log2(Math.max(1,c.hp))/16,damageScore=Math.log2(Math.max(1,c.dmg*a*m.outgoing))/15;
 const extra=(m.extraLife*.3)+(m.shield*.23)+(m.heal*2.5);
 return (slot===0?hpScore*1.25+damageScore*1.5:hpScore*.32+damageScore*1.4)+extra;
}
function recommend(allData,opts={}){
 const data=cardsOnly(allData);
 const owned=data.filter(c=>screenshotKnown.has(c.id)&&hasStats(c));
 const baseline=[['c-3','c-350','new-black-flame-heir-calamity','new-the-grinning-spectator-normal'],['c-1','c-353','new-silver-star-user-calamity','c-5']]
  .map(ids=>ids.map(id=>data.find(c=>c.id===id)));
 const chosen=baseline.flat().some(x=>!x)?[...owned.sort((a,b)=>b.dmg-a.dmg).slice(0,8)].reduce((p,x,i)=>(p[Math.floor(i/4)].push(x),p),[[],[]]):baseline;
 let best=chosen,bestStat=trials(best,{samples:36,hardness:opts.hardness||1,seed:91011});
 const metric=s=>s.clearRate*.68+s.threeStarRate*.22+(s.noLoss/s.samples)*.04-((s.avgTurns[0]+s.avgTurns[1])/65)*.06;
 let bestScore=metric(bestStat);
 // Hill-climb with reproducible independent candidates; do not claim the top
 // result is optimal over all catalog cards.
 const random=rng(29819);
 const maxAttempts=Math.min(360,Math.max(20,Number(opts.attempts)||180));
 for(let i=0;i<maxAttempts;i++){
   const test=best.map(team=>team.slice());
   const type=random();
   if(type<.48){
     const a=Math.floor(random()*8),b=Math.floor(random()*8);
     if(a===b)continue;
     const x=test[Math.floor(a/4)][a%4];test[Math.floor(a/4)][a%4]=test[Math.floor(b/4)][b%4];test[Math.floor(b/4)][b%4]=x;
   }else{
     const a=Math.floor(random()*8),c=owned[Math.floor(random()*owned.length)];
     if(!c)continue;
     test[Math.floor(a/4)][a%4]=c;
   }
   if(!rosterValid(test).ok)continue;
   const val=trials(test,{samples:36,hardness:opts.hardness||1,seed:91011});
   const m=metric(val);
   if(m>bestScore+0.0001){best=test;bestScore=m;bestStat=val}
 }
 return {teams:best,results:trials(best,{samples:120,hardness:opts.hardness||1,seed:44455}),
  candidates:owned.length,attempts:maxAttempts,modelOnly:true};
}
return {phases,screenshotKnown,rank,link,getAdvantage,bonuses,modifiers,hasStats,rosterValid,simulate,trials,recommend,estimateCard};
});
