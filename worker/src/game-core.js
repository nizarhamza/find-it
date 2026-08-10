// Shared game core — word lists + Mastermind-style scoring, used by the multiplayer
// Durable Object (worker/src/room.js) to generate room secrets and score guesses
// server-side. Kept in sync by hand with the WORDS_BY_LANG block in ../../index.html
// (same source, no build step ties them together).

const WORDS_BY_LANG = {
en: {
3:["cat","dog","sun","map","key","ice","jam","owl","fox","bat","pen","cup","box","net","web","sky","arm","bed","leg","ear","car","bus","toy","zip","gum","log","fan","rat","hat","pot","tip","win","war","oak","elk","nut","oil","pie","ray","sea","top","vet","yak","zoo","bag","bee","cow","den","egg","fig","gas","hen","ink","jar","kit","lip","mud","nap","paw","rug","ski","tag","urn","van","wax","bow","cab","dam","fun","gap","hut","jet","lab","mix","nod","pig","rib","sap","tan","cut","dry","eye","few","air"],
4:["bird","tree","lamp","fish","gold","rain","moon","star","wolf","frog","king","milk","road","ship","snow","wind","book","cake","door","fire","game","hand","iron","jump","kite","leaf","mind","note","open","page","quiz","ring","salt","time","unit","vase","wave","yard","zone","bell","corn","dust","echo","farm","gate","hill","idea","jazz","knot","lake","maze","nest","oval","palm","quit","rock","sand","tide","user","void","wall","yarn","zero","bath","clay","desk","east","flag","glow","herb","inch","jail","keen","lion","mask","nine","oven","pond","rope","seed","tent","volt","wing"],
5:["apple","brave","cloud","dance","eagle","flame","grape","house","input","jelly","knife","lemon","mango","noble","ocean","piano","queen","river","stone","tiger","urban","vivid","water","xenon","yield","zebra","actor","beach","chair","dream","earth","frost","glass","heart","index","joker","koala","light","music","north","olive","pearl","quiet","robot","smile","train","under","valve","wheat","youth","amber","bloom","crane","depth","ember","fable","giant","honey","ivory","joint","kneel","laser","metal","night","onion","plant","quest","rhyme","spark","torch","ultra","vapor","witty","yacht","angle","blaze","curve","donut","fresh","globe","hotel","input"],
6:["animal","branch","candle","desert","engine","flower","garden","hammer","island","jacket","kettle","ladder","magnet","nature","orange","pencil","quiver","rocket","silver","turtle","umpire","valley","window","yellow","zigzag","artist","bridge","circle","dragon","empire","forest","gravel","harbor","insect","jungle","knight","lizard","market","napkin","office","planet","quartz","ribbon","summer","tunnel","unique","velvet","walnut","anchor","basket","copper","dinner","effort","fabric","guitar","helmet","injury","junior","kidney","puzzle","mirror","nickel","oxygen","parrot","quaint","rescue","saddle","temple","unfold","vacuum","winter","yogurt","bamboo","cactus","damage","escape","fossil","gopher","hunter","indigo"],
7:["balloon","captain","diamond","evening","factory","gateway","harvest","imagine","journey","kitchen","library","monster","network","october","package","quality","rainbow","scatter","teacher","uniform","village","weather","younger","zealous","academy","bicycle","cabinet","dolphin","eclipse","freedom","gallery","holiday","insider","justice","keeping","lantern","machine","natural","organic","painter","quarter","respect","silence","tornado","upgrade","volcano","warrior","yielded","amazing","blanket","comfort","default","element","fantasy","granite","husband","iceberg","jasmine","kingdom","liberty","mystery","noodles","october","pyramid","quicken","routine","stadium","triumph","unicorn","venture","whisper"],
8:["airplane","birthday","computer","dinosaur","elephant","festival","greeting","hospital","interior","junction","keyboard","language","mountain","notebook","observer","painting","question","reminder","sandwich","triangle","umbrella","vacation","watchdog","yearbook","absolute","backpack","campaign","daylight","envelope","flamingo","gorgeous","handbook","identity","jealousy","kindness","lavender","magnetic","nautical","obstacle","parallel","quantity","resource","strength","together","universe","vertical","wildlife","yielding","argument","blizzard","chemical","diagonal","exercise","farewell","gasoline","headline","increase","juvenile","knuckles","lifetime","material","negative","official","platform","quotient","received","seasonal","tropical"]
},
fr: {
3:["coq","oie","rat","âne","œuf","riz","ail","blé","sel","thé","jus","eau","vin","œil","nez","cou","dos","mur","sol","lit","sac","clé","lac","mer","île","feu","ami","roi","bus","bas","nid","été","art","mot","bol","pot","car","ski","gaz","axe","épi","roc","duc","pré","cri","vue","pie","vis","air","bec","dur","ton","nom"],
4:["chat","ours","loup","cerf","lion","paon","mule","bouc","veau","pain","lait","chou","maïs","café","soda","tête","yeux","dent","bras","main","pied","cœur","foie","peau","sang","toit","lune","ciel","vent","père","mère","sœur","fils","mari","amie","bébé","dame","bleu","vert","rose","noir","gris","juge","jour","nuit","soir","mois","pays","pont","tour","gare","vélo","moto","gros","long","haut","lent","fort","beau","joli","laid","sale"],
5:["chien","vache","poule","lapin","biche","tigre","singe","zèbre","crabe","guêpe","aigle","hibou","cygne","koala","panda","hyène","chiot","pâtes","soupe","fruit","pomme","poire","pêche","prune","melon","sucre","huile","tarte","glace","bière","front","coude","doigt","ongle","jambe","genou","porte","salon","table","tapis","lampe","livre","stylo","nuage","pluie","neige","orage","forêt","arbre","fleur","herbe","océan","plage","sable","roche","terre","fumée","frère","fille","oncle","tante","femme","homme","rouge","jaune","blanc","beige","élève","marin","reine","temps","matin","année","heure","ville","route","école","avion","train","grand","petit","mince","court","large","chaud","froid","jeune","vieux","riche","calme"],
6:["cheval","cochon","mouton","chèvre","canard","souris","renard","girafe","tortue","requin","homard","fourmi","mouche","oiseau","pigeon","chacal","agneau","chaton","beurre","viande","salade","légume","banane","orange","citron","fraise","cerise","raisin","ananas","mangue","tomate","oignon","laitue","poivre","farine","gâteau","bonbon","bouche","langue","épaule","ventre","hanche","orteil","poumon","muscle","maison","jardin","garage","chaise","tiroir","rideau","miroir","crayon","papier","cahier","soleil","étoile","éclair","vallée","fleuve","pierre","désert","cousin","enfant","garçon","violet","marron","avocat","acteur","pilote","soldat","prince","minute","chemin","église","marché","banque","bateau","camion","étroit","rapide","faible","ancien","propre","facile","pauvre","triste","joyeux"],
7:["serpent","poisson","baleine","dauphin","pieuvre","abeille","corbeau","moineau","gorille","léopard","guépard","chameau","poulain","fromage","abricot","carotte","poivron","épinard","haricot","biscuit","cheveux","oreille","estomac","cerveau","fenêtre","plafond","chambre","cuisine","armoire","horloge","colline","feuille","rivière","cousine","docteur","médecin","pompier","boucher","pêcheur","fermier","artiste","peintre","danseur","semaine","seconde","château","hôpital","magasin","voiture","nouveau","heureux"],
8:["éléphant","papillon","araignée","escargot","chouette","pingouin","autruche","pastèque","vinaigre","chocolat","poitrine","escalier","tonnerre","montagne","dentiste","policier","étudiant","musicien","chanteur","écrivain","aéroport"]
},
ar: {
3:["قطة","كلب","بطة","فأر","جرذ","ذئب","أسد","نمر","فيل","قرد","حوت","قرش","نسر","فهد","ضبع","جمل","بغل","تيس","حمل","عجل","مهر","هرة","جرو","طير","سمك","بقر","خبز","جبن","بيض","لحم","أرز","موز","كرز","عنب","خوخ","جزر","بصل","ثوم","ذرة","قمح","سكر","ملح","زيت","شاي","ماء","عسل","رأس","شعر","عين","أنف","أذن","كتف","ظفر","صدر","ظهر","بطن","خصر","ساق","قدم","قلب","رئة","كبد","جلد","عظم","باب","سقف","سلم","قلم","شمس","قمر","مطر","ثلج","ريح","رعد","برق","جبل","عشب","نهر","بحر","رمل","حجر","نار","أخت","ابن","عمة","خال","زوج","طفل","رجل","ولد","بنت","بني","ملك","وقت","يوم","ليل","شهر","سنة","بلد","جسر","برج","قصر","سوق","بنك","سجن","جيش"],
4:["حصان","بقرة","خروف","ماعز","أرنب","ثعلب","ضفدع","سمكة","نحلة","دبور","نملة","دودة","طائر","بومة","غراب","بجعة","كنغر","حمار","حليب","زبدة","حساء","سلطة","خضار","تفاح","مشمش","شمام","بطيخ","فلفل","كوسة","كرنب","دقيق","كعكة","حلوى","قهوة","عصير","نبيذ","جبهة","لسان","رقبة","ذراع","مرفق","إصبع","ركبة","معدة","دماغ","عضلة","منزل","جدار","غرفة","مطبخ","حمام","كراج","كرسي","سرير","مرآة","ساعة","هاتف","كتاب","ورقة","دفتر","نجمة","سماء","وادي","غابة","شجرة","زهرة","محيط","شاطئ","صخرة","تراب","جليد","دخان","ابنة","خالة","زوجة","صديق","أحمر","أزرق","أخضر","أصفر","وردي","أسود","أبيض","طبيب","ممرض","معلم","طالب","قاضي","شرطي","جندي","طباخ","خباز","جزار","صياد","فلاح","فنان","رسام","مغني","راقص","ممثل","كاتب","صحفي","طيار","بحار","ملكة","أمير","صباح","مساء","طريق","مسجد","متجر","محطة","مطار","قطار","مطعم","فندق","متحف","مكتب","شركة","مصنع","رئيس","وزير","شرطة","سلام","حرية","ماضي","حاضر","شبكة"],
5:["خنزير","دجاجة","زرافة","تمساح","ثعبان","فراشة","ذبابة","بعوضة","حلزون","حمامة","عصفور","طاووس","ببغاء","بطريق","نعامة","باندا","فاكهة","كمثرى","ليمون","مانجو","طماطم","بطاطا","سبانخ","فطيرة","نافذة","أرضية","حديقة","طاولة","خزانة","سجادة","ستارة","مصباح","حاسوب","حقيبة","مفتاح","سحابة","عاصفة","بحيرة","جزيرة","صحراء","امرأة","رمادي","محامي","مهندس","أميرة","أسبوع","دقيقة","مدينة","كنيسة","مدرسة","سفينة","طائرة","سيارة","دراجة","جامعة","مكتبة","تلفاز","برمجة","تاريخ","أحياء","فلسفة","سياسة","حكومة","دستور","قانون","محكمة","معركة","هزيمة","عدالة","تطبيق"],
6:["سلحفاة","دولفين","عنكبوت","غوريلا","برتقال","فراولة","أناناس","بسكويت","مثلجات","بنفسجي","موسيقي","مستشفى","صيدلية","فيزياء","كيمياء","اقتصاد","برلمان","انتصار","مساواة","مستقبل","برنامج"],
7:["معكرونة","باذنجان","تلفزيون","برتقالي","رياضيات","جغرافيا","استقلال","مسؤولية","معلومات","مواصلات","اتصالات","مواطنون","مسؤولون","مهندسون"],
8:["فاصولياء","شوكولاتة","مستشفيات","انتخابات","اجتماعات","اقتصادية","اجتماعية"]
}
};
// per-language allowed letters, used both to sanitize the built-in lists and to filter keystrokes
const LETTER_REGEX = {
  en: /^[a-z]+$/,
  fr: /^[a-zàâäéèêëïîôöùûüÿçœæ]+$/,
  ar: /^[ء-ي]+$/
};
// sanitize: keep only words of the exact length, unique, lowercase, made of that language's letters
for (const lang of Object.keys(WORDS_BY_LANG)) {
  const words = WORDS_BY_LANG[lang];
  for (const k of Object.keys(words)) {
    const n = +k;
    words[k] = [...new Set(words[k].map(w => w.toLowerCase()))].filter(w => w.length === n && LETTER_REGEX[lang].test(w));
  }
}
const WORD_SETS_BY_LANG = Object.fromEntries(Object.entries(WORDS_BY_LANG)
  .map(([lang, words]) => [lang, Object.fromEntries(Object.entries(words).map(([k,v]) => [k, new Set(v)]))]));

/* ---------------- Core scoring (Mastermind rules) ---------------- */
export function score(secret, guess){
  const n = secret.length;
  let exact = 0;
  const sc = Object.create(null), gc = Object.create(null);
  for (let i = 0; i < n; i++){
    if (secret[i] === guess[i]) { exact++; continue; }
    sc[secret[i]] = (sc[secret[i]] || 0) + 1;
    gc[guess[i]]  = (gc[guess[i]]  || 0) + 1;
  }
  let partial = 0;
  for (const ch in gc) if (sc[ch]) partial += Math.min(sc[ch], gc[ch]);
  return { exact, partial, wrong: n - exact - partial };
}

/* ---------------- Secret generation ---------------- */
export function randomSecret(mode, len, lang){
  if (mode === "num"){
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
  }
  const list = (WORD_SETS_BY_LANG[lang] || WORD_SETS_BY_LANG.en)[len];
  const pool = list ? [...list] : [...WORD_SETS_BY_LANG.en[5]];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function isKnownWord(lang, len, word){
  const list = (WORD_SETS_BY_LANG[lang] || WORD_SETS_BY_LANG.en)[len];
  return !!list && list.has(word);
}
