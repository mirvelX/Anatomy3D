import { terms, joint, moduleRecord } from './schema.js';
const id='shoulder';
const bones = terms(id,'ლავიწი',13,`
clavicle|ლავიწი|Clavicula|S-ისებურად მოხრილი წყვილი ლულოვანი ძვალი.
sternal-end|სამკერდე ბოლო|Extremitas sternalis|ლავიწის მკერდისკენ მიმართული ბოლო.
sternal-surface|სამკერდე სასახსრე ზედაპირი|Facies articularis sternalis|სამკერდე ბოლოს სასახსრე ზედაპირი.
acromial-end|სამხრე ბოლო|Extremitas acromialis|ბეჭის აკრომიონისკენ მიმართული ბოლო.
body|ლავიწის სხეული|Corpus claviculae|ლავიწის ორ ბოლოს შორის არსებული ნაწილი.
conoid-tubercle|კონუსისებრი ბორცვი|Tuberculum conoideum|ქვედა ზედაპირზე, სამხრე ბოლოსთან ახლოს; იოგის მიმაგრების უბანი.
`);
const scapula = terms(id,'ბეჭი',13,`
scapula|ბეჭი|Scapula|სამკუთხა ბრტყელი ძვალი.
costal-face|სანეკნე ზედაპირი|Facies costalis|გულმკერდისკენ მიმართული ზედაპირი.
dorsal-face|დორსალური ზედაპირი|Facies dorsalis|უკანა ზედაპირი, რომელზეც ბეჭის ქედია.
medial-border|მედიალური კიდე|Margo medialis|ბეჭის სამი კიდიდან ერთ-ერთი.|Margines medialis, lateralis et superior
lateral-border|ლატერალური კიდე|Margo lateralis|ბეჭის სამი კიდიდან ერთ-ერთი.|Margines medialis, lateralis et superior
superior-border|ზედა კიდე|Margo superior|ბეჭის სამი კიდიდან ერთ-ერთი.|Margines medialis, lateralis et superior
superior-angle|ზედა კუთხე|Angulus superior|ბეჭის ზედა კუთხე.|Angulus superior, inferior et lateralis
inferior-angle|ქვედა კუთხე|Angulus inferior|ბეჭის ქვედა კუთხე.|Angulus superior, inferior et lateralis
lateral-angle|ლატერალური კუთხე|Angulus lateralis|კუთხე სასახსრე ფოსოს მიდამოში.|Angulus superior, inferior et lateralis
glenoid|სასახსრე ფოსო|Cavitas glenoidalis|მხრის ძვლის თავთან შეერთების ზედაპირი.
coracoid|ნისკარტისებრი მორჩი|Processus coracoideus|ბეჭის ნისკარტისებრი მორჩი.
spine|ბეჭის ქედი|Spina scapulae|დორსალური ზედაპირის ქედი; გრძელდება აკრომიონისკენ.
acromion|აკრომიონი / სამხრე მორჩი|Acromion|ლავიწთან შეერთებაში მონაწილე მორჩი.
`);
const joints = terms(id,'სარტყლის სახსრები',16,`
sc-joint|მკერდ-ლავიწის სახსარი|Articulatio sternoclavicularis|მკერდისა და ლავიწის შეერთება.
ac-joint|ლავიწ-აკრომიონის სახსარი|Articulatio acromioclavicularis|ლავიწისა და ბეჭის აკრომიონის შეერთება.
`);
export default moduleRecord(id,'10.5','ზედა კიდურის სარტყელი','Cingulum membri superioris',[
  ...bones,...scapula,
  joint(joints[0],'ლავიწი და მკერდის ძვალი','ლავიწის სამკერდე ზედაპირი და მკერდის ლავიწის ნაჭდევი','კონსპექტი: უნაგირა; დისკოსთან ერთად აღწერილია სამღერძიანი ფუნქცია','Discus articularis; წინა/უკანა მკერდ-ლავიწის, ლავიწთაშორისი და ნეკნ-ლავიწის იოგები','კონსპექტის ფუნქციური აღწერა წიგნის შემდგომ გვერდებთან შესადარებელია'),
  joint(joints[1],'ლავიწი და ბეჭი','ლავიწის აკრომიული ბოლო და აკრომიონის სასახსრე ზედაპირი','ბრტყელი (კონსპექტი)','Lig. acromioclaviculare; Lig. coracoclaviculare; Lig. trapezoideum; Lig. conoideum','კონსპექტში აღწერილია მცირე მოძრაობები სამივე მიმართულებით'),
  ...terms(id,'სარტყლის იოგები',16,`
sc-anterior|მკერდ-ლავიწის წინა იოგი|Lig. sternoclaviculare anterius|მკერდ-ლავიწის სახსრის გამამაგრებელი იოგი.|Lig. sternoclaviculare anterius et posterius
sc-posterior|მკერდ-ლავიწის უკანა იოგი|Lig. sternoclaviculare posterius|მკერდ-ლავიწის სახსრის გამამაგრებელი იოგი.|Lig. sternoclaviculare anterius et posterius
interclavicular|ლავიწთაშორისი იოგი|Lig. interclaviculare|კონსპექტში აღწერილია ლავიწების სამკერდე ბოლოების დამაკავშირებლად.|ligamenta interclaviculare
costoclavicular|ნეკნ-ლავიწის იოგი|Lig. costoclaviculare|მკერდ-ლავიწის შეერთების იოგოვანი კომპლექსი.|ligamenta costocraviculare
ac-ligament|ლავიწ-აკრომიონის იოგი|Lig. acromioclaviculare|აკრომიულ-ლავიწის სახსრის იოგი.|ligamenta acromioclaviculare
cc-ligament|ნისკარტ-ლავიწის იოგი|Lig. coracoclaviculare|ბეჭისა და ლავიწის დამაკავშირებელი იოგი.|ligamenta coracoclaviculare
trapezoid|ტრაპეციული იოგი|Lig. trapezoideum|კონსპექტში ჩამოთვლილია ნისკარტ-ლავიწის იოგთან ერთად.|ligamenta trapezoideum
conoid|კონუსისებრი იოგი|Lig. conoideum|კონუსისებრ ბორცვთან დაკავშირებული იოგი.|ligamenta conoideum
coracoacromial|ნისკარტ-აკრომიონის იოგი|Lig. coracoacromiale|ბეჭის საკუთარი იოგების ჯგუფი.|Ligamenta coracoacromiale
superior-transverse|ბეჭის ზედა განივი იოგი|Lig. transversum scapulae superius|ბეჭის საკუთარი იოგების ჯგუფი.|Ligamenta transversum scapulae superius
inferior-transverse|ბეჭის ქვედა განივი იოგი|Lig. transversum scapulae inferius|ბეჭის საკუთარი იოგების ჯგუფი.|Ligamenta transversum scapulae inferius
`),
].map(e=>e.source.page>=16?{...e,book:{printedPages:[162]}}:e), [48,50], ['წინიდან','უკნიდან','გვერდიდან','ლავიწის ქვედა ზედაპირი']);
