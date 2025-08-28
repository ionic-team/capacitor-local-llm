import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from "@ionic/react";
import { LocalLLM } from "@capacitor/local-llm";

import "./Home.css";

const Home: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<string>("---");
  const [prompt, setPrompt] = useState<string>("What is an LLM?");
  const [response, setResponse] = useState<string>("---");
  const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

  const onStatusBtn = async () => {
    const res = await LocalLLM.systemAvailability();
    setSystemStatus(res.status);
  };

  const onPromptBtn = async () => {
    setAwaitingResponse(true);

    const res = await LocalLLM.prompt({
      prompt,
    });

    setAwaitingResponse(false);

    setResponse(res.text);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Capacitor Local LLM</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Capacitor Local LLM</IonTitle>
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

export default Home;
