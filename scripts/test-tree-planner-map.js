const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {layout}=require('../tree-planner-map.js');
const box={window:{}};
for(const file of ['skill-data.js','skill-tree-topology.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../'+file),'utf8'),box);
const data=box.window.CARDO_SKILLS,topology=box.window.CARDO_SKILL_TOPOLOGY;
const original=JSON.stringify({data,topology});
for(const single of [true,false])for(const category of data.categories){
 const result=layout(data,topology,category.name,single);
 const expected=new Set(),edges=new Set();
 for(const cat of data.categories){
  if(single&&cat.name!==category.name)continue;
  const nodes=data.nodes.filter(n=>n.path===cat.name),spec=topology[cat.name],hidden=new Set(spec.hidden||[]);
  nodes.forEach((n,i)=>{if(!hidden.has(i))expected.add(n.id)});
  for(const [a,b]of spec.edges||[])if(!hidden.has(a)&&!hidden.has(b))edges.add(nodes[a].id+'>'+nodes[b].id);
 }
 assert.deepEqual(new Set(result.positions.keys()),expected,'Every visible registered node must remain reachable');
 assert.deepEqual(new Set(result.links.map(l=>l.from+'>'+l.to)),edges,'Only source-drawn links may be shown');
 for(const p of result.positions.values())assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
}
assert.equal(JSON.stringify({data,topology}),original,'Layout must not mutate personal data or source topology');
// Deferred scripts run while readyState is interactive. Mount only after the
// topology and the remaining deferred dependencies have finished loading.
let reads=0,readyHandler=null;
vm.runInNewContext(fs.readFileSync(require.resolve('../tree-planner-ui.js'),'utf8'),{
 window:{CARDO_SKILLS:data,CARDO_TREE_PLANNER:{},CARDO_DATA:[1,2,3,5].map(i=>({id:'c-'+i,type:'card'}))},
 localStorage:{getItem:()=>null},
 document:{readyState:'interactive',getElementById:()=>{reads++;return null},addEventListener:(name,fn)=>{if(name==='DOMContentLoaded')readyHandler=fn}}
});
assert.equal(reads,0,'Do not initialize a partial map before deferred scripts finish');
assert.equal(typeof readyHandler,'function');readyHandler();assert.equal(reads,1);
console.log('Planner map: all seven branches, overview, hidden nodes, source-only links and data preservation passed.');
