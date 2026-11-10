(function(){
'use strict';
const reader=CardPrintReader,fileInput=document.getElementById('print'),status=document.getElementById('ocrStatus'),raw=document.getElementById('ocrRaw'),retry=document.getElementById('ocrRetry'),cropButton=document.getElementById('ocrCropButton'),dialog=document.getElementById('ocrCrop'),cropCanvas=document.getElementById('ocrCanvas'),confirm=form.elements.confirmed;
let typeTouched=false;
let epoch=0,reading=false,lastAuto={},rect=null,cropImage=null,cropRect=null,dragStart=null;
const labels={name:'nome',border:'borda',element:'elemento',hp:'HP',dmg:'DMG',ability:'nome da habilidade',effect:'descrição'};
function syncType(){const support=form.elements.type.value==='support';document.getElementById('supportKindLabel').hidden=!support;for(const k of ['hp','dmg','element','variant','pack','number']){const f=form.elements[k];f.disabled=support;f.closest('label').hidden=support;}document.getElementById('destination').disabled=support;document.getElementById('slot').disabled=support;if(support)document.getElementById('destination').value='catalog';}
form.elements.type.addEventListener('change',()=>{typeTouched=true;reviewReset();syncType();});
function announce(text,error){status.textContent=text;status.classList.toggle('error',!!error);}
function reviewReset(){confirm.checked=false;}
function controls(){document.getElementById('save').disabled=reading;retry.disabled=!fileInput.files.length||reading;cropButton.disabled=!fileInput.files.length||reading;confirm.disabled=reading;}
function cancel(){epoch++;reading=false;reader.cancel();controls();}
async function start(){
 const file=fileInput.files[0];if(!file||busy||currentResult)return;
 const mine=++epoch,initial=Object.fromEntries(reader.FIELDS.map(k=>[k,form.elements[k].value]));reading=true;reviewReset();controls();announce('Preparando a leitura do print… Na primeira vez, o leitor precisa ser baixado.');
 let timer;
 try{
  const data=await Promise.race([reader.read(file,rect,(phase,percent)=>{if(epoch===mine)announce(phase+'… '+percent+'%');}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('A leitura demorou demais. Tente novamente ou preencha manualmente.')),120000);})]);
  if(mine!==epoch)return;rect=data.rect;let filled=0,kept=0;const next={};
  for(const k of reader.FIELDS){const field=form.elements[k],value=data.fields[k]||'';if(value&&value!=='Unknown'&&((k==='type'&&!typeTouched)||reader.canReplace(field.value,initial[k],lastAuto[k]))){field.value=value;field.classList.add('ocrFilled');next[k]=field.value;filled++;}else if(field.value&&field.value!=='Unknown'){kept++;}}
  syncType();lastAuto={...lastAuto,...next};raw.textContent=data.raw;document.getElementById('ocrDetails').hidden=false;
  const pending=Object.keys(labels).filter(k=>form.elements.type.value!=='support'||!['hp','dmg','element','border'].includes(k)).filter(k=>!form.elements[k].value||form.elements[k].value==='Unknown').map(k=>labels[k]);
  announce((data.knownMatch?'Print idêntico a um já confirmado no catálogo. ':'' )+(filled?'Preenchi '+filled+' campos. ':'Não consegui preencher os campos com segurança. ')+(kept?'Mantive os campos que já estavam preenchidos. ':'')+'Confira tudo com o print antes de salvar.'+(pending.length?' Pendentes: '+pending.join(', ')+'.':'')+(file&&rect.w<.9?' Use Ajustar área se a seleção não corresponder à carta.':''));
 }catch(error){if(mine===epoch){await reader.cancel();announce(error.message||'Não foi possível ler. Tente ajustar a área ou preencha manualmente.',true);}}
 finally{clearTimeout(timer);if(mine===epoch){reading=false;controls();}}
}
fileInput.addEventListener('change',()=>{cancel();for(const [k,value] of Object.entries(lastAuto)){const field=form.elements[k];if(field.value===value){field.value=field.tagName==='SELECT'?(k==='type'?'card':'Unknown'):'';field.classList.remove('ocrFilled');}}lastAuto={};syncType();rect=null;reviewReset();raw.textContent='';document.getElementById('ocrDetails').hidden=true;const file=fileInput.files[0];if(!file){announce('Escolha um print para preencher os campos automaticamente.');return;}start();});
retry.addEventListener('click',start);
function acceptImage(file){if(!file||!/^image\/(png|jpeg|gif|webp)$/.test(file.type)||busy||currentResult||inputs.disabled)return false;const transfer=new DataTransfer();transfer.items.add(file);fileInput.files=transfer.files;fileInput.dispatchEvent(new Event('change',{bubbles:true}));return true;}
document.addEventListener('paste',e=>{const image=[...(e.clipboardData?.files||[])].find(f=>f.type.startsWith('image/'));if(image&&acceptImage(image))e.preventDefault();});
document.getElementById('preview').addEventListener('dragover',e=>{e.preventDefault();});
document.getElementById('preview').addEventListener('drop',e=>{if(acceptImage(e.dataTransfer?.files?.[0]))e.preventDefault();});
form.addEventListener('submit',e=>{if(reading){e.preventDefault();e.stopImmediatePropagation();announce('Aguarde a leitura terminar antes de conferir e salvar.');}},{capture:true});
form.addEventListener('input',e=>{if(e.target!==confirm)reviewReset();});
form.addEventListener('reset',()=>{cancel();typeTouched=false;lastAuto={};rect=null;raw.textContent='';document.getElementById('ocrDetails').hidden=true;form.querySelectorAll('.ocrFilled').forEach(e=>e.classList.remove('ocrFilled'));queueMicrotask(()=>{syncType();controls();});announce('Escolha um print para preencher os campos automaticamente.');});
function draw(){const c=cropCanvas,ctx=c.getContext('2d');ctx.drawImage(cropImage,0,0,c.width,c.height);if(!cropRect)return;const r=cropRect;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,c.width,r.y*c.height);ctx.fillRect(0,(r.y+r.h)*c.height,c.width,(1-r.y-r.h)*c.height);ctx.fillRect(0,r.y*c.height,r.x*c.width,r.h*c.height);ctx.fillRect((r.x+r.w)*c.width,r.y*c.height,(1-r.x-r.w)*c.width,r.h*c.height);ctx.strokeStyle='#8be6c4';ctx.lineWidth=3;ctx.strokeRect(r.x*c.width,r.y*c.height,r.w*c.width,r.h*c.height);}
function point(event){const box=cropCanvas.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))};}
cropCanvas.addEventListener('pointerdown',e=>{dragStart=point(e);cropCanvas.setPointerCapture(e.pointerId);});
cropCanvas.addEventListener('pointermove',e=>{if(!dragStart)return;const p=point(e);cropRect={x:Math.min(p.x,dragStart.x),y:Math.min(p.y,dragStart.y),w:Math.abs(p.x-dragStart.x),h:Math.abs(p.y-dragStart.y)};draw();});
cropCanvas.addEventListener('pointerup',()=>{dragStart=null;});cropCanvas.addEventListener('pointercancel',()=>{dragStart=null;});
cropButton.addEventListener('click',async()=>{try{const file=fileInput.files[0];if(!file)return;cropImage=await reader.image(file);const scale=Math.min(1,1200/cropImage.naturalWidth);cropCanvas.width=Math.round(cropImage.naturalWidth*scale);cropCanvas.height=Math.round(cropImage.naturalHeight*scale);cropRect=rect||reader.defaultRect(cropImage.naturalWidth,cropImage.naturalHeight);dialog.showModal();draw();}catch(e){announce(e.message,true);}});
document.getElementById('ocrWhole').onclick=()=>{cropRect={x:0,y:0,w:1,h:1};draw();};
document.getElementById('ocrCropCancel').onclick=()=>dialog.close();
document.getElementById('ocrCropApply').onclick=()=>{if(!reader.validRect(cropRect)){document.getElementById('ocrCropHelp').textContent='Arraste para selecionar uma área maior da carta.';return;}rect={...cropRect};dialog.close();start();};
window.addEventListener('pagehide',()=>reader.cancel());controls();syncType();
})();
