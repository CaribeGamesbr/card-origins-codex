const assert=require('node:assert/strict');
const C=require('../infinite-combat.js');
const dice=()=>.99;
const card=(id,hp=1000,dmg=100,name='Unknown')=>C.actor({id,name,hp,dmg,element:'Unknown'});
function execute(a,plan){const hits=new Map(),landed=new Set();for(const hit of plan.hits){const loss=C.skillHit(a,hit.target,hit,dice);hits.set(hit.target,(hits.get(hit.target)||0)+loss);if(hit.landed)landed.add(hit.target);}for(const st of plan.statuses){if(st.onlyIfAlive&&st.target.hp<=0||st.onlyOnHit&&!landed.has(st.target))continue;C.apply(st.target,st.key,st.turns,st.value,a);}a.hp-=plan.selfHpCost||0;return hits;}

assert.equal(C.cardSkill(card('fake',1000,100,'DELUSIONAL OVERLORD')),null,'Names cannot invent a reviewed skill');
assert.equal(C.cardSkill({...card('c-80'),ability:'DIFFERENT ABILITY'}),null,'A changed ability cannot silently reuse an old handler');
assert.equal(C.cardSkill(card('new-king-of-curses-evolved-normal')).key,'king-curses-evolved');
assert.equal(C.cardSkill(card('new-king-of-curses-calamity')),null,'The evolved form is not assigned to the base card');

const overlord=card('c-80'),foes=Array.from({length:4},()=>card('enemy',1000,10,'WALKER'));
for(const f of foes){f.shield=1000;f.gear={crit:100,trait:'Guard'};f.ward=1;f.sanctuaryUntil=100;}
C.apply(overlord,'Blind',3,1);C.begin(overlord,dice);
assert.equal(C.afterSkillTurn(overlord,foes,{baseDamage:100}).hits.length,0);
C.begin(overlord,dice);const atomic=C.afterSkillTurn(overlord,foes,{baseDamage:100});
assert.equal(atomic.hits.length,4);assert.equal(atomic.selfHpCost,400);assert.equal(atomic.statuses.length,0,'Unknown durations do not become permanent debuffs');
execute(overlord,atomic);for(const f of foes){assert.equal(f.hp,850,'Atomic hits every living foe through shield, ward, dodge and reduction');assert.equal(f.shield,1000);assert.equal(f.dmg,10);}
assert.equal(overlord.hp,600);assert.equal(C.afterSkillTurn(overlord,foes,{baseDamage:100}).hits.length,0,'Atomic is once per battle');
C.resetBattle(overlord);assert.equal(overlord.hp,600,'A new floor resets mechanics without granting free healing');
C.afterSkillTurn(overlord,foes,{baseDamage:100});assert.equal(C.afterSkillTurn(overlord,foes,{baseDamage:100}).hits.length,4,'Once per battle refreshes for the next floor');
const noTargets=card('c-80');C.afterSkillTurn(noTargets,[],{baseDamage:100});const noAtomic=C.afterSkillTurn(noTargets,[],{baseDamage:100});assert.equal(noAtomic.selfHpCost,0,'Killing the final enemy normally does not spend Atomic or its HP cost');assert(!noTargets.once.has('atomic'));

const catalyst=card('new-the-scarlet-catalyst-calamity'),wave=Array.from({length:4},()=>card('enemy'));
const flame=C.skillAction(catalyst,wave[0],wave,{baseDamage:100});assert(flame.replaceNormal);assert.deepEqual(flame.hits.map(h=>h.damage),[30,15,15,15]);
assert.equal(flame.statuses[0].turns,2);assert.equal(flame.statuses[0].value,0,'A base Burn coefficient is not invented');execute(catalyst,flame);assert.deepEqual(wave.map(f=>f.hp),[970,985,985,985]);
assert(flame.hits[0].normalHit);const unknownTick=C.skillAction(catalyst,wave[0],wave,{baseDamage:100});execute(catalyst,unknownTick);assert.equal(wave[0].statuses.Burn.until,1,'Confirmed immediate tick consumes a turn even when its damage coefficient is omitted');
C.apply(wave[0],'Burn',2,10,catalyst);const beforeBurst=wave[0].hp,burst=C.skillAction(catalyst,wave[0],wave,{baseDamage:100});assert.deepEqual(burst.hits.map(h=>h.damage),[35,10]);execute(catalyst,burst);assert.equal(wave[0].hp,beforeBurst-45);assert.equal(wave[0].statuses.Burn.until,1,'One immediate Burn tick consumes exactly one turn');
const upgraded=C.actor({id:'c-162',hp:1000,dmg:100},{},{ids:['debuffs-inferno']});const inferno=C.skillAction(upgraded,card('enemy'),[],{baseDamage:100});assert.equal(inferno.statuses[0].key,'Inferno');assert.equal(inferno.statuses[0].value,15,'Confirmed tree coefficients reach the card Burn');

