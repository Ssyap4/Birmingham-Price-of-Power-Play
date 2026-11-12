/* Birmingham case engine v1.4: independent of the quiz, data-driven, checkpointed. */
(()=>{'use strict';
const BASE_KEY='birmingham_case_smol_heath_v1', KEY=()=>BASE_KEY+'_'+(window.BirminghamHero?.selectedId||'jack'), $=id=>document.getElementById(id);
const scenes={
intro:{chapter:'ПРОЛОГ · 21:15',place:'Смолл-Хит · улица Уотери-Лейн',title:'Долг, который не прощают',text:'Вечерний дождь смывает мел с мостовой. У дверей конторы тебя ждёт миссис Эвелин Прайс. Её муж, счетовод Артур Прайс, исчез два дня назад вместе с долговой книгой. Сегодня кто-то подбросил ей конверт: «До полуночи. Иначе он не вернётся». Эвелин не просит мести. Она хочет узнать правду.',image:'small-heath',choices:[['Спросить о последнем вечере Артура','widow'],['Осмотреть конверт прежде разговора','envelope']]},
envelope:{chapter:'ГЛАВА I · ПЕРВАЯ УЛИКА',place:'Контора Прайса',title:'Чернила и пепел',text:'Конверт пахнет машинным маслом. На внутреннем сгибе — крошечная отметка «D-17», а сургучная печать снята аккуратно, словно отправитель не хотел оставить следов. Эвелин узнаёт бумагу: такую использует складской управляющий на канале.',give:['envelope'],choices:[['Расспросить Эвелин','widow'],['Отправиться к складам','canal']]},
widow:{chapter:'ГЛАВА I · СВИДЕТЕЛЬ',place:'Дом Прайсов',title:'То, о чём молчат дома',text:'Эвелин признаётся: перед исчезновением Артур спорил с управляющим складов Уолтером Крейном. Но был и другой посетитель — полицейский сержант Рид. Артур сказал жене: «Если я исчезну, ищи не деньги, а вторую книгу». Эвелин вручает тебе старый ключ с цифрой 17.',give:['key'],choices:[['Осмотреть кабинет Артура','office'],['Подробно расспросить Эвелин о последнем вечере','interview'],['Пойти к складам на канале','canal'],['Найти сержанта Рида','reed']]},
office:{chapter:'ГЛАВА I · КАБИНЕТ',place:'Контора Прайса',title:'Пустое место на полке',text:'В кабинете всё слишком аккуратно. За фальшивой стенкой книжного шкафа — копия накладной с двумя печатями: «D-17» и «Муниципальные поставки». На обороте карандашом написано: «Не верь Крейну. Не верь форме».',give:['invoice'],choices:[['Проверить склад D-17','canal'],['Осмотреть следы в задней комнате','searchOffice'],['Расспросить сержанта Рида','reed'],['Вернуться к Эвелин','widow']]},
canal:{chapter:'ГЛАВА II · НА КАНАЛЕ',place:'Дигбет · складские причалы',title:'Склад без света',text:'У причала сторож дремлет под навесом. Склад D-17 закрыт, но за дверью слышен стук металлических ящиков. Есть три пути: договориться, обойти здание или рискнуть и воспользоваться ключом.',choices:[['Подкупить сторожа обещанием доли','bribe'],['Пробраться через боковую дверь','sneak'],['Открыть дверь ключом №17','unlock','key'],['Сначала поговорить с Ридом','reed'],['Подслушать разговоры за стеной склада','listen'],['Джек: потребовать у сторожа платёжную запись','heroJack'],['Финн: вскрыть склад отмычками','heroFinn'],['Элеонора: сфотографировать накладную у причала','heroEleanor'],['Виктор: предъявить поддельное удостоверение','heroVictor'],['Сэмюэл: открыть служебный проход инструментами','heroSamuel']]},
bribe:{chapter:'ГЛАВА II · СДЕЛКА',place:'Дигбет · складские причалы',title:'Цена молчания',text:'Сторож соглашается пропустить тебя, но требует слово: его имя не появится в деле. Он шепчет, что вчера ночью Крейн увёз кого-то на старую насосную станцию. За обещание сторож даёт тебе маршрут.',flags:{guard:true},give:['route'],choices:[['Проверить склад изнутри','warehouse'],['Пойти на насосную станцию','pump']]},
sneak:{chapter:'ГЛАВА II · ОБХОД',place:'Дигбет · задний двор',title:'Следы на сырой земле',text:'Ты перелезаешь через низкую ограду. Под окном склада лежит разбитая бутылка и обрывок ведомости с подписью сержанта Рида. Кто-то торопился уничтожить бумаги. В темноте хлопает дверь — тебя могли заметить.',give:['receipt'],flags:{spotted:true},choices:[['Войти на склад, пока не поздно','warehouse'],['Уйти к сержанту с находкой','reed']]},
unlock:{chapter:'ГЛАВА II · КЛЮЧ',place:'Дигбет · склад D-17',title:'Семнадцатая дверь',text:'Ключ поворачивается без усилий. За дверью — пустые ящики, счётные листы и чужая шинель. На столе лежит двойная ведомость с записями о перевозках: в ночь исчезновения Артура груз отправили к насосной станции.',give:['ledger'],choices:[['Осмотреть склад подробнее','warehouse'],['Проверить насосную станцию','pump']]},
warehouse:{chapter:'ГЛАВА II · УЛИКИ',place:'Склад D-17',title:'Вторая бухгалтерия',text:'Под доской пола обнаруживается двойная ведомость. Настоящий долг не принадлежал семье Прайс: через счета Артура отмывали деньги городских подрядов. Подпись Крейна стоит рядом с инициалами «Р.». Слышны шаги снаружи.',give:['ledger'],choices:[['Скрыться с ведомостью и найти Рида','reed'],['Поспешить к насосной станции','pump'],['Вернуться к Эвелин и предупредить её','warn']]},
reed:{chapter:'ГЛАВА II · ПОЛИЦИЯ',place:'Участок на окраине',title:'Человек в форме',text:'Сержант Рид говорит спокойно, но слишком быстро узнаёт о пропавшей книге. Он предлагает защиту для Эвелин в обмен на все найденные документы. «Крейн опасен. Я могу остановить его», — обещает он.',choices:[['Показать ему найденную ведомость','reedProof','ledger'],['Обвинить его без доказательств','accuse'],['Сделать вид, что доверяешь','pretend'],['Не раскрывать карты и уйти','canal']]},
reedProof:{chapter:'ГЛАВА II · ПОДПИСЬ',place:'Полицейский участок',title:'Неудобная строка',text:'Рид бледнеет при виде подписи. Он признаёт, что подписывал бумаги по приказу начальства, но утверждает, что не знал о похищении. Он предлагает тайно провести тебя на насосную станцию. Верить ему опасно.',flags:{reedKnows:true},choices:[['Согласиться на сопровождение','escort'],['Отказаться и идти одному','pump'],['Потребовать письменное признание','confession']]},
accuse:{chapter:'ГЛАВА II · ОШИБКА',place:'Полицейский участок',title:'Слова без веса',text:'Без предъявленных документов обвинение повисает в воздухе. Рид приказывает тебе покинуть участок. Через окно ты видишь, как он отправляет мальчишку с запиской. Теперь тебя ждут.',flags:{reedAlert:true},choices:[['Вернуться к складу за уликами','canal'],['Немедленно идти к насосной станции','pump']]},
pretend:{chapter:'ГЛАВА II · ИГРА',place:'Полицейский участок',title:'Вежливый обман',text:'Ты обещаешь вернуться с бумагами. Рид даёт адрес насосной станции, надеясь, что ты сделаешь грязную работу за него. На выходе замечаешь его тревожный взгляд.',give:['route'],flags:{reedKnows:true},choices:[['Проверить насосную станцию','pump'],['Предупредить Эвелин','warn']]},
confession:{chapter:'ГЛАВА II · ПРИЗНАНИЕ',place:'Полицейский участок',title:'Перо на бумаге',text:'Рид отказывается подписывать признание, но в разговоре проговаривается: Артур жив. Он заперт на насосной станции, пока Крейн не получит вторую книгу. Ты записываешь слова сержанта.',give:['testimony'],choices:[['Идти за Артуром','pump'],['Предупредить Эвелин','warn']]},
escort:{chapter:'ГЛАВА III · СОЮЗ',place:'Дорога к насосной станции',title:'Союз на одну ночь',text:'Рид приводит тебя к чёрному входу. «Внутри двое», — шепчет он. Но, заметив свет в окне, неожиданно исчезает за углом. Возможно, он предал тебя. Возможно, отвлекает охрану.',flags:{reedEscort:true},choices:[['Войти осторожно','pump'],['Подождать и проверить двор','yard']]},
warn:{chapter:'ГЛАВА III · ПРЕДУПРЕЖДЕНИЕ',place:'Дом Прайсов',title:'У кого есть время?',text:'Эвелин прячет детей у соседки. Она отдаёт тебе записку Артура: «Доказательство не в книге, а в том, кто её подписал». Теперь она в безопасности, но время до полуночи истекает.',flags:{widowSafe:true},give:['note'],choices:[['Идти на насосную станцию','pump'],['Вернуться за документами','office']]},
pump:{chapter:'ГЛАВА III · ПОЛУНОЧЬ',place:'Старая насосная станция',title:'За железной дверью',text:'Ночь подходит к полуночи. Сквозь грязное стекло ты видишь Артура, привязанного к стулу. Рядом Крейн с револьвером и кожаной папкой. На улице есть боковой вход, а внутри — шанс заговорить. От твоих доказательств зависит, кто уйдёт отсюда живым.',choices:[['Осмотреть двор и найти тихий путь','yard'],['Войти и потребовать освободить Артура','confront'],['Предложить обмен документов на пленника','trade','ledger']]},
yard:{chapter:'ГЛАВА III · ТИХИЙ ПУТЬ',place:'Насосная станция · двор',title:'Сломанная решётка',text:'За зданием обнаруживается вентиляционный проход. Внутри слышен разговор: Крейн требует назвать имя человека из городской управы, который заказал подлог. Артур отказывается. Ты можешь войти незаметно или выждать.',flags:{secretEntry:true},choices:[['Пробраться через решётку','rescue'],['Выйти к Крейну и заговорить','confront']]},
rescue:{chapter:'ФИНАЛ · РИСК',place:'Насосная станция · подвал',title:'Выход через тьму',text:'Ты отвязываешь Артура, но Крейн замечает движение. Артур шепчет, что документы докажут участие Рида и городской управы. У тебя несколько секунд: спасать человека или пытаться захватить всю папку.',choices:[['Увести Артура через подвал','endingRescue'],['Схватить папку и рискнуть','endingEvidence'],['Остановить Крейна разговором','confront']]},
confront:{chapter:'ФИНАЛ · ПЕРЕГОВОРЫ',place:'Насосная станция · машинный зал',title:'Правда имеет цену',text:'Крейн усмехается: «Ты думаешь, Артур невиновен? Он сам вёл счета». Артур признаёт, что помогал скрывать незаконные выплаты, пока не понял, кого подставляют. Крейн требует все доказательства. Можно разоблачить схему, договориться или спасать человека.',choices:[['Предъявить двойную ведомость','expose','ledger'],['Потребовать признание, сославшись на Рида','pressure','testimony'],['Согласиться уничтожить бумаги ради Артура','endingDeal'],['Отступить и искать другой вход','yard']]},
trade:{chapter:'ФИНАЛ · ОБМЕН',place:'Насосная станция',title:'Бумага за жизнь',text:'Крейн забирает ведомость и отпускает Артура, но не отдаёт папку. У выхода уже ждёт автомобиль: Крейн готовится уехать. У тебя остаётся несколько секунд, чтобы решить, преследовать его или увести Артура в безопасное место.',flags:{traded:true},choices:[['Уйти вместе с Артуром','endingDeal'],['Попытаться перехватить папку','endingEvidence']]},
expose:{chapter:'ФИНАЛ · РАЗОБЛАЧЕНИЕ',place:'Насосная станция',title:'Имена на бумаге',text:'Ты читаешь вслух номера платежей. Крейн понимает, что подделать все копии не успеет. Он отпускает Артура и пытается выторговать своё молчание. Теперь нужно решить, кому достанется правда.',choices:[['Передать документы независимому журналисту','endingTruth'],['Оставить документы себе для будущего давления','endingPower'],['Спрятать документы и вывести Артура','endingRescue']]},
pressure:{chapter:'ФИНАЛ · ДВОЙНОЙ АГЕНТ',place:'Насосная станция',title:'Слабое звено',text:'Услышав о словах Рида, Крейн понимает, что союзники начали сдавать друг друга. Он бросает папку на пол и отступает. Артур свободен, но Рид наверняка узнает о случившемся.',choices:[['Сохранить документы и обнародовать их','endingTruth'],['Укрыть Артура и сохранить секрет','endingPower'],['Спрятать документы и вывести Артура','endingRescue']]},
interview:{chapter:'ГЛАВА I · РАЗГОВОР',place:'Дом Прайсов · кухня',title:'Три вопроса Эвелин',text:'Эвелин долго смотрит на холодный чай. «Артур боялся не Крейна. Он боялся, что я узнаю, кому он помогал». Она вспоминает серый автомобиль возле дома и имя, произнесённое шёпотом: Рид.',give:['witness'],choices:[['Попросить показать последнее письмо','envelope'],['Проверить кабинет и записи Артура','office'],['Поговорить с сержантом Ридом','reed']]},
searchOffice:{chapter:'ГЛАВА I · ОСМОТР',place:'Контора Прайса · задняя комната',title:'Что спрятано под пеплом',text:'В камине ещё тлеют обрывки. Ты осторожно разворачиваешь уцелевший лист: здесь отмечены две поставки в один день и одна фамилия, вымаранная чернилами. На подоконнике — свежая грязь с канала.',give:['ash'],choices:[['Сравнить лист с накладной','office'],['Проверить след у складов','canal'],['Спросить Эвелин о фамилии','interview']]},
listen:{chapter:'ГЛАВА II · ПОДСЛУШАНО',place:'Дигбет · за стеной склада',title:'Голоса в темноте',text:'Ты замираешь за кирпичной стеной. Двое обсуждают насосную станцию и велят никому не открывать дверь после полуночи. Один произносит: «Сержант получит свою долю, когда книга исчезнет».',give:['overheard'],choices:[['Найти вход в склад','sneak'],['Немедленно предупредить Эвелин','warn'],['Проверить насосную станцию','pump']]},
heroJack:{chapter:'ГЛАВА II · КУЛАК СЕМЬИ',place:'Дигбет · пост сторожа',title:'Голос командира',text:'Джек требует предъявить запись о ночной смене. Сторож узнаёт армейскую выправку и, не желая связываться с людьми Шелби, отдаёт обрывок платёжной ведомости с подписью Рида. Это документальный след; обвинять сержанта без остальных доказательств всё ещё рано.',give:['receipt'],flags:{jackGuardDistracted:true},choices:[['Проверить склад изнутри','warehouse'],['Вернуться к причалам','canal']]},
heroFinn:{chapter:'ГЛАВА II · ПРИЗРАК ДИГБЕТА',place:'Дигбет · склад D-17',title:'Замок без ключа',text:'Финн вскрывает боковой замок набором отмычек и добирается до бухгалтерского стола. Он забирает один из экземпляров двойной ведомости и возвращается к двери. Ключ №17 ему не понадобился, но документы ещё предстоит проверить по независимым источникам.',give:['ledger'],flags:{finnLockOpened:true},choices:[['Осмотреть склад подробнее','warehouse'],['Вернуться к причалам','canal']]},
heroEleanor:{chapter:'ГЛАВА II · ЧЕРНИЛЬНАЯ ЛЕДИ',place:'Дигбет · грузовой причал',title:'Кадр с двумя печатями',text:'Элеонора замечает накладную на разгрузочном столе и снимает её карманным фотоаппаратом. На копии различимы печати D-17 и муниципальных поставок. Снимок сохраняет документ, но сам по себе ещё не раскрывает всю финансовую схему.',give:['invoice'],flags:{eleanorPhotoTaken:true},choices:[['Проверить документ у Рида','reed'],['Вернуться к причалам','canal']]},
heroVictor:{chapter:'ГЛАВА II · ДЖЕНТЛЬМЕН',place:'Дигбет · складская проходная',title:'Проверка по чужому имени',text:'Виктор предъявляет поддельное удостоверение проверяющего. Сторож показывает маршрут ночного рейса до старой насосной станции. Повторять обман опасно: фамилия уже осталась в журнале, и это прикрытие больше нельзя использовать в этой попытке.',give:['route'],flags:{victorCoverUsed:true},choices:[['Проверить насосную станцию','pump'],['Вернуться к причалам','canal']]},
heroSamuel:{chapter:'ГЛАВА II · МЕХАНИК',place:'Дигбет · служебная галерея',title:'Забытый технический ход',text:'Сэмюэл освобождает заклинивший механизм служебной галереи. Старый проход ведёт прямо во двор насосной станции. Теперь можно обойти главный вход, но двор по-прежнему охраняется: инструменты не защитят от выстрела.',flags:{samuelServiceOpened:true},choices:[['Пройти во двор насосной станции','yard'],['Вернуться к причалам','canal']]},
endingRescue:{end:true,title:'ЧЕЛОВЕК ВАЖНЕЕ БУМАГ',text:'Артур возвращается домой. Эвелин встречает его на пороге, не задавая вопросов. Ты спас человека, но заказчики махинаций остались на свободе. Возможно, это лишь отсрочка перед новой бурей.',outcome:'Артур спасён · Заговор не раскрыт',reputation:2},
endingEvidence:{end:true,title:'ЦЕНА ДОКАЗАТЕЛЬСТВ',text:'Тебе удаётся унести папку, но Артур получает ранение во время побега. Он выживает благодаря помощи Эвелин. В твоих руках — имена и подписи, которые могут перевернуть город. За ними уже охотятся.',outcome:'Документы получены · Артур ранен',reputation:3},
endingDeal:{end:true,title:'ДОГОВОР С ТЕНЬЮ',text:'Артур жив, но Крейн уничтожает большую часть бумаг. Эвелин благодарит тебя, хотя понимает: кто-то всё ещё управляет городом из-за закрытых дверей. Иногда мир покупают слишком дорого.',outcome:'Артур спасён · Улики утрачены',reputation:1},
endingTruth:{end:true,title:'ГОРОД УЗНАЕТ ПРАВДУ',text:'Утром газеты публикуют копии платежей. В городе начинается расследование, Рид исчезает, а Крейн скрывается. Артур соглашается дать показания. Ты нажил опасных врагов — и людей, которые теперь тебе доверяют.',outcome:'Заговор раскрыт · Влиятельные враги',reputation:5},
endingPower:{end:true,title:'ВЛАСТЬ В ТВОИХ РУКАХ',text:'Ты сохраняешь документы в тайнике. Артур свободен, а Крейн знает: теперь у тебя есть рычаг против его покровителей. Ты не раскрыл правду городу. Ты стал одним из тех, кто решает, когда она прозвучит.',outcome:'Компромат сохранён · Влияние выросло',reputation:4}
,endingDeath:{end:true,title:'ПОСЛЕДНЯЯ ОШИБКА',text:'На мокрых улицах Бирмингема осталась ещё одна нерассказанная история. Расследование оборвалось, но память о погибшем останется в ближнем кругу Шелби.',outcome:'Герой погиб · Дело не раскрыто',reputation:0}
};
const items={envelope:'Конверт с отметкой D-17',key:'Ключ №17',invoice:'Копия накладной',receipt:'Обрывок ведомости',route:'Маршрут к насосной станции',ledger:'Двойная ведомость',testimony:'Записанные слова Рида',note:'Записка Артура',witness:'Показания Эвелин',ash:'Обгоревший лист',overheard:'Подслушанный разговор'};
const HERO_ACTIONS={heroJack:{hero:'jack',flag:'jackGuardDistracted'},heroFinn:{hero:'finn',flag:'finnLockOpened'},heroEleanor:{hero:'eleanor',flag:'eleanorPhotoTaken'},heroVictor:{hero:'victor',flag:'victorCoverUsed'},heroSamuel:{hero:'samuel',flag:'samuelServiceOpened'}};
function heroActionAvailable(target){const action=HERO_ACTIONS[target];return !action||(action.hero===(window.BirminghamHero?.selectedId||'jack')&&!state.flags[action.flag])}
function hasSavedCase(heroId=window.BirminghamHero?.selectedId||'jack'){
 try{const s=JSON.parse(localStorage.getItem(BASE_KEY+'_'+heroId)||'null');return !!(s&&scenes[s.node]&&Array.isArray(s.items)&&s.flags&&typeof s.flags==='object'&&!Array.isArray(s.flags)&&Array.isArray(s.trail))}catch{return false}
}
function hasProgress(heroId=window.BirminghamHero?.selectedId||'jack'){
 if(!hasSavedCase(heroId))return false;const s=JSON.parse(localStorage.getItem(BASE_KEY+'_'+heroId));return !scenes[s.node].end&&!s.ending;
}
let state;const fresh=()=>({node:'intro',items:[],flags:{},trail:[],ending:null,started:Date.now(),health:100,riskSeen:[],bandaged:false,medicalKits:(window.BirminghamHero?.selectedId||'jack')==='jack'?1:0,medicalKitFound:false,deathCause:''});const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(state))}catch(e){console.warn('Не удалось сохранить дело',e)}};
function load(){try{const s=JSON.parse(localStorage.getItem(KEY())||'null');if(s&&scenes[s.node]&&Array.isArray(s.items)&&s.flags&&Array.isArray(s.trail)){s.health=Number.isFinite(s.health)?Math.max(0,Math.min(100,s.health)):100;s.riskSeen=Array.isArray(s.riskSeen)?s.riskSeen:[];s.bandaged=!!s.bandaged;s.medicalKits=Number.isInteger(s.medicalKits)?Math.max(0,Math.min(2,s.medicalKits)):(s.bandaged?0:((window.BirminghamHero?.selectedId||'jack')==='jack'?1:0));s.medicalKitFound=!!s.medicalKitFound;/* Reconstruct irreversible facts in older saves without resetting progress. */for(const [node,flag] of [['bribe','guard'],['reedProof','reedExposed'],['accuse','reedAlert'],['warn','widowSafe'],['rescue','arthurFreed'],['confront','craneNegotiated']])if(s.node===node||s.trail.includes(node))s.flags[flag]=true;if(s.flags.traded)s.items=s.items.filter(item=>item!=='ledger');return s}}catch{}return fresh()}
// Visual scene manifest, reviewed against each location and story beat (v5).
const ART={
 intro:'intro', envelope:'envelope', widow:'widow-home', interview:'interview-kitchen', warn:'evelyn-warning',
 heroJack:'heroJack',heroFinn:'heroFinn',heroEleanor:'heroEleanor',heroVictor:'heroVictor',heroSamuel:'heroSamuel',
 office:'office-approved', searchOffice:'searchOffice',
 canal:'canal-approved', bribe:'bribe',
 sneak:'d17-sneak', unlock:'d17-unlock', warehouse:'d17-warehouse', listen:'listen',
 reed:'reed', reedProof:'reedProof', accuse:'accuse', pretend:'pretend', confession:'confession',
 escort:'escort', pump:'pump', yard:'yard',
 rescue:'rescue', confront:'confront', trade:'trade', expose:'expose', pressure:'pressure',
 endingRescue:'endingRescue-approved', endingEvidence:'endingEvidence', endingDeal:'endingDeal-approved', endingTruth:'endingTruth', endingPower:'endingPower-approved', endingDeath:'endingDeath'
};
const ACTORS={intro:['ЭВЕЛИН ПРАЙС','«Прошу вас... найдите Артура. Я не знаю, кому ещё можно доверять».','evelyn'],widow:['ЭВЕЛИН ПРАЙС','«Он сказал: ищи не деньги, а вторую книгу. Я думала, это просто страх».','evelyn'],interview:['ЭВЕЛИН ПРАЙС','«Я слышала имя Рид. Но Артур просил меня никому об этом не говорить».','evelyn'],reed:['СЕРЖАНТ РИД','«Я могу обеспечить защиту. Но сперва покажите мне бумаги».','reed'],reedProof:['СЕРЖАНТ РИД','«Это не то, чем кажется. Меня заставили подписать накладную».','reed'],confront:['УОЛТЕР КРЕЙН','«Ты думаешь, здесь есть невиновные? Спроси своего счетовода».','crane'],pump:['АРТУР ПРАЙС','«Не отдавай ему вторую книгу. Она единственное доказательство».','arthur']};
// v2.0 visual pass: use location-specific art already bundled with the game.
// No remote image requests: opening index.html via file:// remains supported.
const sceneArt=name=>'assets/case-scenes/'+name+'.webp';
// Preflight the actual WebP bytes before displaying an illustration. CSS background
// URLs fail silently; this detects broken assets and keeps the scene readable.
const verifiedArt=new Map();
function verifySceneArt(name){
 if(verifiedArt.has(name))return;
 verifiedArt.set(name,'loading');
 const img=new Image();
 img.onload=()=>verifiedArt.set(name,'ready');
 img.onerror=()=>{verifiedArt.set(name,'missing');console.error('[Case 001] Missing scene illustration:',name,sceneArt(name));};
 img.src=sceneArt(name);
}
// Load art only when its scene is visited. Do not fetch the entire case on mobile.

