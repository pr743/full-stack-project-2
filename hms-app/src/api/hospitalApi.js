import API from "./axios";

export const addHospital = (hospitalData) => {
  return API.post("/hospitals", hospitalData);
};

export const fetchHospitalsByCity = (city) => {
  return API.get(`/hospitals?city=${city}`);
};
