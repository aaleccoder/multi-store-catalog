import React from 'react'

interface RichTextRendererProps {
  content: any
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content) return null

  // If it's a string, check if it contains HTML (from Quill)
  if (typeof content === 'string') {
    // Check if the string contains HTML tags (Quill format)
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content)

    if (hasHtmlTags) {
      // It's HTML from Quill, render it with Tailwind prose classes
      return (
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-foreground prose-p:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-em:italic prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-foreground prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
    }

    // Plain text
    return <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
  }

  // Use Payload's serialized format - render as HTML from Lexical nodes
  const renderLexicalContent = (editorState: any) => {
    if (!editorState?.root?.children) return null

    const renderNode = (node: any): string => {
      if (node.type === 'text') {
        let text = node.text || ''
        if (node.format & 1) text = `<strong>${text}</strong>`
        if (node.format & 2) text = `<em>${text}</em>`
        if (node.format & 8) text = `<u>${text}</u>`
        return text
      }

      if (node.type === 'paragraph') {
        const content = node.children?.map(renderNode).join('') || ''
        return `<p class="mb-4">${content}</p>`
      }

      if (node.type === 'heading') {
        const tag = node.tag || 'h2'
        const content = node.children?.map(renderNode).join('') || ''
        return `<${tag} class="font-bold mb-3 mt-6">${content}</${tag}>`
      }

      if (node.type === 'list') {
        const tag = node.tag || 'ul'
        const content = node.children?.map(renderNode).join('') || ''
        return `<${tag} class="mb-4 ml-6 ${tag === 'ul' ? 'list-disc' : 'list-decimal'}">${content}</${tag}>`
      }

      if (node.type === 'listitem') {
        const content = node.children?.map(renderNode).join('') || ''
        return `<li class="mb-1">${content}</li>`
      }

      if (node.type === 'quote') {
        const content = node.children?.map(renderNode).join('') || ''
        return `<blockquote class="border-l-4 border-primary pl-4 italic my-4">${content}</blockquote>`
      }

      if (node.type === 'link') {
        const content = node.children?.map(renderNode).join('') || ''
        return `<a href="${node.url}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">${content}</a>`
      }

      if (node.children) {
        return node.children.map(renderNode).join('')
      }

      return ''
    }

    const html = editorState.root.children.map(renderNode).join('')
    return html
  }

  const htmlContent = renderLexicalContent(content)

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
