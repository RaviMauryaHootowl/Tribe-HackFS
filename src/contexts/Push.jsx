import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";

const PK = "d78a037d53c4d0bf724f3de20add6d53da42bee3334718dd85708865d3023ce3"; // channel private key
const Pkey = `0x${PK}`;
const _signer = new ethers.Wallet(Pkey);

// const magic = new Magic(process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY, {
//   network: {
//     rpcUrl: process.env.REACT_APP_RPC_URL,
//     chainId: 80001,
//   },
//   extensions: [new OAuthExtension()],
// });

// console.log(magic);

// const rpcProvider = new ethers.providers.Web3Provider(magic.rpcProvider);
// const _signer = rpcProvider.getSigner();

export const getNotifications = async (userAddr) => {
  const notifications = await PushAPI.user.getFeeds({
    user: userAddr, // user address in CAIP
    env: "staging",
  });
  console.log("notifications", notifications);
};

export const getSubs = async (userAddr) => {
  console.log("Getting subs", userAddr);
  const subscriptions = await PushAPI.user.getSubscriptions({
    user: userAddr, // user address in CAIP
    env: "staging",
  });
  console.log("Subs received");
  console.log("subscriptions", subscriptions);
  // for (let i in subscriptions) {
  //   if (i == "0xE43c72272d597D06FFe0AF1B5416cb21a0d18d29") return true;
  // }
  // return false;
};

export const subscribe = async (channelAddr, userAddr) => {
  console.log("user Address", userAddr)
  const res = await PushAPI.channels.subscribe({
    signer: _signer,
    channelAddress: "0xE43c72272d597D06FFe0AF1B5416cb21a0d18d29", // channel address in CAIP
    userAddress: userAddr, // user address in CAIP
    onSuccess: () => {
      console.log("Channel opted successfully");
    },
    onError: () => {
      console.log("Channel not opted");
    },
    env: "staging",
  });
};

export const sendNotif = async (
  notificationTitle,
  notificationBody,
  payloadTitle,
  payloadBody,
  cta,
  img
) => {
  try {
    console.log("Inside");
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer: _signer,
      type: 1, // broadcast
      identityType: 2, // direct payload
      notification: {
        title: notificationTitle || `My Title`,
        body: notificationBody || `This is the body of Title notification`,
      },
      payload: {
        title: payloadTitle || `New payload title`,
        body: payloadBody || `New msg body`,
        cta: cta || "",
        img: img || "",
      },
      channel: "0xE43c72272d597D06FFe0AF1B5416cb21a0d18d29", // your channel address
      env: "staging",
    });
    console.log("Inside2");
  } catch (err) {
    console.error("Error: ", err);
  }
};

export const receiveNotifications = async (currentAccount) => {
  console.log(`Listening...${currentAccount}`);
  const notifications = await PushAPI.user.getFeeds({
    user: `${currentAccount}`, // user address in CAIP
    env: "staging",
  });
  console.log("Listening completed", notifications);
};

// sendNotification();

// export default sendNotification;
