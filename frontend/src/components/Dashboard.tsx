import { useEffect, useState } from "react";
import axios from "axios";
import type { UrlReport } from "../types/UrlReport";
import DashboardToolbar from "./DashboardToolbar";
import UrlTable from "./UrlTable";

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlReport[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get<UrlReport[]>(
        "http://localhost:8080/urls"
      );
      const data = response.data;
      setUrls(data);

      // Trigger crawling for any URL still pending
      data
        .filter((url) => url.status === "pending")
        .forEach((url) => {
          triggerCrawlAndUpdate(url.ID);
        });
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
    }
  };

  const triggerCrawlAndUpdate = async (id: number) => {
    try {
      const crawlResponse = await axios.post<UrlReport>(
        `http://localhost:8080/crawl/${id}`
      );

      const updatedUrl = crawlResponse.data;

      // Update only the relevant URL in state
      setUrls((prev) =>
        prev.map((url) => (url.ID === updatedUrl.ID ? updatedUrl : url))
      );
    } catch (err) {
      console.error(`Failed to crawl URL with ID ${id}:`, err);
    }
  };

  const handleSelect = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === urls.length ? [] : urls.map((u) => u.ID)
    );

  const handleBulkDelete = () => {
    alert(`Delete request sent for IDs: ${selectedIds.join(", ")}`);
  };

  const handleBulkReanalyze = () => {
    alert(`Re-analyze request sent for IDs: ${selectedIds.join(", ")}`);
  };

  const filteredUrls = urls.filter(
    (url) =>
      url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-xxl mx-auto">
        <DashboardToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onDelete={handleBulkDelete}
          onReanalyze={handleBulkReanalyze}
          disabled={selectedIds.length === 0}
          onUrlAdded={fetchUrls}
        />

        <UrlTable
          urls={filteredUrls}
          allUrls={urls}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
        />
      </div>
    </div>
  );
}
