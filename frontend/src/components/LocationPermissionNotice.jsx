import { useEffect, useState } from 'react';
import { AlertTriangle, LocateFixed, MapPin } from 'lucide-react';
import { readStoredLocation, saveStoredLocation } from '../utils/location';

const getInitialStatus = () => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return 'unsupported';
  return readStoredLocation() ? 'granted' : 'requesting';
};

const LocationPermissionNotice = () => {
  const [status, setStatus] = useState(getInitialStatus);
  const [location, setLocation] = useState(() => readStoredLocation());

  useEffect(() => {
    if (status !== 'requesting' || !navigator.geolocation) return undefined;

    const requestId = window.setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(saveStoredLocation(position.coords));
          setStatus('granted');
        },
        () => setStatus('denied'),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
      );
    }, 500);

    return () => window.clearTimeout(requestId);
  }, [status]);

  if (status === 'granted' && location) {
    return (
      <div className="fixed top-[74px] left-0 right-0 md:left-44 z-20 border-b border-emerald-200 bg-emerald-50 px-4 md:px-5 py-2 text-sm text-emerald-900">
        <div className="flex flex-wrap items-center gap-2">
          <MapPin size={16} className="text-emerald-700" />
          <span>Localizacao ativa para preencher automaticamente o local das vendas.</span>
          <span className="text-emerald-700">{location.label}</span>
        </div>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="fixed top-[74px] left-0 right-0 md:left-44 z-20 border-b border-amber-200 bg-amber-50 px-4 md:px-5 py-2 text-sm text-amber-900">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>Este navegador nao permite capturar localizacao automaticamente.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[74px] left-0 right-0 md:left-44 z-20 border-b border-blue-200 bg-blue-50 px-4 md:px-5 py-2 text-sm text-blue-950">
      <div className="flex flex-wrap items-center gap-2">
        <LocateFixed size={16} className="text-[#1b97e6]" />
        <span>
          Permita o acesso a localizacao para registrar automaticamente onde cada compra foi feita.
        </span>
        {status === 'denied' && (
          <button
            type="button"
            onClick={() => setStatus('requesting')}
            className="h-7 rounded-md border border-blue-300 bg-white px-3 font-semibold text-blue-800 hover:bg-blue-100"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationPermissionNotice;
