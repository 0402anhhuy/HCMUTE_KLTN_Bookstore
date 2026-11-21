import axios from "axios";

const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    return url.endsWith("/api/v1") ? url : `${url.replace(/\/$/, "")}/api/v1`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("rememberMe");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("rememberMe");
            // Redirect to login if user session is expired
            window.dispatchEvent(new Event("auth-expired"));
        }
        return Promise.reject(error);
    },
);

export default api;
