"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAllJobsNoLimit } from "../api/jobsApi";
import { Job } from "../types/job";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import JobModal from "../components/JobModal";
import {
  FiBriefcase,
  FiFilter,
  FiWifiOff,
  FiAlertTriangle,
} from "react-icons/fi";

interface FetchError extends Error {
  name: string;
  message: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "network" | "server" | "unknown" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState({
    experience: "all",
    employmentType: "all", // Keep this to maintain compatibility with the Filters component
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  const jobsPerPage = 8;

  const loadJobs = useCallback(
    async (retry = false) => {
      try {
        if (!retry) {
          setLoading(true);
          setError(null);
          setErrorType(null);
        }

        console.log("Starting to fetch jobs...");
        const location = searchQuery.trim() !== "" ? searchQuery : undefined;
        const response = await fetchAllJobsNoLimit(location);
        console.log("Jobs fetched successfully:", response);

        // Sort by newest first by default
        const sortedJobs = [...response.data].sort(
          (a, b) =>
            new Date(b.postedDate || "").getTime() -
            new Date(a.postedDate || "").getTime()
        );

        setJobs(sortedJobs);
        applyFilters(sortedJobs);
        setRetryCount(0); // Reset retry count on success
      } catch (err: unknown) {
        console.error("Error loading jobs:", err);

        const error = err as FetchError;

        // More detailed error handling
        if (error.name === "AbortError") {
          setError("Request timed out. Please try again.");
          setErrorType("network");
        } else if (!navigator.onLine) {
          setError("You are offline. Please check your internet connection.");
          setErrorType("network");
        } else if (error.message?.includes("Failed to fetch")) {
          setError("Could not connect to the server. Please try again later.");
          setErrorType("network");
        } else if (error.message?.includes("HTTP error")) {
          setError("Server error. Please try again later.");
          setErrorType("server");
        } else {
          setError("An unexpected error occurred. Please try again.");
          setErrorType("unknown");
        }

        // Auto-retry logic for network errors
        if (
          (errorType === "network" || !errorType) &&
          retryCount < MAX_RETRIES
        ) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            loadJobs(true);
          }, 3000 * retryCount); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, retryCount, errorType]
  );

  const applyFilters = (jobsToFilter = jobs) => {
    let result = [...jobsToFilter];

    // Apply experience filter
    if (filterOptions.experience !== "all") {
      const [minExp, maxExp] = filterOptions.experience.split("-").map(Number);
      result = result.filter((job) => {
        const min = job.min_exp || 0;
        const max = job.max_exp || 100;
        return min >= minExp && (maxExp ? max <= maxExp : true);
      });
    }

    // We're not filtering by employment type anymore since all jobs are full-time
    // But we'll keep the interface compatibility

    setFilteredJobs(result);
    setTotalPages(Math.ceil(result.length / jobsPerPage));
  };

  useEffect(() => {
    loadJobs();
  }, [searchQuery, loadJobs]);

  useEffect(() => {
    applyFilters();
  }, [filterOptions]);

  // When jobs change, update the total pages
  useEffect(() => {
    setTotalPages(Math.ceil(filteredJobs.length / jobsPerPage));
  }, [filteredJobs, jobsPerPage]);

  // Check for online status
  useEffect(() => {
    const handleOnline = () => {
      if (error && errorType === "network") {
        loadJobs();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [error, errorType, loadJobs]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: typeof filterOptions) => {
    setFilterOptions(filters);
    setCurrentPage(1);
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleRetry = () => {
    loadJobs();
  };

  // Calculate current jobs to display based on pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Pagination controls
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiBriefcase className="text-blue-600 text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">JobHub</h1>
            </div>
            <button
              className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition font-semibold"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="mr-1.5" />
              Filters
            </button>
          </div>

          <div className="mt-4">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Filters
                onChange={handleFilterChange}
                currentFilters={filterOptions}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status area */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700">
            {loading
              ? "Finding jobs for you..."
              : `Showing ${
                  filteredJobs.length > 0 ? indexOfFirstJob + 1 : 0
                }-${Math.min(indexOfLastJob, filteredJobs.length)} of ${
                  filteredJobs.length
                } jobs`}
          </p>
        </div>

        {/* Error message with retry button */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              errorType === "network"
                ? "bg-blue-50 border-blue-100 text-blue-700"
                : errorType === "server"
                ? "bg-red-50 border-red-100 text-red-700"
                : "bg-yellow-50 border-yellow-100 text-yellow-700"
            } font-medium`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {errorType === "network" ? (
                  <FiWifiOff className="h-5 w-5 text-blue-500" />
                ) : (
                  <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p>{error}</p>
                {errorType === "network" && (
                  <p className="mt-1 text-sm">
                    Retry attempt {retryCount}/{MAX_RETRIES}
                  </p>
                )}
                <button
                  onClick={handleRetry}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                >
                  Retry Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job count summary */}
        {!loading && !error && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm font-medium">
            <strong>Total jobs loaded:</strong> {jobs.length} |{" "}
            <strong>After filters:</strong> {filteredJobs.length}
          </div>
        )}

        {/* Job cards grid - improved responsive layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 h-full flex flex-col"
              >
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-md bg-gray-200 animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-200 mr-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-200 mr-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-200 mr-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/5 animate-pulse"></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {currentJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onClick={() => openJobDetails(job)}
                />
              ))}
            </div>

            {/* Pagination - responsive adjustments */}
            {filteredJobs.length > jobsPerPage && (
              <div className="mt-10 flex justify-center overflow-x-auto py-2">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-2 sm:px-3 py-2 rounded-l-md text-xs sm:text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } border border-gray-300`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } border-t border-b border-gray-300`}
                  >
                    Prev
                  </button>

                  {/* Show a limited number of page buttons */}
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    // Calculate page number to show based on current page
                    let pageNum;
                    if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    // Ensure pageNum is within valid range
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={idx}
                          onClick={() => paginate(pageNum)}
                          className={`hidden sm:block px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border-t border-b border-gray-300 ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } border-t border-b border-gray-300`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-2 sm:px-3 py-2 rounded-r-md text-xs sm:text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } border border-gray-300`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}

            {/* Mobile pagination info */}
            <div className="sm:hidden mt-4 text-center text-sm text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FiBriefcase className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No jobs found
            </h3>
            <p className="text-gray-700 font-medium mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterOptions({ experience: "all", employmentType: "all" });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Job details modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
      />
    </main>
  );
}