const king=card('new-king-of-curses-evolved-normal'),targets=[card('e1'),card('e2')];
const dismantle=C.skillAction(king,targets[0],targets,{baseDamage:100});assert.deepEqual(dismantle.hits.map(h=>h.damage),[25,25,25,25]);execute(king,dismantle);assert.equal(targets[0].hp,900);assert.equal(targets[1].hp,1000);
targets[0].hp=500;targets[1].shield=500;const cleave=C.skillAction(king,targets[0],targets,{baseDamage:100});execute(king,cleave);assert.equal(targets[0].hp,400);assert.equal(targets[1].hp,950);assert.equal(targets[1].shield,500,'Cleave pierce ignores shielding');

const pianist=card('new-abyssal-pianist-calamity',1000,200),active=card('active'),echoTarget=card('target');pianist.gear.crit=100;C.begin(active,dice);
let echoCalls=0;const echo=C.allyEchoes(active,[active,pianist],echoTarget,{landed:true},(a,t,hit)=>{echoCalls++;assert(hit.noCrit);assert(hit.noProcs);return C.skillHit(a,t,hit,()=>0);});assert.equal(echoTarget.hp,950,'The benched Pianist adds 25% of its own damage, without crit');assert.equal(echoCalls,1);assert.equal(echo[0].amount,50);
C.allyEchoes(active,[active,pianist],echoTarget,{landed:true},()=>{throw Error('No second Echo on multi-hit');});
active.hp=500;C.begin(active,dice);C.allyEchoes(active,[active,pianist],echoTarget,{landed:false});assert.equal(active.hp,580,'A missed normal action spends its Echo as 8% Max HP healing');
pianist.hp=0;C.begin(active,dice);assert.equal(C.allyEchoes(active,[active,pianist],echoTarget,{landed:false}).length,0,'A defeated Pianist stops contributing');

const demon=card('new-demon-king-calamity'),burning=card('foe');C.apply(burning,'Burn',3,10,demon);
let demonic=C.skillAction(demon,burning,[burning],{baseDamage:100});assert.equal(demonic.hits[0].damage,150);assert(!demon.once.has('demon-stun'),'Planning an attack is not a successful hit');execute(demon,demonic);assert(C.live(burning,'Stun'));assert(demon.skillState.burnConsumed.has(burning));
demonic=C.skillAction(demon,burning,[burning],{baseDamage:100});assert.equal(demonic.hits[0].damage,100,'Burn bonus is once per enemy');assert(!demonic.statuses.some(s=>s.key==='Stun'));
demon.hp=-10;C.apply(demon,'Silence',3);assert(C.skillFatal(demon,true));assert.equal(demon.hp,500);assert.deepEqual(demon.statuses,{});demon.hp=300;C.skillOnDefeat(demon,burning);assert.equal(demon.hp,450);demon.hp=-1;assert(!C.skillFatal(demon,true));C.resetBattle(demon);assert(C.skillFatal(demon,true),'The next floor refreshes revival');

