require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: { version: "0.8.17", settings: { optimizer: { enabled: true, runs: 200 } }},
	paths: {
		artifacts: "./src/artifacts",
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},
		polygon_mumbai: {
			url: `https://polygon-mumbai.g.alchemy.com/v2/VU5Z6_VJgdMUgrcfhGsHk2o5tzEfFbhT`, // enter polygon alchemy rpcURL here
			accounts: ["225546c2d681f91ee603aeca9f32b1c5eda0758187f5cb7e6d5d9b4774a00ade"], // add admin's private key in this
			allowUnlimitedContractSize: true,
		},
	},
};
