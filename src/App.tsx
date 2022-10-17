import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { RoomClient } from '@heitech/voice-library-npm';

const listDevices = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
    return {};
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const devicesByKind: Record<string, Array<any>> = {};

    devices.forEach((device) => {
      const deviceInfo = {
        id: device.deviceId,
        label: device.label,
        kind: device.kind,
      };

      if (!devicesByKind[device.kind]) {
        devicesByKind[device.kind] = [];
      }
      devicesByKind[device.kind].push(deviceInfo);
    });

    return devicesByKind;
  } catch (err) {
    console.log(err);
    return {};
  }
}

// list devices
const devices = listDevices().then(data => {
  console.log(data);
})

// Enable mic (if you're in a meeting, do not need to do that)
navigator.mediaDevices.getUserMedia({ audio: true });

let voiceRecognition: RoomClient | null;

function App() {
  const [originalVoice, setOriginalVoice] = useState<string>('')
  const [translatedVoice, setTranslatedVoice] = useState<string>('')
  const [isListening, setIsListening] = useState<boolean>(true);

  const callbackonTextRecognizing = (e: string) => {
    setTranslatedVoice('');
    setOriginalVoice(e);
  }

  const callbackOnTextRecognized = (e: string) => {
    setTranslatedVoice(e)
  }

  useEffect(() => {
    voiceRecognition = new RoomClient(
      (textRecognizing: string) => callbackonTextRecognizing(textRecognizing),
      (textRecognized: string) => callbackOnTextRecognized(textRecognized)
    );

    voiceRecognition.initTranslation(YOUR_KEY, 'en-US', 'vi-VN');

  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={'https://uploads-ssl.webflow.com/62a9b06138aac5c00fbb5f5e/62ad49be82ada255cc95750b_HEI%20LOGO.svg'} className="App-logo" alt="logo" />
        <p>
          Heitech Voice Translate Example
        </p>

        {isListening && <button onClick={() => {
          voiceRecognition?.close();
          setIsListening(false)
        }}>TURN LISTENER OFF</button>}

        {!isListening && <button onClick={() => {
          voiceRecognition?.open();
          setIsListening(true)
        }}>TURN LISTENER ON</button>}
        <p></p>

        <div style={{ color: "#61dafb" }}>Original Voice: </div>
        <p>{originalVoice}</p>
        <div style={{ color: "#61dafb" }}>Translated Voice: </div>
        <p>{translatedVoice}</p>


      </header>
    </div>
  );
}

export default App;
