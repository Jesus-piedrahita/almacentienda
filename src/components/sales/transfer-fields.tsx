import { ImageUp, Paperclip } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransferFieldsProps {
  file: File | null;
  referenceNote: string;
  onFileChange: (file: File | null) => void;
  onReferenceNoteChange: (value: string) => void;
  disabled?: boolean;
  fileInputId?: string;
  referenceInputId?: string;
}

export function TransferFields({
  file,
  referenceNote,
  onFileChange,
  onReferenceNoteChange,
  disabled = false,
  fileInputId = 'transfer-proof-file',
  referenceInputId = 'transfer-reference-note',
}: TransferFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-2">
        <Label htmlFor={fileInputId} className="flex items-center gap-2">
          <ImageUp className="size-4" />
          Comprobante de transferencia
        </Label>
        <Input
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={disabled}
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            onFileChange(nextFile);
          }}
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Podés adjuntar JPG, PNG, WEBP o PDF.
        </p>
        {file && (
          <p className="text-xs text-foreground flex items-center gap-2">
            <Paperclip className="size-3.5" />
            {file.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={referenceInputId}>Referencia de transferencia</Label>
        <Input
          id={referenceInputId}
          value={referenceNote}
          disabled={disabled}
          onChange={(event) => onReferenceNoteChange(event.target.value)}
          placeholder="Ej: banco, referencia, observación..."
        />
      </div>
    </div>
  );
}
