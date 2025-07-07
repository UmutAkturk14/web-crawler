import { useState } from "react";
import type { UrlReport } from "../types/url-report";
import { statusStyles } from "../helpers/statusStyle";
import UrlDetailsModal from "./UrlDetailsModal";

type Props = {
  url: UrlReport;
  selected: boolean;
  onSelect: () => void;
  onCrawl: () => void;
};

export default function UrlMobileCard({
  url,
  selected,
  onSelect,
  onCrawl,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const status = url.status as keyof typeof statusStyles;
  const buttonColor = statusStyles[status]?.buttonColor ?? "";
  const buttonText = statusStyles[status]?.buttonText ?? "Retry";

  const handleCardClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <div
        className={`p-4 border border-gray-200 rounded shadow bg-white ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between mb-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mr-2"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="font-semibold truncate max-w-[70%]" title={url.url}>
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

        <div className="text-xs text-gray-500 flex flex-wrap gap-2">
          <div>H1: {url.h1_count}</div>
          <div>H2: {url.h2_count}</div>
          <div>H3: {url.h3_count}</div>
          <div>H4: {url.h4_count}</div>
          <div>H5: {url.h5_count}</div>
          <div>H6: {url.h6_count}</div>
          <div>Internal: {url.internal_links}</div>
          <div>Broken: {url.broken_links}</div>
          <div>
            <button
              className={`px-3 py-2 rounded-2xl border transition-colors ${buttonColor}`}
              onClick={(e) => {
                e.stopPropagation();
                onCrawl();
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <UrlDetailsModal urlId={url.ID} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
