import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, File as FileIcon } from "lucide-react";
import { useState, useRef } from "react";
import { uploadFiles, type FileType, type SdatResult, type EslResult, type UploadResponse } from "@/services/api";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileType, setFileType] = useState<FileType>("sdat");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<UploadResponse<SdatResult> | UploadResponse<EslResult> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate XML content based on selected type
  const validateFile = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');

      if (fileType === 'sdat') {
        const nodes = xml.getElementsByTagNameNS('http://www.strom.ch', 'DocumentID');
        return nodes.length > 0;
      } else {
        const nodes = xml.getElementsByTagName('TimePeriod');
        return nodes.length > 0;
      }
    } catch {
      return false;
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = Array.from(e.dataTransfer.files);
    const valid: File[] = [];
    const invalidXmlFiles: string[] = [];
    const invalidFormatFiles: string[] = [];

    for (const file of dropped) {
      if (!file.name.toLowerCase().endsWith('.xml')) {
        invalidXmlFiles.push(file.name);
        continue;
      }
      const ok = await validateFile(file);
      if (!ok) {
        invalidFormatFiles.push(file.name);
        continue;
      }
      valid.push(file);
    }

    // Show consolidated error messages
    if (invalidXmlFiles.length > 0) {
      const fileList = invalidXmlFiles.length > 3
        ? `${invalidXmlFiles.slice(0, 3).join(', ')} und ${invalidXmlFiles.length - 3} weitere`
        : invalidXmlFiles.join(', ');
      alert(`${invalidXmlFiles.length} Datei(en) haben nicht die Endung .xml: ${fileList}`);
    }

    if (invalidFormatFiles.length > 0) {
      const fileList = invalidFormatFiles.length > 3
        ? `${invalidFormatFiles.slice(0, 3).join(', ')} und ${invalidFormatFiles.length - 3} weitere`
        : invalidFormatFiles.join(', ');
      alert(`${invalidFormatFiles.length} Datei(en) sind kein gültiges ${fileType.toUpperCase()}-Format: ${fileList}`);
    }

    setFiles(prev => [...prev, ...valid]);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles) return;

    const valid: File[] = [];
    const invalidXmlFiles: string[] = [];
    const invalidFormatFiles: string[] = [];

    for (const file of Array.from(inputFiles)) {
      if (!file.name.toLowerCase().endsWith('.xml')) {
        invalidXmlFiles.push(file.name);
        continue;
      }
      const ok = await validateFile(file);
      if (!ok) {
        invalidFormatFiles.push(file.name);
        continue;
      }
      valid.push(file);
    }

    // Show consolidated error messages
    if (invalidXmlFiles.length > 0) {
      const fileList = invalidXmlFiles.length > 3
        ? `${invalidXmlFiles.slice(0, 3).join(', ')} und ${invalidXmlFiles.length - 3} weitere`
        : invalidXmlFiles.join(', ');
      alert(`${invalidXmlFiles.length} Datei(en) haben nicht die Endung .xml: ${fileList}`);
    }

    if (invalidFormatFiles.length > 0) {
      const fileList = invalidFormatFiles.length > 3
        ? `${invalidFormatFiles.slice(0, 3).join(', ')} und ${invalidFormatFiles.length - 3} weitere`
        : invalidFormatFiles.join(', ');
      alert(`${invalidFormatFiles.length} Datei(en) sind kein gültiges ${fileType.toUpperCase()}-Format: ${fileList}`);
    }

    setFiles(prev => [...prev, ...valid]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    try {
      const data = await uploadFiles(fileType, files as File[] & any);
      if ((data as any).success === false) {
        alert(`Fehler: ${(data as any).error}`);
      } else {
        alert('Dateien erfolgreich verarbeitet!');
        setResult(data as any);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setResult(null);
  };

  const handleClearServer = async () => {
    if (!confirm('Alle Server-Daten wirklich löschen?')) return;
    try {
      const res = await fetch('/api/clear');
      if (!res.ok) throw new Error('Server konnte nicht gelöscht werden');
      const data = await res.json();
      alert(data.message);
      clearAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto space-y-6">
        <CardHeader>
          <CardTitle>Stromdaten hochladen</CardTitle>
          <CardDescription>Wähle den Dateityp und lade eine oder mehrere XML-Dateien hoch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Type Selector */}
          <div>
            <Label className="text-base">Dateityp</Label>
            <div className="flex w-full rounded-lg border bg-muted p-1 mt-2">
              {(['sdat', 'esl'] as FileType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setFileType(type); clearAll(); }}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${fileType === type
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Dropzone */}
          <div>
            <Label htmlFor="file-input">Dateien auswählen oder per Drag & Drop ablegen</Label>
            <div
              id="file-input"
              className={`mt-2 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".xml"
                onChange={onFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium">
                    <span className="text-primary font-semibold">Zum Hochladen klicken</span> oder hierher ziehen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fileType.toUpperCase()}-Dateien (XML, max. 10 MB pro Datei)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Ausgewählte Dateien:</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                <ul className="list-disc list-inside text-sm space-y-1">
                  {files.map((f, idx) => (
                    <li key={`${f.name}-${idx}`} className="flex items-center space-x-2">
                      <FileIcon className="h-4 w-4" />
                      <span>{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={handleUpload} disabled={files.length === 0} className="flex-1">
              <Upload className="mr-2 h-4 w-4" /> Dateien verarbeiten
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={files.length === 0}
              className="flex-1"
            >
              Dateien zurücksetzen
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearServer}
              className="flex-1"
            >
              Serverdaten zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
