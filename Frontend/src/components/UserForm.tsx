interface UserFormProps {
  onSubmit: (username: string) => void;
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const handleSubmit = (e: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="username"
          placeholder="Digite seu nome"
          className="px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          required
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Começar
        </button>
      </form>
    </div>
  );
}
