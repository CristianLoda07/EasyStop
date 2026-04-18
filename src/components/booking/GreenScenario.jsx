import { useState } from 'react';

export default function GreenScenario() {
  const [fuelType, setFuelType] = useState('benzina');
  const [km, setKm] = useState(10);

  // Tabella g CO2/km dal tuo documento di progetto
  const emissionsMap = {
    benzina: 120,
    diesel: 110,
    gpl: 95,
    metano: 80,
    ibrida: 60,
    elettrica: 0,
  };

  const calculateSavings = () => {
    const baseEmissions = 120; // Riferimento standard (benzina)
    const currentEmissions = emissionsMap[fuelType];
    const savingGrams = (baseEmissions - currentEmissions) * km;
    return savingGrams;
  };

  const savings = calculateSavings();

  return (
    <div className="card bg-base-100 shadow-xl border border-success/30">
      <div className="card-body">
        <h3 className="card-title text-success">
          🌿 Stima "Green Scenario"
        </h3>
        <p className="text-sm text-base-content/70 mb-4">
          Calcola la CO₂ risparmiata rispetto a un'auto a benzina.
        </p>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Alimentazione Veicolo</span>
          </label>
          <select 
            className="select select-bordered w-full"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
          >
            <option value="benzina">Benzina</option>
            <option value="diesel">Diesel</option>
            <option value="gpl">GPL</option>
            <option value="metano">Metano</option>
            <option value="ibrida">Ibrida</option>
            <option value="elettrica">Elettrica</option>
          </select>
        </div>

        <div className="form-control w-full mt-2">
          <label className="label">
            <span className="label-text">Km stimati andata/ritorno</span>
          </label>
          <input 
            type="number" 
            min="1"
            className="input input-bordered w-full" 
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
          />
        </div>

        <div className="mt-6 p-4 rounded-lg bg-success/10 text-center">
          <div className="text-sm">Risparmio stimato di CO₂:</div>
          <div className="text-3xl font-bold text-success mt-1">
            {savings > 0 ? `${savings} g` : '0 g'}
          </div>
          {savings > 0 && (
            <div className="text-xs text-success mt-2">
              Equivale all'assorbimento di circa {(savings / 20000).toFixed(3)} alberi in un anno!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}