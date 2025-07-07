import type { UrlReport } from "../types/UrlReport";

type Props = {
  allSelected: boolean;
  onSelectAll: () => void;
  sortKey: keyof UrlReport | null;
  sortDirection: "asc" | "desc";
  onSort: (key: keyof UrlReport) => void;
};

const columnConfig: { title: string; key: keyof UrlReport }[] = [
  { title: "ID", key: "ID" },
  { title: "Title", key: "title" },
  { title: "URL", key: "url" },
  { title: "Status", key: "status" },
  { title: "HTML", key: "html_version" },
  { title: "H1", key: "h1_count" },
  { title: "H2", key: "h2_count" },
  { title: "H3", key: "h3_count" },
  { title: "H4", key: "h4_count" },
  { title: "H5", key: "h5_count" },
  { title: "H6", key: "h6_count" },
  { title: "Internal", key: "internal_links" },
  { title: "External", key: "external_links" },
  { title: "Broken", key: "broken_links" },
  { title: "Login", key: "has_login_form" },
  { title: "Created", key: "created_at" },
];

export default function UrlTableHeader({
  allSelected,
  onSelectAll,
  sortKey,
  sortDirection,
  onSort,
}: Props) {
  return (
    <tr>
      <th className="px-4 py-3 whitespace-nowrap">
        <input type="checkbox" onChange={onSelectAll} checked={allSelected} />
      </th>
      {columnConfig.map(({ title, key }) => {
        const isSorted = sortKey === key;
        const arrow = isSorted ? (sortDirection === "asc" ? "↑" : "↓") : "";

        return (
          <th
            key={key}
            className="px-4 py-3 whitespace-nowrap cursor-pointer select-none"
            onClick={() => onSort(key)}
          >
            {title} {arrow}
          </th>
        );
      })}
      <th className="px4- py-3 whitespace-nowrap">Crawl</th>
    </tr>
  );
}
