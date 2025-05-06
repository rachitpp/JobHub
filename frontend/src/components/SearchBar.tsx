import { useState } from "react";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = "",
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow transition">
        <div className="pl-3 md:pl-4 pr-2 md:pr-3 text-gray-500">
          <FiSearch size={18} />
        </div>
        <input
          type="text"
          placeholder="Search jobs by location (e.g., New York, Remote)"
          className="w-full py-2 md:py-3 px-0 text-gray-800 text-sm font-medium focus:outline-none placeholder-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 md:px-5 py-2 md:py-3 text-sm font-semibold hover:bg-blue-700 transition h-full"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
