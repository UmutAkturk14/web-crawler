import { useState, useMemo } from "react";
import type { UrlReport } from "../types/url-report";
import UrlMobileCard from "./UrlMobileCard";
import UrlDesktopTable from "./UrlDesktopTable";

type Props = {
  urls: UrlReport[];
  allUrls: UrlReport[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onCrawl: (id: number) => void;
};

export default function UrlTable({
  urls,
  allUrls,
  selectedIds,
  onSelect,
  onSelectAll,
  onCrawl,
}: Props) {
  const [sortKey, setSortKey] = useState<keyof UrlReport | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof UrlReport) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedUrls = useMemo(() => {
    if (!sortKey) return [...urls];

    return [...urls].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === undefined || bVal === undefined) return 0;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [urls, sortKey, sortDirection]);

  return (
    <>
      <UrlDesktopTable
        urls={sortedUrls}
        allUrls={allUrls}
        selectedIds={selectedIds}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        onCrawl={onCrawl}
        onSort={handleSort}
      />

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {sortedUrls.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No results found.
          </div>
        ) : (
          sortedUrls.map((url) => (
            <UrlMobileCard
              key={url.ID}
              url={url}
              selected={selectedIds.includes(url.ID)}
              onSelect={() => onSelect(url.ID)}
              onCrawl={() => onCrawl(url.ID)}
            />
          ))
        )}
      </div>
    </>
  );
}
