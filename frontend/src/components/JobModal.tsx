import { Job } from "../types/job";
import {
  FiX,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiCalendar,
  FiExternalLink,
} from "react-icons/fi";
import { useEffect } from "react";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, job }) => {
  // Add body class to prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  // Format posted date
  const formatDate = (dateString?: string | { $date?: string }) => {
    if (!dateString) return "Recently posted";

    try {
      // First try to parse ISO date string (e.g. "2023-05-15T00:00:00Z")
      let date: Date;

      if (
        typeof dateString === "object" &&
        dateString !== null &&
        "$date" in dateString
      ) {
        // Handle MongoDB date format
        date = new Date(dateString.$date as string);
      } else if (typeof dateString === "string") {
        // Handle regular date string
        date = new Date(dateString);
      } else {
        return "Recently posted";
      }

      // If we have an invalid date
      if (isNaN(date.getTime())) {
        return "Recently posted";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return "Recently posted";
    }
  };

  // Get company logo or default
  const companyLogo =
    job.companyImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      job.company || "Company"
    )}&background=random&color=fff&size=150`;

  // Experience text formatter
  const experienceText = () => {
    const minExp = job.min_exp;
    const maxExp = job.max_exp;

    if (minExp !== undefined && maxExp !== undefined) {
      if (minExp === maxExp) return `${minExp} years`;
      return `${minExp}-${maxExp} years`;
    }
    if (minExp !== undefined) return `${minExp}+ years`;
    if (maxExp !== undefined) return `Up to ${maxExp} years`;
    return job.experience || "Not specified";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-gray-800/70 flex items-center justify-center p-4 transition-all duration-300">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 animate-modalFadeIn"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 z-10"
          aria-label="Close"
        >
          <FiX size={24} />
        </button>

        <div className="p-4 md:p-6">
          {/* Company info & header */}
          <div className="flex items-start mb-6">
            <div className="mr-4 flex-shrink-0">
              <img
                src={companyLogo}
                alt={job.company || "Company"}
                className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover bg-gray-100"
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    job.company || "Company"
                  )}&background=random&color=fff&size=150`;
                }}
              />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                {job.title || "Untitled Position"}
              </h2>
              <p className="text-sm md:text-base font-semibold text-gray-800">
                {job.company || "Unknown Company"}
              </p>
            </div>
          </div>

          {/* Job details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
            {job.location && (
              <div className="flex items-center text-sm font-medium text-gray-700">
                <FiMapPin className="mr-2 text-gray-500" />
                <span>{job.location}</span>
              </div>
            )}

            <div className="flex items-center text-sm font-medium text-gray-700">
              <FiBriefcase className="mr-2 text-gray-500" />
              <span>
                {job.employmentType || job.employment_type || "Full-time"}
              </span>
            </div>

            <div className="flex items-center text-sm font-medium text-gray-700">
              <FiClock className="mr-2 text-gray-500" />
              <span>Experience: {experienceText()}</span>
            </div>

            <div className="flex items-center text-sm font-medium text-gray-700">
              <FiCalendar className="mr-2 text-gray-500" />
              <span>
                Posted:{" "}
                {formatDate(job.postedDate || job.postedDateTime?.$date)}
              </span>
            </div>
          </div>

          {/* Apply button */}
          <div className="flex justify-center mt-6">
            <a
              href={job.job_link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center px-6 py-3 text-white font-bold rounded-lg transition-colors ${
                job.job_link
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={(e) => {
                if (!job.job_link) {
                  e.preventDefault();
                }
              }}
            >
              <FiExternalLink className="mr-2" />
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
