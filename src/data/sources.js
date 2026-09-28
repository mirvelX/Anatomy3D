// Printed pages, not PDF indices. References describe content, not mesh approval.
export const textbook = {
  title: "კაციტაძე · ადამიანის ანატომია · I ტომი (2017)",
  url: "https://www.interbusiness.edu.ge/storage/books/6453904109402_ადამიანის-ანატომია-კაციტაძე-2017-1-ტ.%20(1).pdf",
  pdfPageOffset: 1,
};

const reviewed = {
  body: [30, "სურ. 58"],
  arch: [30, "სურ. 58"],
  foramen: [30, "სურ. 58"],
  spinous: [30, "სურ. 58"],
  transverse: [30, "სურ. 58"],
  supProcess: [30, "სურ. 58"],
  infProcess: [30, "სურ. 58"],
  supSurface: [30, "სურ. 58"],
  infSurface: [30, "სურ. 58"],
  incSup: [30, "სურ. 58"],
  incInf: [30, "სურ. 58"],
  costSup: [30, "სურ. 58"],
  costInf: [30, "სურ. 58"],
  costSingle: [30, "XI–XII მალები"],
  costTrans: [30, "სანეკნე ფოსოები"],
  antArch: [31, "სურ. 59; გაგრძელება გვ. 32"],
  postArch: [31, "სურ. 59; გაგრძელება გვ. 32"],
  mass: [31, "სურ. 59"],
  atlasSup: [32, "ატლასი"],
  atlasInf: [32, "ატლასი"],
  atlasTrans: [31, "სურ. 59"],
  atlasForamen: [31, "სურ. 59"],
  atlasTransForamen: [31, "სურ. 59"],
  transForamen: [31, "კისრის მალები"],
  atlasTubAnt: [32, "ატლასი"],
  atlasTubPost: [32, "ატლასი"],
  foveaDentis: [32, "ატლასი"],
  dens: [32, "აქსისი; სურ. 60 გვ. 31"],
  axisSup: [31, "სურ. 60"],
  densAnterior: [32, "აქსისი"],
  densPosterior: [32, "აქსისი"],
  carotidTubercle: [32, "კისრის VI მალა"],
  mammillary: [33, "წელის მალა; სურ. 62"],
  accessory: [33, "წელის მალა"],
  sacBase: [33, "გავის ძვალი"],
  sacApex: [33, "გავის ძვალი"],
  sacForamina: [34, "სურ. 63"],
  sacCrest: [35, "გავის შუა ქედი"],
  sacCanal: [35, "გავის არხი"],
  cocCornu: [35, "სურ. 64"],
};

export function sourceFor(part) {
  const ref = reviewed[part];
  if (!ref) return null;
  return {
    page: ref[0],
    figure: ref[1],
    url: `${textbook.url}#page=${ref[0] + textbook.pdfPageOffset}`,
  };
}

export function levelNote(id) {
  if (id === "C1")
    return {
      page: 31,
      text: "ატლასს სხეული არ აქვს. წინა და უკანა რკალებს გვერდითი მასები აერთებს; კბილის ფოსო წინა რკალის შიგნითაა.",
    };
  if (id === "C2")
    return {
      page: 32,
      text: "აქსისის სხეულიდან ზემოთ კბილი გამოდის. ცალ-ცალკე მონიშნე კბილის წინა და უკანა სასახსრე ზედაპირები.",
    };
  if (id === "C6")
    return {
      page: 32,
      text: "C6-ის გამორჩეული ნიშანია საძილე ბორცვი — განივი მორჩის წინა ნაწილის შემაღლება.",
    };
  if (id === "C7")
    return {
      page: 32,
      text: "C7 — vertebra prominens: გრძელი, მკვეთრად გამოხატული წვეტიანი მორჩით ამოიცნობა.",
    };
  if (/^C[3-5]$/.test(id))
    return {
      page: 31,
      text: "კისრის მალების საერთო ნიშანია წყვილი განივი ხვრელი. ამ ეტაპზე მოდელი რეგიონის საერთო სქემას იყენებს.",
    };
  if (id === "T10")
    return {
      page: 30,
      text: "ამ გვერდზე T10-ის სანეკნე ფოსოების ცალკე აღწერა არ არის. მისი გეომეტრიისა და სახელების გადამოწმება შემდეგ ეტაპზე დასრულდება.",
    };
  if (["T11", "T12"].includes(id))
    return {
      page: 30,
      text: "XI–XII მალებს სხეულის თითოეულ მხარეს ერთი სანეკნე სასახსრე ფოსო აქვს. ეს განასხვავე ზედა და ქვედა ფოსოების წყვილისგან.",
    };
  if (/^T/.test(id))
    return {
      page: 30,
      text: "წიგნი I–IX მალებს ზედა და ქვედა სანეკნე ფოსოების ჯგუფში აღწერს. ცალკეული დონის თავისებურებებისა და ვარიანტების გადამოწმება გრძელდება.",
    };
  if (/^L/.test(id))
    return {
      page: 33,
      text: "წელის მალაზე შეადარე დვრილისებრი და დამატებითი მორჩები: პირველი ზედა სასახსრე მორჩზეა, მეორე — განივი მორჩის ფუძის უკან.",
    };
  if (id === "SAC")
    return {
      page: 33,
      text: "გავა ხუთი შეზრდილი მალისგან შედგება. ფუძე ზემოთაა, მწვერვალი — ქვემოთ; წინა და უკანა ზედაპირები განსხვავდება. მათი სრული გეომეტრია ჯერ დასამუშავებელია.",
    };
  return {
    page: 35,
    text: "კუდუსუნის ფუძე გავისკენაა მიმართული. პირველ სეგმენტზე კუდუსუნის რქები ჩანს; სეგმენტების რაოდენობა ცვალებადია.",
  };
}

export const bookAliases = {
  atlasSup: "Fovea articularis superior · ზედა სასახსრე ღრმული",
  atlasInf: "Fovea articularis inferior · ქვედა სასახსრე ღრმული",
  transForamen: "Foramen transversum",
  atlasTransForamen: "Foramen transversum",
  sacCrest: "გავის შუა ქედი",
};
