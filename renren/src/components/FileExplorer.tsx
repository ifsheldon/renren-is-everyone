import Link from "next/link";
import type { FileEntry } from "@/lib/files";

type Props = {
  files: FileEntry[];
  currentPath?: string;
  lang?: "en" | "zh";
};

export function FileExplorer({ files, currentPath = "", lang = "en" }: Props) {
  const parentPath = currentPath.split("/").slice(0, -1).join("/");
  const baseUrl = lang === "zh" ? "/zh/file" : "/file";
  const homeUrl = lang === "zh" ? "/zh" : "/";

  const t = {
    goBack: lang === "zh" ? "返回" : "Go Back",
    directory: lang === "zh" ? "目录" : "Directory",
    file: lang === "zh" ? "字幕文件" : "Subtitle File",
    noFiles:
      lang === "zh"
        ? "此目录下没有文件。"
        : "No files found in this directory.",
  };

  return (
    <div>
      {currentPath && (
        <div className="mb-6">
          <Link
            href={parentPath ? `${baseUrl}/${parentPath}` : homeUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-gray-400 hover:text-white text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <span>{t.goBack}</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <p className="text-gray-400">{t.noFiles}</p>
          </div>
        ) : (
          files.map((file) => (
            <Link
              key={file.path}
              href={`${baseUrl}/${file.path}`}
              className="group p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm flex items-center gap-4"
            >
              <div
                className={`p-3 rounded-lg ${file.isDirectory ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"} group-hover:scale-110 transition-transform`}
              >
                {file.isDirectory ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate text-gray-200 group-hover:text-white transition-colors">
                  {file.name}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {file.isDirectory ? t.directory : t.file}
                </p>
              </div>
              <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
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
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
