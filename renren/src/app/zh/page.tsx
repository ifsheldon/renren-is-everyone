import { FileExplorer } from "@/components/FileExplorer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getSubtitleFiles } from "@/lib/files";

export default async function Home() {
  const files = await getSubtitleFiles();

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-gray-900 to-black text-white relative">
      <LanguageSwitcher lang="zh" />
      <main className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            人人字幕存档
          </h1>
        </header>

        <FileExplorer files={files} lang="zh" />
      </main>
    </div>
  );
}
