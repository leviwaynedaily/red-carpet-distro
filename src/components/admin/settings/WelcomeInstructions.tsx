import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type WelcomeInstructionsProps = {
  settings: {
    welcome_instructions: {
      title: string;
      subtitle: string;
      guidelines: string[];
    } | null;
  };
  onSettingChange: (name: string, value: any) => void;
};

export function WelcomeInstructions({ settings, onSettingChange }: WelcomeInstructionsProps) {
  const [guidelinesText, setGuidelinesText] = useState(
    settings.welcome_instructions?.guidelines.join('\n') || ''
  );

  const handleGuidelinesChange = (text: string) => {
    setGuidelinesText(text);
    const guidelines = text.split('\n').filter(line => line.trim() !== '');
    onSettingChange('welcome_instructions', {
      title: settings.welcome_instructions?.title || 'Welcome to Palmtree Smokes',
      subtitle: settings.welcome_instructions?.subtitle || 'Please take a moment to review our store guidelines:',
      guidelines
    });
  };

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
        <Label htmlFor="welcome-guidelines">Guidelines (one per line)</Label>
        <Textarea
          id="welcome-guidelines"
          value={guidelinesText}
          onChange={(e) => handleGuidelinesChange(e.target.value)}
          placeholder="Enter guidelines, one per line"
          rows={6}
        />
      </div>
    </div>
  );
}