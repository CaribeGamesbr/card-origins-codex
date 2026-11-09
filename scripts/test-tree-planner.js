const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const P=require('../tree-planner-engine.js');
const box={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../skill-data.js'),'utf8'),box);
const nodes=JSON.parse(JSON.stringify(box.window.CARDO_SKILLS.nodes));
const team=[{name:'A',element:'Lightning',border:'Astral',role:'damage'},{name:'B',element:'Fire',border:'Umbral',role:'defense'},{name:'C',element:'Imaginary',border:'Astral',role:'defense'},{name:'Healer',element:'Ice',border:'Unknown',role:'heal'}];
for(const budget of [0,1,2,5,20,80,500]){
 const r=P.recommend(nodes,{team,budget,reserve:Math.floor(budget/4)});
 for(const p of r.plans){assert.ok(p.spent<=budget-r.reserve);assert.equal(p.unspent,budget-p.spent);assert.equal(p.spent,p.items.reduce((s,x)=>s+x.node.cost,0));assert.equal(new Set(p.items.map(x=>x.node.id)).size,p.items.length);assert.ok(p.items.every(x=>P.knownEffect(x.node)));assert.ok(p.items.every(x=>!x.node.id.endsWith('-unbound')||x.node.id==='infinite-'+p.path+'-unbound'));}
}
const eligible=['infinite-endless-vigor','border-stats-astral-i'];
const strict=P.recommend(nodes,{team,budget:80,strict:true,available:eligible,owned:['infinite-endless-vigor']});
assert.ok(strict.plans.every(p=>p.items.every(x=>eligible.includes(x.node.id)&&x.node.id!=='infinite-endless-vigor')));
assert.equal(P.recommend(nodes,{team,budget:80,strict:true}).best.spent,0);
const normal=P.recommend(nodes,{team,budget:80});assert.ok(normal.best.items.some(x=>x.node.id==='border-stats-astral-i'));assert.ok(normal.best.items.every(x=>!x.node.id.startsWith('traits-')));
assert.ok(normal.plans.every(p=>p.items.every(x=>!['debuffs-pyre','debuffs-unquenchable','debuffs-overcharge','debuffs-electrocution','debuffs-rot'].includes(x.node.id))));
const mastered=P.recommend(nodes,{team,budget:500,owned:['elements-fire-mastery']});assert.ok(mastered.best.items.some(x=>x.node.id==='debuffs-pyre'));
const shockTeam=JSON.parse(JSON.stringify(team));shockTeam[0].effect='Attacks apply Shock';assert.ok(P.recommend(nodes,{team:shockTeam,budget:500}).best.items.some(x=>x.node.id==='debuffs-overcharge'));
assert.ok(!P.knownEffect(nodes.find(n=>n.id==='infinite-infinite-origin')));
assert.throws(()=>P.recommend(nodes,{team,budget:-1}));assert.throws(()=>P.recommend(nodes,{team,budget:2.5}));assert.throws(()=>P.recommend(nodes,{team,budget:10,reserve:11}));assert.throws(()=>P.recommend(nodes,{team:team.slice(1),budget:10}));assert.throws(()=>P.recommend(nodes,{team,budget:80,path:'fake'}));
// Check the optimizer against exhaustive subsets, including an attractive costly item.
const items=[{node:{cost:3},value:8},{node:{cost:2},value:6},{node:{cost:4},value:11},{node:{cost:7},value:18}];
for(let budget=0;budget<=16;budget++){let expected=0;for(let mask=0;mask<(1<<items.length);mask++){let cost=0,value=0;items.forEach((x,i)=>{if(mask&(1<<i)){cost+=x.node.cost;value+=x.value}});if(cost<=budget)expected=Math.max(expected,value)}assert.equal(P.pack(items,budget).value,expected)}
console.log('Tree planner: budget, reserve, owned/available state, Path exclusivity, unknown effects and optimal packing passed.');
