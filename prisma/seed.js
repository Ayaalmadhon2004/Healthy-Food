import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Own client (instead of lib/prisma) so the seed runs on any Node version without loading TypeScript.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// --- Small helpers to keep the bilingual data readable ---
const L = (en, ar) => ({ en, ar });
const minutes = (n) => L(`${n} min`, `${n} ${n <= 10 ? "دقائق" : "دقيقة"}`);
const calories = (n) => L(`${n} cal`, `${n} سعرة`);
const grams = (n) => L(`${n}g`, `${n} غ`);
const nutrition = (protein, carbs, fat, fiber) => ({
  protein: grams(protein),
  carbs: grams(carbs),
  fat: grams(fat),
  fiber: grams(fiber),
});
const TYPES = {
  Breakfast: L("Breakfast", "فطور"),
  Lunch: L("Lunch", "غداء"),
  Dinner: L("Dinner", "عشاء"),
  Snacks: L("Snacks", "سناك"),
};

// --- 1. نصائح صحية ---
const healthTips = [
  {
    header: L("Safe Drinking Water", "مياه الشرب الآمنة"),
    iconName: "Droplet",
    advice: L("Drink only water you know is clean.", "اشرب فقط الماء الذي تتأكد من نظافته."),
    details: L(
      "Unsafe water is one of the main causes of diarrhea, especially in children.",
      "المياه غير الآمنة من أهم أسباب الإسهال، خاصة عند الأطفال."
    ),
    moreDetails: L(
      "Use water from a trusted source, such as a certified tanker or a distribution point, and keep it in a clean, covered container with a tap or a small opening. Never dip cups or hands into the container; pour from it instead. If you are not sure about the source, treat the water before drinking it. Adults generally need around 2 to 3 litres of fluids a day, and more in hot weather, when breastfeeding, or when ill. Use salty or unknown water only for washing, never for drinking or for preparing baby formula.",
      "استخدم ماء من مصدر موثوق مثل صهاريج معتمدة أو نقاط توزيع، واحفظه في وعاء نظيف مغطى له صنبور أو فتحة صغيرة. لا تغمس الأكواب أو اليدين في الوعاء، بل اسكب منه. وإذا لم تكن متأكداً من المصدر فعالج الماء قبل شربه. يحتاج البالغ عادةً إلى نحو 2 إلى 3 لترات من السوائل يومياً، وأكثر في الطقس الحار أو أثناء الرضاعة أو المرض. واستخدم الماء المالح أو مجهول المصدر للغسيل فقط، وليس للشرب ولا لتحضير حليب الأطفال."
    ),
  },
  {
    header: L("Making Water Safe", "تعقيم المياه"),
    iconName: "Droplet",
    advice: L("Boil it, or use chlorine tablets when you cannot boil.", "اغلِ الماء، أو استخدم أقراص الكلور إذا تعذّر الغلي."),
    details: L(
      "Boiling and chlorination both kill most germs that cause waterborne disease.",
      "الغلي والتعقيم بالكلور يقتلان معظم الجراثيم المسببة للأمراض المنقولة بالماء."
    ),
    moreDetails: L(
      "If the water looks cloudy, let it settle and pour it through a clean cloth first. Bring it to a rolling boil for at least one minute, then let it cool in a covered container. When fuel is scarce, chlorine tablets or drops are a good alternative: follow the instructions on the package exactly and wait about 30 minutes before drinking. Chlorinated water may smell slightly of chlorine, which is normal and safe at the right dose. Ask the health point or the water team in your area for tablets and the correct dose.",
      "إذا كان الماء عكراً فاتركه يرسب ثم صفِّه عبر قطعة قماش نظيفة أولاً. ثم اتركه يغلي غلياناً قوياً لدقيقة واحدة على الأقل، ودعه يبرد في وعاء مغطى. وعندما يقل الوقود تكون أقراص أو قطرات الكلور بديلاً جيداً: اتبع التعليمات على العبوة بدقة وانتظر نحو 30 دقيقة قبل الشرب. قد تكون للماء رائحة كلور خفيفة وهذا طبيعي وآمن عند الجرعة الصحيحة. اطلب الأقراص والجرعة الصحيحة من النقطة الصحية أو فريق المياه في منطقتك."
    ),
  },
  {
    header: L("Handwashing", "غسل اليدين"),
    iconName: "Droplet",
    advice: L("Wash hands with soap at the key moments.", "اغسل يديك بالصابون في اللحظات الأساسية."),
    details: L(
      "Handwashing cuts the spread of diarrhea and respiratory infections.",
      "غسل اليدين يقلل انتشار الإسهال والتهابات الجهاز التنفسي."
    ),
    moreDetails: L(
      "Wash your hands after using the toilet, after changing a diaper, before preparing food, before eating, and before feeding a child. Rub with soap for about 20 seconds, including between the fingers and under the nails, then rinse. If water is very limited, use a \"tippy-tap\": a small container with a tiny hole that lets a thin stream run, so a little water goes a long way. Ash or clean sand is better than rinsing with water alone when no soap is available. Keep children's nails short and help them wash too.",
      "اغسل يديك بعد استخدام الحمّام، وبعد تغيير الحفاظة، وقبل تحضير الطعام، وقبل الأكل، وقبل إطعام الطفل. افركهما بالصابون نحو 20 ثانية بما في ذلك بين الأصابع وتحت الأظافر، ثم اشطفهما. وإذا كان الماء شحيحاً جداً فاصنع \"حنفية صغيرة\" من عبوة بثقب صغير يسمح بخيط رفيع من الماء، فيكفي القليل منه. والرماد أو الرمل النظيف أفضل من الشطف بالماء وحده إذا لم يتوفر صابون. قصّ أظافر الأطفال وساعدهم على الغسل."
    ),
  },
  {
    header: L("Diarrhea and Oral Rehydration", "الإسهال والإماهة الفموية"),
    iconName: "Droplet",
    advice: L("Replace lost fluids early, and keep feeding.", "عوّض السوائل المفقودة مبكراً واستمر في التغذية."),
    details: L(
      "Dehydration from diarrhea is dangerous, especially for babies and young children.",
      "الجفاف الناتج عن الإسهال خطير، خاصة على الرضّع والأطفال الصغار."
    ),
    moreDetails: L(
      "Give oral rehydration salts (ORS) mixed with clean water exactly as written on the sachet, in small frequent sips. If no sachet is available, a temporary home mix is 6 level teaspoons of sugar and half a level teaspoon of salt in 1 litre of clean water; it is a stopgap, so get ORS as soon as you can. Keep breastfeeding and keep offering normal food. Children under five may also need zinc, which the clinic can provide. Go to a clinic urgently if there is blood in the stool, high fever, repeated vomiting, sunken eyes, very dry mouth, no urine for 6 hours, or the child is unusually sleepy.",
      "أعطِ أملاح الإماهة الفموية (ORS) مذابة في ماء نظيف تماماً كما هو مكتوب على الكيس، على رشفات صغيرة متكررة. وإن لم يتوفر الكيس فالخلطة المنزلية المؤقتة هي 6 ملاعق صغيرة مستوية من السكر ونصف ملعقة صغيرة مستوية من الملح في لتر ماء نظيف؛ وهي حل مؤقت فاحصل على أملاح الإماهة بأسرع وقت. واستمر في الرضاعة الطبيعية وقدّم الطعام المعتاد. وقد يحتاج الأطفال دون الخامسة إلى الزنك الذي توفره العيادة. توجّه إلى العيادة فوراً عند وجود دم في البراز، أو حرارة مرتفعة، أو قيء متكرر، أو غؤور العينين، أو جفاف الفم الشديد، أو انقطاع البول 6 ساعات، أو نعاس غير معتاد عند الطفل."
    ),
  },
  {
    header: L("Breastfeeding", "الرضاعة الطبيعية"),
    iconName: "Leaf",
    advice: L("Breast milk is the safest food for babies.", "حليب الأم هو أأمن غذاء للرضّع."),
    details: L(
      "Breastfeed exclusively for the first 6 months, and continue to 2 years or beyond.",
      "أرضعي حصرياً في الأشهر الستة الأولى واستمري حتى سنتين أو أكثر."
    ),
    moreDetails: L(
      "Breast milk is clean, free, and protects babies against diarrhea and infections, even when the mother is stressed or eating less than usual. Feed on demand, day and night, and keep the baby skin-to-skin as much as possible. Mothers should drink plenty of fluids and eat whatever nourishing food is available; your body prioritises your milk. If you feel your supply is low, feeding more often is the best way to increase it. Avoid prepared formula when water is unsafe, and ask a health worker or lactation counsellor for help if feeding is painful or the baby is not gaining weight.",
      "حليب الأم نظيف ومجاني ويحمي الطفل من الإسهال والعدوى حتى لو كانت الأم متوترة أو تأكل أقل من المعتاد. أرضعي عند الطلب ليلاً ونهاراً، وأبقي الطفل ملاصقاً لجلدك قدر الإمكان. على الأم أن تشرب سوائل كثيرة وتأكل أي طعام مغذٍّ متوفر؛ فجسمك يعطي الأولوية لحليبك. وإن شعرتِ بقلة الحليب فتكرار الرضاعة هو أفضل وسيلة لزيادته. تجنّبي الحليب الصناعي عندما تكون المياه غير آمنة، واطلبي مساعدة العاملين الصحيين أو مستشارة رضاعة إذا كانت الرضاعة مؤلمة أو لم يزد وزن الطفل."
    ),
  },
  {
    header: L("Feeding Babies from 6 Months", "تغذية الرضّع بعد ستة أشهر"),
    iconName: "Leaf",
    advice: L("Start soft, clean, nutrient-rich foods at 6 months.", "ابدأ بأطعمة طرية ونظيفة وغنية عند عمر ستة أشهر."),
    details: L(
      "Keep breastfeeding, and add small portions of thick, mashed food.",
      "استمري بالرضاعة وأضيفي كميات صغيرة من طعام مهروس سميك."
    ),
    moreDetails: L(
      "Begin with 2 to 3 spoonfuls of thick porridge or mashed food twice a day, and slowly build up to 3 to 4 meals by 9 months. Mashed lentils, well-cooked egg, mashed potato with a little oil, soft rice, and mashed fruit are good choices. Add a small amount of oil, tahini or mashed legumes to make each spoonful richer in energy. Do not add salt or sugar, and avoid honey before 1 year. Prepare each portion freshly with clean hands and utensils and never store leftovers of baby food. Never feed from a bottle with unclean water; use a cup and spoon instead.",
      "ابدئي بملعقتين إلى ثلاث من عصيدة سميكة أو طعام مهروس مرتين يومياً، وزيدي تدريجياً إلى 3 أو 4 وجبات عند عمر 9 أشهر. العدس المهروس والبيض المطبوخ جيداً وبطاطا مهروسة مع قليل من الزيت والأرز الطري والفاكهة المهروسة خيارات جيدة. أضيفي كمية صغيرة من الزيت أو الطحينة أو البقوليات المهروسة لتصبح كل ملعقة أغنى بالطاقة. لا تضيفي ملحاً أو سكراً، وتجنّبي العسل قبل عمر السنة. حضّري كل حصة طازجة بيدين وأدوات نظيفة ولا تحفظي بقايا طعام الطفل. وتجنّبي الرضّاعة بماء غير نظيف، واستخدمي الكوب والملعقة بدلاً منها."
    ),
  },
  {
    header: L("Warning Signs of Malnutrition in Children", "علامات سوء التغذية عند الأطفال"),
    iconName: "Activity",
    advice: L("Know the signs and act early.", "تعرّف على العلامات وتصرّف مبكراً."),
    details: L(
      "Early treatment of malnutrition is simple, effective, and saves lives.",
      "علاج سوء التغذية مبكراً بسيط وفعّال وينقذ الأرواح."
    ),
    moreDetails: L(
      "Watch for visible wasting, swollen feet or face, loss of appetite, constant tiredness, hair that is thin or changes colour, and a child who stops growing or playing. Health teams measure the mid-upper arm (MUAC): a reading in the yellow zone (11.5 to 12.5 cm) means moderate malnutrition, and the red zone (below 11.5 cm) is severe and urgent. Do not wait if you see swelling in both feet, repeated vomiting, or a child too weak to eat. Go to the nearest nutrition clinic or stabilisation centre, where ready-to-use therapeutic food is given. Continue breastfeeding throughout treatment.",
      "راقب الهزال الظاهر، أو تورّم القدمين أو الوجه، أو فقدان الشهية، أو التعب المستمر، أو شعراً خفيفاً يتغير لونه، أو طفلاً توقف عن النمو أو اللعب. تقيس الفرق الصحية محيط منتصف الذراع (MUAC): القراءة في المنطقة الصفراء (11.5 إلى 12.5 سم) تعني سوء تغذية متوسطاً، والمنطقة الحمراء (أقل من 11.5 سم) شديدة وعاجلة. لا تنتظر إذا رأيت تورماً في القدمين معاً، أو قيئاً متكرراً، أو طفلاً أضعف من أن يأكل. توجّه إلى أقرب عيادة تغذية أو مركز تثبيت حيث يُعطى الغذاء العلاجي الجاهز. واستمر في الرضاعة الطبيعية طوال العلاج."
    ),
  },
  {
    header: L("Preventing Anemia and Iron Deficiency", "الوقاية من فقر الدم ونقص الحديد"),
    iconName: "Leaf",
    advice: L("Combine iron foods with vitamin C.", "اجمع بين أطعمة الحديد وفيتامين سي."),
    details: L(
      "Iron deficiency is common in women, children, and pregnant mothers.",
      "نقص الحديد شائع عند النساء والأطفال والحوامل."
    ),
    moreDetails: L(
      "Lentils, chickpeas, fava beans, dark leafy greens like khubeizeh and molokhia, eggs, dates, and a little meat or fish all provide iron. Your body absorbs iron from plants much better when you add vitamin C, so squeeze lemon on lentils, add tomato or parsley to bean dishes, and eat fruit when you can. Try not to drink tea or coffee with meals, as they block iron absorption; wait an hour. Common signs of anemia are pallor, dizziness, fast heartbeat and extreme tiredness. Iron tablets from a clinic are needed for pregnant women and children with confirmed anemia, so do not rely on food alone.",
      "العدس والحمص والفول والخضار الورقية الداكنة مثل الخبيزة والملوخية والبيض والتمر وقليل من اللحم أو السمك كلها مصادر للحديد. يمتص الجسم الحديد النباتي بصورة أفضل بكثير مع فيتامين سي، فاعصر الليمون على العدس وأضف البندورة أو البقدونس إلى أطباق البقوليات وتناول الفاكهة عند توفرها. وحاول ألا تشرب الشاي أو القهوة مع الوجبة لأنهما يعيقان امتصاص الحديد، وانتظر ساعة. من علامات فقر الدم الشحوب والدوخة وخفقان القلب والتعب الشديد. وتحتاج الحامل والأطفال المصابون بفقر دم مؤكد إلى أقراص الحديد من العيادة، فلا تعتمد على الغذاء وحده."
    ),
  },
  {
    header: L("Eating Well in Pregnancy", "التغذية أثناء الحمل"),
    iconName: "Leaf",
    advice: L("Eat small, frequent, varied meals.", "تناولي وجبات صغيرة ومتكررة ومتنوعة."),
    details: L(
      "A well-nourished mother is the best start for a healthy baby.",
      "الأم المغذّاة جيداً هي أفضل بداية لطفل سليم."
    ),
    moreDetails: L(
      "Aim for 3 meals plus 2 snacks a day that include legumes, eggs, dairy if available, vegetables, and whole grains such as bulgur. If the clinic provides iron and folic acid tablets, take them every day; they prevent anemia and protect the baby's development. Drink plenty of safe water and avoid raw or undercooked meat, eggs and unpasteurised dairy. Rest often and do light walking. Seek medical care urgently for bleeding, severe headache, swelling of the face or hands, blurred vision, strong abdominal pain, reduced baby movements, or fever.",
      "اهدفي إلى 3 وجبات رئيسية مع وجبتين خفيفتين يومياً تشمل البقوليات والبيض ومنتجات الألبان إن توفرت والخضار والحبوب الكاملة مثل البرغل. وإذا وفّرت العيادة أقراص الحديد وحمض الفوليك فتناوليها يومياً؛ فهي تمنع فقر الدم وتحمي نمو الجنين. اشربي كثيراً من الماء الآمن وتجنّبي اللحوم والبيض النيئة أو غير المطهوّة جيداً والألبان غير المبسترة. استريحي كثيراً وامشي مشياً خفيفاً. وراجعي الطبيب فوراً عند حدوث نزيف، أو صداع شديد، أو تورّم الوجه أو اليدين، أو تشوّش الرؤية، أو ألم بطن قوي، أو نقص حركة الجنين، أو حمّى."
    ),
  },
  {
    header: L("Diabetes with Limited Food", "السكري مع شحّ الغذاء"),
    iconName: "Activity",
    advice: L("Keep meals regular and never skip your medicine plan.", "حافظ على انتظام الوجبات ولا تهمل خطة الدواء."),
    details: L(
      "Irregular eating makes blood sugar swing, which can be dangerous.",
      "عدم انتظام الأكل يسبب تذبذب السكر في الدم وقد يكون خطيراً."
    ),
    moreDetails: L(
      "Try to eat at similar times each day, and choose slower carbohydrates such as bulgur, lentils, and whole bread over white bread and sweets. Fill half your plate with vegetables when available. If you take insulin or tablets and cannot eat, talk to a doctor or pharmacist about adjusting the dose rather than stopping on your own. Learn the signs of low blood sugar, which are sweating, shaking, confusion and sudden hunger, and treat them at once with sugar, a date or sweet tea. Keep insulin as cool and shaded as possible, and check your feet daily for sores.",
      "حاول تناول الطعام في أوقات متقاربة كل يوم، واختر الكربوهيدرات بطيئة الامتصاص مثل البرغل والعدس والخبز الكامل بدلاً من الخبز الأبيض والحلويات. املأ نصف طبقك بالخضار عند توفرها. وإذا كنت تستخدم الأنسولين أو الأقراص ولا تستطيع الأكل فاستشر طبيباً أو صيدلياً لتعديل الجرعة بدلاً من التوقف من تلقاء نفسك. تعرّف على علامات هبوط السكر وهي التعرق والرجفة والارتباك والجوع المفاجئ، وعالجها فوراً بالسكر أو تمرة أو شاي محلّى. احفظ الأنسولين في مكان بارد ومظلل قدر الإمكان، وافحص قدميك يومياً بحثاً عن أي جروح."
    ),
  },
  {
    header: L("High Blood Pressure and Salt", "ضغط الدم والملح"),
    iconName: "Activity",
    advice: L("Cut hidden salt and keep taking your medicine.", "قلّل الملح الخفي واستمر في تناول دوائك."),
    details: L(
      "Much of the salt in aid food comes from canned and pickled items.",
      "كثير من الملح في المساعدات الغذائية يأتي من المعلبات والمخللات."
    ),
    moreDetails: L(
      "Rinse canned beans, vegetables and fish under clean water before using them, and taste before adding any salt. Flavour food with lemon, garlic, cumin, zaatar, sumac, and herbs instead. Limit pickles, salted cheese, and instant noodle seasoning packets. Never stop blood pressure medicine because you feel well; if your supply runs out, go to a clinic for a replacement. Eating dates, legumes and vegetables provides potassium, which helps. Seek urgent care for a severe headache, chest pain, sudden weakness on one side, or difficulty speaking.",
      "اشطف البقوليات والخضار والأسماك المعلّبة بماء نظيف قبل استخدامها، وتذوّق الطعام قبل إضافة الملح. وانكّه الطعام بالليمون والثوم والكمّون والزعتر والسمّاق والأعشاب بدلاً منه. قلّل من المخللات والأجبان المالحة وأكياس التتبيلة الجاهزة. لا توقف دواء الضغط لمجرد أنك تشعر بالتحسن؛ وإذا نفد دوائك فتوجّه إلى عيادة للحصول على بديل. ويساعد تناول التمر والبقوليات والخضار لأنها توفر البوتاسيوم. اطلب رعاية عاجلة عند الصداع الشديد أو ألم الصدر أو الضعف المفاجئ في جهة واحدة أو صعوبة الكلام."
    ),
  },
  {
    header: L("Food Safety Without a Fridge", "سلامة الغذاء بدون ثلاجة"),
    iconName: "Leaf",
    advice: L("Cook only what you will eat, and keep food covered.", "اطبخ ما ستأكله فقط وأبقِ الطعام مغطى."),
    details: L(
      "Cooked food left in the heat can grow harmful bacteria within a few hours.",
      "الطعام المطبوخ المتروك في الحرارة قد تنمو فيه بكتيريا ضارة خلال ساعات قليلة."
    ),
    moreDetails: L(
      "Eat cooked food within 2 hours in warm weather, and do not keep rice, meat or egg dishes overnight. Dried and low-moisture foods, such as lentils, bulgur, and dukkah, keep best in sealed jars in the shade. Keep raw and cooked food apart, and use separate knives and boards if you can. Keep water jars and food off the ground and covered from flies and dust. Reheat any leftovers until steaming hot all the way through, and throw away anything with a strange smell, colour or bulging can. When in doubt, throw it out.",
      "تناول الطعام المطبوخ خلال ساعتين في الطقس الحار، ولا تحتفظ بالأرز أو اللحم أو أطباق البيض إلى اليوم التالي. أما الأغذية الجافة قليلة الرطوبة مثل العدس والبرغل والدقة فتُحفظ أفضل في برطمانات محكمة في الظل. افصل الطعام النيء عن المطبوخ واستخدم سكاكين وألواح تقطيع منفصلة إن أمكن. أبقِ أوعية الماء والطعام بعيداً عن الأرض ومغطاة من الذباب والغبار. وأعد تسخين أي بقايا حتى تصبح ساخنة وتخرج منها أبخرة في كل جزء منها، وارمِ أي طعام برائحة أو لون غريب أو علبة منتفخة. وإذا شككت فيه فارمِه."
    ),
  },
  {
    header: L("Flour and Bread Handling", "تخزين الطحين والخبز"),
    iconName: "Leaf",
    advice: L("Keep flour dry, sealed, and inspected.", "أبقِ الطحين جافاً ومغلقاً وافحصه."),
    details: L(
      "Damp flour grows mold and attracts pests that spoil precious food.",
      "الطحين الرطب يعفّن وتجذب الآفات التي تتلف الغذاء الثمين."
    ),
    moreDetails: L(
      "Store flour in a sealed container raised off the ground, away from moisture and direct sun. Before using it, check for musty smell, clumps, webs, or tiny insects; sieving through a cloth removes most pests, but flour that smells bad or is visibly moldy should be thrown away. Never eat moldy bread, because some molds produce toxins that cooking does not remove. Bread can be sliced and dried in the sun for fatteh, croutons or breadcrumbs, which extends its life for weeks. Always wash your hands and tools before kneading.",
      "احفظ الطحين في وعاء محكم الإغلاق مرفوع عن الأرض بعيداً عن الرطوبة والشمس المباشرة. وقبل الاستخدام افحصه بحثاً عن رائحة عفن أو تكتلات أو خيوط عنكبوتية أو حشرات صغيرة؛ والغربلة بقطعة قماش تزيل معظم الآفات، أما الطحين ذو الرائحة السيئة أو العفن الظاهر فيجب رميه. لا تأكل خبزاً متعفناً أبداً، فبعض أنواع العفن تنتج سموماً لا يزيلها الطبخ. ويمكن تقطيع الخبز وتجفيفه في الشمس للفتة أو الفتات، فيدوم أسابيع. واغسل يديك وأدواتك دائماً قبل العجن."
    ),
  },
  {
    header: L("Sleep and Stress", "النوم والتوتر"),
    iconName: "Bed",
    advice: L("Protect your sleep and your mind as you protect your body.", "احمِ نومك وعقلك كما تحمي جسدك."),
    details: L(
      "Prolonged stress and poor sleep weaken the body and the mood.",
      "التوتر المستمر وقلة النوم يضعفان الجسم والمزاج."
    ),
    moreDetails: L(
      "Try to keep regular times for lying down and waking, even if sleep is broken by noise. Slow breathing, such as inhaling for 4 counts and exhaling for 6, calms the body in a minute or two. Talk with someone you trust, pray or reflect in the way that comforts you, and keep simple daily routines for children, as they help them feel secure. Nightmares, jumpiness and low mood are normal reactions to abnormal events, and most ease with time and support. If you have thoughts of harming yourself, cannot function for weeks, or a child withdraws completely, seek mental health support from a clinic or helpline.",
      "حاول الحفاظ على أوقات منتظمة للنوم والاستيقاظ حتى لو تقطّع نومك بسبب الضجيج. التنفس البطيء، كالشهيق لأربع عدّات والزفير لست، يهدّئ الجسم خلال دقيقة أو دقيقتين. تحدّث مع شخص تثق به، وصلِّ أو تأمل بما يريحك، وحافظ على روتين يومي بسيط للأطفال لأنه يمنحهم شعوراً بالأمان. الكوابيس والانتفاض وتدني المزاج ردود فعل طبيعية لأحداث غير طبيعية، ويخفّ معظمها مع الوقت والدعم. وإذا راودتك أفكار بإيذاء نفسك، أو عجزت عن أداء مهامك لأسابيع، أو انطوى طفل على نفسه تماماً، فاطلب دعماً نفسياً من عيادة أو خط مساعدة."
    ),
  },
  {
    header: L("Light Movement in Shelters", "حركة خفيفة داخل الملاجئ"),
    iconName: "Activity",
    advice: L("Move a little every hour, even in a small space.", "تحرّك قليلاً كل ساعة حتى في مساحة صغيرة."),
    details: L(
      "Gentle movement helps circulation, digestion, mood and sleep.",
      "الحركة الخفيفة تساعد الدورة الدموية والهضم والمزاج والنوم."
    ),
    moreDetails: L(
      "Stand up and stretch every hour, and walk in place or around your tent for 5 to 10 minutes a few times a day. Simple exercises include shoulder rolls, gentle neck stretches, seated leg lifts, ankle circles, and slow squats holding a wall or chair. These prevent stiffness, swollen legs and back pain from sleeping on thin mats. For children, make it a game, such as hopping, clapping rhythms or counting steps. Keep sessions gentle if you are underfed or weak, and stop if you feel dizzy, short of breath or chest pain.",
      "قف وتمدّد كل ساعة، وامشِ في مكانك أو حول خيمتك من 5 إلى 10 دقائق عدة مرات في اليوم. من التمارين البسيطة تدوير الكتفين وتمديد العنق بلطف ورفع الساقين وأنت جالس ودوائر الكاحل والقرفصاء البطيئة مع الاستناد إلى جدار أو كرسي. وهي تمنع التيبّس وتورّم الساقين وآلام الظهر الناتجة عن النوم على فرشات رقيقة. ومع الأطفال اجعلها لعبة كالقفز أو التصفيق بإيقاع أو عدّ الخطوات. وخفّف التمارين إذا كنت ضعيفاً أو لا تتناول ما يكفي، وتوقف إذا شعرت بدوخة أو ضيق نفس أو ألم في الصدر."
    ),
  },
  {
    header: L("Wounds and Skin Hygiene", "العناية بالجروح والجلد"),
    iconName: "Activity",
    advice: L("Clean every wound early and keep it covered.", "نظّف كل جرح مبكراً وأبقِه مغطى."),
    details: L(
      "Crowded living makes skin infections, scabies and lice common.",
      "الازدحام في السكن يجعل التهابات الجلد والجرب والقمل شائعة."
    ),
    moreDetails: L(
      "Wash small cuts and burns with clean, safe water and mild soap, pat dry, and cover with a clean dry dressing, changing it daily. Do not put toothpaste, coffee or oil on wounds. See a clinic for deep wounds, signs of infection like spreading redness, swelling, pus, fever or bad smell, and for animal bites. Wash bedding and clothes in hot water and dry them in the sun when scabies or lice occur, and treat everyone in the household at the same time with medicine from a clinic. Bathe or at least wash the face, hands, feet and underarms regularly, and change clothes when you can.",
      "اغسل الجروح والحروق الصغيرة بماء نظيف آمن وصابون لطيف، وجفّفها بالتربيت، وغطِّها بضماد نظيف جاف وبدّله يومياً. لا تضع معجون الأسنان أو القهوة أو الزيت على الجروح. راجع العيادة في الجروح العميقة وعند ظهور علامات العدوى كاحمرار منتشر أو تورّم أو صديد أو حمّى أو رائحة كريهة، وعند عضّات الحيوانات. اغسل الأغطية والملابس بماء ساخن وجفّفها في الشمس عند الإصابة بالجرب أو القمل، وعالج جميع أفراد الأسرة معاً بدواء من العيادة. واغتسل أو اغسل على الأقل الوجه واليدين والقدمين والإبطين بانتظام، وبدّل ملابسك عندما تستطيع."
    ),
  },
  {
    header: L("Nutrition for Older Adults", "تغذية كبار السن"),
    iconName: "Leaf",
    advice: L("Offer soft, protein-rich food in small, frequent portions.", "قدّم طعاماً طرياً غنياً بالبروتين بحصص صغيرة ومتكررة."),
    details: L(
      "Older adults lose muscle quickly and often feel less thirst.",
      "يفقد كبار السن عضلاتهم بسرعة وكثيراً ما يقل إحساسهم بالعطش."
    ),
    moreDetails: L(
      "Encourage sipping water, tea or soup throughout the day, even without thirst. Soft protein foods like mashed lentils, eggs, hummus, and yogurt are easier to chew and digest. Mash or finely chop food for people with dental problems. Add a spoon of olive oil or tahini to add calories without extra bulk. Check that regular medicines are taken with food if the label says so, and report sudden weight loss, confusion, or refusal to eat to a clinic. Sharing meals also helps with appetite and mood.",
      "شجّع على رشف الماء أو الشاي أو الشوربة طوال اليوم حتى لو لم يشعر بالعطش. الأطعمة البروتينية الطرية كالعدس المهروس والبيض والحمص واللبن أسهل في المضغ والهضم. اهرس الطعام أو قطّعه ناعماً لمن لديهم مشاكل في الأسنان. وأضف ملعقة زيت زيتون أو طحينة لزيادة السعرات دون حجم إضافي. تأكد من تناول الأدوية المعتادة مع الطعام إذا ذُكر ذلك في النشرة، وأبلغ العيادة عن فقدان وزن مفاجئ أو ارتباك أو رفض للأكل. كما أن تناول الطعام مع الآخرين يحسّن الشهية والمزاج."
    ),
  },
  {
    header: L("Safe Cooking Fuel and Fire", "الطبخ الآمن على النار"),
    iconName: "Activity",
    advice: L("Cook outside or where smoke can escape.", "اطبخ في الخارج أو في مكان يخرج منه الدخان."),
    details: L(
      "Smoke and fire are real risks when cooking in tents and shelters.",
      "الدخان والحريق خطران حقيقيان عند الطبخ في الخيام والملاجئ."
    ),
    moreDetails: L(
      "Never cook or burn charcoal inside a closed tent or room, because it releases carbon monoxide, which can kill silently. Keep fire away from fabric and keep children at a distance from cooking areas. Use dry wood and a lid on the pot to save fuel, and soak lentils or beans beforehand to cut cooking time. Pre-cut food and keep pots covered to reduce time on the fire. Keep a bucket of water or sand nearby. Seek help at once for headache, dizziness, nausea or fainting after being near a fire in an enclosed place.",
      "لا تطبخ ولا تحرق الفحم داخل خيمة أو غرفة مغلقة، فهو يطلق أول أكسيد الكربون الذي قد يقتل بصمت. أبعد النار عن الأقمشة وأبعد الأطفال عن مناطق الطبخ. استخدم حطباً جافاً وأغلق الوعاء بغطاء لتوفير الوقود، وانقع العدس أو الفول قبل الطبخ لتقليل الوقت. قطّع الطعام مسبقاً وأبقِ الأواني مغطاة لتقليل الوقت على النار. واحتفظ بدلو ماء أو رمل قريباً. اطلب المساعدة فوراً عند الصداع أو الدوخة أو الغثيان أو الإغماء بعد التواجد قرب نار في مكان مغلق."
    ),
  },
];