const slayer=card('new-slayer-of-the-past-evolved-normal'),ally=card('ally'),enemy=card('enemy');
C.receive(slayer,100,dice);assert.equal(slayer.hp,915,'Evolved Slayer has 15% personal reduction');
C.skillAfterDamage(slayer,enemy,10,{damagingAbility:false,abilityKey:'spell'});assert.equal(slayer.skillState.deciphered.size,0);C.skillAfterDamage(slayer,enemy,10,{damagingAbility:true,abilityKey:'spell'});
assert.equal(C.skillDamageReduction(ally,[ally,slayer],{damagingAbility:false,abilityKey:'spell'}),1,'Normal attacks do not inherit the deciphered spell reduction');assert.equal(C.skillDamageReduction(ally,[ally,slayer],{damagingAbility:true,abilityKey:'spell'}),.8);
for(const key of ['spell2','spell3'])C.skillAfterDamage(slayer,enemy,10,{damagingAbility:true,abilityKey:key});assert.equal(C.basicDamage(slayer),130);const solved=C.skillAction(slayer,enemy,[enemy],{baseDamage:130});assert.equal(solved.hits[0].damage,195);execute(slayer,solved);assert.equal(C.skillAction(slayer,enemy,[enemy],{baseDamage:130}).replaceNormal,false);

const pillar=card('new-flame-pillar-normal');C.receive(pillar,600,dice);assert.equal(C.basicDamage(pillar),150);C.skillAfterHit(pillar,enemy,100);assert.equal(pillar.hp,420);pillar.hp=800;assert.equal(C.basicDamage(pillar),150,'The below-half power persists for this battle');C.resetBattle(pillar);assert.equal(C.basicDamage(pillar),100);

const northern=card('new-northern-blade-normal'),healer=card('healer');healer.hp=500;northern.opponents=[healer];healer.opponents=[northern];C.skillEntry(northern,healer);assert.equal(C.heal(healer,100),60);assert.equal(C.grantShield(healer,100),60);assert.equal(northern.skillState.severanceStored,80);const stored=C.skillAction(northern,healer,[healer],{baseDamage:100});assert.equal(stored.hits[0].damage,80);execute(northern,stored);assert.equal(northern.skillState.severanceStored,0);
const emperor=card('new-demonic-emperor-calamity'),beneficiary=card('beneficiary');emperor.hp=500;beneficiary.hp=500;beneficiary.opponents=[emperor];C.skillEntry(emperor,beneficiary);assert.equal(C.heal(beneficiary,100),65);assert.equal(emperor.hp,535);assert.equal(C.gainDamage(beneficiary,100),65);assert.equal(emperor.dmg,135);const next=card('next');C.skillOnDefeat(emperor,beneficiary,next);assert.equal(emperor.skillState.sealTarget,next);assert.equal(emperor.hp,635);

const ward=card('ward');ward.treeWardReduction=.15;C.receive(ward,100,dice);assert.equal(ward.hp,915,'Ward tree reduction affects received damage');const ignore=card('ignore');ignore.treeWardReduction=.15;ignore.shield=100;C.skillHit(overlord,ignore,{damage:100,ignoreDefenses:true,cannotMiss:true,noCrit:true,noProcs:true},dice);assert.equal(ignore.hp,900);assert.equal(ignore.shield,100);
const shielded=card('shielded'),striker=card('striker'),p2=card('c-220',1000,200);shielded.shield=200;const hit={damage:100,noProcs:true};assert.equal(C.skillHit(striker,shielded,hit,dice),0);assert.equal(hit.landed,true,'A hit absorbed by a shield still landed');C.allyEchoes(striker,[striker,p2],shielded,{landed:hit.landed},(a,t,h)=>C.skillHit(a,t,h,dice));assert.equal(shielded.shield,50,'Shield absorption still triggers the Pianist damage Echo');assert.equal(striker.hp,1000,'An absorbed hit does not become an erroneous miss heal');
const dodgePacket={damage:100,noProcs:true};C.skillHit(striker,card('walker',1000,10,'WALKER'),dodgePacket,()=>0);assert.equal(dodgePacket.landed,false,'Walker avoidance is a miss, unlike shielding');
assert.equal(C.cardSkill(card('new-fallen-angel-umbral')).implemented.length,0,'Unimplemented Joker probabilities are not advertised as executed');
console.log('Exact variants, four-target Atomic, normal-action Catalyst, Evolved King multi-hit/pierce, benched Pianist Echo, no crit/recursion, per-floor reset without healing, Demon revival, deciphered-ability-only protection, conditional life steal, real heal/shield interception and defense-bypass checks passed.');
