export default function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow flex flex-col">
      <span className="text-sm text-neutral-500">{title}</span>
      <span className="text-2xl font-bold mt-2">{value}</span>
    </div>
  );
}
