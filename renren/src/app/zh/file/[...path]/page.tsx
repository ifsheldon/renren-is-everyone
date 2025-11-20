import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileExplorer } from "@/components/FileExplorer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getFileContent, getSubtitleFiles, isDirectory } from "@/lib/files";

type Props = {
  params: Promise<{ path: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const decodedPath = path.map((p) => decodeURIComponent(p)).join("/");
  return {
    title: `${decodedPath} - 字幕服务器`,
    description: `查看 ${decodedPath}`,
  };
}

export default async function FilePage({ params }: Props) {
  const { path: pathSegments } = await params;
  const decodedSegments = pathSegments.map((p) => decodeURIComponent(p));
  const relativePath = decodedSegments.join("/");
  const currentTitle = decodedSegments[decodedSegments.length - 1];

  const isDir = await isDirectory(relativePath);

  if (isDir) {
    const files = await getSubtitleFiles(relativePath);
    return (
      <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-gray-900 to-black text-white relative">
        <LanguageSwitcher lang="zh" currentPath={`/file/${relativePath}`} />
        <main className="max-w-7xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4 break-words">
              {currentTitle}
            </h1>
            <p className="text-gray-400 text-lg break-all">{relativePath}</p>
          </header>
          <FileExplorer files={files} currentPath={relativePath} lang="zh" />
        </main>
      </div>
    );
  }

  const content = await getFileContent(relativePath);

  if (content === null) {
    notFound();
  }

  const parentPath = decodedSegments.slice(0, -1).join("/");

  return (
    <div className="h-screen p-4 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-gray-900 to-black text-white flex flex-col overflow-hidden relative">
      <LanguageSwitcher lang="zh" currentPath={`/file/${relativePath}`} />
      <main className="w-full flex-1 flex flex-col min-h-0">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={parentPath ? `/zh/file/${parentPath}` : "/zh"}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold truncate text-gray-200">
              {currentTitle}
            </h1>
          </div>
        </header>

        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
          <textarea
            readOnly
            value={content}
            className="w-full h-full relative z-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 font-mono text-sm md:text-base text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none custom-scrollbar"
            spellCheck={false}
          />
        </div>
      </main>
    </div>
  );
}
