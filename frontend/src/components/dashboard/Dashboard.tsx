import { useEffect, useState } from "react";
import axios from "axios";
import type { UrlReport } from "../../types/url-report";
import DashboardToolbar from "./DashboardToolbar";
import UrlTable from "../urls/UrlTable";
import PaginationControls from "./PaginationControls";
import { useCallback } from "react";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [urls, setUrls] = useState<UrlReport[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [runningCrawls, setRunningCrawls] = useState<
    Record<number, AbortController>
  >({});

  const fetchUrls = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log(`Bearer ${token}`);

      const response = await axios.get<{
        page: number;
        page_size: number;
        total_count: number;
        urls: UrlReport[];
      }>(`http://localhost:8080/urls?page=${page}&page_size=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }, [page, pageSize]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const triggerCrawlAndUpdate = async (id: number) => {
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
      const token = localStorage.getItem("authToken");

      const response = await axios.post<UrlReport>(
        `http://localhost:8080/crawl/${id}`,
        {},
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      const token = localStorage.getItem("authToken");

      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`http://localhost:8080/url/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
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
          onLogout={onLogout}
        />

        <UrlTable
          urls={filteredUrls}
          allUrls={urls}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onCrawl={triggerCrawlAndUpdate}
        />

        <PaginationControls
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
}
