/* Screenshot transcription. These bonuses are not applied again to displayed HP/DMG. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.CARDO_LOADOUTS=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const blueWolf={cardId:'c-1',confirmedSameCard:true,date:'2026-11-10',border:'Astral',
 readings:{hpWhite:7318,hpGreen:3088,dmgWhite:2439,dmgGreen:885,finalCardStatsConfirmed:false},
 pieces:[
 {slot:'Crown',set:'Hollow Sanctuary',rarity:'Epic',level:12,main:{hp:11.3},sub:{shield:4.6,crit:4.9,critDmg:3,element:1.2}},
 {slot:'Core',set:'Hollow Sanctuary',rarity:'Epic',level:12,main:{damage:11},sub:{potency:4.1,hp:6.5,dot:3.4,shield:1.8}},
 {slot:'Mantle',set:'Hollow Sanctuary',rarity:'Legendary',level:15,main:{hp:6.5},sub:{dot:7.9,shield:3.1,damage:9.3,crit:2.3}},
 {slot:'Sigil',set:'Hollow Sanctuary',rarity:'Epic',level:12,main:{potency:3.3},sub:{healing:1.9,hp:4.5,element:2.2,damage:5.2}},
 {slot:'Echo',set:'Prism of Origin',rarity:'Legendary',level:15,main:{damage:10.8},sub:{shield:5.1,crit:1.9,hp:7.4,dot:3}}
 ],sourceFolder:'https://drive.google.com/drive/folders/17Bkua6fGJhW6xg50XHF8PtfxRNNghFI-'};
function totals(pieces){const stats={},sets={};for(const p of pieces.slice(0,5)){sets[p.set]=(sets[p.set]||0)+1;for(const group of [p.main,p.sub])for(const [k,v]of Object.entries(group||{}))stats[k]=(stats[k]||0)+v;}for(const k in stats)stats[k]=Math.round(stats[k]*1000)/1000;return {stats,sets};}
return {blueWolf,totals};
});
