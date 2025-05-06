import { Job } from "../types/job";
import { FiMapPin, FiBriefcase, FiClock } from "react-icons/fi";

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  // Format posted date to relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "Recently";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
    return `${Math.floor(diffInDays / 365)} year(s) ago`;
  };

  // Get company logo or default
  const companyLogo =
    job.companyImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      job.company || "Company"
    )}&background=random&color=fff`;

  // Get employment type in user-friendly format
  const employmentType =
    job.employmentType || job.employment_type || "Full-time";

  // Get experience range in user-friendly format
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
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="flex items-start mb-3">
        <div className="flex-shrink-0 mr-3">
          <img
            src={companyLogo}
            alt={job.company || "Company"}
            className="w-10 h-10 rounded-md object-cover bg-gray-100"
            onError={(e) => {
              (
                e.target as HTMLImageElement
              ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                job.company || "Company"
              )}&background=random&color=fff`;
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 text-sm sm:text-base">
            {job.title || "Untitled Position"}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-1">
            {job.company || "Unknown Company"}
          </p>
        </div>
      </div>

      <div className="space-y-2 mt-auto">
        {job.location && (
          <div className="flex items-center text-xs font-medium text-gray-700">
            <FiMapPin className="mr-1.5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}

        <div className="flex items-center text-xs font-medium text-gray-700">
          <FiBriefcase className="mr-1.5 text-gray-500 flex-shrink-0" />
          <span>{employmentType}</span>
        </div>

        <div className="flex items-center text-xs font-medium text-gray-700">
          <FiClock className="mr-1.5 text-gray-500 flex-shrink-0" />
          <span>{experienceText()}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-blue-700">
          {getRelativeTime(job.postedDate)}
        </span>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full">
          View Details
        </span>
      </div>
    </div>
  );
};

export default JobCard;
