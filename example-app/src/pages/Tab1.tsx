import { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { LocalLLM } from "@capacitor/local-llm";

import './Tab1.css';


const Tab1: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<string>("---");
  const [prompt, setPrompt] = useState<string>("What is an LLM?");
  const [sessionId, setSessionId] = useState<string>("");
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

    let promptSessionId: string | undefined = sessionId;
    if (promptSessionId == "") {
      promptSessionId = undefined;
    }

    try {
      const res = await LocalLLM.prompt({
        prompt,
        sessionId: promptSessionId
      });

      setAwaitingResponse(false);

      setResponse(res.text);
    } catch (err: unknown) {
      setAwaitingResponse(false);
      setResponse((err as Error).message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Prompt</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Prompt</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          <IonButton expand="block" onClick={onStatusBtn}>
            Check Status
          </IonButton>
          <code>{systemStatus}</code>

          <IonTextarea
            label="Enter a Session ID (optional)"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.currentTarget.value ?? "");
            }}
          ></IonTextarea>

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
          <code>
            {awaitingResponse ? (
              <div className="loading">
                <IonSpinner></IonSpinner>
              </div>
            ) : (
              response
            )}
          </code>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