const portraitFiles={evelyn:'evelyn',investigator:'investigator',reed:'reed-portrait',crane:'crane-portrait',arthur:'arthur-portrait'};
const portraitArt=name=>portraitFiles[name]?'assets/case-scenes/'+portraitFiles[name]+'.webp':null;
const danger={sneak:{source:'Сторож склада D-17',damage:25,base:0.30,desc:'При скрытном проникновении охранник заметил движение.'},yard:{source:'Охрана насосной станции',damage:30,base:0.32,desc:'У вентиляционной решётки прозвучал выстрел.'},rescue:{source:'Уолтер Крейн',damage:35,base:0.38,desc:'Крейн открыл огонь во время освобождения Артура.'},endingEvidence:{source:'Люди Крейна',damage:40,base:0.40,desc:'Попытка захватить папку обернулась перестрелкой.'},retreatCrane:{source:'Уолтер Крейн',damage:25,base:0.30,desc:'Крейн заметил попытку отступить и выстрелил вслед.'}};
const heroBonus={jack:{rescue:-0.14,endingEvidence:-0.12},finn:{sneak:-0.18,yard:-0.12},eleanor:{sneak:-0.04},victor:{rescue:-0.08},samuel:{yard:-0.16}};
// Notifications share one visual language with future achievement popups.
// Important consequences stay on screen for 10 seconds; minor notices for 6.
function notify(kind,title,body){
 let root=document.getElementById('caseHealthToasts');
 if(!root){root=document.createElement('div');root.id='caseHealthToasts';root.setAttribute('aria-live','polite');document.body.append(root)}
 const card=document.createElement('div');card.className='case-health-toast '+kind;
 const heading=document.createElement('strong');heading.textContent=title;
 const desc=document.createElement('p');desc.textContent=body;
 const duration=(kind==='wound'||kind==='fatal'||kind==='heal'||kind==='supply')?10000:6000;
 const time=document.createElement('small');time.className='case-health-duration';time.textContent='Уведомление · '+Math.round(duration/1000)+' сек.';
 card.append(heading,desc,time);root.append(card);
 let remaining=duration,started=Date.now(),timer;
 const dismiss=()=>{card.classList.add('leaving');setTimeout(()=>card.remove(),420)};
 const start=()=>{started=Date.now();timer=setTimeout(dismiss,remaining)};
 card.addEventListener('mouseenter',()=>{clearTimeout(timer);remaining=Math.max(0,remaining-(Date.now()-started))});
 card.addEventListener('mouseleave',start);
 card.addEventListener('focusin',()=>{clearTimeout(timer);remaining=Math.max(0,remaining-(Date.now()-started))});
 card.addEventListener('focusout',start);
 start();while(root.children.length>3)root.firstElementChild.remove();
}
function healthStatus(){let bar=document.getElementById('caseHealthStatus');if(!bar){bar=document.createElement('div');bar.id='caseHealthStatus';const choices=$('caseChoices');choices.parentElement.insertBefore(bar,choices)}const hp=state.health;const label=hp===0?'ПОГИБ':hp<=30?'КРИТИЧЕСКОЕ СОСТОЯНИЕ':hp<=60?'СЕРЬЁЗНОЕ РАНЕНИЕ':hp<=85?'ЛЁГКОЕ РАНЕНИЕ':'В ПОРЯДКЕ';bar.innerHTML='<div class="case-health-head"><span>СОСТОЯНИЕ ГЕРОЯ · '+label+'</span><b>'+hp+' / 100 HP</b></div><div class="case-health-track"><i style="width:'+hp+'%;background:'+(hp<=30?'#b64b42':hp<=60?'#bd803e':hp<=85?'#c5a04b':'#5a9c77')+'"></i></div><div class="case-health-supplies">Перевязочные пакеты: '+state.medicalKits+'</div>';}
function applyDanger(target){const event=danger[target];if(!event||state.riskSeen.includes(target))return true;state.riskSeen.push(target);const hero=window.BirminghamHero?.selectedId||'jack';const bonus=heroBonus[hero]?.[target]||0;const penalty=state.health<=30?0.20:state.health<=60?0.10:state.health<=85?0.04:0;const chance=Math.max(.05,Math.min(.75,event.base+bonus+penalty));if(Math.random()>=chance){notify('safe','ОПАСНОСТЬ МИНОВАЛА',event.source+' · Удалось избежать ранения. Здоровье '+state.health+'/100 HP.');return true}const before=state.health;state.health=Math.max(0,before-event.damage);const lethal=state.health===0 || (before<=30&&Math.random()<0.04);if(lethal){state.health=0;state.deathCause=event.source;notify('fatal','ПОСЛЕДНЯЯ ОШИБКА',event.source+' · '+event.desc+' Герой погиб. Дело не раскрыто.');state.node='endingDeath';return false}notify('wound','РАНЕНИЕ · −'+event.damage+' HP',event.source+' · '+event.desc+' Здоровье '+before+' → '+state.health+'/100. '+(state.health<=30?'Критическое состояние: следующие опасные действия гораздо рискованнее.':state.health<=60?'Серьёзное ранение: повышен риск следующего столкновения.':'Лёгкое ранение: следующий опасный выбор станет немного сложнее.'));return true}
function healChoice(){
 if(state.health>=100||state.medicalKits<=0||state.node==='endingDeath')return;
 const hero=window.BirminghamHero?.selectedId||'jack';const amount=hero==='jack'?25:15;
 const b=button('✚ Использовать перевязочный пакет · +'+amount+' HP ('+state.medicalKits+' шт.)',()=>{
  if(state.medicalKits<=0||state.health>=100)return;
  const before=state.health;state.health=Math.min(100,state.health+amount);
  state.medicalKits--;state.bandaged=true;
  notify('heal','ПЕРВАЯ ПОМОЩЬ · +'+(state.health-before)+' HP','Израсходован перевязочный пакет. Здоровье '+before+' → '+state.health+'/100. Осталось пакетов: '+state.medicalKits+'.');
  save();render();
 });$('caseChoices').append(b)
}
function collectMedicalKit(node){
 // Evelyn gives one kit on the first visit. Jack already carries his own.
 if(node==='widow'&&!state.medicalKitFound){
  state.medicalKitFound=true;
  state.medicalKits=Math.min(2,state.medicalKits+1);
  notify('supply','СНАРЯЖЕНИЕ · ПЕРЕВЯЗОЧНЫЙ ПАКЕТ','Эвелин передала чистые бинты и антисептик. Теперь перевязку можно применить в расследовании после ранения.');
 }
}
function premiumGate(){
 const missing=[];
 if(!state.items.includes('ledger'))missing.push('двойная ведомость');
 let deductions=[];
 try{const f=JSON.parse(localStorage.getItem('birmingham_case_v20_findings_'+(window.BirminghamHero?.selectedId||'jack'))||'null');if(f&&f.started===state.started&&Array.isArray(f.deductions))deductions=f.deductions}catch{}
 const financial=deductions.includes('Деньги и двойной учёт')||deductions.includes('Уничтоженные записи');
 if(!financial)missing.push('сопоставить финансовые улики в инвентаре');
 const independent=state.items.includes('testimony')||deductions.includes('Две версии разговора')||deductions.includes('Путь груза');
 if(!independent)missing.push('независимое подтверждение заговора');
 return missing.length?'Требуется: '+missing.join('; '):null;
}

