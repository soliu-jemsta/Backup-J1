const BASE_URL = "http://127.0.0.1:8000/api";

export const api = {
    getLandlords:  () => fetch(`${BASE_URL}/landlords/`).then(r => r.json()),
    getTenants:    () => fetch(`${BASE_URL}/tenants/`).then(r => r.json()),
    getProperties: () => fetch(`${BASE_URL}/properties/`).then(r => r.json()),
};