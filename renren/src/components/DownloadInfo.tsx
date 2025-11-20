"use client";

import { useEffect, useState } from "react";

export function DownloadInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isOpen && !content) {
      fetch("/download-instruction.md")
        .then((res) => res.text())
        .then((text) => setContent(text))
        .catch((err) => console.error("Failed to load instructions:", err));
    }
  }, [isOpen, content]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-200 text-gray-200 hover:text-white backdrop-blur-md"
        title="Download Instructions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
          aria-labelledby="download-icon-title"
          role="img"
        >
          <title id="download-icon-title">Download Instructions</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close modal"
          />
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative z-10">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
                aria-labelledby="close-icon-title"
                role="img"
              >
                <title id="close-icon-title">Close</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4 text-white">
              Download Instructions
            </h2>

            <div className="prose prose-invert prose-sm max-w-none">
              {content ? (
                <div className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                  {content}
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
