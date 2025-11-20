import Link from "next/link";
import { DownloadInfo } from "./DownloadInfo";

type Props = {
  lang: "en" | "zh";
  currentPath?: string;
};

export function LanguageSwitcher({ lang, currentPath = "" }: Props) {
  // Ensure currentPath starts with / if it's not empty
  const normalizedPath = currentPath.startsWith("/")
    ? currentPath
    : `/${currentPath}`;

  // If current lang is 'en', target is 'zh'. Target URL should be /zh + currentPath
  // If current lang is 'zh', target is 'en'. Target URL should be currentPath (removing /zh if present, but here we just append path to root)

  const targetLabel = lang === "en" ? "中文" : "English";

  let targetUrl = "";
  if (lang === "en") {
    targetUrl = `/zh${normalizedPath === "/" ? "" : normalizedPath}`;
  } else {
    // Switching from zh to en.
    // If we are at /zh/file/..., we want /file/...
    // The currentPath passed in should be relative to the language root if possible,
    // OR we can just construct it.
    // Let's assume currentPath passed from pages is the path *after* the language prefix.
    targetUrl = normalizedPath === "/" ? "/" : normalizedPath;
  }

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      <DownloadInfo />
      <Link
        href={targetUrl}
        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium text-gray-200 hover:text-white backdrop-blur-md"
      >
        {targetLabel}
      </Link>
    </div>
  );
}
