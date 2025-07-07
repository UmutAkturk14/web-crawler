import { useState } from "react";
import type { UrlReport } from "../types/UrlReport";
import { statusStyles } from "../helpers/statusStyle";
import UrlDetailsModal from "./UrlDetailsModal";

type Props = {
  url: UrlReport;
  selected: boolean;
  onSelect: () => void;
  onCrawl: () => void;
};

export default function UrlTableRow({
  url,
  selected,
  onSelect,
  onCrawl,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const handleEntryCrawl = () => {
    console.log("Crawl started for URL ID:", url.ID);
    onCrawl();
  };

  const handlePopUp = () => {
    setShowModal(true);
  };

  const currentStatus = statusStyles[
    url.status as keyof typeof statusStyles
  ] ?? {
    buttonColor: "",
    bgColor: "bg-red-100",
    buttonText: "Retry",
  };

  const { buttonColor, bgColor, buttonText } = currentStatus;

  return (
    <>
      <tr
        className={`transition cursor-default ${bgColor}`}
        onClick={handlePopUp}
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
        <td className="px-4 py-3 max-w-xs truncate text-blue-600 underline">
          <a
            href={url.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block truncate"
            title={url.url}
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
        <td
          className="pr-4 py-3"
          onClick={(e) => {
            e.stopPropagation();
            handleEntryCrawl();
          }}
        >
          <button
            className={`px-3 py-2 rounded-2xl border-1 transition-colors ${buttonColor}`}
          >
            {buttonText}
          </button>
        </td>
      </tr>

      {showModal && (
        <UrlDetailsModal urlId={url.ID} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
