"use client";

import { useState, useEffect } from "react";
import { fetchJobs } from "../api/jobsApi";
import { Job } from "../types/job";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const loadJobs = async (page: number = 1, location: string = "") => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading jobs:", { page, location });

      const response = await fetchJobs({
        page,
        limit: 20,
        location,
      });

      console.log("Jobs response:", response);
      setJobs(response.data);
      setTotalPages(Math.ceil(response.total / 20));
      setTotalJobs(response.total);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(currentPage, searchLocation);
  }, [currentPage, searchLocation]);

  const handleSearch = (location: string) => {
    setSearchLocation(location);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJobClick = (job: Job) => {
    if (job.job_link) {
      window.open(job.job_link, "_blank", "noopener,noreferrer");
    }
  };

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => loadJobs(currentPage, searchLocation)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600">
            Search through thousands of job listings
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="mt-8">
              <p className="text-gray-600 mb-4">
                Showing {jobs.length} of {totalJobs} jobs
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClick={() => handleJobClick(job)}
                  />
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
