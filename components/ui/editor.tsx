'use client'

import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 border rounded-md animate-pulse bg-muted" />,
})

interface EditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
    ],
}

const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'link',
]

export function Editor({ value, onChange, placeholder, className }: EditorProps) {
    return (
        <div className={className}>
            <style jsx global>{`
        .quill {
          background: hsl(var(--background));
        }
        .ql-toolbar {
          border-color: hsl(var(--border)) !important;
          border-radius: 0.5rem 0.5rem 0 0;
          background: hsl(var(--background));
        }
        .ql-container {
          border-color: hsl(var(--border)) !important;
          border-radius: 0 0 0.5rem 0.5rem;
          font-family: inherit;
          background: hsl(var(--background));
        }
        .ql-editor {
          min-height: 200px;
          font-size: 0.875rem;
        }
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
      `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    )
}
