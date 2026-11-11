const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../card-roles.js'),catalog=require('../catalog.json'),byId=new Map(catalog.map(c=>[c.id,c])),before=JSON.stringify(catalog);
const helpers=R.select(catalog),ids=helpers.map(c=>c.id).sort();
assert.equal(helpers.length,53);
assert.equal(R.select(catalog,{audience:'known'}).length,394);
assert.deepEqual(R.select(catalog,{audience:'pending'}).map(c=>c.id),['c-270']);
assert.deepEqual(R.select(catalog,{role:'buff'}).map(c=>c.id).sort(),['new-the-grinning-spectator-normal','c-216','c-43'].sort());
assert.deepEqual(R.select(catalog,{offField:true}).map(c=>c.id).sort(),['c-352','c-260','c-216','c-43','c-220','c-258','new-abyssal-pianist-calamity'].sort());
assert.equal(R.select(catalog,{audience:'known',offField:true}).length,11);
for(const id of ['c-52','c-232','c-319','c-343','c-220','c-233','c-42','c-188','c-14','c-227','new-emy-evolved-calamity'])assert(R.matches(byId.get(id),'heal'),id+' is a confirmed team healer');
for(const id of ['c-18','c-212','c-141','c-24','c-71','c-172','c-167','c-33','c-99'])assert(R.matches(byId.get(id),'protection'),id+' protects an ally');
for(const id of ['c-278','c-107','c-268','c-50'])assert(!R.matches(byId.get(id),'allies'),'Unevolved variants must not inherit ally effects');
assert(!R.classify(byId.get('c-52')).offField,'An ally target alone does not prove off-field execution');
assert(!R.matches(byId.get('c-6'),'allies'),'Off-field preparation of a personal attack is not an ally buff');
assert(R.matches(byId.get('c-44'),'offfield'));assert(R.matches(byId.get('c-44'),'indirect'));
for(const id of ['c-285','c-117','c-128','c-258']){assert(R.matches(byId.get(id),'assist'));assert(!R.matches(byId.get(id),'buff'));}
for(const id of ['c-1','c-2','new-two-timing-pro-astral']){assert(R.classify(byId.get(id)).roles.includes('tank'));assert(!R.matches(byId.get(id),'heal'));assert(!R.matches(byId.get(id),'allies'),'Self healing is not team healing');}
for(const id of ['new-no-longer-human-umbral','new-no-longer-human-cursed-umbral','c-351','c-353'])assert(!R.matches(byId.get(id),'buff'),'Dispel and copying to oneself are not ally attribute buffs');
assert(R.classify(byId.get('new-the-grinning-spectator-normal')).timing.includes('maior DMG'));assert(R.classify(byId.get('new-realitys-worst-duet-umbral')).timing.includes('próxima ação normal'));
assert.equal(R.classify({...byId.get('c-352'),effect:'Texto alterado sem revisão.'}).reviewed,false,'A changed skill must invalidate old roles');
assert.equal(R.classify({...byId.get('c-352'),id:'future-card'}).reviewed,false,'Do not transfer a role to an unseen variant');
assert.equal(R.classify({...byId.get('c-352'),verified:false}).reviewed,true,'Image role review is separate from full statistics verification');assert.equal(R.matches(catalog.find(c=>c.type==='support'),''),false);
assert.equal(catalog.filter(c=>c.type==='card'&&c.verified).length,50,'Only nine new cards and the visually confirmed c-80 were transcribed');
assert.equal(catalog.filter(c=>c.type==='card'&&!c.verified).length,344);
assert.equal(R.classify({...byId.get('c-216'),image:'new-unreviewed-image.png'}).reviewed,false);
assert.equal(R.classify({...byId.get('c-216'),border:'Astral'}).reviewed,false);
assert.equal(R.classify({...byId.get('c-216'),fullName:'Different variant'}).reviewed,false);
const audit=require('../docs/CARD_ROLE_REVIEW.json');assert.equal(audit.cards.length,394);assert.equal(new Set(audit.cards.map(c=>c.id)).size,394);for(const row of audit.cards){assert.match(row.blobSha,/^[0-9a-f]{40}$/);assert.equal(row.image,byId.get(row.id).image);assert.deepEqual(R.classify(byId.get(row.id)).roles,row.roles);}
assert(R.select(catalog,{audience:'known',query:'cursed'}).some(c=>c.id==='new-no-longer-human-cursed-umbral'));
assert.equal(R.select(catalog,{query:'PEAK'}).length,2);assert.equal(R.select(catalog,{query:'nome inexistente'}).length,0);
for(const id of ['c-198','c-170','c-194','c-161','c-8']){assert(R.matches(byId.get(id),'assist'));assert(!R.matches(byId.get(id),'buff'));assert(!R.classify(byId.get(id)).offField);}

for(const id of ['new-slayer-of-the-past-evolved-normal','new-abyssal-pianist-calamity'])assert(R.matches(byId.get(id),'allies'));
assert(R.matches(byId.get('new-slayer-of-the-past-evolved-normal'),'protection'));assert(!R.matches(byId.get('c-137'),'allies'),'Do not transfer the Evolved decipher to base Slayer');
assert(!R.classify(byId.get('new-slayer-of-the-past-evolved-normal')).offField);
assert(!R.matches(byId.get('new-king-of-curses-evolved-normal'),'buff'));
assert.equal(R.classify(byId.get('c-80')).reviewed,true);assert.deepEqual([byId.get('c-80').hp,byId.get('c-80').dmg],[2209,838]);

const team=['c-3','new-no-longer-human-umbral','c-1','c-2'],original=team.slice(),supportTeam=['s-371','s-372','s-365','s-366'],progress={purchased:['infinite-second-wind'],added:80},unchanged=JSON.stringify({team,supportTeam,progress});
const placed=R.place(team,'new-the-grinning-spectator-normal',1,catalog);assert.deepEqual(placed,['c-3','new-the-grinning-spectator-normal','c-1','c-2']);assert.deepEqual(team,original);
assert.throws(()=>R.place(team,'c-1',1,catalog),/já está no slot 3/);assert.deepEqual(R.place(team,'c-1',2,catalog),team);
assert.throws(()=>R.place(team,'s-371',0,catalog),/não encontrada/);assert.throws(()=>R.place(team,'invalid',0,catalog),/não encontrada/);for(const n of [-1,4,1.5])assert.throws(()=>R.place(team,'c-1',n,catalog),/quatro slots/);
assert.equal(JSON.stringify({team,supportTeam,progress}),unchanged);assert.equal(JSON.stringify(catalog),before,'Role filtering and slot choice preserve the catalog');
const browser={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../card-roles.js'),'utf8'),browser);assert.deepEqual(Array.from(browser.window.CARDO_CARD_ROLES.select(catalog).map(c=>c.id)).sort(),ids);
const index=fs.readFileSync(require.resolve('../index.html'),'utf8');assert(index.indexOf('src="card-roles.js')<index.indexOf('src="app.js'));assert(index.includes('id="page-roles"'));assert(index.includes('data-nav="roles"'));
console.log('394 image reviews, 53 team helpers, 11 explicit off-field effects, variant/source guards, self-heal separation, pending statistics, filters and catalog/team/support/tree preservation passed.');
