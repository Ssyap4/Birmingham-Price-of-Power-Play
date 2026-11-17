/* Case 002 — canonical cast sheet and non-spoiling discovery registry.
 * Every new character has one identity; no image is claimed to exist until
 * original portrait assets are reviewed and explicitly registered.
 * Discovered characters come only from visited witness/introduction scenes.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002Cast=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const CAST=Object.freeze([
 {id:"mabel",name:"Мэйбл Кросс",role:"Железнодорожная служащая",appearance:"28 лет; узкое угловатое лицо, нос с горбинкой, клиновидный подбородок, близко посаженные серо-зелёные глаза, короткий прямой тёмно-каштановый боб, строгое серое пальто",intro:["P02"],portrait:null},
 {id:"tommy",name:"Томми Кросс",role:"Рабочий, брат Мэйбл",appearance:"19 лет; светло-каштановые короткие волосы, фамильная узкая переносица с горбинкой как у Мэйбл, рабочая тёмно-синяя куртка, бинт на руке",intro:["D04","HJ02","HV02"],portrait:null},
 {id:"ada",name:"Ада Уэбб",role:"Работница котельной",appearance:"34 года; широкая квадратная челюсть, короткий широкий нос, прямые густые брови, карие глаза, шрам на подбородке, тёмно-рыжие волосы под рабочим платком, сажа и грубый фабричный фартук",intro:["D02","HE02"],portrait:null},
 {id:"mercer",name:"Дэниел Мерсер",role:"Фабричный инспектор",appearance:"46 лет; залысины, усы с проседью, потёртый костюм",intro:["D07","HF03"],portrait:null},
 {id:"vale",name:"Гидеон Вейл",role:"Владелец промышленного предприятия",appearance:"55 лет; серебристая борода, тёмный жилет, тяжёлый шерстяной костюм",intro:["E06","HV01","HV03"],portrait:null},
 {id:"brackett",name:"Льюис Брэкетт",role:"Начальник частной охраны",appearance:"42 года; рубец у левой скулы, аккуратно зачёсанные волосы, тяжёлые ботинки",intro:["E08","HJ03"],portrait:null},
 {id:"nora",name:"Нора Келл",role:"Редактор городской газеты",appearance:"39 лет; подколотые волосы, рабочая блуза, карандаш за ухом",intro:["E02","HE03"],portrait:null},
 {id:"hale",name:"Эдвард Хейл",role:"Погибший на железнодорожной ветке",appearance:"37 лет; старая рабочая кепка, тёмное грузовое пальто",intro:["A03","A05"],portrait:null},
 {id:"rowan",name:"Констебль Роуэн",role:"Молодой полицейский",appearance:"24 года; широкий нос, внимательные глаза, форменный китель",intro:["A03","A06"],portrait:null},
 {id:"signalman",name:"Стрелочник",role:"Служащий стрелочного поста",appearance:"61 год; седые усы, почерневшие от графита руки, шерстяная кепка",intro:["C02","C07","HS02"],portrait:null}
]);
const BY_ID=new Map(CAST.map(x=>[x.id,x]));
function discovered(state) {
 if(!state||!Array.isArray(state.visited))throw Error("Case002 visited scene history required");
 const visited=new Set(state.visited);
 return CAST.filter(c=>c.intro.some(id=>visited.has(id))).map(c=>{
   let detail="";
   if(c.id==="ada"||c.id==="tommy"||c.id==="mercer")
     detail=state.witnesses?.[c.id]||"missing";
   return {id:c.id,name:c.name,role:c.role,status:detail,portrait:c.portrait};
 });
}
function character(id){return BY_ID.get(id)||null;}
return {CAST,discovered,character};
});
