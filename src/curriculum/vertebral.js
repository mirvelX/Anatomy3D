import { terms, joint, moduleRecord } from './schema.js';
const id = 'vertebral';
const structures = [
  ...terms(id, 'ხრტილოვანი შეერთებები', 7, `
discs|მალთაშუა დისკოები|Disci intervertebrales|მალების სხეულებს შორის მოთავსებული ფირფიტები; შესასწავლია ფიბროზული რგოლი და რბილი ბირთვი.
annulus|ფიბროზული რგოლი|Anulus fibrosus|მალთაშუა დისკოს პერიფერიული ნაწილი. ძიებაში გამოიყენება აგრეთვე Annulus fibrosus.
nucleus|რბილი ბირთვი|Nucleus pulposus|დისკოს ცენტრალური ნაწილი.
sacrococcygeal|გავა-კუდუსუნის შეერთება|Junctura sacrococcygea|გავისა და კუდუსუნის შეერთება. კონსპექტის ასაკობრივი/სქესობრივი აღწერა (გვ.8) საჭიროებს დამატებით გადამოწმებას.
`),
  ...terms(id, 'გრძელი იოგები', 8, `
anterior|წინა გასწვრივი იოგი|Lig. longitudinale anterius|ხერხემლის გრძელი იოგების ჯგუფი. დასაწყისისა და დაბოლოების ზუსტი საზღვრები ჯერ გადასამოწმებელია.|ligamenta longitudinale anterior
posterior|უკანა გასწვრივი იოგი|Lig. longitudinale posterius|ხერხემლის გრძელი იოგების ჯგუფი. კონსპექტში წინა იოგთან ერთად არის აღწერილი.|ligamenta longitudinale posterior
supraspinal|წვეტზედა იოგი|Lig. supraspinale|კონსპექტში აღწერილია წვეტიანი მორჩების მწვერვალების გასწვრივ.|ligamenta supraspinale
nuchal|ქედის იოგი|Lig. nuchae|კისრის მიდამოს იოგი; კონსპექტში დაკავშირებულია წვეტზედა იოგთან.|ligamenta nuchae
`),
  ...terms(id, 'მოკლე იოგები', 8, `
flava|ყვითელი იოგები|Ligg. flava|მეზობელი მალების რკალებს შორის კავშირი. კონსპექტი C1–C2-ს გამონაკლისად გამოყოფს.
interspinal|წვეტთაშუა იოგები|Ligg. interspinalia|მეზობელი წვეტიანი მორჩების სივრცის შემავსებელი ფირფიტები.
intertransverse|განივ მორჩთაშუა იოგები|Ligg. intertransversaria|მეზობელი განივი მორჩების დამაკავშირებელი კონები.
`),
  ...terms(id, 'ატლას–აქსისის იოგები', 8, `
transverse|ატლასის განივი იოგი|Lig. transversum atlantis|კონსპექტში განხილულია კბილის უკანა ზედაპირთან და ზურგის ტვინის დაცვის როლთან ერთად.|ligamenta transversum atlantis
cruciform|ატლასის ჯვარედინა იოგი|Lig. cruciforme atlantis|ატლას–აქსისის კომპლექსის იოგოვანი ელემენტი.|ligamneta cruciforme atlantis
`),
  ...terms(id, 'ატლას–აქსისის იოგები', 9, `
alar|ფრთისებრი იოგები|Ligg. alaria|კონსპექტში განხილულია ატლას–აქსისის შეერთების გამამაგრებელ იოგებში.
apical|კბილის მწვერვალის იოგი|Lig. apicis dentis|აქსისის კბილის მწვერვალთან დაკავშირებული იოგი.|ligamenta apicis dentis
tectorial|მფარავი აპკი|Membrana tectoria|კონსპექტში აღწერილია ამ მიდამოს იოგებთან ერთად; მისი ურთიერთობები გადასამოწმებელია.
`),
];
const median = terms(id, 'ატლას–აქსისის სახსრები', 8, 'median|ატლას-აქსისის შუა სახსარი|Articulatio atlantoaxialis mediana|კონსპექტის მიხედვით — ერთღერძიანი ცილინდრული სახსარი.|Articularis atlantoaxialis mediana')[0];
const lateral = terms(id, 'ატლას–აქსისის სახსრები', 8, 'lateral|ატლას-აქსისის გვერდითი სახსრები|Articulationes atlantoaxiales laterales|კონსპექტში აღწერილია ბრტყელ, კომბინირებულ სახსრად.|Articularis atlantoaxialis lateralis')[0];
const facet = terms(id, 'სასახსრე მორჩების შეერთებები', 9, 'facet|სასახსრე მორჩებს შორის სახსრები|Articulationes zygapophysiales|ზედა მალის ქვედა და მომდევნო მალის ზედა სასახსრე მორჩების შეერთება.|Articularis zygoapophysialis')[0];
structures.push(
  joint(median, 'Atlas (C1), Axis (C2)', 'კბილის წინა ზედაპირი ↔ Fovea dentis; უკანა ზედაპირი ↔ ატლასის განივი იოგი', 'კონსპექტი: ცილინდრული, ერთღერძიანი', 'Lig. transversum atlantis; Lig. cruciforme atlantis', 'ბრუნვა ვერტიკალური ღერძის გარშემო'),
  joint(lateral, 'Atlas (C1), Axis (C2)', 'ატლასის ქვედა და აქსისის ზედა სასახსრე ზედაპირები; ზუსტი კონტაქტის mesh ჯერ არ არის', 'კონსპექტი: ბრტყელი, კომბინირებული; ღერძების აღწერა გადასამოწმებელია', 'Ligg. alaria; Lig. apicis dentis; Membrana tectoria (კონსპექტის გვ.9)', 'თავისა და ატლასის ერთობლივი მოძრაობა; მოდელური ანიმაცია მოსამზადებელია'),
  joint(facet, 'ორი მეზობელი მალა', 'ქვედა სასახსრე ზედაპირი ↔ მომდევნო მალის ზედა სასახსრე ზედაპირი', 'კონსპექტში მოცემული რეგიონული კლასიფიკაცია გადასამოწმებელია', 'სასახსრე ჩანთა; რეგიონული იოგოვანი ურთიერთობები შესავსებია', 'რეგიონზე დამოკიდებული მოძრაობები; ზუსტი ღერძები შემდეგი წიგნის გვერდებით გადასამოწმებელია', ['კონსპექტი წელის სახსრებს ერთღერძიანად აღწერს. ეს ჩანაწერი დამოუკიდებლად დამოწმებული არ არის.'])
);
export default moduleRecord(id, '10.3', 'ხერხემლის შეერთებები', 'Articulationes vertebrales', structures, [150, 154], ['წინიდან', 'უკნიდან', 'გვერდიდან', 'დისკოს განაკვეთი']);
