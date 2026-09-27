const ids = [
  ...Array.from({ length: 7 }, (_, i) => "C" + (i + 1)),
  ...Array.from({ length: 12 }, (_, i) => "T" + (i + 1)),
  ...Array.from({ length: 5 }, (_, i) => "L" + (i + 1)),
  "SAC",
  "COC",
];
const name = (id) =>
  id === "OCC"
    ? "კეფის ძვალი"
    : id === "SAC"
      ? "გავა"
      : id === "COC"
        ? "კუდუსუნი"
        : id === "C1"
          ? "ატლასი C1"
          : id === "C2"
            ? "აქსისი C2"
            : id;
const latinName = (id) =>
  id === "OCC"
    ? "Os occipitale"
    : id === "SAC"
      ? "Os sacrum"
      : id === "COC"
        ? "Os coccygis"
        : id === "C1"
          ? "Atlas"
          : id === "C2"
            ? "Axis"
            : id.startsWith("C")
              ? "Vertebra cervicalis"
              : id.startsWith("T")
                ? "Vertebra thoracica"
                : "Vertebra lumbalis";
const above = (id) => (id === "C1" ? "OCC" : ids[ids.indexOf(id) - 1] || null);
const below = (id) => ids[ids.indexOf(id) + 1] || null;
const jointType = (a, b) =>
  a === "OCC" && b === "C1"
    ? "occipital"
    : a === "C1" && b === "C2"
      ? "atlantoaxial"
      : a === "SAC" && b === "COC"
        ? "sacrococcygeal"
        : "ordinary";
