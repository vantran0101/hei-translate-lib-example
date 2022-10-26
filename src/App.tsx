import React, { useEffect, useRef, useState } from 'react';
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
  const [fullText, setFullText] = useState<string>('');
  const [originalLang, setOriginalLang] = useState<string>('en-Us');

  const scrollRef = useRef<null | HTMLDivElement>(null);

  const callbackonTextRecognizing = (e: string) => {
    setOriginalVoice(e);
  }

  const callbackOnTextRecognized = (e: string) => {
    console.log('Translated : ', e);
    setTranslatedVoice(e);
  }

  useEffect(() => {
    if (translatedVoice) {
      const temp = fullText + `<div style="color: #61dafb">Original:  <span>${originalVoice}</span></div>`
      const fulltext2 = temp + ` <div style="color: #61dafb">Translated:  <span>${translatedVoice}</span></div><p></p>`
      setFullText(fulltext2);
      window.scrollTo(0, (scrollRef?.current?.offsetTop || 0) - 300);
    }
  }, [translatedVoice])

  useEffect(() => {
    voiceRecognition = new RoomClient(
      (textRecognizing: string) => callbackonTextRecognizing(textRecognizing),
      (textRecognized: string) => callbackOnTextRecognized(textRecognized)
    );

    voiceRecognition.initTranslation('9a5ce5f10a64d86a0eb9e15be562249', 'en-Us', 'vi-VN');
  }, [])

  const [originalLanguage, setOriginalLanguage] = useState(["en-US", "vi-VN", "fr-FR", "ja-JP"])
  const [translatedLanguage, setTranslatedLanguage] = useState(["vi-VN", "en-US", "fr-FR", "ja-JP"])
  const Add = originalLanguage.map(Add => Add)
  const Add2 = translatedLanguage.map(Add => Add)
  const [showLanguage, setShowLanguage] = useState('en-US')

  const handleOriginalLanguage = (e: any) => {
    console.log((originalLanguage[e.target.value]));
    voiceRecognition?.changeLanguage(originalLanguage[e.target.value]);
    setShowLanguage(originalLanguage[e.target.value])
  }

  const handleTranslateLanguage = (e: any) => {
    console.log((translatedLanguage[e.target.value]));
    voiceRecognition?.changeTranslateLanguage(translatedLanguage[e.target.value]);
  }

  return (
    <div className="App">
      <header className="App-header">

        <div className="info">
          <img src={'https://uploads-ssl.webflow.com/62a9b06138aac5c00fbb5f5e/62ad49be82ada255cc95750b_HEI%20LOGO.svg'} className="App-logo" alt="logo" />
          <p>
            Heitech Voice Translate Example
          </p>

          {isListening && <button className="btn btn-primary" onClick={() => {
            voiceRecognition?.close();
            setIsListening(false)
          }}>TURN LISTENER OFF</button>}

          {!isListening && <button className="btn btn-primary" onClick={() => {
            voiceRecognition?.open();
            setIsListening(true)
          }}>TURN LISTENER ON</button>}
        </div>
        <div className="translateLanguage">
          <label>Original Languages: </label>
          < select
            onChange={e => handleOriginalLanguage(e)}
            className="form-select" >
            {
              Add.map((language, key) => <option value={key}>{language}</option>)
            }
          </select >
          <label>Translate Languages: </label>
          < select
            onChange={e => handleTranslateLanguage(e)}
            className="form-select" >
            {
              Add2.map((language, key) => <option value={key}>{language}</option>)
            }
          </select >
        </div>
        <div className="content">
          <div
            dangerouslySetInnerHTML={{ __html: fullText }}
          />
          <div className="realtime" ref={scrollRef} id="scroll" >
            <div style={{ color: "#61dafb" }}>Original Voice ({showLanguage}):  <span>{originalVoice}</span></div>
          </div>
        </div>
      </header>

    </div>
  );
}

export default App;
