export function Field({
    label,
    value,
    onChange,
    ...props
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <div>
        <label className="text-sm text-gray-600">{label}</label>
        <input
          className="w-full mt-1 p-2 border rounded-md"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      </div>
    );
  }