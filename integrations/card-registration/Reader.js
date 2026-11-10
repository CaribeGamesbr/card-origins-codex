/* Local image reading. No image upload, model key or inferred card attributes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CardPrintReader=api;})(typeof window!=='undefined'?window:this,function(){
'use strict';
const VERSION='1.0.0';
const BORDERS=['Normal','Calamity','Umbral','Astral','Paradox','Origin'];
const ELEMENTS=['Fire','Ice','Lightning','Wind','Quantum','Imaginary','Physical'];
const FIELDS=['type','kind','name','border','element','hp','dmg','variant','number','pack','ability','effect','effectEnglish'];
function clean(s){return String(s||'').replace(/[\u0000-\u0008]/g,'').trim();}
function enumValue(text,choices){const found=choices.filter(v=>new RegExp('\\b'+v+'\\b','i').test(text));return found.length===1?found[0]:'Unknown';}
function stat(text,label){
 const re=new RegExp('\\b'+label+'\\s*[:;]?\\s*([0-9]+(?:[,. ][0-9]{3})*)(?![0-9])','gi');
 const values=[...String(text).matchAll(re)].map(m=>m[1].replace(/[, .]/g,'')).filter(v=>Number.isSafeInteger(Number(v))&&Number(v)>0&&Number(v)<=1e11);
 return new Set(values).size===1?values[0]:'';
}
function lines(part){return (part.lines||String(part.text||'').split(/\r?\n/).map(text=>({text,confidence:part.confidence??0}))).map(l=>({...l,text:clean(l.text)})).filter(l=>l.text);}
function parse(parts){
 const header=parts.header||{},body=parts.body||{},footer=parts.footer||{};
 const h=lines(header),b=lines(body),ht=h.map(l=>l.text).join('\n'),ft=String(footer.text||'');
 const support=/\bSUPPORT\b/i.test(ht)||(/\b(?:equipped|supported)\s+card\b/i.test(body.text||'')&&/\d\s*\/\s*\d/.test(ht)),kind=enumValue(ht,['Buff','Heal','Shield','Debuff','Revive']);
 const fields={type:support?'support':/\b(?:HP|DMG)\s*[:;]/i.test(ft)?'card':'',kind:kind,name:'',border:enumValue(ht,BORDERS),element:enumValue(ht,ELEMENTS),hp:stat(ft,'HP'),dmg:stat(ft,'DMG'),variant:'',number:'',pack:'',ability:'',effect:'',effectEnglish:''};
 const isMeta=s=>BORDERS.concat(ELEMENTS,['Support','Buff','Heal','Shield','Debuff','Revive']).some(v=>new RegExp('^\\W*'+v+'\\W*$','i').test(s))||/\bPACK\b|#\s*\d|\b(?:HP|DMG)\s*:/i.test(s);
 const borderAt=h.findIndex(l=>enumValue(l.text,BORDERS)!=='Unknown');
 const names=(parts.name?lines(parts.name):h).filter((l,i)=>(parts.name||borderAt<0||i<borderAt)&&!isMeta(l.text)&&l.confidence>=45&&/[A-Za-z]{3}/.test(l.text)&&(!l.relativeY||l.relativeY<.55));
 if(names.length){fields.name=names[names.length-1].text.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9)]+$/g,'');if(fields.name.length>100)fields.name='';}
 const pack=h.find(l=>/^[A-Z][A-Z\s'-]*\bPACK\b\W*$/i.test(l.text)&&l.confidence>=45);if(pack)fields.pack=pack.text.replace(/[^A-Za-z ]/g,'').trim();
 const number=ht.match(/#\s*(\d{1,6})\s*\/\s*\d+/);if(number)fields.number=number[1];
 const variants=[...fields.name.matchAll(/\((Cursed|Mutated|Blessed|Shiny|Ascended)\)/gi)].map(m=>m[1]);fields.variant=variants.join(', ');
 const titles=b.map((l,i)=>({l,i})).filter(({l})=>l.confidence>=45&&l.text.replace(/[^A-Z]/g,'').length>=6&&!/[a-z]/.test(l.text)&&!isMeta(l.text)&&l.text.length<=160);
 const titleAt=titles.length?titles.sort((a,b)=>(b.l.height||0)-(a.l.height||0))[0].i:-1;
 if(titleAt>=0){
  fields.ability=b[titleAt].text.replace(/^[^A-Za-z]+|[^A-Za-z0-9]+$/g,'');
  const desc=b.slice(titleAt+1).filter(l=>!/^\s*(?:HP|DMG)\s*[:;]/i.test(l.text));
  if(desc.length&&desc.some(l=>l.confidence>=40)){fields.effect=desc.map(l=>l.text).join(' ').replace(/\s+/g,' ').trim().slice(0,6000);fields.effectEnglish=fields.effect;}
 }
 const raw=[['Nome',parts.name?.text||''],['Identificação',ht],['Habilidade',b.map(l=>l.text).join('\n')],['Atributos',ft]].map(([label,t])=>label+':\n'+clean(t)).join('\n\n');
 const pending=(support?['name','ability','effect']:['name','border','element','hp','dmg','ability','effect']).filter(k=>!fields[k]||fields[k]==='Unknown');
 return {fields,raw,pending,version:VERSION};
}
function canReplace(current,initial,previous){return current===initial&&(current===''||current==='Unknown'||current===previous);}
function defaultRect(width,height){return width/height>1.7?{x:.38,y:.25,w:.24,h:.61}:{x:0,y:0,w:1,h:1};}
function validRect(r){return !!r&&['x','y','w','h'].every(k=>Number.isFinite(r[k]))&&r.x>=0&&r.y>=0&&r.w>.02&&r.h>.02&&r.x+r.w<=1.001&&r.y+r.h<=1.001;}
let loader=null,worker=null,runId=0;
function load(){if(typeof Tesseract!=='undefined')return Promise.resolve();if(!loader)loader=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>{script.remove();loader=null;reject(Error('Não foi possível carregar o leitor. Confira a internet ou preencha os campos manualmente.'));};document.head.append(script);});return loader;}
async function image(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);if(img.naturalWidth<80||img.naturalHeight<80){reject(Error('O print é pequeno demais. Envie uma imagem maior.'));return}resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Não foi possível abrir esta imagem. Use PNG, JPG ou WebP.'));};img.src=url;});}
function canvas(img,rect,region){
 const sx=(rect.x+region.x*rect.w)*img.naturalWidth,sy=(rect.y+region.y*rect.h)*img.naturalHeight,sw=rect.w*region.w*img.naturalWidth,sh=rect.h*region.h*img.naturalHeight;
 const scale=Math.min(4,1400/sw),c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,sx,sy,sw,sh,0,0,c.width,c.height);
 if(region.mode){const pic=ctx.getImageData(0,0,c.width,c.height),source=new Uint8ClampedArray(pic.data),radius=Math.max(2,Math.round(scale*2));for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,r=source[i],g=source[i+1],b=source[i+2];let ink=false;if(region.mode==='stats')ink=(g>120&&g>r*1.25&&g>b*1.1)||(r>135&&r>g*1.3&&r>b*1.15);else if(Math.min(r,g,b)>180&&Math.max(r,g,b)-Math.min(r,g,b)<55){for(const [dx,dy] of [[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,-radius],[radius,-radius],[-radius,radius]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<c.width&&yy<c.height){const j=(yy*c.width+xx)*4;if(Math.max(source[j],source[j+1],source[j+2])<90){ink=true;break;}}}}pic.data[i]=pic.data[i+1]=pic.data[i+2]=ink?0:255;pic.data[i+3]=255;}ctx.putImageData(pic,0,0);}
 return c;
}
function output(data,height){const out=[];for(const block of data.blocks||[])for(const p of block.paragraphs||[])for(const l of p.lines||[])out.push({text:l.text,confidence:l.confidence??data.confidence??0,relativeY:l.bbox?l.bbox.y0/height:0,height:l.bbox?l.bbox.y1-l.bbox.y0:0});return {text:data.text,confidence:data.confidence,lines:out.length?out:undefined};}
async function cancel(){runId++;const old=worker;worker=null;if(old)try{await old.terminate();}catch(e){} }
async function digest(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function knownPrint(file,img){
 try{const response=await fetch('https://raw.githubusercontent.com/CaribeGamesbr/card-origins-codex/main/catalog.json?reader='+Date.now(),{cache:'no-store'});if(!response.ok)return null;const records=await response.json();if(!Array.isArray(records))return null;const rawHash=await digest(await file.arrayBuffer());let match=records.find(c=>c.verified&&c.imageSha256===rawHash);
 if(!match&&records.some(c=>c.imagePixelSha256)){const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const pixelHash=await digest(ctx.getImageData(0,0,c.width,c.height).data.buffer);match=records.find(r=>r.verified&&r.imagePixelSha256===pixelHash);c.width=1;c.height=1;}
 if(!match)return null;const fields={type:match.type,kind:match.supportRole||(['Buff','Heal','Shield','Debuff','Revive'].includes(match.kind)?match.kind:'Unknown'),name:match.name,border:match.border||match.rarity||'Unknown',element:match.element||'Unknown',hp:match.hp==null?'':String(match.hp),dmg:match.dmg==null?'':String(match.dmg),variant:(match.variant||[]).join(', '),number:match.number==null?'':String(match.number),pack:match.pack||'',ability:match.ability||'',effect:match.effect||'',effectEnglish:match.effectEnglish||''};return {fields,pending:[],knownMatch:true,raw:'Print idêntico ao já transcrito e confirmado no catálogo: '+(match.fullName||match.name)+' ('+(match.border||match.kind)+'). Os dados foram recuperados desse registro, sem estimar atributos.',version:VERSION};
 }catch(e){return null;}
}
async function read(file,rect,onProgress){
 await cancel();const mine=runId;const img=await image(file);onProgress('Conferindo o print',0);const known=await knownPrint(file,img);if(mine!==runId)throw Error('Leitura substituída por outro print.');if(known)return {...known,rect:rect||defaultRect(img.naturalWidth,img.naturalHeight)};await load();if(mine!==runId)throw Error('Leitura substituída por outro print.');
 rect=rect||defaultRect(img.naturalWidth,img.naturalHeight);if(!validRect(rect))throw Error('Selecione uma área válida da carta.');
 let phase='Preparando leitor';onProgress(phase,0);
 const active=await Tesseract.createWorker('eng',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',langPath:'https://tessdata.projectnaptha.com/4.0.0',logger:m=>{if(mine===runId)onProgress(phase,Math.round((m.progress||0)*100));}});
 if(mine!==runId){await active.terminate();throw Error('Leitura substituída.');}worker=active;
 const parts={},jobs=[['name','Lendo nome',{x:0,y:0,w:1,h:.075,mode:'white'},'6'],['header','Lendo identificação',{x:.55,y:.072,w:.43,h:.13},'6'],['body','Lendo habilidade',{x:.015,y:.46,w:.97,h:.48,mode:'white'},'6'],['footer','Lendo HP e DMG',{x:.035,y:.94,w:.93,h:.06,mode:'stats'},'11']];
 try{for(const [key,label,region,psm] of jobs){if(mine!==runId)throw Error('Leitura substituída.');phase=label;onProgress(phase,0);await active.setParameters({tessedit_pageseg_mode:psm,user_defined_dpi:'150'});const c=canvas(img,rect,region),result=await active.recognize(c,{}, {text:true,blocks:true});parts[key]=output(result.data,c.height);c.width=1;c.height=1;}
  if(mine!==runId)throw Error('Leitura substituída.');return {...parse(parts),rect};
 }finally{if(worker===active)worker=null;await active.terminate();}
}
return {VERSION,FIELDS,parse,stat,canReplace,defaultRect,validRect,image,read,cancel};
});