// --- 2. بيانات الوصفات ---
// Images are hand-drawn SVG illustrations in public/assets/recipes (no photos needed).
const foodRecipes = [
  {
    id: 1,
    img: "/assets/recipes/foul-medames.svg",
    type: TYPES.Breakfast,
    title: L("Foul Medames", "فول مدمس"),
    time: minutes(15),
    cal: calories(320),
    nutrition: nutrition(17, 42, 9, 14),
    ingredients: {
      en: ["1 can or 1.5 cups cooked fava beans", "2 garlic cloves, crushed", "2 tbsp lemon juice", "2 tbsp olive oil", "1 tsp ground cumin", "1 small tomato, diced", "2 tbsp chopped parsley", "Chili flakes and salt to taste"],
      ar: ["علبة أو كوب ونصف من الفول المطبوخ", "فصّان من الثوم المهروس", "ملعقتان كبيرتان من عصير الليمون", "ملعقتان كبيرتان من زيت الزيتون", "ملعقة صغيرة من الكمّون المطحون", "حبة بندورة صغيرة مقطّعة مكعبات", "ملعقتان كبيرتان من البقدونس المفروم", "شطة مجروشة وملح حسب الرغبة"],
    },
    instructions: {
      en: ["Warm the fava beans in a small pot with a splash of their liquid for 5 minutes.", "Lightly mash about half of the beans with a fork, leaving the rest whole.", "Stir in the garlic, cumin, lemon juice, and salt.", "Spoon into a bowl and top with the diced tomato and parsley.", "Drizzle with olive oil, add chili if you like, and serve with bread."],
      ar: ["سخّن الفول في قدر صغير مع قليل من مائه لمدة 5 دقائق.", "اهرس نصف الكمية تقريباً بشوكة واترك الباقي حبوباً كاملة.", "أضف الثوم والكمّون وعصير الليمون والملح وحرّك.", "اسكب الفول في صحن وزيّنه بالبندورة والبقدونس.", "رشّ زيت الزيتون وأضف الشطة إن أحببت وقدّمه مع الخبز."],
    },
  },
  {
    id: 2,
    img: "/assets/recipes/dagga-ghazzawiyya.svg",
    type: TYPES.Breakfast,
    title: L("Gazan Dagga (Spicy Tomato and Dill Salad)", "الدقة الغزّاوية (سلطة البندورة والشبت الحارّة)"),
    time: minutes(10),
    cal: calories(210),
    nutrition: nutrition(4, 28, 8, 5),
    ingredients: {
      en: ["4 ripe tomatoes, finely chopped", "2 hot green chilies, finely chopped", "3 garlic cloves, crushed", "A handful of fresh dill, chopped", "2 tbsp lemon juice", "1 tbsp olive oil", "Salt", "1 piece of bread to scoop"],
      ar: ["4 حبات بندورة ناضجة مفرومة ناعماً", "حبّتا فلفل أخضر حارّ مفرومتان ناعماً", "3 فصوص ثوم مهروسة", "حفنة من الشبت الطازج المفروم", "ملعقتان كبيرتان من عصير الليمون", "ملعقة كبيرة من زيت الزيتون", "ملح", "رغيف خبز للتغميس"],
    },
    instructions: {
      en: ["Crush the garlic with a pinch of salt into a paste, ideally in a mortar or the bottom of a bowl.", "Add the chopped chilies and press them lightly to release their heat.", "Add the tomatoes and dill and mix, pressing gently so the juices come out.", "Stir in the lemon juice and olive oil and taste for salt.", "Let it rest for 5 minutes, then serve with bread."],
      ar: ["اهرس الثوم مع رشة ملح حتى يصير معجوناً، ويفضّل في هاون أو في قاع صحن.", "أضف الفلفل الحارّ المفروم واهرسه برفق ليخرج حرّه.", "أضف البندورة والشبت وحرّك مع الضغط بلطف حتى يخرج العصير.", "أضف عصير الليمون وزيت الزيتون وتذوّق الملح.", "اتركها 5 دقائق ثم قدّمها مع الخبز."],
    },
  },
  {
    id: 3,
    img: "/assets/recipes/galayet-bandora.svg",
    type: TYPES.Breakfast,
    title: L("Galayet Bandora (Tomato Skillet with Eggs)", "قلاية بندورة (بيض مع البندورة)"),
    time: minutes(20),
    cal: calories(240),
    nutrition: nutrition(10, 14, 16, 4),
    ingredients: {
      en: ["5 ripe tomatoes, chopped", "3 garlic cloves, sliced", "1 hot chili or 1/2 tsp chili flakes", "3 tbsp olive oil", "2 eggs (optional)", "Fresh dill or parsley", "1/2 tsp salt", "Bread for serving"],
      ar: ["5 حبات بندورة ناضجة مقطّعة", "3 فصوص ثوم مقطّعة شرائح", "حبة فلفل حارّ أو نصف ملعقة صغيرة شطة مجروشة", "3 ملاعق كبيرة من زيت الزيتون", "بيضتان (اختياري)", "شبت أو بقدونس طازج", "نصف ملعقة صغيرة من الملح", "خبز للتقديم"],
    },
    instructions: {
      en: ["Heat the olive oil in a pan over medium heat and fry the garlic and chili for 30 seconds.", "Add the tomatoes and salt and cook, pressing them with a spoon, for 10 minutes until thick.", "Make two small wells in the sauce and crack in the eggs if using.", "Cover and cook for 3 to 4 minutes until the whites are set and the yolks are cooked as you like.", "Sprinkle with dill and serve straight from the pan with bread."],
      ar: ["سخّن زيت الزيتون في مقلاة على نار متوسطة وقلّب الثوم والفلفل 30 ثانية.", "أضف البندورة والملح واطبخ مع الهرس بالملعقة نحو 10 دقائق حتى يثخن الصلصة.", "اصنع حفرتين صغيرتين في الصلصة واكسر فيهما البيض إن استخدمته.", "غطِّ الطنجرة واطبخ 3 إلى 4 دقائق حتى يتماسك البياض وينضج الصفار كما تحب.", "رشّ الشبت وقدّمها من المقلاة مباشرة مع الخبز."],
    },
  },
  {
    id: 4,
    img: "/assets/recipes/zaatar-flatbread.svg",
    type: TYPES.Snacks,
    title: L("Za'atar Flatbread (Manakish)", "مناقيش زعتر"),
    time: minutes(30),
    cal: calories(260),
    nutrition: nutrition(7, 40, 8, 3),
    ingredients: {
      en: ["2 cups flour", "1/2 tsp salt", "1 tsp baking powder (or 1 tsp dry yeast)", "3/4 cup warm water", "3 tbsp za'atar", "3 tbsp olive oil, plus 1 tsp for the dough"],
      ar: ["كوبان من الطحين", "نصف ملعقة صغيرة من الملح", "ملعقة صغيرة من البيكنج باودر (أو ملعقة صغيرة من الخميرة الجافة)", "ثلاثة أرباع الكوب من الماء الدافئ", "3 ملاعق كبيرة من الزعتر", "3 ملاعق كبيرة من زيت الزيتون، وملعقة صغيرة إضافية للعجين"],
    },
    instructions: {
      en: ["Mix the flour, salt, and baking powder, then add the water and 1 teaspoon oil.", "Knead for 5 minutes until smooth and rest the dough for 10 minutes (20 if using yeast).", "Mix the za'atar with the 3 tablespoons of olive oil into a loose paste.", "Divide the dough into 4, roll each into a thin circle, and spread the za'atar mixture on top, leaving a small edge.", "Bake on a hot dry pan with a lid, a tray, or over embers for 4 to 5 minutes until golden and serve warm."],
      ar: ["اخلط الطحين والملح والبيكنج باودر ثم أضف الماء وملعقة الزيت.", "اعجنه 5 دقائق حتى يصبح ناعماً واتركه يرتاح 10 دقائق (20 دقيقة إذا استخدمت الخميرة).", "اخلط الزعتر مع 3 ملاعق من زيت الزيتون حتى يصبح معجوناً سائلاً.", "قسّم العجين إلى 4 كرات وافرد كل واحدة قرصاً رقيقاً وادهنها بخليط الزعتر مع ترك حافة صغيرة.", "اخبزها على مقلاة ساخنة جافة بغطاء أو على صاج أو فوق الجمر 4 إلى 5 دقائق حتى تحمرّ وقدّمها دافئة."],
    },
  },
  {
    id: 5,
    img: "/assets/recipes/sumagiyya.svg",
    type: TYPES.Lunch,
    title: L("Sumagiyya (Sumac Stew with Chard)", "السماقية"),
    time: minutes(60),
    cal: calories(380),
    nutrition: nutrition(16, 45, 15, 11),
    ingredients: {
      en: ["3 tbsp sumac soaked in 1.5 cups warm water", "2 cups chopped Swiss chard", "1 cup cooked chickpeas", "2 tbsp tahini", "1 tbsp flour", "4 garlic cloves", "1/2 cup chopped dill", "1 hot pepper and salt", "2 tbsp oil"],
      ar: ["3 ملاعق كبيرة من السمّاق منقوعة في كوب ونصف من الماء الدافئ", "كوبان من السلق المفروم", "كوب من الحمص المطبوخ", "ملعقتان كبيرتان من الطحينة", "ملعقة كبيرة من الطحين", "4 فصوص ثوم", "نصف كوب من الشبت المفروم", "حبة فلفل حارّ وملح", "ملعقتان كبيرتان من الزيت"],
    },
    instructions: {
      en: ["Soak the sumac in warm water for 15 minutes, then squeeze it and strain, keeping only the dark liquid.", "Sauté the chard in oil for 5 minutes until wilted, then add the chickpeas.", "Mix the flour into the sumac water and pour it into the pot, stirring until it begins to thicken.", "Simmer for 20 minutes, then add the tahini whisked with a little hot liquid.", "Crush the garlic, dill, hot pepper and a pinch of salt and fry in a little oil for 1 minute, then stir into the pot.", "Simmer 10 more minutes and serve with bread or rice."],
      ar: ["انقع السمّاق في الماء الدافئ 15 دقيقة ثم اعصره وصفِّه واحتفظ بالسائل الداكن فقط.", "قلّب السلق بالزيت 5 دقائق حتى يذبل ثم أضف الحمص.", "ذوّب الطحين في ماء السمّاق وصبّه في القدر مع التحريك حتى يبدأ بالثخانة.", "اتركه على نار هادئة 20 دقيقة ثم أضف الطحينة المخفوقة مع قليل من السائل الساخن.", "اهرس الثوم والشبت والفلفل الحارّ مع رشة ملح وقلّبها في قليل من الزيت دقيقة ثم أضفها إلى القدر.", "اتركه على النار 10 دقائق أخرى وقدّمه مع الخبز أو الأرز."],
    },
  },
  {
    id: 6,
    img: "/assets/recipes/maqluba.svg",
    type: TYPES.Lunch,
    title: L("Cauliflower Maqluba", "مقلوبة القرنبيط"),
    time: minutes(60),
    cal: calories(450),
    nutrition: nutrition(14, 62, 17, 8),
    ingredients: {
      en: ["2 cups rice, rinsed and soaked 15 minutes", "1 small cauliflower in florets", "1 large potato, sliced (or 1 eggplant)", "1 onion, sliced", "1 tsp mixed spices (baharat)", "1/2 tsp turmeric", "3 cups hot water or broth", "1/4 cup oil", "Salt"],
      ar: ["كوبان من الأرز مغسولان ومنقوعان 15 دقيقة", "رأس قرنبيط صغير مقطّع زهرات", "حبة بطاطا كبيرة مقطّعة شرائح (أو باذنجانة)", "بصلة مقطّعة شرائح", "ملعقة صغيرة من البهارات المشكّلة", "نصف ملعقة صغيرة من الكركم", "3 أكواب من الماء الساخن أو المرق", "ربع كوب من الزيت", "ملح"],
    },
    instructions: {
      en: ["Fry the cauliflower and potato slices in oil until golden on the outside, then drain.", "Layer the onion on the bottom of a heavy pot, then arrange the vegetables on top in a tight pattern.", "Mix the rice with the spices, turmeric, and salt and spread it evenly over the vegetables.", "Pour the hot water or broth slowly down the side of the pot, so the layers stay in place.", "Bring to a boil, then cover and cook on low heat for 30 minutes and rest 10 minutes off the heat.", "Place a large plate over the pot, flip it quickly and carefully, wait 5 minutes, then lift the pot off."],
      ar: ["قلِّ القرنبيط والبطاطا بالزيت حتى يحمرّا من الخارج ثم صفّهما.", "افرش البصل في قاع قدر ثقيل ثم رتّب الخضار فوقه بشكل متراصّ.", "اخلط الأرز مع البهارات والكركم والملح وافرده فوق الخضار بالتساوي.", "اسكب الماء الساخن أو المرق ببطء على جانب القدر حتى لا تختلط الطبقات.", "اتركه حتى يغلي ثم غطِّه واطبخه على نار هادئة 30 دقيقة واتركه يرتاح 10 دقائق بعيداً عن النار.", "ضع صحناً كبيراً فوق القدر واقلبه بسرعة وحذر، وانتظر 5 دقائق ثم ارفع القدر."],
    },
  },
  {
    id: 7,
    img: "/assets/recipes/mujaddara.svg",
    type: TYPES.Lunch,
    title: L("Mujaddara (Lentils and Rice with Onions)", "مجدّرة العدس والأرز"),
    time: minutes(45),
    cal: calories(410),
    nutrition: nutrition(15, 66, 9, 12),
    ingredients: {
      en: ["1 cup brown lentils, rinsed", "3/4 cup rice or coarse bulgur", "3 large onions, sliced thin", "3 tbsp oil", "1 tsp ground cumin", "4 cups water", "1 tsp salt", "Cucumber or yogurt to serve"],
      ar: ["كوب من العدس البنّي مغسول", "ثلاثة أرباع الكوب من الأرز أو البرغل الخشن", "3 حبات بصل كبيرة مقطّعة شرائح رفيعة", "3 ملاعق كبيرة من الزيت", "ملعقة صغيرة من الكمّون المطحون", "4 أكواب من الماء", "ملعقة صغيرة من الملح", "خيار أو لبن للتقديم"],
    },
    instructions: {
      en: ["Boil the lentils in the water for 15 minutes until they begin to soften.", "Meanwhile, fry the onions in oil over medium heat for 15 to 20 minutes, stirring often, until deep golden brown.", "Remove half of the onions and set them aside for topping.", "Add the rice, cumin and salt to the lentils with the rest of the onions and stir.", "Cover and cook on low for 15 minutes until the water is absorbed and the rice is tender.", "Serve topped with the crispy onions and a side of cucumber or yogurt."],
      ar: ["اسلق العدس في الماء 15 دقيقة حتى يبدأ بالليونة.", "في الوقت نفسه قلِّ البصل بالزيت على نار متوسطة 15 إلى 20 دقيقة مع التحريك حتى يصبح بنّياً ذهبياً غامقاً.", "أخرج نصف البصل واتركه جانباً للتزيين.", "أضف الأرز والكمّون والملح إلى العدس مع بقية البصل وحرّك.", "غطِّ القدر واطبخه على نار هادئة 15 دقيقة حتى يُمتصّ الماء وينضج الأرز.", "قدّمها مزيّنة بالبصل المقرمش مع الخيار أو اللبن."],
    },
  },
  {
    id: 8,
    img: "/assets/recipes/sayadiya.svg",
    type: TYPES.Lunch,
    title: L("Sayadiya (Fish and Spiced Rice)", "صيادية السمك"),
    time: minutes(60),
    cal: calories(520),
    nutrition: nutrition(32, 62, 15, 4),
    ingredients: {
      en: ["500 g fresh white fish or sardines, cleaned", "2 cups rice, rinsed", "4 onions, sliced", "2 tsp ground cumin", "1 tsp turmeric", "4 garlic cloves", "1/3 cup oil", "3.5 cups water", "Lemon and salt"],
      ar: ["500 غرام من السمك الأبيض الطازج أو السردين منظّف", "كوبان من الأرز مغسولان", "4 حبات بصل مقطّعة شرائح", "ملعقتان صغيرتان من الكمّون المطحون", "ملعقة صغيرة من الكركم", "4 فصوص ثوم", "ثلث كوب من الزيت", "3 أكواب ونصف من الماء", "ليمون وملح"],
    },
    instructions: {
      en: ["Season the fish with salt, half the cumin, and crushed garlic, and leave 15 minutes.", "Fry the fish in a little oil until cooked and golden on both sides, then set aside.", "In the same pot, cook the onions with the remaining oil for 20 minutes until very dark brown and sweet.", "Add the water, remaining cumin, turmeric, and salt, and boil 5 minutes to make a rich broth, straining out any bones.", "Add the rice, cover, and cook on low heat for 20 minutes until fluffy.", "Spoon the rice onto a platter, lay the fish on top, and serve with lemon."],
      ar: ["تبّل السمك بالملح ونصف الكمّون والثوم المهروس واتركه 15 دقيقة.", "اقلِ السمك بقليل من الزيت حتى ينضج ويحمرّ من الجانبين ثم أخرجه جانباً.", "في القدر نفسه اطبخ البصل مع بقية الزيت 20 دقيقة حتى يصبح غامقاً جداً وحلواً.", "أضف الماء وباقي الكمّون والكركم والملح واتركه يغلي 5 دقائق ليصبح مرقاً غنياً، وصفِّه من أي عظام.", "أضف الأرز وغطِّ القدر واطبخه على نار هادئة 20 دقيقة حتى ينضج ويتفكّك.", "اسكب الأرز في صحن كبير وضع السمك فوقه وقدّمه مع الليمون."],
    },
  },
  {
    id: 9,
    img: "/assets/recipes/khubeizeh.svg",
    type: TYPES.Lunch,
    title: L("Khubeizeh (Wild Mallow Greens)", "الخبيزة"),
    time: minutes(25),
    cal: calories(160),
    nutrition: nutrition(6, 18, 7, 7),
    ingredients: {
      en: ["1 kg khubeizeh (wild mallow) leaves", "1 large onion, chopped", "4 garlic cloves", "3 tbsp olive oil", "1 lemon, juiced", "1 tsp salt", "Pinch of chili flakes", "Bread to serve"],
      ar: ["كيلوغرام من أوراق الخبيزة", "بصلة كبيرة مفرومة", "4 فصوص ثوم", "3 ملاعق كبيرة من زيت الزيتون", "ليمونة معصورة", "ملعقة صغيرة من الملح", "رشة شطة مجروشة", "خبز للتقديم"],
    },
    instructions: {
      en: ["Only use leaves picked from a clean area, away from sewage or waste, and wash them in three changes of clean water.", "Remove thick stems and chop the leaves roughly.", "Sauté the onion in olive oil until soft, then add the crushed garlic for 30 seconds.", "Add the leaves, salt and chili and cook on medium heat for 10 to 15 minutes, stirring, until completely wilted and soft.", "Finish with lemon juice and serve warm with bread."],
      ar: ["استخدم فقط أوراقاً مقطوفة من مكان نظيف بعيداً عن المجاري أو النفايات، واغسلها بثلاث مياه نظيفة.", "انزع السيقان السميكة وقطّع الأوراق تقطيعاً خشناً.", "قلّب البصل بزيت الزيتون حتى يذبل ثم أضف الثوم المهروس 30 ثانية.", "أضف الأوراق والملح والشطة واطبخ على نار متوسطة 10 إلى 15 دقيقة مع التحريك حتى تذبل تماماً وتطرى.", "أضف عصير الليمون وقدّمها دافئة مع الخبز."],
    },
  },
  {
    id: 10,
    img: "/assets/recipes/qidra.svg",
    type: TYPES.Lunch,
    title: L("Qidra (Spiced Rice and Chickpeas in a Clay Pot)", "قدرة الأرز والحمص"),
    time: minutes(90),
    cal: calories(480),
    nutrition: nutrition(22, 60, 17, 9),
    ingredients: {
      en: ["2 cups rice, rinsed", "1 cup chickpeas, soaked overnight", "250 g meat or bones (optional)", "1 onion, chopped", "1 tsp cumin, 1/2 tsp cinnamon, 1/2 tsp turmeric", "3 tbsp oil or ghee", "4 cups hot broth or water", "Salt"],
      ar: ["كوبان من الأرز مغسولان", "كوب من الحمص منقوع من الليلة السابقة", "250 غرام من اللحم أو العظام (اختياري)", "بصلة مفرومة", "ملعقة صغيرة كمّون، ونصف ملعقة قرفة، ونصف ملعقة كركم", "3 ملاعق كبيرة من الزيت أو السمن", "4 أكواب من المرق أو الماء الساخن", "ملح"],
    },
    instructions: {
      en: ["Boil the chickpeas (and meat if using) in water for 40 minutes until half cooked, and drain, keeping the broth.", "Heat the oil in a clay or heavy pot and fry the onion until golden.", "Add the chickpeas, meat, cumin, cinnamon, turmeric and salt and stir for 2 minutes.", "Add the rice and stir to coat it in the spices.", "Pour in the hot broth, bring to a boil, then cover tightly and cook on the lowest heat for 25 to 30 minutes.", "Rest 10 minutes before serving with yogurt or a simple salad."],
      ar: ["اسلق الحمص (واللحم إن استخدمته) في الماء 40 دقيقة حتى ينضج نصف نضج، وصفِّه واحتفظ بالمرق.", "سخّن الزيت في قدر فخاري أو ثقيل وقلِّ البصل حتى يحمرّ.", "أضف الحمص واللحم والكمّون والقرفة والكركم والملح وحرّك دقيقتين.", "أضف الأرز وقلّبه حتى تتغطى حباته بالتوابل.", "اسكب المرق الساخن واتركه يغلي ثم غطِّه بإحكام واطبخه على أخفض نار 25 إلى 30 دقيقة.", "اتركه يرتاح 10 دقائق ثم قدّمه مع اللبن أو سلطة بسيطة."],
    },
  },
  {
    id: 11,
    img: "/assets/recipes/musakhan.svg",
    type: TYPES.Dinner,
    title: L("Musakhan (Sumac Chicken and Onions)", "مسخّن الدجاج"),
    time: minutes(75),
    cal: calories(540),
    nutrition: nutrition(30, 52, 22, 5),
    ingredients: {
      en: ["4 chicken pieces", "4 large onions, sliced", "3 tbsp sumac", "1/3 cup olive oil", "1 tsp allspice", "1/2 tsp cinnamon", "4 pieces of taboon or flatbread", "Salt"],
      ar: ["4 قطع دجاج", "4 حبات بصل كبيرة مقطّعة شرائح", "3 ملاعق كبيرة من السمّاق", "ثلث كوب من زيت الزيتون", "ملعقة صغيرة من البهار الحلو", "نصف ملعقة صغيرة من القرفة", "4 أرغفة طابون أو خبز مسطّح", "ملح"],
    },
    instructions: {
      en: ["Rub the chicken with salt, allspice, cinnamon, and 1 tablespoon of sumac.", "Cook the chicken in a covered pot with a little water for 30 minutes, or roast until fully cooked and browned.", "Cook the onions in olive oil on low heat for 20 minutes until soft and sweet, then stir in the rest of the sumac and salt.", "Spread the onion mixture over the bread and bake or heat on a dry pan for 5 minutes.", "Place the chicken on top, and serve warm with the cooking juices poured over."],
      ar: ["افرك الدجاج بالملح والبهار الحلو والقرفة وملعقة من السمّاق.", "اطبخ الدجاج في قدر مغطى مع قليل من الماء 30 دقيقة أو اشوِه حتى ينضج تماماً ويحمرّ.", "اطبخ البصل بزيت الزيتون على نار هادئة 20 دقيقة حتى يطرى ويحلو ثم أضف باقي السمّاق والملح.", "وزّع خليط البصل على الخبز واخبزه أو سخّنه على مقلاة جافة 5 دقائق.", "ضع الدجاج فوقه وقدّمه دافئاً مع سكب مرق الطبخ عليه."],
    },
  },
  {
    id: 12,
    img: "/assets/recipes/fatteh.svg",
    type: TYPES.Dinner,
    title: L("Chickpea Fatteh", "فتّة الحمص"),
    time: minutes(25),
    cal: calories(430),
    nutrition: nutrition(18, 52, 16, 10),
    ingredients: {
      en: ["2 stale flatbreads, torn or cubed", "1.5 cups cooked chickpeas, warm", "1 cup plain yogurt", "2 tbsp tahini", "2 garlic cloves, crushed", "2 tbsp lemon juice", "1 tbsp olive oil or ghee", "1/2 tsp cumin, parsley and paprika"],
      ar: ["رغيفا خبز قديمان مقطّعان قطعاً صغيرة", "كوب ونصف من الحمص المطبوخ الدافئ", "كوب من اللبن الزبادي", "ملعقتان كبيرتان من الطحينة", "فصّان من الثوم المهروس", "ملعقتان كبيرتان من عصير الليمون", "ملعقة كبيرة من زيت الزيتون أو السمن", "نصف ملعقة صغيرة من الكمّون وبقدونس وبابريكا"],
    },
    instructions: {
      en: ["Toast the bread pieces in a dry pan or oven until crisp and golden.", "Mix the yogurt, tahini, garlic, lemon juice, cumin, and a pinch of salt into a smooth sauce, adding a spoon of water if it is too thick.", "Place the toasted bread in a deep bowl and moisten it with a few spoons of the chickpea cooking liquid.", "Spread the warm chickpeas over the bread, then pour the yogurt sauce on top.", "Heat the oil, drizzle it over the dish, and top with parsley and paprika. If you have no yogurt, make the sauce from tahini, lemon, garlic and water."],
      ar: ["حمّص الخبز في مقلاة جافة أو فرن حتى يقرمش ويحمرّ.", "اخلط اللبن والطحينة والثوم وعصير الليمون والكمّون ورشة ملح حتى يصير صلصة ناعمة، وأضف ملعقة ماء إذا كانت ثقيلة.", "ضع الخبز المحمّص في صحن عميق وبلّله بملاعق من مرق الحمص.", "وزّع الحمص الدافئ فوق الخبز ثم اسكب صلصة اللبن فوقه.", "سخّن الزيت وصبّه فوق الطبق وزيّنه بالبقدونس والبابريكا. وإن لم يتوفر اللبن فاصنع الصلصة من الطحينة والليمون والثوم والماء."],
    },
  },
  {
    id: 13,
    img: "/assets/recipes/shorba-adas.svg",
    type: TYPES.Dinner,
    title: L("Lentil Soup (Shorbat Adas)", "شوربة العدس"),
    time: minutes(35),
    cal: calories(250),
    nutrition: nutrition(14, 38, 5, 11),
    ingredients: {
      en: ["1 cup red lentils, rinsed", "1 onion, chopped", "1 carrot, diced", "1 potato, diced", "2 garlic cloves", "1 tsp cumin and 1/2 tsp turmeric", "5 cups water", "1 tbsp oil", "Lemon and salt"],
      ar: ["كوب من العدس الأحمر مغسول", "بصلة مفرومة", "جزرة مقطّعة مكعبات", "حبة بطاطا مقطّعة مكعبات", "فصّان من الثوم", "ملعقة صغيرة كمّون ونصف ملعقة كركم", "5 أكواب من الماء", "ملعقة كبيرة من الزيت", "ليمون وملح"],
    },
    instructions: {
      en: ["Sauté the onion and garlic in the oil for 3 minutes until soft.", "Add the cumin and turmeric and stir for 30 seconds.", "Add the lentils, carrot, potato, and water and bring to a boil.", "Lower the heat and simmer for 25 minutes until everything is very soft.", "Blend or mash until smooth, add salt, and serve with a squeeze of lemon and bread."],
      ar: ["قلّب البصل والثوم بالزيت 3 دقائق حتى يذبلا.", "أضف الكمّون والكركم وقلّب 30 ثانية.", "أضف العدس والجزر والبطاطا والماء واتركه يغلي.", "خفّض النار واتركه 25 دقيقة حتى يصبح كل شيء طرياً جداً.", "اخفقه بالخلاط أو اهرسه حتى ينعم وأضف الملح وقدّمه مع عصرة ليمون والخبز."],
    },
  },
  {
    id: 14,
    img: "/assets/recipes/hummus.svg",
    type: TYPES.Snacks,
    title: L("Hummus with Tahini", "حمّص بالطحينة"),
    time: minutes(15),
    cal: calories(230),
    nutrition: nutrition(9, 24, 11, 7),
    ingredients: {
      en: ["1.5 cups cooked chickpeas", "3 tbsp tahini", "2 garlic cloves", "3 tbsp lemon juice", "1/2 tsp cumin", "1/4 cup chickpea cooking water", "1 tbsp olive oil", "Salt and paprika"],
      ar: ["كوب ونصف من الحمص المطبوخ", "3 ملاعق كبيرة من الطحينة", "فصّان من الثوم", "3 ملاعق كبيرة من عصير الليمون", "نصف ملعقة صغيرة من الكمّون", "ربع كوب من ماء سلق الحمص", "ملعقة كبيرة من زيت الزيتون", "ملح وبابريكا"],
    },
    instructions: {
      en: ["Keep a few whole chickpeas aside for decoration.", "Crush or blend the chickpeas with the garlic, cumin, and salt into a rough paste.", "Add the tahini and lemon juice and mix, then add the cooking water slowly until creamy and smooth.", "Taste and adjust the salt and lemon.", "Spread in a shallow dish, making a small well, then add the oil, whole chickpeas and paprika. Serve with bread or raw vegetables."],
      ar: ["احتفظ ببضع حبات حمص كاملة للتزيين.", "اهرس الحمص أو اخلطه مع الثوم والكمّون والملح حتى يصبح معجوناً خشناً.", "أضف الطحينة وعصير الليمون وحرّك ثم أضف ماء السلق ببطء حتى يصبح كريمياً وناعماً.", "تذوّق وعدّل الملح والليمون.", "افرده في صحن مسطّح مع عمل حفرة صغيرة في الوسط ثم أضف الزيت والحمص الكامل والبابريكا. قدّمه مع الخبز أو الخضار النيئة."],
    },
  },
  {
    id: 15,
    img: "/assets/recipes/bulgur-bandora.svg",
    type: TYPES.Dinner,
    title: L("Bulgur with Tomato (Burghul bi Bandora)", "برغل بالبندورة"),
    time: minutes(30),
    cal: calories(340),
    nutrition: nutrition(11, 62, 6, 11),
    ingredients: {
      en: ["1.5 cups coarse bulgur", "4 tomatoes, chopped (or 2 tbsp tomato paste)", "1 onion, chopped", "2 tbsp olive oil", "1 green chili (optional)", "3 cups hot water", "1 tsp salt", "Chopped parsley"],
      ar: ["كوب ونصف من البرغل الخشن", "4 حبات بندورة مقطّعة (أو ملعقتان كبيرتان من معجون البندورة)", "بصلة مفرومة", "ملعقتان كبيرتان من زيت الزيتون", "حبة فلفل أخضر (اختياري)", "3 أكواب من الماء الساخن", "ملعقة صغيرة من الملح", "بقدونس مفروم"],
    },
    instructions: {
      en: ["Sauté the onion in olive oil until golden.", "Add the tomatoes and chili and cook for 8 minutes until they break down into a sauce.", "Stir in the bulgur and fry for 1 minute.", "Add the hot water and salt, bring to a boil, then cover and cook on low for 15 minutes.", "Turn off the heat and let it rest covered for 10 minutes, fluff with a fork, and top with parsley."],
      ar: ["قلّب البصل بزيت الزيتون حتى يحمرّ.", "أضف البندورة والفلفل واطبخها 8 دقائق حتى تتحول إلى صلصة.", "أضف البرغل وقلّبه دقيقة.", "أضف الماء الساخن والملح واتركه يغلي ثم غطِّه واطبخه على نار هادئة 15 دقيقة.", "أطفئ النار واتركه مغطى 10 دقائق ثم فكّكه بشوكة وزيّنه بالبقدونس."],
    },
  },
];

