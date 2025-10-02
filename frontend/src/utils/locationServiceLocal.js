import dataset from "../data/location.json"; // save the JSON above as location.json

const locationServiceLocal = {
  getCountries: async () => dataset.countries,
  getStates: async (countryId) =>
    dataset.states.filter((s) => s.country_id === Number(countryId)),
  getCities: async (stateId) =>
    dataset.cities.filter((c) => c.state_id === Number(stateId)),
};

export default locationServiceLocal;
