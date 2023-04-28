import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import WavePortalJson from './utils/WavePortal.json';
import { CONTRACT_ADDRESS, GOERLI_CHAIN_ID, GOERLI_NAME } from './constants';
const contractABI = WavePortalJson.abi;

export default function App() {
  
  const [currentAccount, setCurrentAccount] = useState(null);
  const [totalWaves, setTotalWaves] = useState(0);
  const [mineLoading, setMineLoading] = useState(false);
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
        await getChainId();
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
debugger
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
      
      const { ethereum } = window;

      if (ethereum) {

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de tchauzinhos...", count.toNumber());

        setMineLoading(true);
        
        const waveTxn = await wavePortalContract.wave();

        console.log("Minerando...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Minerado -- ", waveTxn.hash);
        
        setMineLoading(false);
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Total de tchauzinhos recuperado...", count.toNumber());

        setTotalWaves(count.toNumber());
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalWaves = async (account) => {
    if (!account && !currentAccount) return;
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de tchauzinhos...", count.toNumber());

        setTotalWaves(count.toNumber());
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error)
    }
  };

  const setListeners = async () => {
    const { ethereum } = window;

    if (!ethereum) return;

    ethereum.on("chainChanged", () => {
      alert("chain changed");
      setWrongNetworkError(true);
      getChainId();
    });
    
    ethereum.on("accountsChanged", async () => {
        // alert("account changed");
        setCurrentAccount(null);
        setTotalWaves(0);
        await connectWallet();
    });
    
    ethereum.on("disconnect", () => {
        alert("disconnect");
    });
  };

  const getChainId = async () => {
    console.log("Getting nework name and id...");
    try {
      const chainId = Number(await window.ethereum.request({ method: "eth_chainId" }));
      const network = ethers.providers.getNetwork(chainId);
      console.log(`Network name: ${network.name}, id:${network.chainId}`);
      setWrongNetworkError(!isGoerliNetwork(network));
    } catch (error) {
      console.log(error);
    }
  };

  const isGoerliNetwork = ({ name, chainId }) => {
    return chainId === GOERLI_CHAIN_ID && name === GOERLI_NAME;
  };
  
  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalWaves(currentAccount);
    setListeners();
  }, []);
  
  const disconnectWallet = async () => {
    refreshState();
  };

  const refreshState = () => {
    setCurrentAccount(null);
    setTotalWaves(0);
    setMineLoading(false);
    setWrongNetworkError(false);
  };

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
                <p>👋 Hi {currentAccount}</p>
                { !wrongNetworkError && <button className="waveButton btnHeader" onClick={disconnectWallet}>Logout</button> }
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

        <div className="btnContainer">
        {
          !mineLoading ?
          (
            <button
              disabled={!currentAccount || wrongNetworkError}
              className="waveButton"
              onClick={wave}
            >
              Send wave 🌟
            </button>
          )
          : (<div className="loading"></div>)
        }
        </div>
      </div>
    </div>
  );
}