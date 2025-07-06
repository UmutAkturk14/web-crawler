import { useState, useMemo } from "react";
import UrlTableHeader from "./UrlTableHeader";
import UrlTableRow from "./UrlTableRow";
import type { UrlReport } from "../types/UrlReport";

type Props = {
  urls: UrlReport[];
  allUrls: UrlReport[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export default function UrlTable({
  urls,
  allUrls,
  selectedIds,
  onSelect,
  onSelectAll,
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
    if (!sortKey) return urls;

    return [...urls].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

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
      {/* Desktop Table: hidden on small screens */}
      <div className="hidden sm:block w-full min-h-[80svh] overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-[1200px] text-sm">
          <thead className="bg-gray-100 text-left">
            <UrlTableHeader
              allSelected={
                selectedIds.length === allUrls.length && allUrls.length > 0
              }
              onSelectAll={onSelectAll}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </thead>
          <tbody>
            {sortedUrls.map((url) => (
              <UrlTableRow
                key={url.ID}
                url={url}
                selected={selectedIds.includes(url.ID)}
                onSelect={() => onSelect(url.ID)}
              />
            ))}
            {sortedUrls.length === 0 && (
              <tr>
                <td
                  colSpan={16}
                  className="text-center px-4 py-10 text-gray-500"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards: shown only on small screens */}
      <div className="sm:hidden space-y-4">
        {sortedUrls.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No results found.
          </div>
        )}

        {sortedUrls.map((url) => (
          <div
            key={url.ID}
            className={`p-4 border border-gray-200 rounded shadow bg-white ${
              selectedIds.includes(url.ID) ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => onSelect(url.ID)}
          >
            <div className="flex items-center justify-between mb-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(url.ID)}
                onChange={() => onSelect(url.ID)}
                className="mr-2"
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className="font-semibold truncate max-w-[70%]"
                title={url.url}
              >
                {url.url}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  url.status === "pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : url.status === "done"
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {url.status}
              </span>
            </div>
            {url.title && (
              <div
                className="text-gray-700 text-sm mb-1 truncate"
                title={url.title}
              >
                {url.title}
              </div>
            )}
            {/* Add a few more key details if you want */}
            <div className="text-xs text-gray-500 flex flex-wrap gap-2">
              <div>H1: {url.h1_count}</div>
              <div>Internal: {url.internal_links}</div>
              <div>Broken: {url.broken_links}</div>
              {/* Add more if needed */}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
