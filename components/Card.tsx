type CardProps = {
  title: string;
  value: string | number;
};

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow flex flex-col">
      <span className="text-sm text-neutral-500">{title}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
