const CONTRACT_ADDRESSES = {
  goerli: "0x16E1aB79ad10d182a6D79236Eb9205c267FF65A2",
  sepolia: "0x5b1A0ECaE2e31E829D33E1A6053D2661cDd2AC8d",
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
