'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface UrlInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export default function UrlInput({ urls, onChange }: UrlInputProps) {
  const addUrl = () => {
    onChange([...urls, '']);
  };

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground">网站URL（每行一个）</div>
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => updateUrl(index, e.target.value)}
            placeholder="https://example.com"
          />
          {urls.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeUrl(index)}
              aria-label="删除URL"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addUrl} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        添加更多URL
      </Button>
    </div>
  );
}
