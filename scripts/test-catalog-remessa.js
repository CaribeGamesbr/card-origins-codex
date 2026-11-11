const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const catalog=require('../catalog.json'),baseline=require('./fixtures/catalog-remessa-2026-11-11-baseline.json'),byId=new Map(catalog.map(c=>[c.id,c]));
const canonical=x=>x&&typeof x==='object'?Array.isArray(x)?x.map(canonical):Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
assert.equal(byId.size,catalog.length,'Unique IDs must remain unique');
assert.equal(catalog.length,433);assert.equal(catalog.filter(c=>c.type==='card').length,394);assert.equal(catalog.filter(c=>c.type==='support').length,39);
assert.equal(catalog.filter(c=>c.type==='card'&&c.verified).length,50);assert.equal(catalog.filter(c=>c.type==='card'&&!c.verified).length,344);
assert.equal(Object.keys(baseline.hashes).length,423);
for(const [id,digest]of Object.entries(baseline.hashes))assert.equal(hash(byId.get(id)),digest,'Preserve all existing fields and histories: '+id);
const expected=[
 ['new-slayer-of-the-past-evolved-normal','SLAYER OF THE PAST (EVOLVED)','Normal','Imaginary',869,290],
 ['new-the-scarlet-catalyst-calamity','THE SCARLET CATALYST','Calamity','Fire',5056,1685],
 ['new-fallen-angel-umbral','FALLEN ANGEL','Umbral','Quantum',8914,2972],
 ['new-king-of-curses-evolved-normal','KING OF CURSES (EVOLVED)','Normal','Fire',2488,829],
 ['new-flame-pillar-normal','FLAME PILLAR','Normal','Fire',2115,705],
 ['new-northern-blade-normal','NORTHERN BLADE','Normal','Lightning',1945,648],
 ['new-demonic-emperor-calamity','DEMONIC EMPEROR','Calamity','Lightning',3758,1252],
 ['new-abyssal-pianist-calamity','ABYSSAL PIANIST','Calamity','Wind',4024,1341],
 ['new-demon-king-calamity','DEMON KING','Calamity','Quantum',5982,1994]
];
for(const [id,full,border,element,hp,dmg]of expected){
 const c=byId.get(id);assert(c,id);assert.equal(c.fullName,full);assert.equal(c.border,border);assert.equal(c.element,element);assert.equal(c.hp,hp);assert.equal(c.dmg,dmg);assert(c.verified&&c.effect&&c.effectEnglish&&c.ability);
 assert.equal(c.statsContext,'displayed-card');assert.equal(c.number,null);assert(!('trait'in c));assert(!('crit'in c));assert(!('critDmg'in c));
 assert.equal(catalog.filter(x=>x.type==='card'&&(x.fullName||x.name)===full&&x.border===border&&x.element===element).length,1,'Do not duplicate this variant');
 const bytes=fs.readFileSync(path.resolve(__dirname,'..',decodeURIComponent(c.image)));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),c.imageSha256,'Original image bytes');
}
const added=new Set(expected.map(x=>x[0]));assert.deepEqual(catalog.filter(c=>!baseline.hashes[c.id]&&c.id!=='c-80').map(c=>c.id).sort(),[...added].sort(),'Only nine new variants');
const overlord=byId.get('c-80');for(const key of ['id','name','fullName','border','element','number','variant','image'])assert.deepEqual(overlord[key],baseline.updatedExisting[key],'Keep the existing Delusional identity/source');
assert.deepEqual([overlord.hp,overlord.dmg,overlord.verified],[2209,838,true]);assert(overlord.effectEnglish.includes('1.5x DMG to all enemies'));assert(overlord.effectEnglish.includes('loses 40% Max HP'));
assert(byId.get('new-king-of-curses-evolved-normal').effectEnglish.includes('With The Guardian of Hell support card'));assert(!catalog.some(c=>c.name==='THE GUARDIAN OF HELL'),'Do not identify or create a support from a discarded thumbnail');
assert(byId.get('new-slayer-of-the-past-evolved-normal').effectEnglish.includes('After surviving'));assert(byId.get('new-abyssal-pianist-calamity').effectEnglish.includes('on the field or benched'));
const browser={window:{}};vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../data.js'),'utf8'),browser);assert.equal(JSON.stringify(browser.window.CARDO_DATA),JSON.stringify(catalog));
console.log('Nine exact variants, original image hashes, 423 prior records, existing Delusional identity, unknown trait/support exclusion and browser data parity passed.');
