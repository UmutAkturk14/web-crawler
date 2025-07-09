// components/UrlDetailsModal.tsx

import { useEffect, useState, useRef } from "react";
import type { UrlReport } from "../../types/url-report";
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

  const modalRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchUrlDetails = async () => {
      try {
        const token = localStorage.getItem("authToken"); // get the token

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/url/${urlId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // include the token
            },
          }
        );

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
        <div className="bg-white p-6 rounded-xl shadow-lg text-base sm:text-lg">
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
        backgroundColor: ["#3b82f6", "#ef4444"],
        hoverBackgroundColor: ["#2563eb", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 overflow-auto p-4 sm:p-6"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-5xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl relative mt-48"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="fixed sm:static top-4 right-4 text-gray-400 hover:text-red-500 text-2xl sm:text-3xl font-bold"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-[65svh] md:gap-8 md:mt-4">
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-2xl sm:text-3xl font-bold border-b pb-2">
              URL Details (ID: {data.ID})
            </h2>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700 text-center">
              Internal vs External Links
            </h3>
            <div className="w-full max-w-xs">
              <Doughnut data={chartData} />
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">
              Broken Links ({data.broken_links})
            </h3>
            {data.broken_links_details &&
            data.broken_links_details.length > 0 ? (
              <ul className="max-h-52 overflow-y-auto border rounded-md p-3 sm:p-4 bg-gray-50 shadow-inner text-sm sm:text-base">
                {data.broken_links_details.map(({ link }, idx) => (
                  <li
                    key={idx}
                    className="mb-2 last:mb-0 break-words truncate"
                    title={link}
                  >
                    —{" "}
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">
                No broken links detected.
              </p>
            )}
          </div>
        </div>

        {/* Rest of the details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 text-sm">
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
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
        {title}
      </div>
      <div className="text-sm text-gray-800 break-words">{content}</div>
    </div>
  );
}