const defs = [
  ["all", "Vertebra", "მთლიანი მალა", "ყველა სტრუქტურა ერთად", "any"],
  [
    "body",
    "Corpus vertebrae",
    "მალის სხეული",
    "მალის წინა, დატვირთვის მატარებელი ნაწილი.",
    "typical",
  ],
  [
    "arch",
    "Arcus vertebrae",
    "მალის რკალი",
    "შედგება წყვილი ფეხისა და წყვილი ფირფიტისგან.",
    "typical",
  ],
  [
    "pedicle",
    "Pediculus arcus vertebrae",
    "მალის რკალის ფეხი",
    "აკავშირებს მალის სხეულს რკალის უკანა ნაწილთან.",
    "typical",
  ],
  [
    "lamina",
    "Lamina arcus vertebrae",
    "მალის რკალის ფირფიტა",
    "რკალის წყვილი უკანა, გაბრტყელებული ნაწილი.",
    "typical",
  ],
  [
    "foramen",
    "Foramen vertebrale",
    "მალის ხვრელი",
    "სივრცე, რომელსაც სხეული და რკალი შემოსაზღვრავს.",
    "normal-space",
  ],
  [
    "spinous",
    "Processus spinosus",
    "წვეტიანი მორჩი",
    "მალის რკალის უკან მიმართული მორჩი.",
    "typical",
  ],
  [
    "transverse",
    "Processus transversus",
    "განივი მორჩი",
    "მალის გვერდითი მორჩი.",
    "typical",
  ],
  [
    "supProcess",
    "Processus articularis superior",
    "ზედა სასახსრე მორჩი",
    "ზედა მომიჯნავე მალასთან სახსრის წარმოქმნაში მონაწილეობს.",
    "typical",
  ],
  [
    "infProcess",
    "Processus articularis inferior",
    "ქვედა სასახსრე მორჩი",
    "ქვედა მომიჯნავე მალასთან სახსრის წარმოქმნაში მონაწილეობს.",
    "typical",
  ],
  [
    "supSurface",
    "Facies articularis superior",
    "ზედა სასახსრე ზედაპირი",
    "ზედა სასახსრე მორჩზე არსებული სასახსრე ზედაპირი.",
    "typical",
  ],
  [
    "infSurface",
    "Facies articularis inferior",
    "ქვედა სასახსრე ზედაპირი",
    "ქვედა სასახსრე მორჩზე არსებული სასახსრე ზედაპირი.",
    "typical",
  ],
  [
    "incSup",
    "Incisura vertebralis superior",
    "ზედა ნაჭდევი",
    "მალის რკალის ფეხის ზედა კიდის ნაჭდევი; გეომეტრიულ მოდელში ნიშნულია.",
    "typical-space",
  ],
  [
    "incInf",
    "Incisura vertebralis inferior",
    "ქვედა ნაჭდევი",
    "მალის რკალის ფეხის ქვედა კიდის ნაჭდევი; გეომეტრიულ მოდელში ნიშნულია.",
    "typical-space",
  ],
  [
    "interforamen",
    "Foramen intervertebrale",
    "მალთაშუა ხვრელი",
    "მომიჯნავე მალების ნაჭდევებით შემოსაზღვრული ხვრელი.",
    "ordinary-link",
  ],
  [
    "disc",
    "Discus intervertebralis",
    "მალთაშუა დისკო",
    "მალების სხეულებს შორის ბოჭკოვან-ხრტილოვანი წარმონაქმნი.",
    "disc-link",
  ],
  [
    "canal",
    "Canalis vertebralis",
    "ხერხემლის არხი",
    "ერთმანეთზე განლაგებული მალების ხვრელებით შექმნილი არხი.",
    "canal",
  ],
  [
    "transForamen",
    "Foramen transversarium",
    "განივი ხვრელი",
    "კისრის მალის განივი მორჩის მიდამოში არსებული წყვილი ხვრელი.",
    "cervical",
  ],
  [
    "costSup",
    "Fovea costalis superior",
    "ზედა სანეკნე ფოსო",
    "ტიპური გულმკერდის მალის სხეულზე არსებული სანეკნე სასახსრე ფოსო.",
    "thoracic-typical",
  ],
  [
    "costInf",
    "Fovea costalis inferior",
    "ქვედა სანეკნე ფოსო",
    "ტიპური გულმკერდის მალის სხეულზე არსებული სანეკნე სასახსრე ფოსო.",
    "thoracic-typical",
  ],
  [
    "costSingle",
    "Fovea costalis",
    "სანეკნე ფოსო",
    "გარდამავალ გულმკერდის მალებზე სანეკნე სასახსრე ადგილი.",
    "thoracic-last",
  ],
  [
    "costTrans",
    "Fovea costalis processus transversi",
    "განივი მორჩის სანეკნე ფოსო",
    "ნეკნის ბორცვთან შეერთებისთვის განკუთვნილი სასახსრე ზედაპირი.",
    "thoracic-trans",
  ],
  [
    "mammillary",
    "Processus mamillaris",
    "დვრილისებრი მორჩი",
    "წელის მალის ზედა სასახსრე მორჩის უკანა ნაწილზე მდებარეობს.",
    "lumbar",
  ],
  [
    "antArch",
    "Arcus anterior atlantis",
    "ატლასის წინა რკალი",
    "წინიდან აკავშირებს ატლასის ლატერალურ მასებს.",
    "atlas",
  ],
  [
    "postArch",
    "Arcus posterior atlantis",
    "ატლასის უკანა რკალი",
    "უკნიდან აკავშირებს ატლასის ლატერალურ მასებს.",
    "atlas",
  ],
  [
    "mass",
    "Massa lateralis atlantis",
    "ატლასის ლატერალური მასა",
    "ატლასის წყვილი მასიური გვერდითი ნაწილი.",
    "atlas",
  ],
  [
    "atlasSup",
    "Facies articularis superior atlantis",
    "ატლასის ზედა სასახსრე ზედაპირი",
    "უკავშირდება კეფის ძვლის შესაბამის როკს.",
    "atlas",
  ],
  [
    "atlasInf",
    "Facies articularis inferior atlantis",
    "ატლასის ქვედა სასახსრე ზედაპირი",
    "უკავშირდება აქსისის ზედა სასახსრე ზედაპირს.",
    "atlas",
  ],
  [
    "atlasTrans",
    "Processus transversus atlantis",
    "ატლასის განივი მორჩი",
    "ატლასის ლატერალური მასებიდან გვერდით მიმართული წყვილი მორჩი.",
    "atlas",
  ],
  [
    "foveaDentis",
    "Fovea dentis",
    "კბილის ფოსო",
    "ატლასის წინა რკალის უკანა ზედაპირზე მდებარე სასახსრე ფოსო.",
    "atlas",
  ],
  [
    "atlasTubAnt",
    "Tuberculum anterius",
    "ატლასის წინა ბორცვი",
    "ატლასის წინა რკალის შუა ნაწილის მცირე შემაღლება.",
    "atlas",
  ],
  [
    "atlasTubPost",
    "Tuberculum posterius",
    "ატლასის უკანა ბორცვი",
    "ატლასის უკანა რკალის შუა ნაწილის მცირე შემაღლება.",
    "atlas",
  ],
  [
    "atlasForamen",
    "Foramen vertebrale atlantis",
    "ატლასის მალის ხვრელი",
    "ატლასის რგოლით შემოსაზღვრული სივრცე.",
    "atlas-space",
  ],
  [
    "atlasTransForamen",
    "Foramen transversarium atlantis",
    "ატლასის განივი ხვრელი",
    "ატლასის განივ მორჩებში არსებული ხვრელები.",
    "atlas-space",
  ],
  [
    "dens",
    "Dens axis",
    "აქსისის კბილისებრი მორჩი",
    "ატლასის ბრუნვის მთავარი ძვლოვანი ღერძი.",
    "axis",
  ],
  [
    "axisSup",
    "Facies articularis superior axis",
    "აქსისის ზედა სასახსრე ზედაპირი",
    "უერთდება ატლასის ქვედა სასახსრე ზედაპირს.",
    "axis",
  ],
  [
    "sacBase",
    "Basis ossis sacri",
    "გავის ფუძე",
    "გავის ზედა გაფართოებული ნაწილი.",
    "sacrum",
  ],
  [
    "sacAla",
    "Ala ossis sacri",
    "გავის ფრთა",
    "გავის ფუძის გვერდითი გაფართოება.",
    "sacrum",
  ],
  [
    "sacApex",
    "Apex ossis sacri",
    "გავის მწვერვალი",
    "გავის შევიწროებული ქვედა დაბოლოება.",
    "sacrum",
  ],
  [
    "sacForamina",
    "Foramina sacralia",
    "გავის ხვრელები",
    "წინა ან უკანა გავის ხვრელები; ამ პროტოტიპში ნიშნულებით ჩანს.",
    "sacrum-space",
  ],
  [
    "sacCrest",
    "Crista sacralis mediana",
    "გავის შუამდებარე ქედი",
    "შეზრდილი წვეტიანი მორჩებისგან წარმოქმნილი ქედი.",
    "sacrum",
  ],
  [
    "sacCanal",
    "Canalis sacralis",
    "გავის არხი",
    "ხერხემლის არხის გაგრძელება გავის ძვალში; აქ აღნიშნულია სქემატურად.",
    "sacrum-space",
  ],
  [
    "cocBase",
    "Basis ossis coccygis",
    "კუდუსუნის ფუძე",
    "კუდუსუნის ზედა ნაწილი.",
    "coccyx",
  ],
  [
    "cocCornu",
    "Cornu coccygeum",
    "კუდუსუნის რქა",
    "პირველი კუდუსუნის სეგმენტის ზედა მორჩი.",
    "coccyx",
  ],
  [
    "cocApex",
    "Apex ossis coccygis",
    "კუდუსუნის მწვერვალი",
    "კუდუსუნის ქვედა შევიწროებული დაბოლოება.",
    "coccyx",
  ],
  [
    "facetLink",
    "Articulationes zygapophysiales",
    "რკალთაშუა სახსრები",
    "მეზობელი მალების სასახსრე მორჩების წყვილი სინოვიალური სახსარი.",
    "ordinary-link",
  ],
  [
    "ligament",
    "Ligamentum transversum atlantis",
    "ატლასის განივი იოგი",
    "კბილისებრი მორჩის უკან მდებარე იოგი, რომელიც მის შეკავებაში მონაწილეობს.",
    "axial-link",
  ],
].map(([id, latin, ka, info, kind]) => ({ id, latin, ka, info, kind }));
const byId = Object.fromEntries(defs.map((x) => [x.id, x]));

export { ids, name, latinName, above, below, jointType, defs, byId };
