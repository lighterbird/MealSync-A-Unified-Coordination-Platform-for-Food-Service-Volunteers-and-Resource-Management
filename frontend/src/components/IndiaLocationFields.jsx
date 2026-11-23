import { State, City } from 'india-state-city';

const states = State.getAllStates();

export default function IndiaLocationFields({ state, city, onChange, required = false }) {
  const selectedState = states.find(option => option.name === state);
  const stateValue = selectedState?.isoCode ?? state;
  const cities = selectedState
    ? [...new Set(City.getCitiesOfState(selectedState.isoCode).map(option => option.name))]
    : [];

  return (
    <div className="form-fields">
      <label className="form-field">State
        <select value={stateValue} required={required}
          onChange={event => {
            const nextState = State.getStateByCode(event.target.value);
            onChange({ state: nextState?.name || '', city: '' });
          }}>
          <option value="">Select a state</option>
          {state && !selectedState && <option value={state}>{state} (saved)</option>}
          {states.map(option => <option key={option.isoCode} value={option.isoCode}>{option.name}</option>)}
        </select>
      </label>
      <label className="form-field">City
        <select value={city} disabled={!selectedState} required={required}
          onChange={event => onChange({ state, city: event.target.value })}>
          <option value="">Select a city</option>
          {city && !cities.includes(city) && <option value={city}>{city} (saved)</option>}
          {cities.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
    </div>
  );
}