// --- 3. بيانات المطابخ المجتمعية ---
// region.en must be one of: North, Gaza, Middle, Khan Younis, Rafah (see KitchensFilterClient.tsx).
const REGION = {
  North: L("North", "الشمال"),
  Gaza: L("Gaza", "غزة"),
  Middle: L("Middle", "الوسطى"),
  KhanYounis: L("Khan Younis", "خانيونس"),
  Rafah: L("Rafah", "رفح"),
};
const kitchens = [
  {
    name: L("Al-Sadaqa Kitchen", "مطبخ الصداقة"),
    location: L("Al-Shuja'iyya, Gaza City", "الشجاعية، مدينة غزة"),
    region: REGION.Gaza,
    distributionTime: L("1:00 PM", "1:00 ظهراً"),
    capacity: L("350-500 families", "350-500 أسرة"),
    todaysMeal: L("Lentil soup + bread", "شوربة عدس + خبز"),
    accessInfo: L("Open to all families. Bring your own container.", "مفتوح لجميع العائلات. أحضروا وعاءكم الخاص."),
    contact: "+970-599-100101",
  },
  {
    name: L("Al-Rahma Community Kitchen", "مطبخ الرحمة المجتمعي"),
    location: L("Al-Rimal, Gaza City", "الرمال، مدينة غزة"),
    region: REGION.Gaza,
    distributionTime: L("12:30 PM", "12:30 ظهراً"),
    capacity: L("400-600 families", "400-600 أسرة"),
    todaysMeal: L("Rice with chickpeas", "أرز بالحمص"),
    accessInfo: L("Priority for families with young children and elderly.", "الأولوية للعائلات التي لديها أطفال صغار وكبار سن."),
    contact: "+970-597-100102",
  },
  {
    name: L("Tal Al-Hawa Shared Table", "المائدة المشتركة - تل الهوى"),
    location: L("Tal Al-Hawa, Gaza City", "تل الهوى، مدينة غزة"),
    region: REGION.Gaza,
    distributionTime: L("2:00 PM", "2:00 ظهراً"),
    capacity: L("250-350 families", "250-350 أسرة"),
    todaysMeal: L("Bulgur with tomato", "برغل بالبندورة"),
    accessInfo: L("Register at the gate by 11:00 AM for the same day.", "التسجيل عند البوابة حتى الساعة 11:00 صباحاً لنفس اليوم."),
    contact: "+970-592-100103",
  },
  {
    name: L("Jabalia Hope Kitchen", "مطبخ الأمل - جباليا"),
    location: L("Jabalia Camp, North Gaza", "مخيم جباليا، شمال غزة"),
    region: REGION.North,
    distributionTime: L("12:00 PM", "12:00 ظهراً"),
    capacity: L("500-700 families", "500-700 أسرة"),
    todaysMeal: L("Mujaddara with onions", "مجدّرة بالبصل"),
    accessInfo: L("Open to all. Please arrive early.", "مفتوح للجميع. يُرجى الحضور مبكراً."),
    contact: "+970-599-100104",
  },
  {
    name: L("Beit Lahia Neighbours Kitchen", "مطبخ الجيران - بيت لاهيا"),
    location: L("Beit Lahia, North Gaza", "بيت لاهيا، شمال غزة"),
    region: REGION.North,
    distributionTime: L("1:30 PM", "1:30 ظهراً"),
    capacity: L("200-300 families", "200-300 أسرة"),
    todaysMeal: L("Fava bean stew + bread", "فول مدمس + خبز"),
    accessInfo: L("Families sheltering nearby are served first.", "تُخدم أولاً العائلات المقيمة في الأماكن القريبة."),
    contact: "+970-595-100105",
  },
  {
    name: L("Beit Hanoun Community Pot", "قدر الحيّ - بيت حانون"),
    location: L("Beit Hanoun, North Gaza", "بيت حانون، شمال غزة"),
    region: REGION.North,
    distributionTime: L("1:00 PM", "1:00 ظهراً"),
    capacity: L("150-250 families", "150-250 أسرة"),
    todaysMeal: L("Vegetable and lentil stew", "يخنة خضار وعدس"),
    accessInfo: L("Open to all. Children's portions available.", "مفتوح للجميع. تتوفر حصص للأطفال."),
    contact: "+970-598-100106",
  },
  {
    name: L("Nuseirat Together Kitchen", "مطبخ معاً - النصيرات"),
    location: L("Nuseirat Camp, Middle Area", "مخيم النصيرات، المنطقة الوسطى"),
    region: REGION.Middle,
    distributionTime: L("12:30 PM", "12:30 ظهراً"),
    capacity: L("450-650 families", "450-650 أسرة"),
    todaysMeal: L("Maqluba with cauliflower", "مقلوبة القرنبيط"),
    accessInfo: L("Open to all. One portion per family member.", "مفتوح للجميع. حصة واحدة لكل فرد من الأسرة."),
    contact: "+970-597-100107",
  },
  {
    name: L("Deir Al-Balah Palm Kitchen", "مطبخ النخيل - دير البلح"),
    location: L("Deir Al-Balah, Middle Area", "دير البلح، المنطقة الوسطى"),
    region: REGION.Middle,
    distributionTime: L("1:00 PM", "1:00 ظهراً"),
    capacity: L("300-450 families", "300-450 أسرة"),
    todaysMeal: L("Qidra with rice and chickpeas", "قدرة أرز وحمص"),
    accessInfo: L("Open to all. Nutrition screening for children on Sundays.", "مفتوح للجميع. فحص تغذية للأطفال أيام الأحد."),
    contact: "+970-592-100108",
  },
  {
    name: L("Al-Bureij Sharing Kitchen", "مطبخ التشارك - البريج"),
    location: L("Al-Bureij Camp, Middle Area", "مخيم البريج، المنطقة الوسطى"),
    region: REGION.Middle,
    distributionTime: L("2:00 PM", "2:00 ظهراً"),
    capacity: L("200-300 families", "200-300 أسرة"),
    todaysMeal: L("Lentil soup + bread", "شوربة عدس + خبز"),
    accessInfo: L("Priority for pregnant and breastfeeding mothers.", "الأولوية للحوامل والمرضعات."),
    contact: "+970-599-100109",
  },
  {
    name: L("Khan Younis Al-Karam Kitchen", "مطبخ الكرم - خانيونس"),
    location: L("Khan Younis City Centre", "وسط مدينة خانيونس"),
    region: REGION.KhanYounis,
    distributionTime: L("12:00 PM", "12:00 ظهراً"),
    capacity: L("400-600 families", "400-600 أسرة"),
    todaysMeal: L("Sumac onion rice", "أرز بالبصل والسمّاق"),
    accessInfo: L("Open to all families. No ID required.", "مفتوح لجميع العائلات. لا يلزم إبراز هوية."),
    contact: "+970-595-100110",
  },
  {
    name: L("Al-Mawasi Sea Breeze Kitchen", "مطبخ نسيم البحر - المواصي"),
    location: L("Al-Mawasi, Khan Younis", "المواصي، خانيونس"),
    region: REGION.KhanYounis,
    distributionTime: L("1:30 PM", "1:30 ظهراً"),
    capacity: L("600-900 families", "600-900 أسرة"),
    todaysMeal: L("Sayadiya (fish and rice)", "صيادية السمك"),
    accessInfo: L("Open to displaced families in nearby tent areas.", "مفتوح للعائلات النازحة في مخيمات الخيام القريبة."),
    contact: "+970-598-100111",
  },
  {
    name: L("Rafah Olive Tree Kitchen", "مطبخ شجرة الزيتون - رفح"),
    location: L("Tal As-Sultan, Rafah", "تل السلطان، رفح"),
    region: REGION.Rafah,
    distributionTime: L("12:30 PM", "12:30 ظهراً"),
    capacity: L("300-500 families", "300-500 أسرة"),
    todaysMeal: L("Bulgur with tomato + salad", "برغل بالبندورة + سلطة"),
    accessInfo: L("Open to all. Wheelchair access at the side entrance.", "مفتوح للجميع. مدخل جانبي مهيأ للكراسي المتحركة."),
    contact: "+970-597-100112",
  },
  {
    name: L("Rafah Al-Amal Family Kitchen", "مطبخ الأمل العائلي - رفح"),
    location: L("Al-Shaboura, Rafah", "الشابورة، رفح"),
    region: REGION.Rafah,
    distributionTime: L("2:00 PM", "2:00 ظهراً"),
    capacity: L("250-400 families", "250-400 أسرة"),
    todaysMeal: L("Chickpea fatteh", "فتّة الحمص"),
    accessInfo: L("Open to all. Soft meals for infants and elderly on request.", "مفتوح للجميع. وجبات طرية للرضّع وكبار السن عند الطلب."),
    contact: "+970-592-100113",
  },
];

