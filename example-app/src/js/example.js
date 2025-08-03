import { LocalLLM } from '@capacitor/local-llm';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    LocalLLM.echo({ value: inputValue })
}
