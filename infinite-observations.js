/* Observed battle values are separate from owned card stats. No growth law inferred. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_INFINITE_OBSERVATIONS=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const records=Object.freeze([
 Object.freeze({id:'floor-1-widow',floor:1,name:'Widow',hp:18,dmg:10,element:'Imaginary',observedAt:'2026-11-10',elementsMode:null,abilityComplete:false,abilityPartial:"On entry, become Unseen (single-target effects can't select this card) until it deals damage,...",image:'assets/references/FLOOR_1_WIDOW.png',sourceDrive:'https://drive.google.com/file/d/1Zas_zBi4g0aXAmnh1QliI90-_uvoHdTC/view'}),
 Object.freeze({id:'floor-2-sinner-ruler-of-life',floor:2,name:'Sinner Ruler of Life',hp:22,dmg:11,element:'Imaginary',observedAt:'2026-11-10',elementsMode:null,abilityComplete:false,abilityPartial:'On defeat, bind your soul to the enemy responsible for 2 of their turns: the first allied hit on them...',image:'assets/references/FLOOR_2_SINNER_RULER_OF_LIFE.png',sourceDrive:'https://drive.google.com/file/d/1cEVB8QIaA_GOYIbA2q8n-cm-zqD6kDfo/view'}),
 Object.freeze({id:'floor-261-game-princess',floor:261,name:'Game Princess',hp:6061,dmg:2648,element:'Unknown',elementsMode:null,abilityComplete:false,abilityName:'No Continue',image:null,sourceDrive:null})
]);
function compare(a,b){if(!a||!b||!(a.hp>0&&a.dmg>0))throw Error('Referências inválidas.');return Object.freeze({hpChange:b.hp/a.hp-1,dmgChange:b.dmg/a.dmg-1,sameEnemy:a.name===b.name,growthConfirmed:false});}
function scenarioFor(id,current={}){const r=records.find(r=>r.id===id);if(!r)throw Error('Referência não encontrada.');const to=Number(current.ifTo);return {...current,ifFrom:r.floor,ifBase:r.floor,ifTo:Number.isInteger(to)&&to>=r.floor&&to<=Math.min(20000,r.floor+150)?to:r.floor,ifHp:r.hp,ifDmg:r.dmg,ifElement:r.element,ifElementsMode:false};}
function alignKnownBaseline(current={}){const r=records.find(r=>r.floor===Number(current.ifFrom)&&r.hp===Number(current.ifHp)&&r.dmg===Number(current.ifDmg));return r&&r.floor!==Number(current.ifBase)?{...current,ifBase:String(r.floor)}:{...current};}
return Object.freeze({records,compare,scenarioFor,alignKnownBaseline});
});
