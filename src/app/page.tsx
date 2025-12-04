import LexicalEditor from "@/components/LexicalEditor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="w-full max-w-4xl">
        <LexicalEditor />
      </div>
    </main>
  );
}
