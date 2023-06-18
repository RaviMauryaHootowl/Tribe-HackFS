import Cookies from "js-cookie";
import axios from "axios";
import notify from "./notify";
import { notifyPromise, notifyResolve } from "./notify";
import { ethers } from "ethers";
import { Magic } from "magic-sdk";
import { ContractABI, ContractAddress } from "./constants";
import { OAuthExtension } from "@magic-ext/oauth";

export const logoutHandler = (dispatch) => {
    console.log("Loggin out");
    dispatch({ type: "UNSET_USER" });
    Cookies.remove("user");
    dispatch({ type: "UNSET_JWT" });
    Cookies.remove("jwt");
    // navigate('/');
    // console.log('user',state.user)
};

export const loginWithGoogle = async (dispatch, code) => {
    const notifyId = notifyPromise("Google Logging...", "info");
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API}/user/googleLogin`,
            {
                code: code,
            }
        );
        console.log(response);
        var inThirtyMins = new Date(new Date().getTime() + 30 * 60 * 1000);
        dispatch({
            type: "SET_USER",
            payload: response.data.user_instance,
            time: inThirtyMins,
        });
        Cookies.set("user", JSON.stringify(response.data.user_instance));
        dispatch({
            type: "SET_JWT",
            payload: response.data.token,
            time: inThirtyMins,
        });
        Cookies.set("jwt", response.data.token);
        response.data.isNewUser
            ? notifyResolve(notifyId, "Signed Up", "success")
            : notifyResolve(notifyId, "Logged In", "success");
        return true;
    } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
            notifyResolve(notifyId, error?.response?.data?.message, "error");
        } else {
            notifyResolve(notifyId, error.message, "error");
        }
        return false;
    }
};

export const connectToMetamask = async (dispatch) => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
        console.log("No metamask");
        notify("Please use a browser with Metamask", "info");
        return;
    }

    const chainId = 137;
    const requrestNetworkSuccess = await requestNetwork(chainId);
    if (!requrestNetworkSuccess) {
        console.log("Not able to change network");
        return;
    }
    const notifyId = notifyPromise("Connecting to MetaMask...", "info");
    try {
        const web3 = new ethers.providers.Web3Provider(window.ethereum, "any");
        await web3.send("eth_requestAccounts", []);
        const signer = web3.getSigner();
        console.log("Account:", await signer.getAddress());
        const message = await axios
            .get(`${process.env.REACT_APP_API}/user/getToken`)
            .then((res) => {
                console.log(res);
                return res.data.message;
            });

        const verifiedMessage = await axios.post(
            `${process.env.REACT_APP_API}/user/verifyToken`,
            {
                address: await web3.getSigner().getAddress(),
                signature: await web3.getSigner().signMessage(message),
            }
        );

        const signerAddress = await web3.getSigner().getAddress();

        if (verifiedMessage.data.message === "Token verified") {
            const userRes = await axios
                .get(
                    `${process.env.REACT_APP_API}/user/getUser/${signerAddress}`
                );
            const userBackend = userRes.data;
            console.log(userBackend);

            // add token to user object

            // console.log('user',userBackend);

            var inThirtyMins = new Date(new Date().getTime() + 30 * 60 * 1000);

            dispatch({
                type: "SET_USER",
                payload: userBackend,
                time: inThirtyMins,
            });

            console.log("SETTING USER", userBackend);

            Cookies.set("user", JSON.stringify(userBackend));

            dispatch({
                type: "SET_JWT",
                payload: verifiedMessage.data.token,
                time: inThirtyMins,
            });

            Cookies.set("jwt", verifiedMessage.data.token);
            notifyResolve(notifyId, "Connected to Metamask", "success");
            return true;
        }
    } catch (error) {
        if (error?.response?.data?.message) {
            notifyResolve(notifyId, error?.response?.data?.message, "error");
        } else {
            notifyResolve(notifyId, error.message, "error");
        }
        return false;
    }
};

// const registerContributor = (magic, userAddress) => {
//     return new Promise(async (resolve, reject) => {
//         const biconomy = new Biconomy(magic.rpcProvider, {
//             apiKey: process.env.REACT_APP_BICONOMY_API,
//             debug: true,
//             contractAddresses: [ContractAddress],
//         });
//         await biconomy.init();
//         const provider = await biconomy.provider;
//         const contractInstance = new ethers.Contract(
//             ContractAddress,
//             ContractABI,
//             biconomy.ethersProvider
//         );
//         console.log(contractInstance);

//         const { data } =
//             await contractInstance.populateTransaction.RegisterContributor(
//                 "Contributor Name"
//             );
//         let txParams = {
//             data: data,
//             to: ContractAddress,
//             from: userAddress,
//             signatureType: "EIP712_SIGN",
//         };

//         const res = await provider.send("eth_sendTransaction", [txParams]);
//         console.log(res);

//         biconomy.on("txHashGenerated", (data) => {
//             console.log(data);
//         });

//         biconomy.on("txMined", (data) => {
//             console.log(data);
//             resolve(data);
//         });

//         biconomy.on("onError", (data) => {
//             console.log(data);
//             reject(data);
//         });

//         biconomy.on("txHashChanged", (data) => {
//             console.log(data);
//         });
//     });
// };

// const registerCreator = (magic, userAddress) => {
//     return new Promise(async (resolve, reject) => {
//         const biconomy = new Biconomy(magic.rpcProvider, {
//             apiKey: process.env.REACT_APP_BICONOMY_API,
//             debug: true,
//             contractAddresses: [ContractAddress],
//         });
//         await biconomy.init();
//         const provider = await biconomy.provider;
//         const contractInstance = new ethers.Contract(
//             ContractAddress,
//             ContractABI,
//             biconomy.ethersProvider
//         );
//         console.log(contractInstance);

//         const { data } =
//             await contractInstance.populateTransaction.RegisterCreator(
//                 "Creator name",
//                 "youtube",
//                 1000
//             );
//         let txParams = {
//             data: data,
//             to: ContractAddress,
//             from: userAddress,
//             signatureType: "EIP712_SIGN",
//         };

//         const res = await provider.send("eth_sendTransaction", [txParams]);
//         console.log(res);

//         biconomy.on("txHashGenerated", (data) => {
//             console.log(data);
//         });

//         biconomy.on("txMined", (data) => {
//             console.log(data);
//             resolve(data);
//         });

//         biconomy.on("onError", (data) => {
//             console.log(data);
//             reject(data);
//         });

//         biconomy.on("txHashChanged", (data) => {
//             console.log(data);
//         });
//     });
// };

export const magicLogin = async (state, dispatch, did, userInfo, isCreator) => {
    console.log("magic loggin in", did, userInfo);
    try {
        const API_URL_SUFFIX = isCreator
            ? "magicLoginCreator"
            : "magicLoginUser";
        const userBackend = await axios.post(
            `${process.env.REACT_APP_API}/user/${API_URL_SUFFIX}`,
            {
                didToken: did,
                userInfo,
            }
        );
        console.log(userBackend);

        const inThirtyMins = new Date(new Date().getTime() + 30 * 60 * 1000);

        dispatch({
            type: "SET_USER",
            payload: userBackend.data.user_instance,
            time: inThirtyMins,
        });
        Cookies.set("user", JSON.stringify(userBackend.data.user_instance));

        dispatch({
            type: "SET_JWT",
            payload: userBackend.data.token,
            time: inThirtyMins,
        });
        Cookies.set("jwt", userBackend.data.token);
        return userBackend.data;
    } catch (error) {
        return {};
    }
};

const requestNetwork = async (chainId) => {
    console.log(window.ethereum.networkVersion);
    if (window.ethereum.networkVersion !== chainId) {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: ethers.utils.hexValue(chainId) }],
            });
        } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask
            console.log(error);
            if (error.code === 4902) {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainName: "Polygon Mainnet",
                            chainId: ethers.utils.hexValue(chainId),
                            nativeCurrency: {
                                name: "MATIC",
                                decimals: 18,
                                symbol: "MATIC",
                            },
                            rpcUrls: ["https://polygon-rpc.com/"],
                        },
                    ],
                });
            } else {
                notify(error.message, "error");
                return false;
            }
        }
    }
    return true;
};
