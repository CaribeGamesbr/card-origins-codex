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
console.log('Planner map: all seven branches, overview, hidden nodes, source-only links and data preservation passed.');
