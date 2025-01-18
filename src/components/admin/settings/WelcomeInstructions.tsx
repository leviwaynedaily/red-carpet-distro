import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type WelcomeInstructionsProps = {
  settings: {
    welcome_instructions: {
      title: string;
      subtitle: string;
      guidelines: string;
    } | null;
  };
  onSettingChange: (name: string, value: any) => void;
};

export function WelcomeInstructions({ settings, onSettingChange }: WelcomeInstructionsProps) {
  const [guidelinesHtml, setGuidelinesHtml] = useState(
    settings.welcome_instructions?.guidelines || ''
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: guidelinesHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setGuidelinesHtml(html);
      onSettingChange('welcome_instructions', {
        title: settings.welcome_instructions?.title || 'Welcome to Palmtree Smokes',
        subtitle: settings.welcome_instructions?.subtitle || 'Please take a moment to review our store guidelines:',
        guidelines: html
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="welcome-title">Welcome Title</Label>
        <Input
          id="welcome-title"
          value={settings.welcome_instructions?.title || ''}
          onChange={(e) =>
            onSettingChange('welcome_instructions', {
              ...settings.welcome_instructions,
              title: e.target.value,
            })
          }
          placeholder="Welcome Title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcome-subtitle">Welcome Subtitle</Label>
        <Input
          id="welcome-subtitle"
          value={settings.welcome_instructions?.subtitle || ''}
          onChange={(e) =>
            onSettingChange('welcome_instructions', {
              ...settings.welcome_instructions,
              subtitle: e.target.value,
            })
          }
          placeholder="Welcome Subtitle"
        />
      </div>

      <div className="space-y-2">
        <Label>Guidelines</Label>
        <div className="border border-input rounded-md p-4">
          <EditorContent editor={editor} className="min-h-[200px] prose prose-sm max-w-none" />
        </div>
      </div>
    </div>
  );
}