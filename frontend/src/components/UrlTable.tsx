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
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-[1200px] text-sm">
        <thead className="bg-gray-100 text-left">
          <UrlTableHeader
            allSelected={
              selectedIds.length === allUrls.length && allUrls.length > 0
            }
            onSelectAll={onSelectAll}
          />
        </thead>
        <tbody>
          {urls.map((url) => (
            <UrlTableRow
              key={url.ID}
              url={url}
              selected={selectedIds.includes(url.ID)}
              onSelect={() => onSelect(url.ID)}
            />
          ))}
          {urls.length === 0 && (
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
