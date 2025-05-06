import axios from "axios";
import { JobsResponse } from "../types/job";

// Use environment variable with fallback
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://jobhub-7scy.onrender.com";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Changed to false since we're not using cookies
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status);
    return response;
  },
  (error) => {
    console.error("Response error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });
    return Promise.reject(error);
  }
);

interface FetchJobsParams {
  page?: number;
  limit?: number | string;
  location?: string;
}

export const fetchJobs = async (
  params: FetchJobsParams = {}
): Promise<JobsResponse> => {
  try {
    console.log("Fetching jobs from:", `${API_URL}/api/jobs`);
    const response = await api.get<JobsResponse>("/api/jobs", {
      params,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching jobs:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        params: error.config?.params,
      });
    } else {
      console.error("Error fetching jobs:", error);
    }
    throw error;
  }
};

// Kept for backward compatibility
export const fetchAllJobs = async (): Promise<JobsResponse> => {
  return fetchJobs({ limit: 20, page: 1 });
};

// Kept for backward compatibility
export const fetchJobsByLocation = async (
  location: string
): Promise<JobsResponse> => {
  return fetchJobs({ location, limit: 20, page: 1 });
};

// Fetch all jobs (10,000) at once without pagination
export const fetchAllJobsNoLimit = async (
  location?: string
): Promise<JobsResponse> => {
  return fetchJobs({ location, limit: "all" });
};
