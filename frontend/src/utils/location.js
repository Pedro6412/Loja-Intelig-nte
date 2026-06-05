export const LOCATION_STORAGE_KEY = 'lojaInteligente:userLocation';
export const LOCATION_UPDATED_EVENT = 'lojaInteligente:locationUpdated';

const pickFirstText = (...values) =>
  values.find((value) => typeof value === 'string' && value.trim())?.trim() || null;

const buildReadableLocation = (location) => {
  const parts = [location.regiao || location.bairro, location.cidade, location.estado].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

export const buildLocationLabel = ({ latitude, longitude, accuracy, regiao, bairro, cidade, estado }) => {
  const readableLocation = buildReadableLocation({ regiao, bairro, cidade, estado });
  if (readableLocation) return readableLocation;

  const lat = Number(latitude).toFixed(6);
  const lng = Number(longitude).toFixed(6);
  const accuracyText = Number.isFinite(Number(accuracy))
    ? `, precisao aprox. ${Math.round(Number(accuracy))}m`
    : '';

  return `Localizacao atual: ${lat}, ${lng}${accuracyText}`;
};

export const reverseGeocodeCoordinates = async ({ latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'pt-BR');

    const response = await fetch(url);
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
      address.county,
      cidade
    );

    return {
      cidade,
      bairro,
      regiao,
      estado: pickFirstText(address.state_code, address.state),
      cep: pickFirstText(address.postcode),
      endereco_formatado: pickFirstText(data.display_name)
    };
  } catch {
    return null;
  }
};

export const readStoredLocation = () => {
  try {
    const rawLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    return rawLocation ? JSON.parse(rawLocation) : null;
  } catch {
    return null;
  }
};

export const saveStoredLocation = (coords) => {
  const location = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    label: buildLocationLabel(coords),
    capturedAt: new Date().toISOString()
  };

  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT, { detail: location }));

  reverseGeocodeCoordinates(location).then((geocodedLocation) => {
    if (!geocodedLocation) return;
    const enrichedLocation = {
      ...location,
      ...geocodedLocation,
      label: buildLocationLabel({ ...location, ...geocodedLocation })
    };

    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(enrichedLocation));
    window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT, { detail: enrichedLocation }));
  });

  return location;
};
