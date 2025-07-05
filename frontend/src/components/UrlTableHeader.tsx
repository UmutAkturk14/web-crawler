type Props = {
  allSelected: boolean;
  onSelectAll: () => void;
};

export default function UrlTableHeader({ allSelected, onSelectAll }: Props) {
  return (
    <tr>
      <th className="px-4 py-3 whitespace-nowrap">
        <input type="checkbox" onChange={onSelectAll} checked={allSelected} />
      </th>
      {[
        "ID",
        "Title",
        "URL",
        "Status",
        "HTML",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "Internal",
        "External",
        "Broken",
        "Login",
        "Created",
      ].map((title) => (
        <th key={title} className="px-4 py-3 whitespace-nowrap">
          {title}
        </th>
      ))}
    </tr>
  );
}
