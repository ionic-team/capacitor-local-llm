import { ChangeEvent, useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { LocalLLM } from "@capacitor/local-llm";

import './Tab2.css';

interface SelectedImage {
  id: string;
  file: File;
  preview: string;
  type: string;
}

const Tab2: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<string>("---");
  const [prompt, setPrompt] = useState<string>("Can you create a futuristic image of a model wearing smart glasses?");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [response, setResponse] = useState<string>("---");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

  const onStatusBtn = async () => {
    const res = await LocalLLM.systemAvailability();
    setSystemStatus(res.status);

    if (res.status == 'downloadable') {
      onDownloadingModel();
    }
  };

  const onFileImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
          // Convert FileList to an Array and map to our interface
          const filesArray: SelectedImage[] = Array.from(e.target.files).map((file) => ({
            id: Math.random().toString(36).substring(2, 11),
            file: file,
            preview: URL.createObjectURL(file),
            type: file.type
          }));

      console.log(filesArray);

          setSelectedImages((prev) => [...prev, ...filesArray]);

          e.target.value = "";
        }
    };

  const removeImage = (id: string, previewUrl: string): void => {
      setSelectedImages((prev) => prev.filter((img) => img.id !== id));
      URL.revokeObjectURL(previewUrl);
    };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // This is called once the file is fully read
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to string"));
        }
      };

      reader.onerror = (error) => reject(error);

      // Starts the reading process
      reader.readAsDataURL(file);
    });
  };

  const onDownloadingModel = async () => {
    let interval: NodeJS.Timeout | null = null;
    try {
      interval = setInterval(async () => {
        const res = await LocalLLM.systemAvailability();
        setSystemStatus(res.status);
      }, 1000);
      await LocalLLM.download();
      clearInterval(interval);
    } catch (err) {
      if (interval) {
        clearInterval(interval)
      }
      setResponse((err as Error).message);
    }
  }

  const onPromptBtn = async () => {
    setAwaitingResponse(true);

    try {
      const base64Promises = selectedImages.map(img => fileToBase64(img.file));
      const promptImages = await Promise.all(base64Promises);

      const res = await LocalLLM.generateImage({
        prompt,
        promptImages: promptImages,
        count: 4
      });

      setAwaitingResponse(false);
      setGeneratedImages(res.pngBase64Images);
    } catch (err: unknown) {
      setAwaitingResponse(false);
      setResponse((err as Error).message);
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
          <code>{systemStatus}</code>

          <IonTextarea
            label="Enter a Prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.currentTarget.value ?? "");
            }}
          ></IonTextarea>
          <input
            type="file"
            id="file-picker"
            accept="image/*"
            multiple
            onChange={onFileImageSelected}
            style={{ marginBottom: '20px' }}
          />

          <div style={gridStyle}>
                  {selectedImages.map((img) => (
                    <div key={img.id} style={thumbnailContainerStyle}>
                      <img
                        src={img.preview}
                        alt="Preview"
                        style={imageStyle}
                      />
                      <button
                        onClick={() => removeImage(img.id, img.preview)}
                        style={removeButtonStyle}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
          <IonButton
            disabled={awaitingResponse}
            expand="block"
            onClick={onPromptBtn}
          >
            Prompt
          </IonButton>

            {awaitingResponse ? (
              <div className="loading">
                <IonSpinner></IonSpinner>
              </div>
          ) : null}

          {generatedImages.length == 0 && (
            <small>None</small>
          )}
          {generatedImages.map((data) => {
            return <img src={`data:image/png;base64,${data}`} />
          })}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;

const containerStyle: React.CSSProperties = {
  padding: '20px',
  border: '2px dashed #ccc',
  borderRadius: '12px',
  textAlign: 'center'
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  justifyContent: 'center'
};

const thumbnailContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100px',
  height: '100px'
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '8px'
};

const removeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  background: '#ff4d4f',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  cursor: 'pointer',
  fontWeight: 'bold'
};
