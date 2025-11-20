import { getSubtitleFiles } from '@/lib/files';
import { FileExplorer } from '@/components/FileExplorer';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function Home() {
  const files = await getSubtitleFiles();

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-gray-900 to-black text-white relative">
      <LanguageSwitcher lang="en" />
      <main className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Ren Ren is Everyone
          </h1>
          <p className="text-gray-400 text-lg">
            Subtitles from Ren Ren Ying Shi
          </p>
        </header>

        <FileExplorer files={files} />
      </main>
    </div>
  );
}
