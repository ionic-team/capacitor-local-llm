import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { LocalLLM } from "@capacitor/local-llm";

import './Tab2.css';

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
  type: string;
}

const statusColor = (status: string): string => {
  switch (status) {
    case 'available': return 'success';
    case 'unavailable': return 'danger';
    case 'notready':
    case 'downloadable': return 'warning';
    default: return 'medium';
  }
};

const Tab2: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Can you create a futuristic image of a model wearing smart glasses?");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onStatusBtn = async () => {
    try {
      const res = await LocalLLM.systemAvailability();
      setSystemStatus(res.status);
      if (res.status === 'downloadable') {
        onDownloadingModel();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onFileImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray: SelectedImage[] = Array.from(e.target.files).map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));

    setSelectedImages((prev) => [...prev, ...filesArray]);
    e.target.value = "";
  };

  const removeImage = (id: string, previewUrl: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
    URL.revokeObjectURL(previewUrl);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const onDownloadingModel = async () => {
    let interval: NodeJS.Timeout | null = null;
    try {
      interval = setInterval(async () => {
        try {
          const res = await LocalLLM.systemAvailability();
          setSystemStatus(res.status);
        } catch (err) {
          if (interval) clearInterval(interval);
          setError((err as Error).message);
        }
      }, 1000);
      await LocalLLM.download();
      clearInterval(interval);
    } catch (err) {
      if (interval) clearInterval(interval);
      setError((err as Error).message);
    }
  };

  const onGenerateBtn = async () => {
    setAwaitingResponse(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const promptImages = await Promise.all(selectedImages.map(img => fileToBase64(img.file)));

      const res = await LocalLLM.generateImage({
        prompt,
        promptImages,
        count: 4,
      });

      setGeneratedImages(res.pngBase64Images);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAwaitingResponse(false);
    }
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [selectedImages]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Images</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Images</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          <IonButton expand="block" onClick={onStatusBtn}>
            Check Status
          </IonButton>
          {systemStatus && (
            <IonChip color={statusColor(systemStatus)}>
              <IonLabel>{systemStatus}</IonLabel>
            </IonChip>
          )}

          <IonTextarea
            fill="outline"
            labelPlacement="floating"
            label="Prompt"
            value={prompt}
            onIonInput={(e) => setPrompt(e.detail.value ?? "")}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileImageSelected}
            style={{ display: 'none' }}
          />
          <IonButton expand="block" fill="outline" onClick={() => fileInputRef.current?.click()}>
            Add Reference Images
          </IonButton>

          {selectedImages.length > 0 && (
            <div className="image-grid">
              {selectedImages.map((img) => (
                <div key={img.id} className="thumbnail-container">
                  <img src={img.preview} alt="Preview" className="thumbnail" />
                  <button
                    onClick={() => removeImage(img.id, img.preview)}
                    className="remove-button"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <IonButton expand="block" disabled={awaitingResponse} onClick={onGenerateBtn}>
            Generate
          </IonButton>

          {awaitingResponse && (
            <div className="loading">
              <IonSpinner />
            </div>
          )}
          {error && <p className="error">{error}</p>}

          {generatedImages.length > 0 && (
            <div className="generated-grid">
              {generatedImages.map((data, i) => (
                <img
                  key={i}
                  src={`data:image/png;base64,${data}`}
                  alt={`Generated image ${i + 1}`}
                  className="generated-image"
                />
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
