export interface GridProvider {
  code: string;
  name: string;
  networkTariff: number; // kr/kWh
  region: 'DK1' | 'DK2';
}

export interface Municipality {
  name: string;
  code: string;
  region: 'DK1' | 'DK2';
}

export interface PostalCode {
  code: string;
  municipality: string;
  region: 'DK1' | 'DK2';
}

export interface LocationData {
  postalCode: string;
  municipality: Municipality;
  gridProvider: GridProvider;
  region: 'DK1' | 'DK2';
}

export interface ConnectionPoint {
  ConnectionPointCode: string;
  ConnectionPointName: string;
  MunicipalityNo: string;
  Municipality: string;
  RegionName: string;
  ConnectionPointLatitude: number;
  ConnectionPointLongitude: number;
  NetCompanyName: string;
}

export interface GridCompany {
  code: string;
  name: string;
  gln?: string;
  municipalities: string[];
}