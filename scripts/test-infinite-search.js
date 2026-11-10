const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../infinite-engine.js'),card=(id,hp,dmg,name=id)=>({id,type:'card',name,hp,dmg,element:'Unknown'}),team=[0,1,2,3].map(i=>card('test-'+i,100000,100000));
const base={from:1,to:1,baseFloor:1,enemyHp:100,enemyDmg:1,growth:0,enemiesPerFloor:4,team,supports:[],path:'erudition',seed:261};
const area=E.simulate(base),single=E.simulate({...base,path:'destruction'});
assert.equal(area.clear,true);assert.equal(area.wavesCleared,1);assert.equal(area.enemiesDefeated,4);assert.equal(area.turns,1,'Recorded Erudition splash can defeat all three waiting enemies without phantom turns');assert(single.turns>=4);assert.equal(single.enemiesDefeated,4);assert.equal(new Set(area.team).size,4);
const weak=[0,1,2,3].map(i=>card('weak-'+i,1,1));const loss=E.assess({...base,team:weak,path:'destruction',enemyHp:1000000,enemyDmg:1000000},12);assert.equal(loss.clearRate,0);assert.equal(loss.clearActionsPerWave,null);assert.equal(loss.avgWaves,0);assert.equal(loss.avgKills,0);assert.equal(loss.avgKos,4);
const partial=E.simulate({...base,team:[0,1,2,3].map(i=>card('partial-'+i,1,70)),path:'destruction',enemyDmg:100000});assert(partial.enemiesDefeated>0&&partial.enemiesDefeated<4);assert.equal(partial.wavesCleared,0);assert.equal(partial.floorReached,0,'Partial kills do not count as a completed wave');
const stats={error:null,clearRate:1,avgFloor:100,avgKills:40,avgWaves:10,avgKos:0,avgHealth:1,avgTurns:40,clearActionsPerWave:4};
assert(E.compareStats({...stats,avgFloor:110,clearRate:0},stats,'endurance')<0,'Distance is the first endurance criterion');
assert(E.compareStats({...stats,clearActionsPerWave:2},stats,'rush')<0,'Equal clear rates prefer fewer actions');
assert(E.compareStats({...stats,clearRate:0,avgTurns:1,clearActionsPerWave:null},stats,'rush')>0,'Dying quickly is not good rush');
assert(E.compareStats({...stats,clearRate:.5,clearActionsPerWave:1},stats,'rush')>0,'Reliability precedes speed');
assert(E.compareStats({...stats,clearActionsPerWave:2},{...stats,clearActionsPerWave:null},'rush')<0);
const endurance=E.searchScenario({from:261,to:300,enemiesPerFloor:1}),rush=E.searchScenario({from:261,objective:'rush'});assert.equal(endurance.to,1260);assert.equal(endurance.enemiesPerFloor,4);assert.equal(rush.to,270);assert.equal(rush.enemiesPerFloor,4);assert.equal(E.searchScenario({from:19999,objective:'rush'}).to,20000);
const capped=E.simulate({...base,...E.searchScenario({from:19999}),baseFloor:19999});assert.equal(capped.floorReached,20000);assert.equal(capped.wavesCleared,2);assert.equal(capped.enemiesDefeated,8);
const thousands=E.simulate({...base,to:10000});assert.equal(thousands.floorReached,1000);assert.equal(thousands.wavesCleared,1000,'Safety ceiling is explicit and bounded');
assert.deepEqual(E.simulate(base),E.simulate(base),'Fixed seed reproduces combat');
const roster=JSON.parse(fs.readFileSync(path.join(__dirname,'../catalog.json'),'utf8')).filter(c=>c.type==='card'&&c.hp>0&&c.dmg>0),before=JSON.stringify(roster);
for(const objective of ['endurance','rush']){const cfg={objective,from:261,maxTests:50},search=E.makeSearch(roster,cfg);const r=search.step(50);assert.equal(r.done,true);assert.equal(r.checked,50);assert(r.evaluated>0);assert(r.finalists.length>0&&r.finalists.length<=12);assert.equal(r.scenario.enemiesPerFloor,4);assert.equal(r.scenario.to,objective==='rush'?270:1260);assert.equal(Object.values(r.paths).filter(p=>p.trials>0).length,7);
 for(const c of r.finalists){assert(E.valid(c.team));assert.equal(c.supports.length,4);for(const id of ['s-366','s-372','s-374'])assert(c.supports.filter(s=>s===id).length<=1);assert(c.supports.every(s=>s==null||E.SUPPORT_IDS.includes(s)));}
 const stopped=E.makeSearch(roster,cfg);stopped.step(3);stopped.stop();assert.equal(stopped.step(10).checked,3);assert.equal(stopped.result.stopped,true);}
assert.equal(JSON.stringify(roster),before,'Search never mutates card records');assert(E.makeSearch(roster.slice(0,3)).step().error);
console.log('Endurance/rush ranking, fast-loss rejection, 4-enemy waves, multi-target splash, kill counts, ceilings, seeds, finalist diversity, stop and catalog preservation passed.');
