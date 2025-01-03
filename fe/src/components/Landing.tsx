import { useEffect, useRef, useState } from "react";
import { Room } from "./Room";
import { Link } from "react-router-dom";

export const Landing = () => {
  const [name, setName] = useState("");
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [joined, setJoined] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getStreaming = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const video = stream.getVideoTracks()[0];
    const audio = stream.getAudioTracks()[0];
    setLocalVideoTrack(video);
    setLocalAudioTrack(audio);
    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream([video]);
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (videoRef.current && videoRef) {
      getStreaming();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div>
        <video ref={videoRef} width={400}></video>
        <input
          type="text"
          placeholder="Enter Name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        ></input>
        <button
          onClick={() => {
            setJoined(true);
          }}
        >
          Join Room
        </button>
      </div>
    );
  }

  return (
    <Room
      name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};
