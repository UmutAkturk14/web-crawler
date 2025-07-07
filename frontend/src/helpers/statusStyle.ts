export const statusStyles = {
  pending: {
    buttonColor:
      "bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-200",
    bgColor: "bg-red-100",
    buttonText: "Start",
  },
  running: {
    buttonColor:
      "bg-yellow-100 border-yellow-500 text-yellow-700 hover:bg-yellow-200",
    bgColor: "bg-yellow-100",
    buttonText: "Stop",
  },
  done: {
    buttonColor: "bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200",
    bgColor: "bg-emerald-100",
    buttonText: "Reanalyze",
  },
  error: {
    buttonColor: "bg-red-100 border-red-500 text-red-700 hover:bg-red-200",
    bgColor: "bg-red-100",
    buttonText: "Retry",
  },
  queued: {
    buttonColor: "bg-gray-100 border-gray-500 text-gray-700 hover:bg-gray-200",
    bgColor: "bg-gray-100",
    buttonText: "Stop",
  },
} as const;
