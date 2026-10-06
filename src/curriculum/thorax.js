import { terms, joint, moduleRecord } from './schema.js';
const id = 'thorax';
const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const ribs = roman.flatMap((r,i) => terms(id, 'ნეკნები I–XII', 9, `rib-${i+1}|${r} ნეკნი|Costa ${r}|${i<7?'ნამდვილი ნეკნი — Costae verae':i<10?'ცრუ ნეკნი — Costae spuriae':'მერყევი ნეკნი — Costae fluctuantes'}. წყვილი ძვალია; მარცხენა და მარჯვენა მოდელები ცალკე მოსამზადებელია.`, { ribNumber:i+1, sides:['left','right'] }));
export const skeleton = moduleRecord(id, '10.4', 'გულმკერდის ჩონჩხი', 'Ossa thoracis', [
  ...ribs,
  ...terms(id, 'ნეკნების კლასიფიკაცია', 9, `
true|ნამდვილი ნეკნები|Costae verae|კონსპექტში I–VII ნეკნები: მკერდთან დამოუკიდებელი კავშირი თავიანთი ხრტილით.
false|ცრუ ნეკნები|Costae spuriae|კონსპექტში ცალკე ჯგუფად გამოყოფილია VIII–X; მათი ხრტილები ზემოთ მდებარე ნეკნის ხრტილს უკავშირდება.
floating|მერყევი ნეკნები|Costae fluctuantes|XI–XII; წინა ბოლოები მკერდის ძვალს არ უკავშირდება.
bone|ნეკნის ძვლოვანი ნაწილი|Os costale|ნეკნის უკანა, ძვლოვანი ნაწილი.
cartilage|ნეკნის ხრტილი|Cartilago costalis|ნეკნის წინა, ხრტილოვანი ნაწილი.
head|ნეკნის თავი|Caput costae|მალის სხეულთან შეერთებაში მონაწილე ბოლო.
`),
  ...terms(id, 'ნეკნის ნიშნები', 10, `
head-surface|ნეკნის თავის სასახსრე ზედაპირი|Facies articularis capitis costae|მალის სასახსრე ფოსოსთან ურთიერთობის ზედაპირი. ნეკნების მიხედვით განსხვავებები გადასამოწმებელია.
head-crest|ნეკნის თავის ქედი|Crista capitis costae|კონსპექტში აღწერილია II–X ნეკნებზე სასახსრე ზედაპირის გამყოფად; X ნეკნის ვარიანტები გადასამოწმებელია.
neck|ნეკნის ყელი|Collum costae|თავის გაგრძელება სხეულის მიმართულებით.
body|ნეკნის სხეული|Corpus costae|ნეკნის გრძელი მოღუნული ნაწილი.
tubercle|ნეკნის ბორცვი|Tuberculum costae|განივ მორჩთან ურთიერთობის უბანი; ქვედა ნეკნების გამონაკლისები ცალკე შესამოწმებელია.
tubercle-surface|ნეკნის ბორცვის სასახსრე ზედაპირი|Facies articularis tuberculi costae|განივი მორჩის სანეკნე ფოსოსთან შეერთების ზედაპირი.
angle|ნეკნის კუთხე|Angulus costae|სხეულის მკვეთრი მოხვევის ადგილი.
groove|ნეკნის ღარი|Sulcus costae|ნეკნის შიგნითა ზედაპირზე ქვედა კიდესთან მდებარე ღარი.
artery-groove|ლავიწქვეშა არტერიის ღარი|Sulcus a. subclaviae|I ნეკნის ზედა ზედაპირის ნიშანი.
vein-groove|ლავიწქვეშა ვენის ღარი|Sulcus v. subclaviae|I ნეკნის ზედა ზედაპირის ნიშანი.
scalene|წინა კიბისებრი კუნთის ბორცვი|Tuberculum m. scaleni anterioris|I ნეკნზე არტერიისა და ვენის ღარებს შორის.|Tuberculum m. sceleni anterioris
serratus|წინა დაკბილული კუნთის ხორკლი|Tuberositas m. serrati anterioris|II ნეკნის თავისებურება.|Tuberosita m. serrati anterioris
`),
  ...terms(id, 'მკერდის ძვალი', 10, `
sternum|მკერდის ძვალი|Sternum|ბრტყელი ძვალი: ტარი, სხეული და მახვილისებრი მორჩი.
manubrium|მკერდის ტარი|Manubrium sterni|მკერდის ძვლის ზედა ნაწილი.
sternal-body|მკერდის სხეული|Corpus sterni|მკერდის ძვლის შუა ნაწილი.
xiphoid|მახვილისებრი მორჩი|Processus xiphoideus|მკერდის ქვედა ბოლო; ფორმა და ზომა ცვალებადია.
jugular|საუღლე ამონაჭდევი|Incisura jugularis|ტარის ზედა კიდეზე, ლავიწის ნაჭდევებს შორის.
clavicular|ლავიწის ნაჭდევები|Incisurae claviculares|ლავიწთან კავშირის ზედაპირები.|Incisura clavicularis
costal-notches|სანეკნე ნაჭდევები|Incisurae costales|ნეკნის ხრტილებთან შეერთების უბნები.|Incisura costales
sternal-angle|მკერდის კუთხე|Angulus sterni|ტარისა და სხეულის შეერთების კუთხე; კონსპექტში დაკავშირებულია II ნეკნის დონესთან.
`),
], [40, 45], ['წინიდან','უკნიდან','ზემოდან','შიგნითა ზედაპირი','I / II ნეკნის ზედა ხედი']);

