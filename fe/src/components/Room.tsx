import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";

const URL = "http://localhost:3000";

export const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [searchParam, setSearchParam] = useSearchParams();
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | undefined>();
  const localVideoRef = useRef<HTMLVideoElement | undefined>();

  useEffect(() => {
    const socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      // setConnected(true);
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      if (localAudioTrack && localVideoTrack) {
        pc.addTrack(localAudioTrack);
        pc.addTrack(localVideoTrack);
      }
      pc.onicecandidate = async (e) => {
        socket.emit("add-ice-candidate", {
          candidate: e.candidate,
          type: "sender",
          roomId,
        });
      };
      pc.onnegotiationneeded = async () => {
        setTimeout(async () => {
          const sdp = await pc.createOffer();
          pc.setLocalDescription(sdp);
          socket.emit("offer", {
            roomId,
            sdp,
          });
        }, 2000);
      };
    });
    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      // setConnected(true);
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);
      setReceivingPc(pc);
      pc.onicecandidate = async (e) => {
        socket.emit("add-ice-candidate", {
          candidate: e.candidate,
          type: "receiver",
          roomId,
        });
      };
      pc.ontrack = (e) => {
        const { track, type } = e;
        if (type == "audio") {
          // setRemoteAudioTrack(track);
          // @ts-ignore
          remoteVideoRef.current?.srcObject?.addTrack(track);
        } else {
          // @ts-ignore
          remoteVideoRef.current?.srcObject?.addTrack(track);
          // setRemoteVideoTrack(track);
        }
        remoteVideoRef.current?.play();
      };
      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;
        if (track1.kind === "video") {
          setRemoteVideoTrack(track1);
          setRemoteAudioTrack(track2);
        } else {
          setRemoteVideoTrack(track2);
          setRemoteAudioTrack(track1);
        }
        // @ts-ignore
        remoteVideoRef.current?.srcObject?.addTrack(track1);
        // @ts-ignore
        remoteVideoRef.current?.srcObject?.addTrack(track2);
        remoteVideoRef.current?.play();
      },5000);
    });
    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      // setConnected(true);
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
    });
    socket.on("lobby", () => {
      setLobby(true);
    });
    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type === "sender") {
        setReceivingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });
    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoRef.current.play();
    }
  }, [localVideoRef]);

  return (
    <div>
      Hi {name}
      <video autoPlay width={400} height={400} ref={localVideoRef} />
      {lobby ? "Waiting to connect you to someone" : null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};
