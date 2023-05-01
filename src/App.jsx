import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import WavePortalJson from './utils/WavePortal.json';
import CONSTANTS from "./constants";
const contractABI = WavePortalJson.abi;

export default function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  
  const [mineLoading, setMineLoading] = useState(false);
  const [totalWaves, setTotalWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  
  
  const [name, setName] = useState("");
  const [waveMessage, setWaveMessage] = useState("");
  const [nameInput, setNameInput] = useState(false);
  
  const [wrongNetworkError, setWrongNetworkError] = useState(false);


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask wallet must be installed!");
        return;
      } else {
        console.log("Ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Encontrada a conta autorizada:", account);
        setCurrentAccount(account);
        const network = await getChainInfo();
        const actualContractAddress = await getContractAddress(network);
        await getAllWaves(actualContractAddress);
        await getTotalWaves(account, actualContractAddress);
        await getName(actualContractAddress);
      } else {
        console.log("Nenhuma conta autorizada foi encontrada")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("window.ethereum.selectedAddress", window.ethereum.selectedAddress);

      const account = accounts[0];
      console.log("Conectado", account);
      setCurrentAccount(account);

      await getTotalWaves(account);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
  
      if (!currentAccount) {
        alert("Please connect your wallet again");
        return;
      }

      if (!waveMessage) {
        alert("Give me a cooler wave sending me a message");
        return;
      }
      
      const { ethereum } = window;

      if (ethereum) {

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.totalWaves();
        console.log("Retreiving total waves count...", count.toNumber());

        setMineLoading(true);
        
        const waveTxn = await wavePortalContract.wave(waveMessage);

        console.log("Mining wave tx...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined tx ->", waveTxn.hash);
        
        setMineLoading(false);
        
        count = await wavePortalContract.totalWaves();
        console.log("Total wave count...", count.toNumber());

        setTotalWaves(count.toNumber());

        await getAllWaves();

      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
      setMineLoading(false);
    }
  }

  const getName = async (actualContractAddress) => {
    const contract = !contractAddress ? actualContractAddress : contractAddress;
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contract, contractABI, signer);
        const name = await wavePortalContract.getName();
        console.log(`Retrieving waver's name: ${name}`);
        setName(name);
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error)
    }
  };

  const getTotalWaves = async (account, actualContractAddress) => {
    console.log(account, actualContractAddress);
    if (!account && !currentAccount) return;
    const contract = !contractAddress ? actualContractAddress : contractAddress;
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contract, contractABI, signer);
        let count = await wavePortalContract.totalWaves();
        console.log("Retreiving total waves count...", count.toNumber());
        setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error)
    }
  };

  const setListeners = async () => {
    const { ethereum } = window;

    if (!ethereum) return;

    ethereum.on("chainChanged", async () => {
      // alert("chain changed");
      setWrongNetworkError(true);
      const network = await getChainInfo();
      const actualContractAddress = await getContractAddress(network);
      await getAllWaves(actualContractAddress);
      await getTotalWaves(null, actualContractAddress);
      await getName(actualContractAddress);
    });
    
    ethereum.on("accountsChanged", async () => {
      // alert("account changed");
      setCurrentAccount(null);
      setTotalWaves(0);
      await connectWallet();
    });
  };

  const getChainInfo = async () => {
    console.log("Getting nework name and id...");
    try {
      const chainId = Number(await window.ethereum.request({ method: "eth_chainId" }));
      const network = ethers.providers.getNetwork(chainId);
      console.log(`Network name: ${network.name}, id:${network.chainId}`);
      setWrongNetworkError(!isSupportedNetwork(network));
      return network;
    } catch (error) {
      console.log(error);
    }
  };

  const getContractAddress = async (network) => {
    const actualContractAddress = getContractAddressFromNetwork(network); 
    console.log(`Contract address set with address: ${actualContractAddress}`);
    setContractAddress(actualContractAddress);
    return actualContractAddress;
  };

  const isGoerliNetwork = ({ name, chainId }) => {
    const goerli = CONSTANTS.ALLOWED_NETWORKS.goerli;
    return chainId === goerli.chainId && name === goerli.name;
  };
  
  const isSepoliaNetwork = ({ name, chainId }) => {
    const sepolia = CONSTANTS.ALLOWED_NETWORKS.sepolia;
    return chainId === sepolia.chainId && name === sepolia.name;
  };
  
  const getContractAddressFromNetwork = (network) => {
    if (isGoerliNetwork(network)) return CONSTANTS.CONTRACT_ADDRESSES.goerli;
    if (isSepoliaNetwork(network)) return CONSTANTS.CONTRACT_ADDRESSES.sepolia;
  };

  const isSupportedNetwork = (network) => {
    return isGoerliNetwork(network) || isSepoliaNetwork(network);
  };
  
  const getAllWaves = async (actualContractAddress) => {
    const contract = !contractAddress ? actualContractAddress : contractAddress;
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contract, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => ({
          address: wave.waver,
          name: wave.name,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        })).reverse();
        
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object not found!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const disconnectWallet = async () => {
    refreshState();
  };

  const refreshState = () => {
    setCurrentAccount(null);
    setTotalWaves(0);
    setMineLoading(false);
    setWrongNetworkError(false);
  };

  const setNameOnBlockchain = async () => {
    if(!name) {
      alert("Name cannot be empty");
      return;
    }
    try {
      const { ethereum } = window;
      if (!ethereum) { 
        console.log("Ethereum object not found!")
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      setMineLoading(true);
      const tx = await wavePortalContract.setName(name);
      console.log("Mining name tx...", tx.hash);
      await tx.wait();
      console.log("Mined tx ->", tx.hash);
      setMineLoading(false);
      console.log("Name set as...", name);
      setName(name);
      setNameInput(false)
    } catch (error) {
      console.log(error);
      setMineLoading(false);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    setListeners();
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        
        {
          wrongNetworkError &&
          <div className="top warning">Only Goerli network is supported</div>
        }

        <div className="header">
        { 
          currentAccount
          ? (
              <div className="headerContainer">
                <div>{ !name 
                    ? <p>👋 Hi {currentAccount}</p>
                    : <div>
                      <p>👋 Hi {name}</p>
                      <p className="bio">Address: {currentAccount}</p> 
                    </div> 
                  }
                </div>
                { !wrongNetworkError && 
                  <div>
                    <button className="waveButton btnHeader" onClick={disconnectWallet}>Logout</button>
                    { !nameInput 
                      ? <button className="waveButton btnHeader" onClick={() => setNameInput(true)}>Update name</button>
                      : 
                        <div>
                          <input type="text" value={name} onChange={e=>setName(e.target.value)}/>
                          <button className="waveButton btnHeader cancel" onClick={() => setNameInput(false)}>Cancel</button>
                          <button className="waveButton btnHeader" onClick={() => setNameOnBlockchain()}>Submit</button>
                        </div>
                    }
                  </div>
                }
              </div>

            )
          : (
              <div className="headerContainer">
                <p>👋 Hi everyone</p>
                <button className="waveButton btnHeader" onClick={connectWallet}>Connect wallet</button>
              </div>
            )
        }
        </div>

        <div className="bio">
          I'm Ramiro Gonzalez, and now I'm learning how to work with smart contracts.
        </div>

        {
          !currentAccount &&
          (
            <div className="bio">
              This is just an example so, please connect your metamask wallet and send me a wave!
            </div>
          )
        }

        {
          (currentAccount && !wrongNetworkError) &&
          (
            <div>
              <div className="bio">Here you will visualize all waves that people already sent to me.</div>
              <div className="bio counter">Total wave count: {totalWaves}</div>
            </div>
          )
        }

        <div className="">
        {
          !mineLoading ?
          (
            <div className="input">
              <div>
                <p>Leave me a message:</p>
                <textarea placeholder="Give me a cool wave ..." onChange={e => setWaveMessage(e.target.value)}/>
              </div>
              <div className="btnContainer">
                <button
                  disabled={!currentAccount || wrongNetworkError}
                  className="waveButton"
                  onClick={wave}
                  >
                  Send wave 🌟
                </button>
              </div>
            </div>
          )
          : (<div className="btnContainer"><div className="loading"></div></div>)
        }
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              { !!wave.name && (<div>Name: {wave.name}</div>) }
              <div>Datetime: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}