import { useEffect, useRef, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
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

import './Tab1.css';

const formatError = (err: unknown): string => {
  const message = (err as Error).message ?? 'Unknown error';
  const code = (err as any).code;
  return code ? `[${code}] ${message}` : message;
};

const statusColor = (status: string): string => {
  switch (status) {
    case 'available': return 'success';
    case 'unavailable': return 'danger';
    case 'notready':
    case 'downloadable': return 'warning';
    default: return 'medium';
  }
};

const Tab1: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("What is an LLM?");
  const [sessionId, setSessionId] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
  const availabilityListenerRef = useRef<PluginListenerHandle | null>(null);

  useEffect(() => {
    return () => {
      availabilityListenerRef.current?.remove();
    };
  }, []);

  const onStatusBtn = async () => {
    try {
      const res = await LocalLLM.systemAvailability();
      setSystemStatus(res.status);
      if (res.status === 'downloadable') {
        onDownloadingModel();
      }
    } catch (err) {
      setResponse(formatError(err));
    }
  };

  const onDownloadingModel = async () => {
    try {
      availabilityListenerRef.current = await LocalLLM.addListener('systemAvailabilityChange', (status) => {
        setSystemStatus(status);
        if (status === 'available' || status === 'unavailable') {
          availabilityListenerRef.current?.remove();
          availabilityListenerRef.current = null;
        }
      });
      await LocalLLM.download();
    } catch (err) {
      availabilityListenerRef.current?.remove();
      availabilityListenerRef.current = null;
      setResponse(formatError(err));
    }
  };

  const onPromptBtn = async () => {
    setAwaitingResponse(true);
    setResponse(null);

    try {
      const res = await LocalLLM.prompt({
        prompt,
        sessionId: sessionId || undefined,
      });
      setResponse(res.text);
    } catch (err: unknown) {
      setResponse(formatError(err));
    } finally {
      setAwaitingResponse(false);
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
          {systemStatus && (
            <IonChip color={statusColor(systemStatus)}>
              <IonLabel>{systemStatus}</IonLabel>
            </IonChip>
          )}

          <IonTextarea
            fill="outline"
            labelPlacement="floating"
            label="Session ID (optional)"
            value={sessionId}
            onIonInput={(e) => setSessionId(e.detail.value ?? "")}
          />

          <IonTextarea
            fill="outline"
            labelPlacement="floating"
            label="Prompt"
            value={prompt}
            onIonInput={(e) => setPrompt(e.detail.value ?? "")}
          />

          <IonButton expand="block" disabled={awaitingResponse} onClick={onPromptBtn}>
            Send Prompt
          </IonButton>

          {awaitingResponse && (
            <div className="loading">
              <IonSpinner />
            </div>
          )}
          {response && <p className="response">{response}</p>}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
