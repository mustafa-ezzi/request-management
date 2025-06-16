import axios from "axios";

// let BASE_URL = "http://127.0.0.1:8000/api";
let BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://rms-v2.duckdns.org/api" 
  : "http://127.0.0.1:8000/api";  // Use 127.0.0.1 instead of localhost


if (process.env.NODE_ENV === "production") {
  console.log("Running in Production Mode");
  BASE_URL = "https://rms-v2.duckdns.org/api";
} else {
  // BASE_URL = "http://localhost:8000/api/v1";
  console.log("Running in Development Mode");
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // await logErrorToBackend(error);
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const get = async (url, params) => {
  return axiosInstance.get(url, { params }).then((res) => res.data);
};

export const post = async (url, data) => {
  return axiosInstance.post(url, data).then((res) => res.data);
};

export const put = async (url, data) => {
  return axiosInstance.put(url, data).then((res) => res.data);
};

export const patch = async (url, data) => {
  return axiosInstance.patch(url, data).then((res) => res.data);
};

export const _delete = async (url) => {
  return axiosInstance.delete(url).then((res) => res.data);
};

export const downloadBlob = async (url, filename) => {
  try {
    const response = await axiosInstance.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
    throw err;
  }
};

export const uploadFormData = async (url, formData) => {
  try {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    console.error("File upload failed:", err);
    throw err;
  }
};

export default axiosInstance;
