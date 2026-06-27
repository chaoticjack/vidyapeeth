import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import 'highlight.js/styles/github-dark.css';
import { Check, Copy } from 'lucide-react';

function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-8">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 p-2 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Copy code"
      >
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>
      <div className="overflow-hidden rounded-xl bg-[#0d1117] shadow-[0_10px_30px_-10px_rgba(27,42,74,0.15)]">
        <div className="flex items-center px-4 py-2 border-b border-white/10 bg-[#161b22]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
        </div>
        <div className="overflow-x-auto p-5 text-[13px] sm:text-[14px] leading-relaxed font-mono text-white">
          <code ref={codeRef} className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  // Fix literal \n strings that might have been doubly escaped in the database
  const normalizedContent = content.replace(/\\n/g, '\n');

  return (
    <div className="markdown-body max-w-none w-full text-left">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[
          rehypeSanitize,
          rehypeSlug,
          rehypeAutolinkHeadings,
          rehypeHighlight
        ]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-5xl font-black font-display text-navy mt-14 mb-8 leading-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold font-display text-navy mt-12 mb-6 leading-snug" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-bold font-display text-navy mt-10 mb-4" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-xl font-bold font-display text-navy mt-8 mb-4" {...props} />,
          p: ({ node, ...props }) => <p className="text-lg leading-8 text-ink mb-6" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-lg text-ink" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-lg text-ink" {...props} />,
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto mb-8 rounded-xl border border-navy/10 shadow-sm">
              <table className="min-w-full text-left text-ink border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-navy/5 text-navy font-bold" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-navy/10" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-navy/[0.02] transition-colors" {...props} />,
          td: ({ node, ...props }) => <td className="p-4" {...props} />,
          th: ({ node, ...props }) => <th className="p-4 font-semibold text-navy" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-8 border-l-4 border-saffron bg-saffron/5 px-6 py-4 rounded-r-xl italic text-lg font-semibold text-navy/80" {...props} />
          ),
          img: ({ node, alt, src, ...props }) => (
            <figure className="my-10 flex flex-col items-center">
              <img 
                src={src} 
                alt={alt} 
                loading="lazy" 
                className="rounded-xl w-full h-auto max-w-full shadow-[0_10px_30px_-10px_rgba(27,42,74,0.15)] object-cover" 
                {...props} 
              />
              {alt && <figcaption className="mt-3 text-center text-sm font-medium text-ink/60">{alt}</figcaption>}
            </figure>
          ),
          a: ({ node, ...props }) => <a className="text-saffron font-medium hover:text-navy hover:underline transition-colors" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-12 border-t-2 border-navy/10" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-navy" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          pre: ({ node, children }) => <>{children}</>,
          code: ({ node, className, children, ...props }: any) => {
            const isBlockCode = className?.includes('language-');
            if (isBlockCode) {
              return (
                <CodeBlock className={className} {...props}>
                  {children}
                </CodeBlock>
              );
            }
            return (
              <code className={`${className || ''} bg-navy/5 text-navy px-1.5 py-0.5 rounded-md text-sm font-mono whitespace-nowrap`} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
