import { terms, joint, moduleRecord } from './schema.js';
const id='arm';
const humerus = [
  ...terms(id,'მხარი · Brachium',14,'humerus|მხრის ძვალი|Humerus|თავისუფალი ზედა კიდურის მხრის ნაწილის ძვალი.'),
  ...terms(id,'პროქსიმალური ნაწილი',14,`
head|მხრის ძვლის თავი|Caput humeri|ბეჭის სასახსრე ფოსოსთან შეერთების სფერული ზედაპირი.
anatomic-neck|ანატომიური ყელი|Collum anatomicum|გამოყოფს მხრის თავს დანარჩენი ნაწილისაგან.
surgical-neck|ქირურგიული ყელი|Collum chirurgicum|კონსპექტში მოთავსებულია ზედა ეპიფიზსა და დიაფიზს შორის.
greater-tubercle|დიდი ბორცვი|Tuberculum majus|მხრის ძვლის პროქსიმალური ნაწილის ნიშანი.|Tuberculum minus et majus
lesser-tubercle|მცირე ბორცვი|Tuberculum minus|მხრის ძვლის პროქსიმალური ნაწილის ნიშანი.|Tuberculum minus et majus
greater-crest|დიდი ბორცვის ქედი|Crista tuberculi majoris|დიდი ბორცვის გაგრძელება.|Crista tuberculi minoris et majoris
lesser-crest|მცირე ბორცვის ქედი|Crista tuberculi minoris|მცირე ბორცვის გაგრძელება.|Crista tuberculi minoris et majoris
intertubercular|ბორცვთაშუა ღარი|Sulcus intertubercularis|ბორცვებსა და მათ ქედებს შორის ღარი.
`),
  ...terms(id,'დიაფიზი',14,`
deltoid|დელტისებრი ხორკლი|Tuberositas deltoidea|მხრის ძვლის სხეულზე არსებული ხორკლი.
radial-groove|სხივის ნერვის ღარი|Sulcus nervi radialis|კონსპექტში აღწერილია დელტისებრი ხორკლის უკან.
`),
  ...terms(id,'დისტალური ნაწილი',14,`
condyle|მხრის ძვლის როკი|Condylus humeri|მხრის ძვლის ქვედა სასახსრე ნაწილი.
medial-epicondyle|მედიალური ზედა როკი|Epicondylus medialis|დისტალური ნაწილის მედიალური შემაღლება.|Epicondylus medialis et lateralis
lateral-epicondyle|ლატერალური ზედა როკი|Epicondylus lateralis|დისტალური ნაწილის ლატერალური შემაღლება.|Epicondylus medialis et lateralis
trochlea|მხრის ძვლის ჭაღი|Trochlea humeri|იდაყვის ძვალთან შეერთების ზედაპირი.|Trochea
capitulum|მხრის ძვლის მცირე თავი|Capitulum humeri|სხივის ძვლის თავთან შეერთების ზედაპირი.
olecranon-fossa|იდაყვის ფოსო|Fossa olecrani|მხრის ძვლის დისტალური ნაწილის უკანა ზედაპირზე.
coronoid-fossa|გვირგვინოვანი ფოსო|Fossa coronoidea|მხრის ძვლის დისტალური ნაწილის წინა ზედაპირზე.
radial-fossa|სხივის ფოსო|Fossa radialis|წინა ზედაპირზე, გვირგვინოვანი ფოსოს გარეთ.
`),
];
const joints = terms(id,'მხრისა და იდაყვის სახსრები',17,`
shoulder-joint|მხრის სახსარი|Articulatio humeri|მხრის თავსა და ბეჭის სასახსრე ფოსოს შორის.
elbow|იდაყვის სახსარი|Articulatio cubiti|სამი სახსრის საერთო ჩანთაში გაერთიანებული კომპლექსი.
humeroulnar|მხარ-იდაყვის სახსარი|Articulatio humeroulnaris|მხრის ჭაღისა და იდაყვის ჭაღისებრი ნაჭდევის კავშირი.
humeroradial|მხარ-სხივის სახსარი|Articulatio humeroradialis|მხრის მცირე თავისა და სხივის თავის კავშირი.
`);
export const arm = moduleRecord(id,'10.6','მხრის ძვალი და სახსრები','Brachium · Humerus',[
  ...humerus,
  joint(joints[0],'Scapula; Humerus','Caput humeri ↔ Cavitas glenoidalis','სფერული; კონსპექტში სამღერძიანი','Labrum glenoidale; Lig. coracohumerale; Ligg. glenohumeralia','სამი ღერძის მიმართ მოძრაობა (კონსპექტი)'),
  joint(joints[1],'Humerus; Ulna; Radius','მხარ-იდაყვის, მხარ-სხივის და სხივ-იდაყვის პროქსიმალური სახსრების ზედაპირები','რთული სახსარი','საერთო ჩანთა; Ligg. collateralia ulnare et radiale; Lig. anulare radii; Lig. quadratum','მოხრა/გაშლისა და წინამხრის ბრუნვის კომპონენტები ცალ-ცალკე შესასწავლია'),
  joint(joints[2],'Humerus; Ulna','Trochlea humeri ↔ Incisura trochlearis','ჭაღისებრი (კონსპექტში ასევე სპირალური)','იდაყვის საერთო ჩანთა და გვერდითი იოგები','მოხრა/გაშლა ფრონტალური ღერძის გარშემო'),
  joint(joints[3],'Humerus; Radius','Capitulum humeri ↔ Caput radii','კონსპექტი: სფერული, შეზღუდული თავისუფლებით','იდაყვის საერთო ჩანთა','კონსპექტის ღერძების აღწერა საჭიროებს გადამოწმებას', ['გვ.17-ზე დასახელებულია ფრონტალური და საგიტალური ღერძები. ეს არ არის მოძრაობის დამოწმებული ანიმაციის საფუძველი.']),
  ...terms(id,'სახსრების იოგები',17,`
coracohumeral|ნისკარტ-მხრის იოგი|Lig. coracohumerale|მხრის სახსრის იოგი.|Ligamenta coracohumerale
glenohumeral|სახსარ-მხრის იოგები|Ligg. glenohumeralia|მხრის სახსრის იოგოვანი ელემენტები.
ulnar-collateral|იდაყვის გვერდითი იოგი|Lig. collaterale ulnare|იდაყვის სახსრის მედიალური იოგი.|Ligg. collateralia ulnare et radiale
radial-collateral|სხივის გვერდითი იოგი|Lig. collaterale radiale|იდაყვის სახსრის ლატერალური იოგი.|Ligg. collateralia ulnare et radiale
annular|სხივის რგოლისებრი იოგი|Lig. anulare radii|კონსპექტში ჩამოთვლილია იდაყვის კომპლექსის იოგებთან.|Ligamenta anulare radii
quadrate|კვადრატული იოგი|Lig. quadratum|კონსპექტში ჩამოთვლილია იდაყვის კომპლექსის იოგებთან.|Ligamenta quadratum
`),
].map(e=>e.source.page>=16?{...e,book:{printedPages:[162]}}:e),[51],['წინიდან','უკნიდან','მედიალურად','ლატერალურად','პროქსიმალური/დისტალური ბოლო']);

