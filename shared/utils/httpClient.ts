import axios, { AxiosInstance } from "axios";

export const httpClient: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log requests
httpClient.interceptors.request.use((config) => {
  return config;
});

// Log responses
httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);