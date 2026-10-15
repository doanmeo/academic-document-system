import React, { useState } from 'react'
import { Check, Copy, Download, Code2, Maximize2, Minimize2 } from 'lucide-react'

interface CodeViewerProps {
  code: string
  language?: string | null
  title?: string
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'python',
  title = 'Mã nguồn mẫu trực tuyến',
}) => {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      py: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      typescript: 'ts',
      javascript: 'js',
      sql: 'sql',
      html: 'html',
      css: 'css',
    }
    const lang = (language || 'txt').toLowerCase()
    const ext = extMap[lang] || 'txt'
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `utc_source_code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const lines = code.split('\n')

  // Simple token styler for keywords, strings, comments
  const highlightLine = (line: string) => {
    // Escape HTML first
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Comments
    if (escaped.trim().startsWith('//') || escaped.trim().startsWith('#') || escaped.trim().startsWith('--')) {
      return `<span class="text-emerald-500 italic">${escaped}</span>`
    }

    // Highlight strings
    let styled = escaped.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-amber-500 font-medium">$&</span>')

    // Highlight keywords
    styled = styled.replace(
      /\b(def|class|return|import|from|public|private|protected|void|static|final|abstract|extends|implements|if|else|for|while|try|catch|new|SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|LIMIT|interface|const|let|var|function|async|await)\b/g,
      '<span class="text-purple-600 dark:text-purple-400 font-semibold">$&</span>'
    )

    // Highlight types
    styled = styled.replace(
      /\b(int|double|float|String|boolean|Boolean|Integer|List|Map|Set|void|null|None|True|False)\b/g,
      '<span class="text-cyan-600 dark:text-cyan-400 font-medium">$&</span>'
    )

    return styled
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-lg overflow-hidden transition-all duration-200 ${
        isExpanded ? 'fixed inset-4 z-50 flex flex-col' : 'my-4'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <Code2 className="w-4 h-4 text-primary-400 text-blue-400" />
          <span className="font-semibold text-sm text-slate-200">{title}</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wide">
            {language || 'code'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Sao chép toàn bộ code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Tải tệp mã nguồn"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Tải file</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isExpanded ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code body with line numbers */}
      <div className={`overflow-x-auto font-mono text-xs leading-relaxed p-4 select-text ${isExpanded ? 'flex-1' : 'max-h-[500px]'}`}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                <td className="w-10 pr-4 text-right text-slate-600 select-none text-[11px] align-top py-0.5">
                  {idx + 1}
                </td>
                <td
                  className="pl-2 text-slate-300 whitespace-pre align-top py-0.5 font-mono"
                  dangerouslySetInnerHTML={{ __html: highlightLine(line) || '&nbsp;' }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default CodeViewer
