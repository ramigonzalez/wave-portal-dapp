const CONTRACT_ADDRESSES = {
  sepolia: "0x768Ea872179723d5378A13A4ff68368bA2bA07De",
  goerli: "0x3BA20f8E0CedEB01a4799fEaECFa8ee9B70b61b4",
};

const ALLOWED_NETWORKS = {
  goerli: {
    chainId: 5,
    name: "goerli",
  },
  sepolia: {
    chainId: 11155111,
    name: "sepolia",
  },
};

const EVENTS = {
  NEW_WAVE: "NewWave",
};

const export_ = { CONTRACT_ADDRESSES, ALLOWED_NETWORKS, EVENTS };

export default export_;
