interface HintsProps {
  hints: string[];
}

export default function Hints({ hints }: HintsProps) {
  if (hints.length === 0) return null;

  return (
    <div className="w-90 max-w-2xl mx-auto mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Tips:</h3>
      <div className="space-y-2">
        {hints.map((hint, index) => (
          <div
            key={index}
            className="bg-blue-100 border-l-4 border-(--button-color) p-4 rounded-r-lg"
          >
            <p className="text-gray-800">
              <span className="font-bold">Tips {index + 1}:</span> {hint}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
