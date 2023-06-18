import React, {useContext, useRef, useState, useEffect} from "react";
import VideoPlayer from "./videoplayer";
import { usePushSocket } from "./usePushSocket";
import styled from "styled-components";
import { StoreContext } from "../../utils/Store";
import * as PushAPI from "@pushprotocol/restapi";
import { produce } from "immer";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";
import { ADDITIONAL_META_TYPE } from "@pushprotocol/restapi/src/lib/payloads/constants";
const Heading = styled.h1`
  margin: 20px 40px;
`;

const CallInfo = styled.p`
  margin: 20px 40px;
`;

const HContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 40px;
`;

const VContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  width: fit-content;
  height: fit-content;
`;

const env = "staging";

const VideoCall = () => {

    const { state, dispatch } = useContext(StoreContext);
  const chain = "80001";
  const [signer, setSigner] = useState();

    useEffect(() => {
        const magic = new Magic(
            process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY,
            {
                network: {
                    rpcUrl: process.env.REACT_APP_RPC_URL,
                    chainId: 80001,
                },
                extensions: [new OAuthExtension()],
            }
        );
        const rpcProvider = new ethers.providers.Web3Provider(
            magic.rpcProvider
        );
        const mySigner = rpcProvider.getSigner();
        setSigner(mySigner);
    }, [state.user.walletAddress]);

  const { pushSocket, isPushSocketConnected, latestFeedItem } = usePushSocket({
    env,
  });

  const videoObjectRef = useRef();
  const recipientAddressRef = useRef(null);
  const chatIdRef = useRef(null);

  const [data, setData] = useState(
    PushAPI.video.initVideoCallData
  );

  const setRequestVideoCall = async () => {
    // update the video call 'data' state with the outgoing call data
    videoObjectRef.current?.setData((oldData) => {
      return produce(oldData, (draft) => {
        if (!recipientAddressRef || !recipientAddressRef.current) return;
        if (!chatIdRef || !chatIdRef.current) return;

        draft.local.address = state.user.walletAddress;
        draft.incoming[0].address = recipientAddressRef.current.value;
        draft.incoming[0].status = PushAPI.VideoCallStatus.INITIALIZED;
        draft.meta.chatId = chatIdRef.current.value;
      });
    });

    // start the local media stream
    await videoObjectRef.current?.create({ video: true, audio: true });
  };

  const setIncomingVideoCall = async (
    videoCallMetaData
  ) => {
    // update the video call 'data' state with the incoming call data
    videoObjectRef.current?.setData((oldData) => {
      return produce(oldData, (draft) => {
        draft.local.address = videoCallMetaData.recipientAddress;
        draft.incoming[0].address = videoCallMetaData.senderAddress;
        draft.incoming[0].status = PushAPI.VideoCallStatus.RECEIVED;
        draft.meta.chatId = videoCallMetaData.chatId;
        draft.meta.initiator.address = videoCallMetaData.senderAddress;
        draft.meta.initiator.signal = videoCallMetaData.signalData;
      });
    });

    // start the local media stream
    await videoObjectRef.current?.create({ video: true, audio: true });
  };

  const acceptVideoCallRequest = async () => {
    if (!data.local.stream) return;

    await videoObjectRef.current?.acceptRequest({
      signalData: data.meta.initiator.signal,
      senderAddress: data.local.address,
      recipientAddress: data.incoming[0].address,
      chatId: data.meta.chatId,
    });
  };

  const connectHandler = (videoCallMetaData) => {
    videoObjectRef.current?.connect({
      signalData: videoCallMetaData.signalData,
    });
  };

  // initialize video call object
  useEffect(() => {
    if (!signer || !state.user.walletAddress || !chain?.id) return;

    (async () => {
      const user = await PushAPI.user.get({
        account: state.user.walletAddress,
        env,
      });
      let pgpPrivateKey = null;
      if (user?.encryptedPrivateKey) {
        pgpPrivateKey = await PushAPI.chat.decryptPGPKey({
          encryptedPGPPrivateKey: user.encryptedPrivateKey,
          account: state.user.walletAddress,
          signer,
          env,
        });
      }

      videoObjectRef.current = new PushAPI.video.Video({
        signer,
        chainId: chain.id,
        pgpPrivateKey,
        env,
        setData,
      });
    })();
  }, [signer, state.user.walletAddress, chain]);

  // after setRequestVideoCall, if local stream is ready, we can fire the request()
  useEffect(() => {
    (async () => {
      const currentStatus = data.incoming[0].status;

      if (
        data.local.stream &&
        currentStatus === PushAPI.VideoCallStatus.INITIALIZED
      ) {
        await videoObjectRef.current?.request({
          senderAddress: data.local.address,
          recipientAddress: data.incoming[0].address,
          chatId: data.meta.chatId,
        });
      }
    })();
  }, [data.incoming, data.local.address, data.local.stream, data.meta.chatId]);

  // establish socket connection
  useEffect(() => {
    if (!pushSocket?.connected) {
      pushSocket?.connect();
    }
  }, [pushSocket]);

  // receive video call notifications
  useEffect(() => {
    if (!isPushSocketConnected || !latestFeedItem) return;

    const { payload } = latestFeedItem || {};

    // check for additionalMeta
    if (
      !Object.prototype.hasOwnProperty.call(payload, "data") ||
      !Object.prototype.hasOwnProperty.call(payload["data"], "additionalMeta")
    )
      return;

    const additionalMeta = payload["data"]["additionalMeta"];
    console.log("RECEIVED ADDITIONAL META", additionalMeta);
    if (!additionalMeta) return;

    // check for PUSH_VIDEO
    if (additionalMeta.type !== `${ADDITIONAL_META_TYPE.PUSH_VIDEO}+1`) return;
    const videoCallMetaData = JSON.parse(additionalMeta.data);
    console.log("RECIEVED VIDEO DATA", videoCallMetaData);

    if (videoCallMetaData.status === PushAPI.VideoCallStatus.INITIALIZED) {
      setIncomingVideoCall(videoCallMetaData);
    } else if (
      videoCallMetaData.status === PushAPI.VideoCallStatus.RECEIVED ||
      videoCallMetaData.status === PushAPI.VideoCallStatus.RETRY_RECEIVED
    ) {
      connectHandler(videoCallMetaData);
    } else if (
      videoCallMetaData.status === PushAPI.VideoCallStatus.DISCONNECTED
    ) {
      window.location.reload();
    } else if (
      videoCallMetaData.status === PushAPI.VideoCallStatus.RETRY_INITIALIZED &&
      videoObjectRef.current?.isInitiator()
    ) {
      videoObjectRef.current?.request({
        senderAddress: data.local.address,
        recipientAddress: data.incoming[0].address,
        chatId: data.meta.chatId,
        retry: true,
      });
    } else if (
      videoCallMetaData.status === PushAPI.VideoCallStatus.RETRY_INITIALIZED &&
      !videoObjectRef.current?.isInitiator()
    ) {
      videoObjectRef.current?.acceptRequest({
        signalData: videoCallMetaData.signalingData,
        senderAddress: data.local.address,
        recipientAddress: data.incoming[0].address,
        chatId: data.meta.chatId,
        retry: true,
      });
    }
  }, [latestFeedItem]);

  return (
    <div>
      <Heading>Push Video SDK Demo</Heading>
      <CallInfo>Video Call Status: {data.incoming[0].status}</CallInfo>

      {/* <HContainer>
        <ConnectButton />
      </HContainer> */}

      {state.user.walletAddress ? (
        <>
          <HContainer>
            <input
              ref={recipientAddressRef}
              placeholder="recipient address"
              type="text"
            />
            <input ref={chatIdRef} placeholder="chat id" type="text" />
          </HContainer>

          <HContainer>
            <button
              disabled={
                data.incoming[0].status !==
                PushAPI.VideoCallStatus.UNINITIALIZED
              }
              onClick={setRequestVideoCall}
            >
              Request
            </button>

            <button
              disabled={
                data.incoming[0].status !== PushAPI.VideoCallStatus.RECEIVED
              }
              onClick={acceptVideoCallRequest}
            >
              Accept Request
            </button>

            <button
              disabled={
                data.incoming[0].status ===
                PushAPI.VideoCallStatus.UNINITIALIZED
              }
              onClick={() => videoObjectRef.current?.disconnect()}
            >
              Disconect
            </button>

            <button
              disabled={
                data.incoming[0].status ===
                PushAPI.VideoCallStatus.UNINITIALIZED
              }
              onClick={() =>
                videoObjectRef.current?.enableVideo({
                  state: !data.local.video,
                })
              }
            >
              Toggle Video
            </button>

            <button
              disabled={
                data.incoming[0].status ===
                PushAPI.VideoCallStatus.UNINITIALIZED
              }
              onClick={() =>
                videoObjectRef.current?.enableAudio({
                  state: !data.local.audio,
                })
              }
            >
              Toggle Audio
            </button>
          </HContainer>

          <HContainer>
            <p>LOCAL VIDEO: {data.local.video ? "TRUE" : "FALSE"}</p>
            <p>LOCAL AUDIO: {data.local.audio ? "TRUE" : "FALSE"}</p>
            <p>INCOMING VIDEO: {data.incoming[0].video ? "TRUE" : "FALSE"}</p>
            <p>INCOMING AUDIO: {data.incoming[0].audio ? "TRUE" : "FALSE"}</p>
          </HContainer>

          <HContainer>
            <VContainer>
              <h2>Local Video</h2>
              <VideoPlayer stream={data.local.stream} isMuted={true} />
            </VContainer>
            <VContainer>
              <h2>Incoming Video</h2>
              <VideoPlayer stream={data.incoming[0].stream} isMuted={false} />
            </VContainer>
          </HContainer>
        </>
      ) : (
        "Please connect your wallet."
      )}
    </div>
  );
}

export default VideoCall;