import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders BoviAI's Markdown replies with the app's typography tokens. */
export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-1 flex list-none flex-col gap-1 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 flex list-decimal flex-col gap-1 last:mb-0">{children}</ol>,
        li: ({ children }) => (
          <li className="relative pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/60">
            {children}
          </li>
        ),
        strong: ({ children }) => <strong className="font-semibold text-label">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ children, href }) => (
          <a href={href} className="text-primary underline hover:opacity-80" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        h1: ({ children }) => <h3 className="mb-1.5 mt-1 font-dm-sans text-[15px] font-bold text-label">{children}</h3>,
        h2: ({ children }) => <h3 className="mb-1.5 mt-1 font-dm-sans text-[14px] font-bold text-label">{children}</h3>,
        h3: ({ children }) => <h4 className="mb-1 mt-1 font-dm-sans text-[13px] font-semibold text-label">{children}</h4>,
        code: ({ children }) => (
          <code className="rounded bg-surface px-1 py-0.5 font-mono text-[12px] text-label">{children}</code>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border border-border-light bg-surface px-2 py-1 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="border border-border-light px-2 py-1">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
