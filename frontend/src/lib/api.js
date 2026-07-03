import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const contactUs = (payload) => api.post("/contact", payload).then((r) => r.data);
export const requestBrochure = (payload) => api.post("/brochure-request", payload).then((r) => r.data);
export const getGlobal = () => api.get("/destinations/global").then((r) => r.data);
export const getDomestic = () => api.get("/destinations/domestic").then((r) => r.data);
export const getPackages = () => api.get("/packages").then((r) => r.data);
export const getPrograms = () => api.get("/training-programs").then((r) => r.data);
export const getGallery = () => api.get("/gallery").then((r) => r.data);
export const getBrochures = () => api.get("/brochures").then((r) => r.data);
export const brochureDownloadUrl = (id) => `${API}/brochures/${id}/download`;
export const getJourneyVideo = () => api.get("/journey-video").then((r) => r.data);
