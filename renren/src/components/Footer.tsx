import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-gray-500">
      <p>
        Created by{" "}
        <Link
          href="https://alittlemagic.studio"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors underline decoration-gray-700 underline-offset-4 hover:decoration-gray-300"
        >
          A Little Magic Studio
        </Link>
      </p>
      <p>
        <Link
          href="https://github.com/ifsheldon/renren-is-everyone"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors underline decoration-gray-700 underline-offset-4 hover:decoration-gray-300"
        >
          GitHub
        </Link>
      </p>
    </footer>
  );
}
