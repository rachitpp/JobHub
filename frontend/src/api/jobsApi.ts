import axios from "axios";
import { JobsResponse } from "../types/job";

const API_URL = "https://jobhub-7scy.onrender.com/api";

interface FetchJobsParams {
  page?: number;
  limit?: number | string;
  location?: string;
}

export const fetchJobs = async (
  params: FetchJobsParams = {}
): Promise<JobsResponse> => {
  try {
    console.log("Fetching jobs from:", `${API_URL}/jobs`);
    const response = await axios.get<JobsResponse>(`${API_URL}/jobs`, {
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
