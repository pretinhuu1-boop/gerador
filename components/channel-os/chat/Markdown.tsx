import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../../lib/cn';

export const Markdown = ({ children, className }: { children: string; className?: string }) => (
  <div className={cn('prose-chat', className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
      p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0 break-words">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-fg-primary">{children}</strong>,
      em: ({ children }) => <em className="italic text-fg-secondary">{children}</em>,
      a: ({ children, href }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-brand underline underline-offset-2 hover:text-brand-muted break-all"
        >
          {children}
        </a>
      ),
      code: ({ children, className: cls }) => {
        const isBlock = (cls ?? '').startsWith('language-');
        if (isBlock) {
          return (
            <pre className="bg-bg-overlay border border-border-subtle rounded-lg p-3 my-2 overflow-x-auto text-[12px] font-mono">
              <code className={cls}>{children}</code>
            </pre>
          );
        }
        return (
          <code className="font-mono text-[12px] bg-bg-elevated/80 text-fg-primary px-1.5 py-0.5 rounded">
            {children}
          </code>
        );
      },
      h1: ({ children }) => <h2 className="font-display font-bold text-lg my-2">{children}</h2>,
      h2: ({ children }) => <h3 className="font-display font-semibold text-base my-2">{children}</h3>,
      h3: ({ children }) => <h4 className="font-display font-semibold text-sm my-1.5">{children}</h4>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-brand/40 pl-3 my-2 text-fg-secondary italic">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="my-3 border-border-subtle" />,
      table: ({ children }) => (
        <div className="my-2 overflow-x-auto">
          <table className="text-xs border-collapse">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-border-subtle px-2 py-1 font-semibold text-left bg-bg-elevated">
          {children}
        </th>
      ),
      td: ({ children }) => <td className="border border-border-subtle px-2 py-1">{children}</td>,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);
