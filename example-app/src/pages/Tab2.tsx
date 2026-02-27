import { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { LocalLLM } from "@capacitor/local-llm";

import './Tab2.css';

const Tab2: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<string>("---");
  const [prompt, setPrompt] = useState<string>("Can you create a futuristic image of a model wearing smart glasses?");
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
      const res = await LocalLLM.generateImage({
        prompt,
        count: 4
      });

      setAwaitingResponse(false);
      setGeneratedImages(res.pngBase64Images);
    } catch (err: unknown) {
      setAwaitingResponse(false);
      setResponse((err as Error).message);
    }
  };

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