const cavityEntries = terms('cavity', 'გულმკერდის ღრუ', 11, `
cavity|გულმკერდის ღრუ|Cavum thoracis|გულმკერდის კედლებით შემოსაზღვრული სივრცე.
superior|გულმკერდის ზედა შესავალი|Apertura thoracis superior|ზედა შესავლის საზღვრების ერთობლივი მონიშვნა მოდელის დამატების შემდეგ იქნება შესაძლებელი.
inferior|გულმკერდის ქვედა შესავალი|Apertura thoracis inferior|კონსპექტში მოცემული საზღვრები შემოკლებულია; სრული საზღვრები კაციტაძის მიხედვით გადასამოწმებელია.
arch|ნეკნთა რკალი|Arcus costalis|კონსპექტში აღწერილია ქვედა შესავლის საზღვრებთან ერთად.
angle|მკერდქვეშა კუთხე|Angulus infrasternalis|მარჯვენა და მარცხენა ნეკნთა რკალებს შორის კუთხე.
`);
cavityEntries.find(e=>e.id==='cavity.superior').boundaries = 'კონსპექტი: T1 მალის სხეული; I წყვილი ნეკნების შიგნითა კიდეები; მკერდის ტარის ზედა კიდე.';
cavityEntries.find(e=>e.id==='cavity.inferior').boundaries = 'კონსპექტის შემოკლებული სია: T12; ნეკნთა რკალები; მახვილისებრი მორჩი. ამ ჩამონათვალის სისრულე ჯერ დამოწმებული არ არის.';
cavityEntries[0].reviewNotes.push('კონსპექტის გვ.11-ზე აღწერილია კონუსისებრი, ბრტყელი და ცილინდრული ფორმები; ასევე ქათმისებრი და მეწაღის გულმკერდი. მათი ზოგადი ტიპოლოგია წიგნთან შედარებას ელოდება.');
export const cavity = moduleRecord('cavity', '10.4', 'გულმკერდის ღრუ', 'Cavum thoracis', cavityEntries, [45,47], ['ზედა შესავალი','ქვედა შესავალი','წინიდან','გვერდიდან']);

