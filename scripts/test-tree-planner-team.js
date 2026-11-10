const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const T=require('../tree-planner-team.js');
const profile={team:[{name:'A',element:'Wind',hp:10,dmg:2},{name:'B',element:'Ice',hp:20,dmg:3},{name:'C',element:'Ice',hp:30,dmg:4},{name:'D',element:'Fire',hp:40,dmg:5}],supports:['a','b','c','d'],budget:80,owned:['keep']};
let s=T.summary(profile.team);assert.equal(s.hp,100);assert.equal(s.dmg,14);assert.equal(s.hpKnown,4);assert.deepEqual(s.links.map(l=>l.name),['Whiteout','Cryostasis Link','Thermal Shock']);assert.deepEqual(s.resonance,[0,6,6,0]);
const original=JSON.stringify(profile);assert.equal(T.moveSlots(profile,0,-1),false);assert.equal(T.moveSlots(profile,3,1),false);assert.equal(T.moveSlots(profile,0,2),false);assert.equal(JSON.stringify(profile),original);
assert.ok(T.moveSlots(profile,1,1));assert.deepEqual(profile.team.map(c=>c.name),['A','C','B','D']);assert.deepEqual(profile.supports,['a','c','b','d']);assert.equal(profile.budget,80);assert.deepEqual(profile.owned,['keep']);assert.ok(T.moveSlots(profile,2,-1));assert.equal(JSON.stringify(profile),original);
const incomplete=[profile.team[0],{name:'Unknown',element:'Unknown',hp:null,dmg:null},profile.team[2],profile.team[3]];s=T.summary(incomplete);assert.equal(s.hp,80);assert.equal(s.hpKnown,3);assert.equal(s.dmgKnown,3);assert.equal(s.links[0],null);assert.equal(s.links[1],null);assert.deepEqual(s.resonance,[0,0,0,0]);
const catalog=[{id:'s-366',type:'support'},{id:'normal',type:'support'},{id:'card',type:'card'}];assert.deepEqual(T.normalizeSupports(null,catalog),[null,null,null,null]);assert.deepEqual(T.normalizeSupports(['s-366','s-366','card','missing'],catalog),['s-366',null,null,null]);assert.deepEqual(T.normalizeSupports(['normal','normal'],catalog),['normal','normal',null,null]);
// Keep circuit labels consistent with the existing panel, without adding rules.
const panel=fs.readFileSync(require.resolve('../infinite-panel.js'),'utf8'),literal=panel.match(/const circuitRows=(\[[^;]+\]);/)[1],rows=vm.runInNewContext(literal);
for(const [a,b,name]of rows){assert.equal(T.connection({element:a},{element:b}).name,name);assert.equal(T.connection({element:b},{element:a}).name,name)}
assert.equal(T.connection({element:'Unknown'},{element:'Ice'}),null);
console.log('Planner team: paired reordering, profile preservation, partial totals, adjacent circuits and support migration passed.');
