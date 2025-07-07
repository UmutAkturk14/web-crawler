import { useEffect, useState } from "react";
import axios from "axios";
import type { UrlReport } from "../types/UrlReport";
import DashboardToolbar from "./DashboardToolbar";
import UrlTable from "./UrlTable";

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlReport[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [runningCrawls, setRunningCrawls] = useState<
    Record<number, AbortController>
  >({});

  useEffect(() => {
    fetchUrls();
  }, [page, pageSize]);

  const fetchUrls = async () => {
    try {
      const response = await axios.get<{
        page: number;
        page_size: number;
        total_count: number;
        urls: UrlReport[];
      }>(`http://localhost:8080/urls?page=${page}&page_size=${pageSize}`);

      const data = response.data.urls;
      setUrls(data);

      setTotalPages(
        response.data.page_size > 0
          ? Math.ceil(response.data.total_count / pageSize)
          : 1
      );
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
    }
  };

  const triggerCrawlAndUpdate = async (id: number) => {
    // If already running, cancel instead
    if (runningCrawls[id]) {
      runningCrawls[id].abort();
      setRunningCrawls((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setStatus(id, "pending");
      return;
    }

    const controller = new AbortController();
    setRunningCrawls((prev) => ({ ...prev, [id]: controller }));
    setStatus(id, "running");

    try {
      const response = await axios.post<UrlReport>(
        `http://localhost:8080/crawl/${id}`,
        {},
        { signal: controller.signal }
      );

      const updatedUrl = response.data;

      setUrls((prev) =>
        prev.map((url) => (url.ID === updatedUrl.ID ? updatedUrl : url))
      );
      setStatus(id, updatedUrl.status || "completed");
    } catch (err) {
      if (
        axios.isCancel(err) ||
        (typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name?: string }).name === "CanceledError") ||
        (typeof err === "object" &&
          err !== null &&
          "message" in err &&
          (err as { message?: string }).message === "canceled")
      ) {
        console.warn(`Crawl for ID ${id} was cancelled`);
        setStatus(id, "pending");
      } else {
        console.error(`Crawl failed for ID ${id}:`, err);
        setStatus(id, "error");
      }
    } finally {
      setRunningCrawls((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} URL(s)?`
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedIds.map((id) => axios.delete(`http://localhost:8080/url/${id}`))
      );
      await fetchUrls(); // refresh the list after deletion
      setSelectedIds([]); // clear selection
    } catch (error) {
      console.error("Failed to delete URLs:", error);
      alert("Failed to delete one or more URLs.");
    }
  };

  const handleBulkReanalyze = async () => {
    selectedIds.forEach((id) => {
      setStatus(id, "queued");
      triggerCrawlAndUpdate(id);
    });
    setSelectedIds([]);
  };

  const setStatus = (id: number, status: UrlReport["status"]) => {
    setUrls((prev) =>
      prev.map((url) => (url.ID === id ? { ...url, status } : url))
    );
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
          onCrawl={triggerCrawlAndUpdate} // pass it down
        />

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 space-x-4">
          <div>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="mx-2">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="font-medium">
              Items per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
