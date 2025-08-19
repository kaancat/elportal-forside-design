// Grid providers (DSOs) operating in Denmark
// Data from EnergiDataService ConnectionPointsInGrid and PowerSupplierChangePerGridarea APIs
// Network tariffs are weighted averages from DatahubPricelist API (2025 data)

export const gridProviders = {
  // Major DSOs
  "791": {
    code: "791",
    name: "Radius Elnet A/S",
    gln: "5790000705689",
    networkTariff: 0.217, // kr/kWh (2025 average from DatahubPricelist API)
    chargeCode: "DT_C_01", // Charge code for residential customers
    region: "DK2" as const,
    municipalities: ["København", "Frederiksberg", "Gentofte", "Lyngby-Taarbæk", "Gladsaxe", 
      "Herlev", "Ballerup", "Furesø", "Allerød", "Fredensborg", "Helsingør", "Hørsholm",
      "Rudersdal", "Egedal", "Frederikssund", "Halsnæs", "Gribskov", "Hillerød", "Holbæk",
      "Lejre", "Køge", "Greve", "Høje-Taastrup", "Vallensbæk"]
  },
  "740": {
    code: "740",
    name: "Cerius A/S",
    gln: "5790000610976",
    networkTariff: 0.236, // kr/kWh (2025 average)
    chargeCode: "DT_C_01",
    region: "DK2" as const,
    municipalities: ["Faxe", "Stevns", "Køge", "Solrød", "Greve", "Holbæk", "Kalundborg",
      "Odsherred", "Slagelse", "Ringsted", "Næstved", "Vordingborg", "Guldborgsund", "Lolland"]
  },
  "853": {
    code: "853",
    name: "Cerius A/S",
    gln: "5790000610976",
    networkTariff: 0.236, // kr/kWh (2025 average)
    chargeCode: "DT_C_01",
    region: "DK2" as const,
    municipalities: []
  },
  "131": {
    code: "131",
    name: "N1 A/S",
    gln: "5790001089030",
    networkTariff: 0.192, // kr/kWh (2025 average from DatahubPricelist API)
    chargeCode: "CD", // N1 uses different charge code
    region: "DK1" as const,
    municipalities: ["Aabenraa", "Tønder", "Haderslev", "Sønderborg", "Esbjerg", "Fanø",
      "Varde", "Billund", "Vejen", "Kolding", "Vejle", "Hedensted", "Horsens", "Viborg",
      "Skive", "Holstebro", "Herning", "Ikast-Brande", "Ringkøbing-Skjern", "Lemvig",
      "Struer", "Thisted", "Morsø", "Vesthimmerland", "Rebild", "Mariagerfjord", "Jammerbugt",
      "Aalborg", "Brønderslev", "Frederikshavn", "Hjørring", "Læsø", "Ærø"]
  },
  "344": {
    code: "344",
    name: "N1 A/S",
    gln: "5790001089030",
    networkTariff: 0.192, // kr/kWh (2025 average)
    chargeCode: "CD",
    region: "DK1" as const,
    municipalities: []
  },
  "398": {
    code: "398",
    name: "N1 A/S",
    gln: "5790001089030",
    networkTariff: 0.192, // kr/kWh (2025 average)
    chargeCode: "CD",
    region: "DK1" as const,
    municipalities: []
  },
  "543": {
    code: "543",
    name: "Vores Elnet A/S",
    gln: "5790000610853",
    networkTariff: 0.220, // kr/kWh (2025 average)
    chargeCode: "DT_C_01",
    region: "DK2" as const,
    municipalities: ["Odense", "Faaborg-Midtfyn", "Assens", "Middelfart", "Nordfyn",
      "Kerteminde", "Nyborg", "Svendborg", "Langeland", "Ærø"]
  },
  "244": {
    code: "244",
    name: "TREFOR El-Net A/S",
    gln: "5790000392261",
    networkTariff: 0.316, // kr/kWh (2025 average)
    chargeCode: "DT_C_01",
    region: "DK1" as const,
    municipalities: ["Fredericia", "Kolding", "Vejen", "Haderslev", "Middelfart"]
  },
  "911": {
    code: "911",
    name: "TREFOR El-Net Øst A/S",
    gln: "5790000392551",
    networkTariff: 0.641, // kr/kWh (2025 average - Bornholm has higher costs)
    chargeCode: "DT_C_01",
    region: "DK2" as const,
    municipalities: ["Bornholm", "Egedal"]
  },
  "151": {
    code: "151",
    name: "Konstant Net A/S",
    gln: "5790000610280",
    networkTariff: 0.310, // kr/kWh (2025 average)
    chargeCode: "DT_C_01",
    region: "DK1" as const,
    municipalities: ["Aarhus", "Skanderborg", "Favrskov", "Norddjurs", "Syddjurs", "Samsø"]
  },
  "245": {
    code: "245",
    name: "Konstant Net A/S",
    gln: "5790000610280",
    networkTariff: 0.31,
    region: "DK1" as const,
    municipalities: ["Horsens", "Hedensted"]
  },
  "031": {
    code: "031",
    name: "Nord Energi Net A/S",
    gln: "5790001095024",
    networkTariff: 0.30,
    region: "DK1" as const,
    municipalities: ["Frederikshavn", "Hjørring", "Brønderslev", "Aalborg", "Jammerbugt"]
  },
  "233": {
    code: "233",
    name: "Dinel A/S",
    gln: "5790000610846",
    networkTariff: 0.29,
    region: "DK1" as const,
    municipalities: ["Aarhus", "Favrskov", "Horsens", "Odder", "Skanderborg"]
  },
  "533": {
    code: "533",
    name: "FLOW Elnet A/S",
    gln: "5790000610839",
    networkTariff: 0.28,
    region: "DK2" as const,
    municipalities: ["Faaborg-Midtfyn", "Svendborg"]
  },
  "531": {
    code: "531",
    name: "Ravdex A/S",
    gln: "5790001089375",
    networkTariff: 0.29,
    region: "DK2" as const,
    municipalities: ["Odense", "Kerteminde"]
  },
  "051": {
    code: "051",
    name: "Elinord A/S",
    gln: "5790001089191",
    networkTariff: 0.30,
    region: "DK1" as const,
    municipalities: ["Frederikshavn"]
  },
  "154": {
    code: "154",
    name: "Elnet Midt A/S",
    gln: "5790001089238",
    networkTariff: 0.30,
    region: "DK1" as const,
    municipalities: ["Silkeborg"]
  },
  "381": {
    code: "381",
    name: "Hurup Elværk Net A/S",
    gln: "5790001089542",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: ["Thisted"]
  },
  "347": {
    code: "347",
    name: "NOE Net A/S",
    gln: "5790001089351",
    networkTariff: 0.31,
    region: "DK1" as const,
    municipalities: ["Holstebro", "Lemvig", "Herning"]
  },
  "348": {
    code: "348",
    name: "RAH Net A/S",
    gln: "5790001089368",
    networkTariff: 0.31,
    region: "DK1" as const,
    municipalities: ["Ringkøbing-Skjern", "Herning", "Ikast-Brande", "Billund", "Vejle"]
  },
  "385": {
    code: "385",
    name: "RAH Net A/S",
    gln: "5790001089368",
    networkTariff: 0.31,
    region: "DK1" as const,
    municipalities: []
  },
  "351": {
    code: "351",
    name: "L-Net A/S",
    gln: "5790001089313",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: ["Herning", "Holstebro"]
  },
  "357": {
    code: "357",
    name: "Forsyning Elnet A/S",
    gln: "5790001095093",
    networkTariff: 0.31,
    region: "DK1" as const,
    municipalities: ["Holstebro"]
  },
  "342": {
    code: "342",
    name: "Ikast El Net A/S",
    gln: "5790001089320",
    networkTariff: 0.30,
    region: "DK1" as const,
    municipalities: ["Ikast-Brande"]
  },
  "532": {
    code: "532",
    name: "Veksel A/S",
    gln: "5790001089382",
    networkTariff: 0.32,
    region: "DK2" as const,
    municipalities: ["Langeland"]
  },
  "584": {
    code: "584",
    name: "Midtfyns Elforsyning A.m.b.A.",
    gln: "5790001095048",
    networkTariff: 0.33,
    region: "DK2" as const,
    municipalities: ["Faaborg-Midtfyn"]
  },
  "085": {
    code: "085",
    name: "Læsø Elnet A/S",
    gln: "5790001089290",
    networkTariff: 0.35,
    region: "DK1" as const,
    municipalities: ["Læsø"]
  },
  // Additional smaller DSOs
  "016": {
    code: "016",
    name: "El-net Kongerslev A/S",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: []
  },
  "042": {
    code: "042",
    name: "Netselskabet Elværk A/S",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: []
  },
  "084": {
    code: "084",
    name: "Kimbrer Elnet A/S",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: []
  },
  "141": {
    code: "141",
    name: "Hammel Elforsyning Net A/S",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: ["Favrskov"]
  },
  "331": {
    code: "331",
    name: "Netselskabet Elværk A/S",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: []
  },
  "341": {
    code: "341",
    name: "Grindsted Elnet A/S",
    networkTariff: 0.31,
    region: "DK1" as const,
    municipalities: []
  },
  "370": {
    code: "370",
    name: "Aal El-net A.m.b.a",
    networkTariff: 0.33,
    region: "DK1" as const,
    municipalities: []
  },
  "371": {
    code: "371",
    name: "Hjerting Transformatorforening",
    networkTariff: 0.33,
    region: "DK1" as const,
    municipalities: []
  },
  "384": {
    code: "384",
    name: "Tarm Elværk Net A/S",
    networkTariff: 0.32,
    region: "DK1" as const,
    municipalities: []
  },
  "396": {
    code: "396",
    name: "Sunds Net A.m.b.a",
    networkTariff: 0.33,
    region: "DK1" as const,
    municipalities: []
  },
  "757": {
    code: "757",
    name: "Elektrus A/S",
    networkTariff: 0.32,
    region: "DK2" as const,
    municipalities: []
  },
  "854": {
    code: "854",
    name: "NKE-Elnet A/S",
    networkTariff: 0.32,
    region: "DK2" as const,
    municipalities: []
  },
  "860": {
    code: "860",
    name: "Zeanet A/S",
    networkTariff: 0.32,
    region: "DK2" as const,
    municipalities: []
  }
};

// Helper function to get grid provider by municipality
export function getGridProviderByMunicipality(municipality: string): typeof gridProviders[keyof typeof gridProviders] | null {
  for (const provider of Object.values(gridProviders)) {
    const municipalities = provider.municipalities as string[] | undefined;
    if (municipalities && municipalities.includes(municipality)) {
      return provider;
    }
  }
  
  // Default fallback based on region (most common provider)
  const isEastDenmark = municipality.toLowerCase().includes('køben') || 
                       municipality.toLowerCase().includes('zealand') ||
                       municipality.toLowerCase().includes('sjælland');
  
  if (isEastDenmark) {
    return gridProviders["791"]; // Radius Elnet for Copenhagen area
  } else {
    return gridProviders["131"]; // N1 for Jutland
  }
}

// Export type for grid provider
export type GridProvider = typeof gridProviders[keyof typeof gridProviders];