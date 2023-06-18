import { ethers } from "ethers";
// import { namehash } from "ethers/lib/utils.js";
// import publicResolverAbi from "./PublicResolver.json";

export const flattenObj = (obj, parent, res = {}) => {
    try {
        for (const key of Object.keys(obj)) {
            const propName = parent ? parent + "." + key : key;
            if (typeof obj[key] === "object") {
                flattenObj(obj[key], propName, res);
            } else {
                res[propName] = obj[key];
            }
        }
    } catch (e) {
        // console.log(e);
    }
    console.log(res);
    return res;
};

export const returnShortAddress = (address) => {
    if (address)
        return (
            address.substring(0, 6) +
            "..." +
            address.substring(address.length - 4, address.length)
        );
};

export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

export const isValid = (text) => {
    return text != null && text != undefined && text.replace(" ", "") != "";
};

export const ensNameToAddressResolution = async (ensName) => {
    const provider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com");
    const address = await provider.resolveName(ensName);
    return address;
};

export const addressToENSNameResolution = async (address) => {
    const provider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com");
    const name = await provider.lookupAddress(address);
    return name;
};


// const createContract = (address, abi, provider) => {
//   let ethersProvider = provider;
//   // Convert regular provider to ethers provider
//   if (!ethersProvider.getSigner) ethersProvider = new ethers.providers.Web3Provider(provider);
//   // Use signer if available, otherwise use provider
//   const signer = ethersProvider.getSigner();
//   return new ethers.Contract(address, abi, signer || ethersProvider);
// };

// export const nameToAvatarResolution = async (name) => {
// 	const provider = new ethers.providers.Web3Provider(window.ethereum);
// 	const publicResolver = createContract("0x42D63ae25990889E35F215bC95884039Ba354115", publicResolverAbi, provider);
//   console.log(publicResolver);
// 	const uri = await publicResolver.text(namehash(name), "avatar");
// 	return uri;
// }