const jid = 'thoracic-joints';
const jointRows = terms(jid,'სახსრები',12,`
head|ნეკნის თავის სახსარი|Articulatio capitis costae|ნეკნის თავისა და მალის სხეულის შეერთება.|Articularis capitis costae
transverse|ნეკნ-განივი სახსარი|Articulatio costotransversaria|ნეკნის ბორცვისა და მალის განივი მორჩის შეერთება.|Articularis costotransversaria
sternocostal|მკერდ-ნეკნის სახსრები|Articulationes sternocostales|კონსპექტში II–VII ნეკნების სინოვიური შეერთებები.
interchondral|ხრტილთაშუა სახსრები|Articulationes interchondrales|კონსპექტში ნეკნების ხრტილოვან ნაწილებს შორის შეერთებები.
`);
const configs = [
  ['ნეკნი და გულმკერდის მალა/მალები','Facies articularis capitis costae ↔ Foveae costales','კონსპექტი: I, XI, XII — ბრტყელი; II–X — უნაგირა (გადასამოწმებელია)','Lig. capitis costae intraarticulare; Lig. capitis costae radiatum','კონსპექტის კლასიფიკაცია დამატებით გადამოწმებას საჭიროებს'],
  ['ნეკნი და შესაბამისი გულმკერდის მალა','Facies articularis tuberculi costae ↔ Fovea costalis processus transversus','ფორმისა და ღერძების აღწერა გადასამოწმებელია','Lig. costotransversarium; გვერდითი და ზედა ნეკნ-განივი იოგები','კონსპექტის მოძრაობის აღწერა არ არის გამოყენებული ანიმაციის დასამოწმებლად'],
  ['II–VII ნეკნების ხრტილები და მკერდის ძვალი','ხრტილის სამკერდე ბოლო ↔ Incisura costalis','კონსპექტი: სინოვიური','Ligg. sternocostalia radiata; Lig. sternocostale intraarticulare (II ნეკნი); Membrana sterni','გადაადგილების ზუსტი მოცულობა შესავსებია'],
  ['მეზობელი ნეკნების ხრტილები','ხრტილების ურთიერთმიმართული ზედაპირები','კონსპექტი: ხრტილთაშუა სახსრები','მოგრძო სასახსრე ღრუ; დამატებითი ელემენტები შესავსებია','წიგნის შესაბამისი გვერდების დამატების შემდეგ შესავსებია'],
];
export const connections = moduleRecord(jid,'10.4','გულმკერდის შეერთებები','Articulationes thoracis',[
  ...jointRows.map((e,i)=>joint(e,...configs[i])),
  ...terms(jid,'იოგები და აპკები',12,`
head-intra|ნეკნის თავის სახსარშიგა იოგი|Lig. capitis costae intraarticulare|კონსპექტში აკავშირებს თავის ქედს მალთაშუა ფიბროზულ რგოლთან.|Ligamenta capitis costae intraarticulare
head-radiate|ნეკნის თავის სხივისებრი იოგი|Lig. capitis costae radiatum|ნეკნის თავის სახსრის გამამაგრებელი იოგი.|Ligamenta capitis costae radiatum
costotransverse|ნეკნ-განივი იოგი|Lig. costotransversarium|კონსპექტში ზედა და გვერდით ნეკნ-განივ იოგებთან ერთად.|Ligamenta costotransversarium
costotransverse-lateral|გვერდითი ნეკნ-განივი იოგი|Lig. costotransversarium laterale|ნეკნ-განივი სახსრის იოგი.|Ligg. costotransversaria laterale
costotransverse-superior|ზედა ნეკნ-განივი იოგი|Lig. costotransversarium superius|ნეკნ-განივი სახსრის იოგი.|Ligg. costotransversaria superior
sternocostal-intra|მკერდ-ნეკნის სახსარშიგა იოგი|Lig. sternocostale intraarticulare|კონსპექტში გამოყოფილია II ნეკნის შეერთებისთვის.|Ligamenta sternocostale intraarticulare
sternocostal-radiate|მკერდ-ნეკნის სხივისებრი იოგები|Ligg. sternocostalia radiata|მკერდ-ნეკნის შეერთებების გამამაგრებელი იოგები.
sternal-membrane|მკერდის აპკი|Membrana sterni|კონსპექტში აღწერილია სხივისებრი იოგების ბოჭკოთა გაერთიანება მკერდის წინა ზედაპირზე.
`),
  ...terms(jid,'ხრტილოვანი შეერთებები',13,`
manubriosternal|ტარ-მკერდის შეერთება|Synchondrosis manubriosternalis|კონსპექტში უწოდებენ სინქონდროზს და დროებით შეერთებას. ტერმინი უცვლელადაა წარმოდგენილი; კლასიფიკაცია გადასამოწმებელია.
xiphisternal|მკერდ-მახვილისებრი შეერთება|Synchondrosis xiphosternalis|მკერდის სხეულსა და მახვილისებრ მორჩს შორის კავშირი კონსპექტის მიხედვით.
`),
], [155,161], ['ნეკნის თავი და მალა','ნეკნის ბორცვი და განივი მორჩი','მკერდთან კავშირი']);
