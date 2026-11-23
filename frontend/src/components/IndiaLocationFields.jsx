import { useId } from 'react';
import { State, City } from 'india-state-city';

const states = State.getAllStates();

export default function IndiaLocationFields({ state, city, onChange, required = false }) {
  const id = useId();
  const selectedState = states.find(option => option.name === state);
  const stateValue = selectedState?.isoCode ?? state;
  const cities = selectedState
    ? [...new Set(City.getCitiesOfState(selectedState.isoCode).map(option => option.name))]
    : [];

  return (
    <>
      <label htmlFor={`${id}-state`}>State</label>
      <select id={`${id}-state`} value={stateValue} required={required}
        onChange={event => {
          const nextState = State.getStateByCode(event.target.value);
          onChange({ state: nextState?.name || '', city: '' });
        }}>
        <option value="">Select a state</option>
        {state && !selectedState && <option value={state}>{state} (saved)</option>}
        {states.map(option => <option key={option.isoCode} value={option.isoCode}>{option.name}</option>)}
      </select>
      <label htmlFor={`${id}-city`}>City</label>
      <select id={`${id}-city`} value={city} disabled={!selectedState} required={required}
        onChange={event => onChange({ state, city: event.target.value })}>
        <option value="">Select a city</option>
        {city && !cities.includes(city) && <option value={city}>{city} (saved)</option>}
        {cities.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
    </>
  );
}
