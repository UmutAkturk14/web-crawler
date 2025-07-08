import UrlTableHeader from "./UrlTableHeader";
import UrlTableRow from "./UrlTableRow";
import type { UrlReport } from "../../types/url-report";

type Props = {
  urls: UrlReport[];
  allUrls: UrlReport[];
  selectedIds: number[];
  sortKey: keyof UrlReport | null;
  sortDirection: "asc" | "desc";
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  onCrawl: (id: number) => void;
  onSort: (key: keyof UrlReport) => void;
};

export default function UrlDesktopTable({
  urls,
  allUrls,
  selectedIds,
  sortKey,
  sortDirection,
  onSelect,
  onSelectAll,
  onCrawl,
  onSort,
}: Props) {
  return (
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
            onSort={onSort}
          />
        </thead>
        <tbody>
          {urls.length > 0 ? (
            urls.map((url) => (
              <UrlTableRow
                key={url.ID}
                url={url}
                selected={selectedIds.includes(url.ID)}
                onSelect={() => onSelect(url.ID)}
                onCrawl={() => onCrawl(url.ID)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={16} className="text-center px-4 py-10 text-gray-500">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