// Narrative state is layered over existing scenes: no new IDs or artwork bindings.
const singleVisit=new Set(['bribe','sneak','unlock','reedProof','accuse','pretend','confession','escort','warn','trade','expose','pressure']);
function visited(node){return state.node===node||state.trail.includes(node)}
function mayEnter(target){
 if(target==='rescue'&&state.flags.arthurFreed)return false;
 if(target==='yard'&&state.flags.arthurFreed)return false;
 if(target==='confront'&&state.flags.craneRetreated)return false;
 if(target==='reed'&&(state.flags.reedAlert||state.flags.reedExposed))return false;
 if(target==='widow'&&state.flags.widowSafe)return false;
 if(target==='warn'&&state.flags.widowSafe)return false;
 if(target==='bribe'&&state.flags.guard)return false;
 if(singleVisit.has(target)&&visited(target))return false;
 return true;
}
function sceneChoices(node){
 const choices=(scenes[node].choices||[]).slice();
 if(node==='confront'&&state.flags.arthurFreed){
  // Arthur is already loose: a second bargain for his release makes no sense.
  return choices.filter(c=>c[1]!=='endingDeal'&&c[1]!=='yard').concat([
   ['Увести освобождённого Артура','endingRescue'],
   ['Рискнуть и забрать папку Крейна','endingEvidence']
  ]);
 }
 return choices;
}
function sceneText(node){
 if(node==='widow'&&visited('widow'))return 'Ты вновь приходишь к Эвелин. Ключ от склада уже у тебя; теперь она ждёт новостей об Артуре. Вы можете сверить показания или продолжить поиски в кабинете и на канале.';
 if(node==='office'&&visited('office'))return 'В кабинете Артура ничего не изменилось. Копия накладной уже сохранена; если нужны новые доказательства, стоит осмотреть заднюю комнату или продолжить расследование вне дома.';
 if(node==='warehouse'&&(visited('warehouse')||visited('unlock')||visited('heroFinn')))return 'На складе обнаруживаются дополнительные записи, подтверждающие двойную бухгалтерию. Изученная ранее ведомость остаётся у тебя; новые детали связывают подпись Крейна с инициалами «Р.». За дверью по-прежнему слышны шаги.';
 if(node==='reed'&&visited('reed'))return 'Сержант Рид снова принимает тебя в участке. Он помнит предыдущий разговор и настороженно следит, какие документы ты принесёшь на этот раз.';
 if(node==='canal'&&state.flags.guard)return 'На причале по-прежнему слышны шаги у склада D-17. Сторож помнит вашу договорённость и не требует новой платы. Время искать остальные свидетельства или след к насосной станции.';
 if(node==='confront'&&state.flags.arthurFreed)return 'Артур уже освобождён от верёвок и стоит рядом с тобой. Крейн всё ещё держит папку и пытается торговаться: прошлое Артура связано с подложными счетами. Теперь решается судьба доказательств, а не повторное освобождение пленника.';
 if(node==='endingEvidence'&&state.flags.traded)return 'Ты бросаешься за Крейном к ожидавшему автомобилю. В короткой схватке удаётся вырвать папку, но Артур получает ранение, прикрывая твой отход. Эвелин помогает ему выжить. Документы получены — теперь за ними охотятся.';
 return scenes[node].text;
}
function sceneActor(node){
 const actor=ACTORS[node];
 if(node==='widow'&&visited('widow')&&actor)return [actor[0],'«Вы уже знаете всё, что я вспомнила. Прошу, найдите Артура».',actor[2]];
 if(node==='reed'&&visited('reed')&&actor)return [actor[0],'«Вы вернулись. Надеюсь, на этот раз с чем-то существенным».',actor[2]];
 return actor;
}
function render(){const n=scenes[state.node];healthStatus();$('caseChapter').textContent=n.chapter||'ДЕЛО ЗАКРЫТО';$('casePlace').textContent=n.place||'СМОЛЛ-ХИТ · АРХИВ';$('caseTitle').textContent=n.title;$('caseText').textContent=sceneText(state.node);$('caseScene').classList.toggle('case-ending',!!n.end);$('caseScene').dataset.ending=n.end?state.node:'';verifySceneArt(ART[state.node]||'intro-meeting');$('caseArt').style.backgroundImage='linear-gradient(0deg,rgba(5,5,5,.78) 0%,rgba(5,5,5,.08) 46%,rgba(5,5,5,.08) 100%),url("'+sceneArt(ART[state.node]||'intro-meeting')+'")';const actor=sceneActor(state.node)||null;const dialogue=document.querySelector('.case-dialogue');dialogue.hidden=!actor;if(actor){$('caseSpeaker').textContent=actor[0];$('caseDialogue').textContent=actor[1];const portrait=actor[2]||'investigator';$('casePortrait').style.backgroundImage=portraitArt(portrait)?'url("'+portraitArt(portrait)+'")':'none';$('casePortrait').textContent=portraitArt(portrait)?'':actor[0].split(' ').map(x=>x[0]).join('');}$('caseProgressBar').style.width=Math.min(100,Math.round((new Set(state.trail).size+1)/26*100))+'%';$('caseJournalCount').textContent=String(state.items.length);$('caseInventory').replaceChildren();for(const item of state.items){const el=document.createElement('span');el.className='case-item';el.dataset.evidenceId=item;const pic=document.createElement('img');pic.src='assets/evidence-cinematic/'+item+'.webp';pic.className='case-evidence-photo';pic.onerror=()=>{pic.onerror=null;pic.src='assets/case-v17/icon-'+item+'.svg'};pic.alt='';pic.width=34;pic.height=34;const caption=document.createElement('span');caption.textContent=items[item]||item;el.append(pic,caption);el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Рассмотреть улику: '+(items[item]||item));el.addEventListener('click',()=>window.caseOpenEvidence?.(item,items[item]||item));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.caseOpenEvidence?.(item,items[item]||item)}});$('caseInventory').append(el)}if(!state.items.length)$('caseInventory').textContent='Пока нет улик';renderChoices();if(!n.end)save()}
function renderChoices(){const n=scenes[state.node];$('caseChoices').replaceChildren();$('caseOutcome').hidden=!n.end;if(n.end){state.ending=state.node;$('caseOutcome').textContent=n.outcome+(state.node==='endingDeath'?' · Причина: '+(state.deathCause||'опасное столкновение'):' · Репутация +'+n.reputation);save();const b=button('ПЕРЕИГРАТЬ ДЕЛО С НАЧАЛА',()=>{if(confirm('Начать дело заново? Текущие решения будут заменены.')){state=fresh();save();render()}});$('caseChoices').append(b);return}healChoice();for(const [label,target,requirement] of sceneChoices(state.node)){
// Each one-time scene grants a unique clue. Those existing permanent clues
// survive the bounded journal and also cover old saves without a schema change.
const oneTime=new Set(['envelope','interview','searchOffice','listen']);
if(!heroActionAvailable(target)||!mayEnter(target))continue;
if(oneTime.has(target)&&(scenes[target].give.every(item=>state.items.includes(item))||state.trail.includes(target)||state.node===target))continue;
const gate=(target==='endingPower'||target==='endingTruth')?premiumGate():null;const has=(!requirement||state.items.includes(requirement))&&!gate;const riskKey=state.node==='confront'&&target==='yard'?'retreatCrane':target;const risky=!!danger[riskKey]&&!state.riskSeen.includes(riskKey);const b=button(label+(risky?' · ⚠ возможное ранение −'+danger[riskKey].damage+' HP':'')+(has?'':gate?' · 🔒 '+gate:' · нужна улика'),()=>move(target));b.disabled=!has;if(HERO_ACTIONS[target])b.dataset.heroAction=target;if(!has)b.title=gate||('Нужна улика: '+items[requirement]);$('caseChoices').append(b)}}
// Refresh only decisions: discovering a link must not replay a scene, grant
// supplies, roll danger again, or rewrite the investigation save.
document.addEventListener('birmingham:case-findings-changed',({detail})=>{
 if(!state||$('caseGame').hidden||scenes[state.node].end)return;
 if(detail?.heroId!==(window.BirminghamHero?.selectedId||'jack')||detail.started!==state.started)return;
 renderChoices();
});
function button(label,fn){const b=document.createElement('button');b.type='button';b.className='case-choice';b.textContent=label;b.addEventListener('click',fn);return b}
function move(target){if(!scenes[target]||!heroActionAvailable(target)||!mayEnter(target))return;const previous=scenes[state.node];const edge=sceneChoices(state.node).find(c=>c[1]===target);if(!edge||(edge[2]&&!state.items.includes(edge[2]))||((target==='endingPower'||target==='endingTruth')&&premiumGate()))return;state.trail.push(state.node);if(state.trail.length>80)state.trail.shift();if(previous===scenes.confront&&target==='yard')state.flags.craneRetreated=true;state.node=target;if(previous===scenes.confront&&target==='yard'){applyDanger('retreatCrane');state.riskSeen.push('yard')}else applyDanger(target);const next=scenes[state.node];for(const x of next.give||[])if(!state.items.includes(x))state.items.push(x);Object.assign(state.flags,next.flags||{});if(state.node==='rescue')state.flags.arthurFreed=true;if(state.node==='reedProof')state.flags.reedExposed=true;if(state.node==='trade')state.items=state.items.filter(item=>item!=='ledger');if(state.node!=='endingDeath')collectMedicalKit(state.node);render();window.scrollTo({top:0,behavior:'smooth'})}
function show(newAttempt=false){const section=$('caseGame');if(!section)return;state=newAttempt||!hasSavedCase()?fresh():load();document.querySelectorAll('.screen').forEach(x=>x.hidden=x!==section);$('homeBtn').hidden=false;render();window.scrollTo(0,0)}
window.BirminghamCase={hasSavedCase,hasProgress,startNew:()=>show(true),resume:()=>show(false)};
function backToMap(){const section=$('districts');document.querySelectorAll('.screen').forEach(x=>x.hidden=x!==section);$('homeBtn').hidden=false;window.scrollTo(0,0)}
const locked=document.querySelector('.district-locked');if(!locked)return;const launch=button('ОТКРЫТЬ ДЕЛО · ДОЛГ, КОТОРЫЙ НЕ ПРОЩАЮТ →',()=>show(false));launch.id='launchFirstCase';locked.after(launch);function updateLaunch(){const active=document.querySelector('.map-pin.selected')?.dataset.district==='small-heath';launch.hidden=!active;locked.hidden=!!active}document.querySelectorAll('.map-pin').forEach(x=>x.addEventListener('click',updateLaunch));updateLaunch();$('caseBack').addEventListener('click',backToMap);$('homeBtn').addEventListener('click',()=>{$('caseGame').hidden=true});$('caseHome').addEventListener('click',()=>{document.querySelectorAll('.screen').forEach(x=>x.hidden=x.id!=='home');$('homeBtn').hidden=true;window.scrollTo(0,0)});$('caseChangeHero')?.addEventListener('click',()=>{if(confirm('Выбрать другого персонажа? Прогресс текущего героя сохранится.'))window.BirminghamHero?.openSelection?.()});$('caseRestart').addEventListener('click',()=>{if(confirm('Начать дело заново? Текущие решения будут заменены.')){state=fresh();save();render()}});})();
