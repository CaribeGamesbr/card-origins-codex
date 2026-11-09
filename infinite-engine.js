/* Infinite Tower: seeded COMPARATIVE MODEL, not the official Roblox combat code.
 * Screenshot-proven paths, card stats and one Floor 261 enemy are input data.
 * Enemy growth, unknown abilities and turn order are openly adjustable hypotheses.
 */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_INFINITE_ENGINE=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const PATHS=[
 {id:'destruction',name:'The Destruction',short:'HP perdido → dano / Fatigue',detail:'Tier 5: +8% Power; +2,2% DMG por 10% de HP perdido; 5% Fatigue por 25% de HP perdido.',color:'#f27a6b',tier:5},
 {id:'remembrance',name:'The Remembrance',short:'26,5% Freeze / Shatter',detail:'26,5% de Freeze por hit, por 1 turno; atingir alvo Frozen causa +26,5% DMG.',color:'#9ddcff',tier:0},
 {id:'nihility',name:'The Nihility',short:'3 Decay/hit, 3,3% HP por stack',detail:'3 stacks por ataque, maximo 5; cada stack causa 3,3% do HP atual do inimigo.',color:'#bf82df',tier:0},
 {id:'erudition',name:'The Erudition',short:'8,8% splash + Max HP',detail:'Splash de 8,8% em outros inimigos e buff de 8,8% de Max HP para a carta ativa.',color:'#8f90ff',tier:0},
 {id:'harmony',name:'The Harmony',short:'Buff aleatorio a cada turno',detail:'A cada turno, inclusive inimigo: +16,5% Max HP, +22% Overshield ou +16,5% DMG.',color:'#f5d084',tier:0},
 {id:'hunt',name:'The Hunt',short:'Abates dão +16,5% DMG',detail:'Cada inimigo derrotado concede +16,5% DMG permanente ate 3 stacks.',color:'#7ccde3',tier:0},
 {id:'abundance',name:'The Abundance',short:'Excesso de cura → Overhealth',detail:'Cura acima do HP maximo vira Overhealth temporario compartilhado com a equipe.',color:'#8ae5ae',tier:0}
];
const SUPPORT_IDS=['s-360','s-365','s-366','s-371','s-372','s-374'];
const DEFAULT={from:261,to:280,baseFloor:261,enemyHp:6061,enemyDmg:2648,growth:0.01,enemyElement:'Unknown',enemyDodge:0,enemiesPerFloor:1,elementsMode:false,seed:261,pressure:1};
const BEATS={Fire:'Ice',Ice:'Lightning',Lightning:'Wind',Wind:'Fire',Quantum:'Imaginary',Imaginary:'Physical',Physical:'Quantum'};
const LINKS=new Set(['Fire+Fire','Ice+Ice','Lightning+Lightning','Wind+Wind','Quantum+Quantum','Imaginary+Imaginary','Physical+Physical','Fire+Ice','Fire+Wind','Fire+Lightning','Ice+Lightning','Ice+Wind','Lightning+Wind','Quantum+Imaginary','Quantum+Physical','Imaginary+Physical','Fire+Physical','Ice+Quantum','Wind+Imaginary'].map(x=>x.split('+').sort().join('+')));
function rand(seed){let x=(seed>>>0)||1977;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function clamp(x,a,b){return Math.min(b,Math.max(a,x));}
function valid(cards){return Array.isArray(cards)&&cards.length===4&&cards.every(x=>x&&Number(x.hp)>0&&Number(x.dmg)>0)&&new Set(cards.map(x=>x.id)).size===4;}
function advantage(att,def,on){if(!on||!BEATS[att]||!BEATS[def])return 1;if(BEATS[att]===def)return 1.5;if(BEATS[def]===att)return .70;return 1;}
function linkBonus(cards){return cards.map((c,i)=>[i-1,i+1].reduce((v,j)=>{if(j<0||j>=cards.length)return v;const other=cards[j];return v+(LINKS.has([c.element,other.element].sort().join('+'))&&c.element===other.element?.06:0);},1));}
function defaultSupports(){return ['s-371','s-372','s-365','s-366'];}
function cardEffects(card){return String(card.name||'').toUpperCase();}
function simulate(raw){
 const options={...DEFAULT,...raw},cards=options.team||[],sup=options.supports||[];
 if(!valid(cards))return {error:'Selecione 4 cartas diferentes com HP e DMG conhecidos.'};
 const start=clamp(Math.floor(+options.from||261),1,20000),goal=clamp(Math.floor(+options.to||280),start,start+150);
 const dice=rand(options.seed||261),path=PATHS.some(p=>p.id===options.path)?options.path:'destruction';
 const tier=clamp(Math.floor(+options.tier||0),0,5),power=1+Math.min(.08,tier*.016);
 const hp=cards.map((c,i)=>+c.hp*(path==='erudition'?1.088:1)*(path!=='erudition'&&(sup[i]==='s-371'||sup[i]?.id==='s-371')?1.075:1));
 const max=hp.slice(),shield=cards.map(()=>0),blood=cards.map(()=>0),matter=cards.map(()=>0),flesh=cards.map(()=>0),kocKills=cards.map(()=>0),extraLife=cards.map(()=>true),supportUsed=cards.map(()=>false),clone=cards.map(()=>true);
 const link=linkBonus(cards);const kinds=cards.map(cardEffects);
 const spectator=kinds.indexOf('THE GRINNING SPECTATOR');const eyeTarget=spectator<0?-1:cards.reduce((best,c,i)=>i!==spectator&&(best<0||c.dmg>cards[best].dmg)?i:best,-1);
 let active=0,won=0,turns=0,kos=0,huntStack=0,decay=0,log=[],floorReached=start-1,stoppedAt=null;
 const save=(s)=>{if(log.length<35)log.push(s);};
 function heal(i,amount){if(amount<=0)return;const before=hp[i];hp[i]=Math.min(max[i],before+amount);const excess=Math.max(0,before+amount-max[i]);if(path==='abundance'&&excess>0)shield[i]+=excess;}
 function onFatal(i){
   if(hp[i]>0)return false;
   if((sup[i]?.id==='s-366'||sup[i]==='s-366')&&!supportUsed[i]){supportUsed[i]=true;hp[i]=max[i]*.65;save('Binding Vow ativou no slot '+(i+1)+' (modelo: uma vez na run).');return true;}
   if((sup[i]?.id==='s-374'||sup[i]==='s-374')&&!supportUsed[i]){supportUsed[i]=true;hp[i]=1;save('Serenity protegeu o slot '+(i+1)+'.');return true;}
   if(kinds[i]==='MAGICIAN'&&extraLife[i]){extraLife[i]=false;hp[i]=1;save('Paper Substitute de Magician evitou dano fatal.');return true;}
   return false;
 }
 const teammate=(i)=>cards[i],support=(i)=>String(sup[i]?.id||sup[i]||'');
 for(let floor=start;floor<=goal;floor++){
   if(active>=4){stoppedAt=floor;break;}
   const ratio=Math.pow(1+clamp(+options.growth||0,0,.08),floor-(+options.baseFloor||261))*clamp(+options.pressure||1,.2,5)*(options.elementsMode?1.2:1);
   let nextSplash=0,localTurns=0;
   for(let enemy=0;enemy<clamp(Math.floor(+options.enemiesPerFloor||1),1,4);enemy++){
     if(active>=4)break;
     const baseHp=Math.max(1,+options.enemyHp||6061)*ratio;
     const foeMax=baseHp*(.92+.16*dice());let foe=foeMax-nextSplash;nextSplash=0;
     const enemyDmg=Math.max(1,+options.enemyDmg||2648)*ratio*(.9+.2*dice());let frozen=0,bleed=0,burn=0,bleedPower=0,burnPower=0,enemyTurns=0;
     decay=0;
     while(foe>0&&active<4&&localTurns<160){
       localTurns++;turns++;let i=active,c=teammate(i),name=kinds[i],s=support(i),dodgeChance=clamp(+options.enemyDodge||0,0,.90);
       if(s==='s-365')heal(i,max[i]*.05);
       if((s==='s-372')&&!supportUsed[i]&&hp[i]<max[i]*.5){supportUsed[i]=true;heal(i,Math.max(0,max[i]*.70-hp[i]));save('Divine Spirit Waters recuperou o slot '+(i+1)+' ate 70% HP.');}
       // Harmony buffs are approximated as ONE-turn effects, not permanent shields.
       let harmonyDamage=false,tempShield=0;
       if(path==='harmony'){const v=dice();if(v<1/3)tempShield=max[i]*.165;else if(v<2/3)tempShield=max[i]*.22;else harmonyDamage=true;}
       const missing=1-hp[i]/max[i];let multi=power*link[i]*advantage(c.element,options.enemyElement,options.elementsMode)*(path==='hunt'?1+.165*huntStack:1);
       if(path==='destruction')multi*=1+.22*missing;
       if(s==='s-371')multi*=1.075;
       if(s==='s-372'&&supportUsed[i])multi*=1.10;
       if(s==='s-366'&&supportUsed[i])multi*=.5;
       if(harmonyDamage)multi*=1.165;
       if(i===eyeTarget)multi*=1.06; // ganho medio hipotetico do critico do Eye Deal
       if(name==='KING OF GAMES'&&kos===0)multi*=1.2;
       if(name==='KING OF CURSES'){multi*=1+.1*kocKills[i];if(foe>foeMax*.5)multi*=1.2;if(dodgeChance>0)multi*=1+.4*dodgeChance;}
       if(name==='BLUE WOLF'&&blood[i]>=3){multi*=1.4;blood[i]=0;heal(i,max[i]*.15);}
       const sureHit=name==='KING OF CURSES'||name==='SORCERER KILLER';
       const chance=sureHit?1:clamp(.96-dodgeChance,.08,.99);
       let damage=0;
       if(dice()<chance){
         damage=(+c.dmg)*multi*(.88+.24*dice());
         if(name==='ASHEY'&&dice()<.5)damage*=1.5;
         if(name==='SILVER STAR USER')damage*=1.25;
         if(name==='FULLMETAL ALCHEMIST'&&matter[i]>0){damage+=matter[i]*.6;heal(i,matter[i]*.4);matter[i]=0;}
         if(name==='ASHEY')damage+=c.dmg*.4*multi;
         if(name==='HALF GHOUL')flesh[i]=Math.min(max[i]*.5,flesh[i]+damage*.4);
         if(name==='BLUE WOLF')blood[i]++;
         if(path==='remembrance'){
           if(frozen>0){damage*=1.265;frozen=0;}
           else if(dice()<.265)frozen=2;
         }
         if(path==='nihility')decay=Math.min(5,decay+3);
         if(s==='s-360'){burn=2;burnPower=damage*.10;}
         if(name==='ASHEY'||name==='BLACK FLAME HEIR'||name==='VIRTUAL CHIMERA'){burn=Math.max(burn,2);burnPower=Math.max(burnPower,damage*.10);}
         if(path==='erudition'&&enemy<options.enemiesPerFloor-1)nextSplash+=damage*.088;
         foe-=damage;
       }
       if(foe<=0){won++;if(path==='hunt')huntStack=Math.min(3,huntStack+1);if(name==='KING OF CURSES')kocKills[i]++;break;}
       enemyTurns++;
       if(path==='nihility'&&decay>0)foe-=foe*.033*decay;
       if(burn>0){foe-=burnPower;burn--;}
       if(bleed>0){foe-=bleedPower;bleed--;}
       if(foe<=0){won++;if(path==='hunt')huntStack=Math.min(3,huntStack+1);break;}
       if(frozen>0){frozen--;continue;}
       let hit=enemyDmg*(.90+.20*dice());
       if(name==='VECTOR STORM'){const reflected=hit*.35;hit*=.65;foe-=Math.min(reflected,c.dmg*.6);}
       if(name==='RABBIT GHOUL'&&dice()<.40){if(extraLife[i]){foe-=c.dmg*.6;extraLife[i]=false;}continue;}
       if(name==='SILVERFOX VANGUARD'&&clone[i]){clone[i]=false;hit*=.5;}
       if(name==='DEMONIC SWORDSAINT'&&dice()<.15)hit=0;
       if(tempShield>0)hit=Math.max(0,hit-tempShield);
       if(shield[i]>0){const absorb=Math.min(shield[i],hit);shield[i]-=absorb;hit-=absorb;}
       hp[i]-=hit;
       if(name==='FULLMETAL ALCHEMIST'&&hit>0)matter[i]=Math.min(max[i]*.25,matter[i]+hit*.2);
       if(name==='HALF GHOUL'&&hp[i]<max[i]*.35&&flesh[i]>0){heal(i,Math.min(flesh[i],max[i]*.5));flesh[i]=0;}
       if(hp[i]<=0&&!onFatal(i)){hp[i]=0;kos++;save('F'+floor+': '+c.name+' ('+c.border+') caiu.');active++;}
     }
     if(localTurns>=160){save('F'+floor+': limite de turnos de seguranca do modelo.');break;}
   }
   if(active>=4||localTurns>=160){stoppedAt=floor;break;}
   floorReached=floor;
   if(floor===start||floor%10===0||floor===goal)save('Andar '+floor+' concluido; '+(4-kos)+'/4 cartas vivas.');
 }
 const clear=floorReached>=goal;const totalHp=hp.reduce((sum,n,i)=>sum+Math.max(0,n)/max[i],0)/4;
 return {clear,from:start,target:goal,floorReached,stoppedAt,progress:Math.max(0,floorReached-start+1)/(goal-start+1),kos,turns,healthFraction:totalHp,team:cards.map(x=>x.id),path,log};
}
function assess(cfg,trials=20){const stats=[],n=clamp(Math.round(trials),1,250);for(let i=0;i<n;i++)stats.push(simulate({...cfg,seed:(cfg.seed||261)+i*7919}));if(stats[0]?.error)return {error:stats[0].error};const wins=stats.filter(x=>x.clear);return {trials:n,clearRate:wins.length/n,avgFloor:stats.reduce((s,x)=>s+x.floorReached,0)/n,maxFloor:Math.max(...stats.map(x=>x.floorReached)),avgKos:stats.reduce((s,x)=>s+x.kos,0)/n,avgTurns:stats.reduce((s,x)=>s+x.turns,0)/n,avgHealth:stats.reduce((s,x)=>s+x.healthFraction,0)/n,example:(wins[0]||stats.sort((a,b)=>b.floorReached-a.floorReached||a.kos-b.kos)[0])};}
function score(a,from,to){if(a.error)return -Infinity;const span=Math.max(1,to-from+1);return a.clearRate*100000+(a.avgFloor-from+1)/span*1200-a.avgKos*65+a.avgHealth*90-a.avgTurns*.08;}
function makeSearch(roster,raw={}){
 const pool=roster.filter(c=>Number(c.hp)>0&&Number(c.dmg)>0&&c.type==='card');
 const cfg={...DEFAULT,...raw},N=clamp(Math.floor(+cfg.maxTests||4000),50,30000);
 let checked=0,best=null,stopped=false,unique=new Set(),testedPaths=Object.fromEntries(PATHS.map(p=>[p.id,{trials:0,best:null}]));const rng=rand(cfg.seed||261);
 const byRating=pool.slice().sort((a,b)=>b.dmg+b.hp*.12-(a.dmg+a.hp*.12));
 function pick(){const out=[];let attempts=0;while(out.length<4&&attempts++<120){const c=rng()<.73?byRating[Math.floor(Math.pow(rng(),1.8)*byRating.length)]:pool[Math.floor(rng()*pool.length)];if(!out.some(x=>x.id===c.id))out.push(c)}return out;}
 function next(){
   if(stopped||checked>=N)return false;
   const path=PATHS[checked%PATHS.length].id;const team=checked<PATHS.length?['c-1','c-2','c-3','c-5'].map(id=>pool.find(c=>c.id===id)).filter(Boolean):pick();
   if(team.length!==4){checked++;return true;}
   const supports=defaultSupports();
   if(checked%9===2)supports.splice(0,4,'s-365','s-371','s-372','s-366');
   if(checked%9===5)supports.splice(0,4,'s-371','s-365','s-366','s-372');
   const key=path+'|'+team.map(c=>c.id).join('|')+'|'+supports.join('|');
   if(unique.has(key)){checked++;return true;}unique.add(key);
   const tier=path==='destruction'?cfg.tierDestruction??5:cfg.tierOther??0;
   const args={...cfg,team,supports,path,tier,seed:(cfg.seed||261)+293};
   const a=assess(args,3),candidate={team,supports,path,tier,stats:a,score:score(a,cfg.from,cfg.to)};
   const bucket=testedPaths[path];bucket.trials++;
   if(!bucket.best||candidate.score>bucket.best.score)bucket.best=candidate;
   if(!best||candidate.score>best.score)best=candidate;
   checked++;return true;
 }
 return {step(n=25){for(let i=0;i<n&&next();i++);return {checked,maxTests:N,best,paths:testedPaths,done:checked>=N||stopped};},stop(){stopped=true;},get result(){return {checked,maxTests:N,best,paths:testedPaths,done:checked>=N||stopped};}};
}
return {PATHS,DEFAULT,SUPPORT_IDS,rand,valid,simulate,assess,makeSearch,defaultSupports};
});
