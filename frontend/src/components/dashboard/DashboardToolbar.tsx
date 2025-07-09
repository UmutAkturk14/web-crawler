import { useState } from "react";
import axios from "axios";
import type { UrlReport } from "../../types/url-report";

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onDelete: () => void;
  onReanalyze: () => void;
  disabled: boolean;
  onUrlAdded: (newUrl: UrlReport) => void;
  onLogout: () => void;
};

export default function DashboardToolbar({
  searchTerm,
  setSearchTerm,
  onDelete,
  onReanalyze,
  disabled,
  onUrlAdded,
  onLogout,
}: Props) {
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;
    const token = localStorage.getItem("authToken");

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/urls`,
        {
          url: newUrl.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        }
      );

      const createdUrl: UrlReport = response.data;

      if (createdUrl) {
        onUrlAdded(createdUrl);
      }

      setNewUrl("");
    } catch (error) {
      console.error("Failed to add URL:", error);
      alert("Failed to add URL.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Search + Bulk buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 w-full">
        {/* Search Input */}
        <div className="w-full sm:w-auto flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search URL or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full shadow-sm"
          />
          {/* Add URL */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="url"
              placeholder="Enter new URL..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-96 shadow-sm"
            />
            <button
              onClick={handleAddUrl}
              disabled={!newUrl.trim() || isSubmitting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Button Group */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
          >
            Log out
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onReanalyze}
              disabled={disabled}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-1 sm:flex-none"
            >
              Re-analyze
            </button>
            <button
              onClick={onDelete}
              disabled={disabled}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-1 sm:flex-none"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
