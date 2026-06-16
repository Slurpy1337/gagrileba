export function PolicyPage({ title, text }: { title: string; text: string }) {
  return (
    <section className="section bg-white">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-black">{title}</h1>
        <p className="mt-5 leading-8 text-slate-700">{text}</p>
      </div>
    </section>
  );
}
