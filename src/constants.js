const CONTRACT_ADDRESSES = {
  goerli: "0x5b1A0ECaE2e31E829D33E1A6053D2661cDd2AC8d",
  sepolia: "0xb683b3BD996e06f67fA8e797d74a0cCB15925175",
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

export default { CONTRACT_ADDRESSES, ALLOWED_NETWORKS };
