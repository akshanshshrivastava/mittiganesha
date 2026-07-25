export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-lg text-stone-100">Mitti Ganesha</p>
            <p className="mt-1 text-sm text-stone-400">
              Handcrafted eco-friendly clay idols that dissolve in water.
            </p>
          </div>
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Mitti Ganesha · mittiganesha.com
          </p>
        </div>
      </div>
    </footer>
  );
}
