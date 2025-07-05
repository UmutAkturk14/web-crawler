import type { UrlReport } from "../types/UrlReport";

type Props = {
  url: UrlReport;
  selected: boolean;
  onSelect: () => void;
};

export default function UrlTableRow({ url, selected, onSelect }: Props) {
  return (
    <tr
      className={`hover:bg-blue-50 transition cursor-default ${
        url.status === "pending" ? "bg-red-500" : ""
      }`}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-4 py-3">{url.ID}</td>
      <td className="px-4 py-3 font-medium">{url.title}</td>
      <td className="px-4 py-3 text-blue-600 underline">
        <a
          href={url.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {url.url}
        </a>
      </td>
      <td className="px-4 py-3">{url.status}</td>
      <td className="px-4 py-3">{url.html_version}</td>
      <td className="px-4 py-3">{url.h1_count}</td>
      <td className="px-4 py-3">{url.h2_count}</td>
      <td className="px-4 py-3">{url.h3_count}</td>
      <td className="px-4 py-3">{url.h4_count}</td>
      <td className="px-4 py-3">{url.h5_count}</td>
      <td className="px-4 py-3">{url.h6_count}</td>
      <td className="px-4 py-3">{url.internal_links}</td>
      <td className="px-4 py-3">{url.external_links}</td>
      <td className="px-4 py-3 text-red-600">{url.broken_links}</td>
      <td className="px-4 py-3">{url.has_login_form ? "Yes" : "No"}</td>
      <td className="px-4 py-3">
        {new Date(url.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
}