// --- 4. بيانات الأطباء ---
const doctorsData = [
  {
    name: L("Dr. Rania Abu Shamala", "د. رانيا أبو شمالة"),
    specialty: L("Clinical Nutritionist", "أخصائية تغذية علاجية"),
    qualifications: { en: ["MSc in Clinical Nutrition", "Certified in community management of acute malnutrition"], ar: ["ماجستير في التغذية العلاجية", "شهادة في الإدارة المجتمعية لسوء التغذية الحاد"] },
    rating: 4.9,
    reviews: 214,
    location: L("Al-Rimal Clinic, Gaza City", "عيادة الرمال، مدينة غزة"),
    phone: "+970-599-200201",
    email: "rania.abushamala@example.org",
    about: L(
      "Rania supports families with children and pregnant mothers on making the most of limited food, and leads nutrition screening days.",
      "تدعم رانيا العائلات التي لديها أطفال والأمهات الحوامل في الاستفادة القصوى من الغذاء المحدود، وتشرف على أيام فحص التغذية."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sun-Thu, 9:00 AM - 2:00 PM", "الأحد-الخميس، 9:00 ص - 2:00 م"),
  },
  {
    name: L("Dr. Khaled Al-Masri", "د. خالد المصري"),
    specialty: L("Pediatrician", "طبيب أطفال"),
    qualifications: { en: ["MD, Pediatrics", "Fellow in child nutrition"], ar: ["دكتوراه في الطب، تخصص أطفال", "زمالة في تغذية الأطفال"] },
    rating: 4.8,
    reviews: 187,
    location: L("Nuseirat Children's Clinic, Middle Area", "عيادة الأطفال في النصيرات، المنطقة الوسطى"),
    phone: "+970-597-200202",
    email: "khaled.almasri@example.org",
    about: L(
      "Khaled treats childhood diarrhea, malnutrition, and respiratory infections and trains mothers in oral rehydration at home.",
      "يعالج خالد إسهال الأطفال وسوء التغذية والتهابات الجهاز التنفسي ويدرّب الأمهات على الإماهة الفموية في المنزل."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sat-Wed, 8:30 AM - 1:30 PM", "السبت-الأربعاء، 8:30 ص - 1:30 م"),
  },
  {
    name: L("Dr. Samar Al-Najjar", "د. سمر النجار"),
    specialty: L("Obstetrician and Maternal Health", "طبيبة نسائية وصحة الأم"),
    qualifications: { en: ["MD, Obstetrics and Gynecology", "Diploma in maternal nutrition"], ar: ["دكتوراه في الطب، تخصص نسائية وتوليد", "دبلوم في تغذية الأم"] },
    rating: 4.9,
    reviews: 256,
    location: L("Khan Younis Maternity Point", "نقطة الأمومة، خانيونس"),
    phone: "+970-595-200203",
    email: "samar.alnajjar@example.org",
    about: L(
      "Samar follows pregnancies and breastfeeding mothers and gives practical advice on iron, folic acid, and safe nutrition.",
      "تتابع سمر الحمل والأمهات المرضعات وتقدّم نصائح عملية حول الحديد وحمض الفوليك والتغذية الآمنة."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sun-Thu, 10:00 AM - 3:00 PM", "الأحد-الخميس، 10:00 ص - 3:00 م"),
  },
  {
    name: L("Dr. Mahmoud Hamdan", "د. محمود حمدان"),
    specialty: L("Family Physician", "طبيب أسرة"),
    qualifications: { en: ["MD, Family Medicine", "Training in emergency and disaster care"], ar: ["دكتوراه في الطب، تخصص طب أسرة", "تدريب في رعاية الطوارئ والكوارث"] },
    rating: 4.7,
    reviews: 143,
    location: L("Jabalia Primary Care Centre, North Gaza", "مركز الرعاية الأولية، جباليا، شمال غزة"),
    phone: "+970-599-200204",
    email: "mahmoud.hamdan@example.org",
    about: L(
      "Mahmoud provides general care for whole families, including wound care, skin infections, and follow-up for chronic illnesses.",
      "يقدّم محمود رعاية عامة للأسرة بأكملها تشمل العناية بالجروح والالتهابات الجلدية ومتابعة الأمراض المزمنة."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sat-Thu, 9:00 AM - 1:00 PM", "السبت-الخميس، 9:00 ص - 1:00 م"),
  },
  {
    name: L("Dr. Hanan Qudeih", "د. حنان قديح"),
    specialty: L("Diabetes and Endocrinology", "السكري والغدد الصماء"),
    qualifications: { en: ["MD, Internal Medicine", "Diabetes educator certification"], ar: ["دكتوراه في الطب، تخصص باطنة", "شهادة مثقّف سكري"] },
    rating: 4.8,
    reviews: 168,
    location: L("Deir Al-Balah Diabetes Clinic, Middle Area", "عيادة السكري، دير البلح، المنطقة الوسطى"),
    phone: "+970-592-200205",
    email: "hanan.qudeih@example.org",
    about: L(
      "Hanan helps patients manage blood sugar and blood pressure when food and medicine are limited and teaches safe insulin storage.",
      "تساعد حنان المرضى على ضبط السكر والضغط عند شحّ الغذاء والدواء وتعلّم حفظ الأنسولين بأمان."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Mon, Wed, Thu, 9:00 AM - 2:00 PM", "الإثنين، الأربعاء، الخميس، 9:00 ص - 2:00 م"),
  },
  {
    name: L("Dr. Yousef Abu Jazar", "د. يوسف أبو جزر"),
    specialty: L("Community Nutrition Specialist", "أخصائي تغذية مجتمعية"),
    qualifications: { en: ["MPH in Public Health Nutrition", "Trainer in infant and young child feeding"], ar: ["ماجستير صحة عامة، تخصص تغذية", "مدرّب في تغذية الرضّع والأطفال الصغار"] },
    rating: 4.7,
    reviews: 121,
    location: L("Rafah Nutrition Point", "نقطة التغذية، رفح"),
    phone: "+970-598-200206",
    email: "yousef.abujazar@example.org",
    about: L(
      "Yousef runs group sessions on stretching meals, feeding babies after six months, and choosing the best foods from aid parcels.",
      "يدير يوسف جلسات جماعية حول مضاعفة الوجبات وتغذية الأطفال بعد ستة أشهر واختيار أفضل الأطعمة من الطرود الغذائية."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sun-Thu, 8:00 AM - 12:00 PM", "الأحد-الخميس، 8:00 ص - 12:00 م"),
  },
  {
    name: L("Dr. Layla Shurrab", "د. ليلى شرّاب"),
    specialty: L("Geriatrics and Internal Medicine", "طب المسنّين والباطنة"),
    qualifications: { en: ["MD, Internal Medicine", "Diploma in geriatric care"], ar: ["دكتوراه في الطب، تخصص باطنة", "دبلوم في رعاية المسنّين"] },
    rating: 4.6,
    reviews: 97,
    location: L("Al-Mawasi Medical Point, Khan Younis", "النقطة الطبية في المواصي، خانيونس"),
    phone: "+970-595-200207",
    email: "layla.shurrab@example.org",
    about: L(
      "Layla cares for older adults and people with heart disease and high blood pressure, with a focus on safe eating and hydration.",
      "تعتني ليلى بكبار السن والمصابين بأمراض القلب وارتفاع الضغط مع التركيز على الغذاء الآمن والترطيب."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sat-Wed, 10:00 AM - 2:00 PM", "السبت-الأربعاء، 10:00 ص - 2:00 م"),
  },
  {
    name: L("Dr. Omar Al-Ghalayini", "د. عمر الغلاييني"),
    specialty: L("Pediatric Nutrition and Growth", "تغذية الأطفال والنمو"),
    qualifications: { en: ["MD, Pediatrics", "Certified in severe acute malnutrition management"], ar: ["دكتوراه في الطب، تخصص أطفال", "شهادة في علاج سوء التغذية الحاد الوخيم"] },
    rating: 4.9,
    reviews: 203,
    location: L("Beit Lahia Stabilisation Centre, North Gaza", "مركز التثبيت الغذائي، بيت لاهيا، شمال غزة"),
    phone: "+970-599-200208",
    email: "omar.alghalayini@example.org",
    about: L(
      "Omar treats children with severe malnutrition and trains community health workers to measure arm circumference and refer early.",
      "يعالج عمر الأطفال المصابين بسوء التغذية الوخيم ويدرّب العاملين الصحيين المجتمعيين على قياس محيط الذراع والتحويل المبكر."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Daily, 8:00 AM - 4:00 PM", "يومياً، 8:00 ص - 4:00 م"),
  },
  {
    name: L("Dr. Nadine Al-Aqqad", "د. نادين العقّاد"),
    specialty: L("Mental Health and Psychosocial Support", "الصحة النفسية والدعم النفسي الاجتماعي"),
    qualifications: { en: ["MSc in Clinical Psychology", "Trained in psychological first aid"], ar: ["ماجستير في علم النفس العيادي", "تدريب في الإسعاف النفسي الأولي"] },
    rating: 4.8,
    reviews: 132,
    location: L("Gaza City Wellbeing Centre", "مركز العافية، مدينة غزة"),
    phone: "+970-597-200209",
    email: "nadine.alaqqad@example.org",
    about: L(
      "Nadine offers individual and family support for stress, sleep problems, and trauma, including activities for children.",
      "تقدّم نادين دعماً فردياً وأسرياً للتوتر ومشاكل النوم والصدمة، بما في ذلك أنشطة للأطفال."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sun-Thu, 11:00 AM - 5:00 PM", "الأحد-الخميس، 11:00 ص - 5:00 م"),
  },
  {
    name: L("Dr. Ibrahim Abu Rukbah", "د. إبراهيم أبو ركبة"),
    specialty: L("Clinical Pharmacist and Water Hygiene Advisor", "صيدلي سريري ومستشار نظافة المياه"),
    qualifications: { en: ["PharmD", "Trained in water, sanitation and hygiene (WASH)"], ar: ["دكتوراه في الصيدلة", "تدريب في المياه والصرف الصحي والنظافة"] },
    rating: 4.7,
    reviews: 88,
    location: L("Khan Younis Pharmacy Point", "نقطة الصيدلية، خانيونس"),
    phone: "+970-595-200210",
    email: "ibrahim.aburukbah@example.org",
    about: L(
      "Ibrahim explains correct use of ORS, zinc, and chlorine tablets, and advises families on safe water storage.",
      "يشرح إبراهيم الاستخدام الصحيح لأملاح الإماهة والزنك وأقراص الكلور، ويقدّم النصح للعائلات حول تخزين الماء بأمان."
    ),
    image: "/assets/doctor1.jpg",
    availability: L("Sat-Thu, 9:00 AM - 5:00 PM", "السبت-الخميس، 9:00 ص - 5:00 م"),
  },
];

// --- 5. دليل التغذية (يتطابق مع components/NutritionSection.tsx) ---
// Supported section colors: "green", "orange", anything else renders blue.
const nutritionGuideData = {
  header: {
    badge: L("Nutrition Knowledge", "الثقافة الغذائية"),
    title: L("Family Nutrition Guide", "دليل تغذية العائلة"),
    subtitle: L(
      "Practical, low-cost ways to protect your family's health with the food and water you can get.",
      "طرق عملية قليلة التكلفة لحماية صحة عائلتك بالغذاء والماء المتوفرين لديك."
    ),
  },
  sections: [
    {
      title: L("Protein Sources", "مصادر البروتين"),
      description: L(
        "Protein keeps muscles, immunity and growth strong. You can get it without meat.",
        "البروتين يحافظ على العضلات والمناعة والنمو، ويمكنك الحصول عليه بدون لحوم."
      ),
      listTitle: L("Good options", "خيارات جيدة"),
      color: "green",
      items: [
        L("Lentils, chickpeas, and fava beans, ideally with rice or bread", "العدس والحمص والفول، ويفضّل مع الأرز أو الخبز"),
        L("Eggs, if available, boiled or cooked well", "البيض إن توفر، مسلوقاً أو مطبوخاً جيداً"),
        L("Tinned fish such as sardines, rinsed to cut the salt", "الأسماك المعلبة كالسردين مع شطفها لتقليل الملح"),
        L("Tahini and sesame, a few spoons for extra energy", "الطحينة والسمسم، بضع ملاعق لطاقة إضافية"),
        L("Yogurt or labneh when you can get it", "اللبن أو اللبنة عند توفرها"),
        L("Pairing grains with legumes gives a more complete protein", "الجمع بين الحبوب والبقوليات يعطي بروتيناً أكمل"),
      ],
    },
    {
      title: L("Hydration and Safe Water", "الترطيب والمياه الآمنة"),
      description: L(
        "Water keeps the body working and prevents illness when it is clean.",
        "الماء يبقي الجسم يعمل ويقي من المرض عندما يكون نظيفاً."
      ),
      listTitle: L("Daily habits", "عادات يومية"),
      color: "blue",
      items: [
        L("Aim for about 2 to 3 litres of fluids a day for adults", "اهدف إلى نحو 2 إلى 3 لترات من السوائل يومياً للبالغين"),
        L("Boil water for 1 minute or treat it with chlorine tablets", "اغلِ الماء دقيقة أو عالجه بأقراص الكلور"),
        L("Store water in a clean, covered container with a tap", "احفظ الماء في وعاء نظيف مغطى له صنبور"),
        L("Use soups, herbal tea and diluted juice to add fluids", "استخدم الشوربات والأعشاب والعصير المخفف لزيادة السوائل"),
        L("Learn the signs of dehydration: dark urine, dry mouth, dizziness", "تعرّف على علامات الجفاف: بول داكن وجفاف الفم ودوخة"),
        L("Keep ORS sachets at home for diarrhea", "احتفظ بأكياس أملاح الإماهة في المنزل للإسهال"),
      ],
    },
    {
      title: L("Babies and Young Children", "الرضّع والأطفال الصغار"),
      description: L(
        "The first 2 years shape lifelong growth, so every spoonful counts.",
        "السنتان الأوليان تحددان النمو مدى الحياة، فكل ملعقة لها قيمتها."
      ),
      listTitle: L("What to do", "ما العمل"),
      color: "orange",
      items: [
        L("Breastfeed exclusively for 6 months and continue to 2 years", "رضاعة طبيعية حصرية 6 أشهر ثم الاستمرار حتى سنتين"),
        L("From 6 months, give thick mashed foods 2 to 3 times a day", "من الشهر السادس قدّم أطعمة مهروسة سميكة 2 إلى 3 مرات يومياً"),
        L("Add a little oil or tahini to porridge to raise calories", "أضف قليلاً من الزيت أو الطحينة للعصيدة لرفع السعرات"),
        L("Offer small, frequent meals and let children eat at their pace", "قدّم وجبات صغيرة ومتكررة ودع الطفل يأكل بوتيرته"),
        L("Use a cup and spoon, not a bottle, when water is unsafe", "استخدم الكوب والملعقة لا الرضّاعة عندما تكون المياه غير آمنة"),
        L("Measure arm circumference, and go to a clinic if it is in the yellow or red zone", "قِس محيط الذراع وراجع العيادة إذا كان في المنطقة الصفراء أو الحمراء"),
      ],
    },
    {
      title: L("Pregnant and Breastfeeding Mothers", "الحوامل والمرضعات"),
      description: L(
        "A mother's nutrition protects both her and her baby.",
        "تغذية الأم تحميها وتحمي طفلها."
      ),
      listTitle: L("Priorities", "الأولويات"),
      color: "green",
      items: [
        L("Eat 3 meals and 2 snacks a day when possible", "تناولي 3 وجبات ووجبتين خفيفتين يومياً قدر الإمكان"),
        L("Take iron and folic acid tablets from the clinic every day", "تناولي أقراص الحديد وحمض الفوليك من العيادة يومياً"),
        L("Add dates, lentils, and leafy greens for iron", "أضيفي التمر والعدس والخضار الورقية لتأمين الحديد"),
        L("Drink extra water, especially while breastfeeding", "اشربي ماءً إضافياً خاصة أثناء الرضاعة"),
        L("Avoid raw or undercooked meat, eggs, and unpasteurised dairy", "تجنّبي اللحوم والبيض النيئة أو غير المطبوخة جيداً والألبان غير المبسترة"),
        L("Seek urgent care for bleeding, severe headache, or swelling", "اطلبي الرعاية العاجلة عند النزيف أو الصداع الشديد أو التورّم"),
      ],
    },
    {
      title: L("Older Adults and Chronic Illness", "كبار السن والأمراض المزمنة"),
      description: L(
        "Steady meals and steady medicine matter most for people with diabetes, blood pressure or heart disease.",
        "الانتظام في الوجبات والدواء هو الأهم لمرضى السكري والضغط والقلب."
      ),
      listTitle: L("Care tips", "نصائح للرعاية"),
      color: "blue",
      items: [
        L("Eat at regular times, and prefer bulgur, lentils, and whole bread", "تناول الطعام في أوقات منتظمة وفضّل البرغل والعدس والخبز الكامل"),
        L("Rinse canned foods and avoid extra salt and pickles", "اشطف المعلبات وتجنّب الملح الإضافي والمخللات"),
        L("Never stop medicine without advice, even if you feel well", "لا توقف الدواء دون استشارة حتى لو شعرت بالتحسن"),
        L("Know low blood sugar signs and keep a date or sugar at hand", "تعرّف على علامات هبوط السكر واحتفظ بتمرة أو سكر في متناول يدك"),
        L("Soft, protein-rich foods help people with weak teeth", "الأطعمة الطرية الغنية بالبروتين تناسب من لديهم أسنان ضعيفة"),
        L("Sip fluids through the day, even without thirst", "ارتشف السوائل طوال اليوم حتى بدون عطش"),
      ],
    },
    {
      title: L("Iron and Vitamins from Available Foods", "الحديد والفيتامينات من الأطعمة المتوفرة"),
      description: L(
        "Colour and variety on the plate cover many vitamin gaps, even in hard times.",
        "التنوع والألوان في الطبق يسدّان كثيراً من النقص في الفيتامينات حتى في الظروف الصعبة."
      ),
      listTitle: L("Where to find them", "أين تجدها"),
      color: "orange",
      items: [
        L("Iron: lentils, fava beans, dates, khubeizeh, molokhia", "الحديد: العدس والفول والتمر والخبيزة والملوخية"),
        L("Vitamin C: lemon, tomato, parsley, peppers, guava", "فيتامين سي: الليمون والبندورة والبقدونس والفلفل والجوافة"),
        L("Vitamin A: carrots, pumpkin, sweet potato, dark greens", "فيتامين أ: الجزر والقرع والبطاطا الحلوة والخضار الداكنة"),
        L("Zinc: legumes, sesame, tahini, and eggs", "الزنك: البقوليات والسمسم والطحينة والبيض"),
        L("Add lemon or tomato to lentils to absorb more iron", "أضف الليمون أو البندورة إلى العدس لامتصاص حديد أكثر"),
        L("Avoid tea or coffee with meals, since they reduce iron absorption", "تجنّب الشاي أو القهوة مع الوجبات لأنهما يقللان امتصاص الحديد"),
      ],
    },
  ],
  stretching: {
    title: L("Stretching Your Meals", "مضاعفة الوجبات"),
    subtitle: L(
      "Simple ways to make limited food go further, safely and with good taste.",
      "طرق بسيطة لجعل الطعام المحدود يكفي أكثر، بأمان وبطعم جيد."
    ),
    steps: [
      {
        number: 1,
        title: L("Bulk with Grains and Legumes", "زيادة الحجم بالحبوب والبقوليات"),
        text: L(
          "Add bulgur, lentils, or rice to stews and vegetable dishes. A small amount of meat or tinned fish goes much further this way.",
          "أضف البرغل أو العدس أو الأرز إلى اليخنات وأطباق الخضار. تكفي كمية صغيرة من اللحم أو السمك المعلّب أكثر بهذه الطريقة."
        ),
      },
      {
        number: 2,
        title: L("Make It a Soup", "حوّلها إلى شوربة"),
        text: L(
          "A pot of lentil or vegetable soup serves more people than the same ingredients served dry, and the hot liquid also helps hydration.",
          "قدر من شوربة العدس أو الخضار يكفي عدداً أكبر من الأشخاص مقارنة بالمكونات نفسها جافة، كما أن السائل الساخن يساعد على الترطيب."
        ),
      },
      {
        number: 3,
        title: L("Dilute with Broth, Not Plain Water", "خفّف بالمرق لا بالماء فقط"),
        text: L(
          "Cook vegetable peels, onion ends, and bones into a broth and use it to cook rice and soups for more flavour and nutrients.",
          "اطبخ قشور الخضار وأطراف البصل والعظام لتحصل على مرق، واستخدمه لطبخ الأرز والشوربات لنكهة وقيمة غذائية أكبر."
        ),
      },
      {
        number: 4,
        title: L("Use Bread Wisely", "استخدم الخبز بحكمة"),
        text: L(
          "Turn stale bread into fatteh, or toast it into crumbs to thicken stews. Never waste a piece, and never eat moldy bread.",
          "حوّل الخبز القديم إلى فتّة أو حمّصه فتاتاً لتثخين اليخنات. لا ترمِ أي قطعة، ولا تأكل خبزاً متعفناً أبداً."
        ),
      },
      {
        number: 5,
        title: L("Flavour with Dukkah and Za'atar", "نكّه بالدقة والزعتر"),
        text: L(
          "A spoon of dukkah, za'atar, sumac, cumin, or lemon makes simple lentils and bread satisfying, and you need no extra salt.",
          "ملعقة من الدقة أو الزعتر أو السمّاق أو الكمّون أو الليمون تجعل العدس والخبز مشبعين، ولا تحتاج ملحاً إضافياً."
        ),
      },
      {
        number: 6,
        title: L("Soak Before You Cook", "انقع قبل الطبخ"),
        text: L(
          "Soak lentils, chickpeas, and beans for several hours or overnight. They cook faster, use less fuel and are easier to digest.",
          "انقع العدس والحمص والفول عدة ساعات أو طوال الليل. فتنضج أسرع وتستهلك وقوداً أقل وتُهضم بسهولة أكبر."
        ),
      },
      {
        number: 7,
        title: L("Store Food Safely Without a Fridge", "احفظ الطعام بأمان بدون ثلاجة"),
        text: L(
          "Keep dry foods in sealed jars in the shade, cook only what you will eat in 2 hours, and reheat leftovers until steaming hot.",
          "احفظ الأغذية الجافة في برطمانات محكمة في الظل، واطبخ ما ستأكله خلال ساعتين فقط، وأعد تسخين البقايا حتى تصبح ساخنة جداً."
        ),
      },
      {
        number: 8,
        title: L("Forage Wild Greens Carefully", "اجمع الأعشاب البرية بحذر"),
        text: L(
          "Wild greens such as khubeizeh are rich in iron and vitamins. Pick only from clean ground, wash them thoroughly, and cook them well.",
          "الأعشاب البرية كالخبيزة غنية بالحديد والفيتامينات. اقطفها فقط من أرض نظيفة واغسلها جيداً واطبخها جيداً."
        ),
      },
      {
        number: 9,
        title: L("Share the Plate Fairly", "وزّع الطبق بعدالة"),
        text: L(
          "Serve children, pregnant or breastfeeding mothers, and the sick first and fully, and share the remainder among adults.",
          "قدّم للأطفال والحوامل والمرضعات والمرضى أولاً وبكامل حصصهم، ثم وزّع الباقي على البالغين."
        ),
      },
    ],
  },
};

// --- الدالة الأساسية لتنفيذ الـ Seed ---
async function main() {
  console.log("🌱 بدأت عملية تنظيف البيانات القديمة...");
  
  // ترتيب الحذف لتجنب مشاكل العلاقات
  await prisma.favorite.deleteMany({});
  await prisma.healthTip.deleteMany({});
  await prisma.foodRecipe.deleteMany({});
  await prisma.kitchen.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.nutritionGuide.deleteMany({});
  
  console.log("🗑️ تم تنظيف قاعدة البيانات. جاري إضافة البيانات الجديدة...");

  // إضافة النصائح
  await prisma.healthTip.createMany({ data: healthTips });

  // إضافة الوصفات
  for (const recipe of foodRecipes) {
    await prisma.foodRecipe.create({ data: recipe });
  }

  // إضافة المطابخ
  await prisma.kitchen.createMany({ data: kitchens });

  // إضافة الأطباء
  for (const doctor of doctorsData) {
    await prisma.doctor.create({ data: doctor });
  }

  // إضافة دليل التغذية
  await prisma.nutritionGuide.create({
    data: { content: nutritionGuideData }
  });

  console.log("🏁 تمت العملية بنجاح! قاعدة البيانات جاهزة الآن ببيانات مترجمة.");
}

main()
  .catch((e) => {
    console.error("❌ خطأ أثناء الـ Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });