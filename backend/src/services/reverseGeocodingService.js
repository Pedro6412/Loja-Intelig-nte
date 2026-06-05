const DEFAULT_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const STATE_ABBREVIATIONS = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapa: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceara: 'CE',
  'Distrito Federal': 'DF',
  'Espirito Santo': 'ES',
  Goias: 'GO',
  Maranhao: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Para: 'PA',
  Paraiba: 'PB',
  Parana: 'PR',
  Pernambuco: 'PE',
  Piaui: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondonia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'Sao Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO'
};

const pickFirstText = (...values) =>
  values.find((value) => typeof value === 'string' && value.trim())?.trim() || null;

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeState = (address = {}) => {
  const stateCode = pickFirstText(address.state_code, address.stateCode);
  if (stateCode) return stateCode.toUpperCase();

  const state = pickFirstText(address.state);
  if (!state) return null;

  return STATE_ABBREVIATIONS[normalizeText(state)] || state;
};

const toCoordinate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const reverseGeocodingService = {
  resolve: async ({ latitude, longitude }) => {
    const lat = toCoordinate(latitude);
    const lon = toCoordinate(longitude);
    if (lat === null || lon === null) return null;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Number(process.env.REVERSE_GEOCODING_TIMEOUT_MS || 8000)
    );

    try {
      const url = new URL(process.env.REVERSE_GEOCODING_URL || DEFAULT_REVERSE_URL);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('accept-language', 'pt-BR');

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': process.env.REVERSE_GEOCODING_USER_AGENT || 'LojaInteligente/1.0'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      const address = data.address || {};
      const bairro = pickFirstText(
        address.suburb,
        address.neighbourhood,
        address.quarter,
        address.city_district,
        address.residential
      );
      const cidade = pickFirstText(address.city, address.town, address.village, address.municipality, address.county);
      const regiao = pickFirstText(
        address.city_district,
        address.suburb,
        address.neighbourhood,
        address.quarter,
        address.administrative,
        address.county,
        cidade
      );

      return {
        latitude: lat,
        longitude: lon,
        cidade,
        bairro,
        regiao,
        estado: normalizeState(address),
        cep: pickFirstText(address.postcode),
        enderecoFormatado: pickFirstText(data.display_name)
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
};
