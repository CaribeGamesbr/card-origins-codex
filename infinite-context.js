/* Pure snapshot of the saved skill simulation; never reads the friend's planner. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_COMBAT_CONTEXT=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const KEY='card-origins-codex-skill-progress-v1';
function tree(data,stored,enabled=true){
 const nodes=data?.nodes||[],original=new Set(nodes.filter(n=>n.status==='learned').map(n=>n.id)),selected=new Set(original);
 let balance=Math.max(0,(+data?.total||nodes.length)-(+data?.countLearned||original.size));
 if(stored?.version===1&&Array.isArray(stored.purchased)){balance+=Number.isSafeInteger(stored.added)?Math.max(0,Math.min(100000,stored.added)):0;const seen=new Set();for(const id of stored.purchased.slice(0,146)){const n=nodes.find(n=>n.id===id),cost=+n?.cost;if(!n||original.has(id)||seen.has(id)||!Number.isSafeInteger(cost)||cost<=0||cost>balance)continue;seen.add(id);selected.add(id);balance-=cost;}}
 const inferred=n=>/inferid|deduz|confirmando qual|nome n.o confirmado/i.test((n.notes||'')+' '+n.name);
 const excluded=nodes.filter(n=>selected.has(n.id)&&inferred(n));
 const active=enabled?nodes.filter(n=>selected.has(n.id)&&!inferred(n)):[];
 return {source:enabled?'Minha Skill Tree salva (simulação)':'Sem árvore',ids:active.map(n=>n.id),nodes:active.map(n=>({id:n.id,name:n.name,path:n.path,effect:n.effect})),excluded:excluded.map(n=>n.name),displayedStats:true};
}
function capture(data,storage,enabled=true){let saved;try{saved=JSON.parse(storage.getItem(KEY)||'null')}catch{}return tree(data,saved,enabled);}
return {KEY,tree,capture};
});
