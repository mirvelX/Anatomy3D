import { terms, joint, moduleRecord } from './schema.js';
const id='hand';
const carpals=[
  ...terms(id,'მაჯა · პროქსიმალური რიგი',15,`
scaphoid|ნავისებრი ძვალი|Os scaphoideum|მაჯის პროქსიმალური რიგი.
lunate|მთვარისებრი ძვალი|Os lunatum|მაჯის პროქსიმალური რიგი.
triquetrum|სამწახნაგიანი ძვალი|Os triquetrum|მაჯის პროქსიმალური რიგი.
pisiform|ცერცვისებრი ძვალი|Os pisiforme|მაჯის პროქსიმალური რიგი.
`,{carpalRow:'proximal'}),
  ...terms(id,'მაჯა · დისტალური რიგი',16,`
trapezium|ტრაპეციული ძვალი|Os trapezium|მაჯის დისტალური რიგი.
trapezoid|ტრაპეცოიდული ძვალი|Os trapezoideum|მაჯის დისტალური რიგი.
capitate|თავდიდა ძვალი|Os capitatum|მაჯის დისტალური რიგი.
hamate|კავიანი ძვალი|Os hamatum|მაჯის დისტალური რიგი.
`,{carpalRow:'distal'}),
];
const roman=['I','II','III','IV','V'];
const metacarpals=roman.flatMap((r,i)=>[
  ...terms(id,'ნები · Metacarpus',16,`metacarpal-${i+1}|ნების ${r} ძვალი|Os metacarpale ${r}|კონსპექტის ხუთი ნების ძვლის ჯგუფის ცალკე სასწავლო ჩანაწერი.|Ossa metacarpalia`),
  ...terms(id,`ნების ${r} ძვლის ნაწილები`,16,`
mc-${i+1}-base|ნების ${r} ძვლის ფუძე|Basis ossis metacarpalis ${r}|კონსპექტის Basis / Corpus / Caput დაყოფა ცალკე ძვალზე.|Basis
mc-${i+1}-body|ნების ${r} ძვლის სხეული|Corpus ossis metacarpalis ${r}|კონსპექტის Basis / Corpus / Caput დაყოფა ცალკე ძვალზე.|Corpus
mc-${i+1}-head|ნების ${r} ძვლის თავი|Caput ossis metacarpalis ${r}|კონსპექტის Basis / Corpus / Caput დაყოფა ცალკე ძვალზე.|Caput
`),
]);
const phalanges=roman.flatMap((r,i)=>(i===0?['proximalis','distalis']:['proximalis','media','distalis']).flatMap(position=>{
  const ka={proximalis:'პროქსიმალური',media:'შუა',distalis:'დისტალური'}[position];
  return terms(id,`ფალანგები · ${r} თითი`,16,`phalanx-${i+1}-${position}|${r} თითის ${ka} ფალანგი|Phalanx ${position} digiti ${r}|კონსპექტის ფალანგების ტიპები გაშლილია თითების მიხედვით. ცერზე შუა ფალანგი არ არის; ცერის განსხვავება შეერთებებში გვ.19-ზეცაა გამოყოფილი.|Phalanx ${position}`);
}));
const jointEntries=[
  ...terms(id,'მაჯის სახსრები',18,`
radiocarpal|სხივ-მაჯის სახსარი|Articulatio radiocarpea|კონსპექტის მონაწილე ძვლების ჩამონათვალში არის საეჭვო სიტყვა „კუბური“; ის აქ არ ითვლება დამოწმებულ სტრუქტურად.
midcarpal|მაჯის შუა სახსარი|Articulatio mediocarpea|პროქსიმალურ და დისტალურ რიგებს შორის კავშირი.
intercarpal|მაჯის ძვალთაშუა სახსრები|Articulationes intercarpeae|მაჯის მეზობელი ძვლების გვერდით ზედაპირებს შორის.
`),
  ...terms(id,'მტევნის სახსრები',19,`
pisiform-joint|ცერცვისებრი ძვლის სახსარი|Articulatio ossis pisiformis|ცერცვისებრი და სამწახნაგა ძვლების კავშირი.
cmc|მაჯა-ნების სახსრები|Articulationes carpometacarpeae|დისტალური მაჯის რიგისა და ნების ძვლების ფუძეების კავშირი.
thumb-cmc|ცერის მაჯა-ნების სახსარი|Articulatio carpometacarpea pollicis|ტრაპეციულ და ნების პირველ ძვალს შორის.
mcp|ნებ-ფალანგის სახსრები|Articulationes metacarpophalangeae|ნების თავები და პროქსიმალური ფალანგების ფუძეები.
ip|მტევნის ფალანგთაშუა სახსრები|Articulationes interphalangeae manus|მეზობელი ფალანგების თავებსა და ფუძეებს შორის.
`),
];
const configurations=[
  ['Radius და მაჯის პროქსიმალური რიგის მონაწილე ძვლები','სხივის დისტალური სასახსრე ზედაპირი + დისკო ↔ პროქსიმალური რიგი; ზუსტი სია გადასამოწმებელია','ელიფსური (კონსპექტი)','გვერდითი იოგები; სხივ-მაჯის დორსალური და პალმარული იოგები','კონსპექტი: ორი ღერძის მიმართ მოძრაობა'],
  ['მაჯის პროქსიმალური და დისტალური რიგები','ურთიერთმიმართული სასახსრე ზედაპირები','კონსპექტში — კომბინირებული უნაგირა; კლასიფიკაცია გადასამოწმებელია','Lig. carpi radiatum','ერთობლივი მოძრაობა; ზუსტი მოცულობა შესავსებია'],
  ['მეზობელი მაჯის ძვლები','გვერდითი სასახსრე ზედაპირები','ბრტყელი (კონსპექტი)','დორსალური, პალმარული და ძვალთაშუა იოგები','მცირე გადაადგილებები; დეტალური მექანიკა გადასამოწმებელია'],
  ['Os pisiforme; Os triquetrum','ურთიერთმიმართული ზედაპირები','კლასიფიკაცია წიგნის შემდგომი გვერდებით შესავსებია','იოგების აღწერა შესავსებია','მოძრაობის აღწერა შესავსებია'],
  ['მაჯის დისტალური რიგი; Ossa metacarpalia','დისტალური მაჯის ზედაპირები ↔ ნების ფუძეები','ცერის სახსარი ცალკეა გამოყოფილი; დანარჩენები კონსპექტში ბრტყელია','მაჯა-ნების დორსალური და პალმარული იოგები','რეგიონული მოძრაობის მოცულობა შესავსებია'],
  ['Os trapezium; Os metacarpale I','ტრაპეციული ძვალი ↔ ნების I ძვლის ფუძე','უნაგირა (კონსპექტი)','ჩანთა/იოგები შესავსებია','კონსპექტში გამოყოფილია ცერის მეტი მოძრაობის თავისუფლება'],
  ['ნების ძვლები; პროქსიმალური ფალანგები','ნების თავები ↔ პროქსიმალური ფალანგების ფუძეები','კონსპექტის ფორმისა და ცერის გამონაკლისის აღწერა გადასამოწმებელია','Ligg. collateralia; Ligg. palmaria; Lig. metacarpeum transversum profundum','ღერძების აღწერა შემდგომი გვერდებით გადასამოწმებელია'],
  ['მეზობელი ფალანგები','ფალანგის თავი ↔ მომდევნო ფალანგის ფუძე','ჭაღისებრი (კონსპექტი)','Ligg. collateralia','მოხრა/გაშლა ფრონტალური ღერძის მიმართ; ცერს ერთი ფალანგთაშუა სახსარი აქვს'],
];
export default moduleRecord(id,'10.7','მტევნის ძვლები და სახსრები','Manus · Ossa manus',[
  ...carpals,...metacarpals,...phalanges,
  ...jointEntries.map((e,i)=>joint(e,...configurations[i])),
  ...terms(id,'მაჯის იოგები',18,`
ulnar-carpal|მაჯის იდაყვისმხრივი გვერდითი იოგი|Lig. collaterale carpi ulnare|სხივ-მაჯის კომპლექსის გვერდითი იოგი.|Ligg.collaterale carpi ulnare et radiale
radial-carpal|მაჯის სხივისმხრივი გვერდითი იოგი|Lig. collaterale carpi radiale|სხივ-მაჯის კომპლექსის გვერდითი იოგი.|Ligg.collaterale carpi ulnare et radiale
dorsal-radiocarpal|სხივ-მაჯის დორსალური იოგი|Lig. radiocarpeum dorsale|კონსპექტის სხივ-მაჯის იოგი.|Ligg.radiocarpeum dorsale et palmare
palmar-radiocarpal|სხივ-მაჯის პალმარული იოგი|Lig. radiocarpeum palmare|კონსპექტის სხივ-მაჯის იოგი.|Ligg.radiocarpeum dorsale et palmare
radiate-carpal|მაჯის სხივისებრი იოგი|Lig. carpi radiatum|მაჯის შუა სახსართან განხილული იოგი.|Ligamenta carpi radiatum
intercarpal-dorsal|მაჯის ძვალთაშუა დორსალური იოგები|Ligg. intercarpea dorsalia|მაჯის ძვლების დამაკავშირებელი იოგები.|Ligg. intercarpea dorsalia et palmaria
intercarpal-palmar|მაჯის ძვალთაშუა პალმარული იოგები|Ligg. intercarpea palmaria|მაჯის ძვლების დამაკავშირებელი იოგები.|Ligg. intercarpea dorsalia et palmaria
intercarpal-interosseous|მაჯის ძვალთაშუა იოგები|Ligg. intercarpea interossea|მაჯის ძვლების დამაკავშირებელი იოგები.
`),
  ...terms(id,'თითების სახსრების იოგები',19,`
collateral|გვერდითი იოგები|Ligg. collateralia|კონსპექტში ნებ-ფალანგისა და ფალანგთაშუა სახსრებთან.|Ligg. coolateralia
palmar|ხელისგულის იოგები|Ligg. palmaria|კონსპექტში ნებ-ფალანგის სახსრებთან.
deep-transverse|ნების ღრმა განივი იოგი|Lig. metacarpeum transversum profundum|კონსპექტში ნებ-ფალანგის სახსრებთან.|Ligamenta metacarpeum transversum profundum
`),
].map(e=>e.source.page>=18?{...e,book:{printedPages:[162]}}:e),[],['ხელისგულის მხრიდან','ზურგის მხრიდან','რადიალურად','ულნარულად','მაჯის რიგები']);
