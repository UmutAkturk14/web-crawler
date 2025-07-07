// components/UrlDetailsModal.tsx

import { useEffect, useState } from "react";
import type { UrlReport } from "../types/UrlReport";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  urlId: number;
  onClose: () => void;
};

export default function UrlDetailsModal({ urlId, onClose }: Props) {
  const [data, setData] = useState<UrlReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrlDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8080/url/${urlId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to load URL details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrlDetails();
  }, [urlId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg text-lg">
          Loading...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = {
    labels: ["Internal Links", "External Links"],
    datasets: [
      {
        label: "Links Distribution",
        data: [data.internal_links, data.external_links],
        backgroundColor: ["#3b82f6", "#ef4444"], // blue and red
        hoverBackgroundColor: ["#2563eb", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white w-full max-w-5xl p-8 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl font-bold"
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold mb-6 border-b pb-2">
          URL Details (ID: {data.ID})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Internal vs External Links
            </h3>
            <Doughnut data={chartData} />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Broken Links ({data.broken_links})
            </h3>
            {data.broken_links_list && data.broken_links_list.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto border rounded-md p-4 bg-gray-50 shadow-inner">
                {data.broken_links_list.map(({ url, status_code }, idx) => (
                  <li
                    key={idx}
                    className="mb-2 last:mb-0 break-words"
                    title={url}
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {url}
                    </a>{" "}
                    —{" "}
                    <span
                      className={`font-semibold ${
                        status_code >= 400 ? "text-red-600" : "text-yellow-600"
                      }`}
                    >
                      {status_code}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No broken links detected.</p>
            )}
          </div>
        </div>

        {/* Rest of the details */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <Section title="Title" content={data.title} />
          <Section
            title="URL"
            content={
              <a
                href={data.url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.url}
              </a>
            }
          />
          <Section title="Status" content={data.status} />
          <Section title="HTML Version" content={data.html_version} />
          <Section
            title="Login Form"
            content={data.has_login_form ? "Yes" : "No"}
          />
          <Section title="H1 Count" content={data.h1_count} />
          <Section title="H2 Count" content={data.h2_count} />
          <Section title="H3 Count" content={data.h3_count} />
          <Section title="H4 Count" content={data.h4_count} />
          <Section title="Internal Links" content={data.internal_links} />
          <Section title="External Links" content={data.external_links} />
          <Section
            title="Created At"
            content={new Date(data.created_at).toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  content,
}: {
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
        {title}
      </div>
      <div className="text-sm text-gray-800 break-words">{content}</div>
    </div>
  );
}