const fid='forearm';
const ulna=[
  ...terms(fid,'წინამხარი · Antebrachium',14,`
ulna|იდაყვის ძვალი|Ulna|წინამხრის ერთ-ერთი ძვალი. სხივის ძვალთან ერთად ანატომიურ პოზიციაში გამოსახვა მოსამზადებელია.
space|წინამხრის ძვალთაშუა სივრცე|Spatium interosseum antebrachii|იდაყვისა და სხივის ძვლებს შორის სივრცე.|Spatia interossea antebrachii
`),
  ...terms(fid,'იდაყვი · პროქსიმალური ნაწილი',14,`
olecranon|იდაყვის მორჩი|Olecranon|იდაყვის ძვლის პროქსიმალური მორჩი.
coronoid|გვირგვინოვანი მორჩი|Processus coronoideus|იდაყვის მორჩის მოპირდაპირე მორჩი.
trochlear-notch|ჭაღისებრი ნაჭდევი|Incisura trochlearis|იდაყვისა და გვირგვინოვან მორჩებს შორის; მხრის ჭაღთან შესასახსრებელი.
radial-notch|სხივისეული ნაჭდევი|Incisura radialis|სხივის თავთან შესასახსრებელი ნაჭდევი.
`),
  ...terms(fid,'იდაყვი · სხეული და დისტალური ნაწილი',15,`
ulnar-tuberosity|იდაყვის ხორკლი|Tuberositas ulnae|იდაყვის ძვლის წინა ზედაპირზე.
ulnar-anterior-face|იდაყვის წინა ზედაპირი|Facies anterior|დიაფიზის ზედაპირი.|Facies anterior, posterior et medialis
ulnar-posterior-face|იდაყვის უკანა ზედაპირი|Facies posterior|დიაფიზის ზედაპირი.|Facies anterior, posterior et medialis
ulnar-medial-face|იდაყვის მედიალური ზედაპირი|Facies medialis|დიაფიზის ზედაპირი.|Facies anterior, posterior et medialis
ulnar-anterior-border|იდაყვის წინა კიდე|Margo anterior|დიაფიზის კიდე.|Margines anterior, posterior et interosseus
ulnar-posterior-border|იდაყვის უკანა კიდე|Margo posterior|დიაფიზის კიდე.|Margines anterior, posterior et interosseus
ulnar-interosseous|იდაყვის ძვალთაშუა კიდე|Margo interosseus|სხივის ძვლისკენ მიმართული კიდე.|Margines anterior, posterior et interosseus
ulnar-head|იდაყვის ძვლის თავი|Caput ulnae|იდაყვის დისტალური მომრგვალებული ბოლო.
ulnar-styloid|იდაყვის სადგისებური მორჩი|Processus styloideus ulnae|იდაყვის დისტალური ნაწილის მორჩი.|Processus styloideus
`),
];
const radius=terms(fid,'სხივის ძვალი',15,`
radius|სხივის ძვალი|Radius|წინამხრის მეორე ძვალი; პროქსიმალური და დისტალური ბოლოები ცალ-ცალკე შესასწავლია.
radial-head|სხივის ძვლის თავი|Caput radii|კონსპექტის ქართულ ტექსტში წერია სხეული, ლათინურად Caput radii; განსხვავება აქ გამოყოფილია.
radial-circumference|საბრუნებელი სასახსრე ზედაპირი|Circumferentia articularis|სხივის თავის გარშემო სასახსრე ზედაპირი.
radial-neck|სხივის ყელი|Collum radii|თავის ქვემოთ შევიწროებული ნაწილი.
radial-tuberosity|სხივის ხორკლი|Tuberositas radii|სხივის ყელის ქვემოთ მდებარე ხორკლი.
radial-anterior-border|სხივის წინა კიდე|Margo anterior|სხივის დიაფიზის კიდე.|Margo anterior et posterior
radial-posterior-border|სხივის უკანა კიდე|Margo posterior|სხივის დიაფიზის კიდე.|Margo anterior et posterior
radial-interosseous|სხივის ძვალთაშუა კიდე|Margo interosseus|იდაყვის ძვლისკენ მიმართული კიდე.
radial-anterior-face|სხივის წინა ზედაპირი|Facies anterior|სხივის დიაფიზის ზედაპირი.|Facies anterior, posterior et lateralis
radial-posterior-face|სხივის უკანა ზედაპირი|Facies posterior|სხივის დიაფიზის ზედაპირი.|Facies anterior, posterior et lateralis
radial-lateral-face|სხივის ლატერალური ზედაპირი|Facies lateralis|სხივის დიაფიზის ზედაპირი.|Facies anterior, posterior et lateralis
radial-styloid|სხივის სადგისებური მორჩი|Processus styloideus radii|დისტალური ნაწილის მორჩი.|Processus styloideus
ulnar-notch|იდაყვის ნაჭდევი|Incisura ulnaris|სხივის დისტალური ნაწილის იდაყვთან მიმართული ზედაპირი.
carpal-surface|მაჯის სასახსრე ზედაპირი|Facies articularis carpea|სხივის დისტალური ნაწილის ქვედა სასახსრე ზედაპირი.
`);
const proximal=terms(fid,'წინამხრის შეერთებები',17,'proximal-joint|სხივ-იდაყვის პროქსიმალური სახსარი|Articulatio radioulnaris proximalis|პროქსიმალური ბოლოების ბრუნვითი კავშირი.')[0];
const distal=terms(fid,'წინამხრის შეერთებები',18,'distal-joint|სხივ-იდაყვის დისტალური სახსარი|Articulatio radioulnaris distalis|პროქსიმალურ სახსართან კომბინირებული მოქმედება.')[0];
export const forearm=moduleRecord(fid,'10.6','წინამხრის ძვლები','Antebrachium · Ulna + Radius',[
  ...ulna,...radius,
  joint(proximal,'Radius; Ulna','Circumferentia articularis radii ↔ Incisura radialis ulnae','ცილინდრული (კონსპექტი)','Lig. anulare radii; საერთო იდაყვის ჩანთა','ბრუნვა; დისტალურ სახსართან კოორდინირებული მოქმედება'),
  joint(distal,'Radius; Ulna','Caput ulnae ↔ Incisura ulnaris radii','კომბინირებული პროქსიმალურ სახსართან','დისკოსა და ჩანთის სრული აღწერა წიგნის გვერდებით შესავსებია','ბრუნვა; ზუსტი ერთიანი ღერძი გადასამოწმებელია'),
  ...terms(fid,'წინამხრის შეერთებები',18,'membrane|წინამხრის ძვალთაშუა აპკი|Membrana interossea antebrachii|ორ ძვალს შორის გაჭიმული აპკი; კონსპექტში აღნიშნულია სისხლძარღვებისა და ნერვების გასავლელი ხვრელები.'),
].map(e=>e.source.page>=16?{...e,book:{printedPages:[162]}}:e),[],['ანატომიური პოზიცია','ცალ-ცალკე','ერთად','წინიდან','უკნიდან']);
