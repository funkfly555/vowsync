/**
 * RichTextEditor - Tiptap-based rich text editor for email content
 * @feature 016-email-campaigns
 * @task T007
 */

import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Variable,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import type { RecipientType } from '@/types/email';
import { AVAILABLE_VARIABLES } from '@/types/email';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  recipientType?: RecipientType;
  onInsertVariable?: (variable: string) => void;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

/**
 * Rich text editor with toolbar for email content editing
 * Features:
 * - Basic formatting (bold, italic, underline, strikethrough)
 * - Headings (H1, H2, H3)
 * - Lists (ordered and unordered)
 * - Text alignment
 * - Links
 * - Variable insertion for email templates
 */
export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your email content here...',
  recipientType,
  onInsertVariable,
  minHeight = 200,
  maxHeight = 500,
  disabled = false,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertVariable = useCallback(
    (variable: string) => {
      if (editor) {
        editor.commands.insertContent(variable);
        editor.commands.focus();
        onInsertVariable?.(variable);
      }
    },
    [editor, onInsertVariable]
  );

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkPopoverOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  // Filter variables based on recipient type
  const availableVariables = AVAILABLE_VARIABLES.filter((v) => {
    if (!recipientType) return true;
    if (recipientType === 'guest') {
      return v.entity !== 'vendor';
    }
    if (recipientType === 'vendor') {
      return v.entity !== 'guest';
    }
    return true;
  });

  // Group variables by entity
  const groupedVariables = availableVariables.reduce(
    (acc, variable) => {
      if (!acc[variable.entity]) {
        acc[variable.entity] = [];
      }
      acc[variable.entity].push(variable);
      return acc;
    },
    {} as Record<string, typeof availableVariables>
  );

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Type className="h-4 w-4 mr-1" />
                <span className="text-xs">Format</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                <Type className="h-4 w-4 mr-2" />
                Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Link */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0',
                  editor.isActive('link') && 'bg-gray-200'
                )}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setLink();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={setLink}>
                    {linkUrl ? 'Set Link' : 'Remove Link'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLinkPopoverOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Variable Insertion */}
        {recipientType && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Variable className="h-4 w-4 mr-1" />
                <span className="text-xs">Insert Variable</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {Object.entries(groupedVariables).map(([entity, variables]) => (
                <div key={entity}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                    {entity}
                  </div>
                  {variables.map((v) => (
                    <DropdownMenuItem
                      key={v.placeholder}
                      onClick={() => insertVariable(v.placeholder)}
                    >
                      <code className="mr-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {v.placeholder}
                      </code>
                      <span className="text-xs text-gray-500">{v.description}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 focus:outline-none"
        style={{
          minHeight,
          maxHeight,
          overflowY: 'auto',
        }}
      />

      {/* Character count */}
      <div className="px-4 py-2 text-xs text-gray-400 border-t bg-gray-50 flex justify-between">
        <span>
          {recipientType && (
            <>
              Variables available for <strong>{recipientType}</strong> recipients
            </>
          )}
        </span>
        <span>
          {editor.storage.characterCount?.characters?.() || editor.getText().length} characters
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Toolbar Button Helper
// =============================================================================

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-gray-200',
        disabled && 'opacity-50'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}
