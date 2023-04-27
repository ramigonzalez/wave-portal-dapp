import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import WavePortalJson from './utils/WavePortal.json';

export default function App() {
    
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState(0);
  const [mineLoading, setMineLoading] = useState(false);
  const [wrongNetworkError, setWrongNetworkError] = useState(false);
  
  const contractAddress = "0xB10e6469C48B3097E4EAB714E3cFD8b5558dd9b0";
  const contractABI = WavePortalJson.abi;
  const GOERLI_CHAIN_ID = 5;
  const GOERLI_NAME = "goerli";
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Garanta que possua a Metamask instalada!");
        return;
      } else {
        console.log("Temos o objeto ethereum", ethereum);
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

  /**
  * Implemente aqui o seu método connectWallet
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        // alert("MetaMask encontrada!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);

      await getTotalWaves();
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
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

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

  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

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

    if (!ethereum) {
      // alert("MetaMask encontrada!");
      return;
    }
    
    ethereum.on("chainChanged", () => {
      alert("chain changed");
      setWrongNetworkError(true);
      getChainId();
    });
    
    ethereum.on("accountsChanged", () => {
        alert("account changed");
        setCurrentAccount(null);
        setTotalWaves(0);
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
    getTotalWaves();
    setListeners();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        { wrongNetworkError && <div className="top warning">Only Goerli network is supported</div> }

        {/* <div className="connectWallet">
        {
          !currentAccount && 
          (
            <button className="waveButton" onClick={connectWallet}>
              Conectar carteira
            </button>
          )
        }
        </div> */}
        <div className="header">
        { currentAccount ? 
        (<p>👋 Hi {currentAccount}</p>) 
        :           
        (
          <div className="headerContainer">
        <p>👋 Hi everyone</p>
        <button className="waveButton btnHeader" onClick={connectWallet}>
              Conectar carteira
            </button>
          </div>) }
        </div>

        <div className="bio">
          I'm Ramiro Gonzalez, and now I'm learning how to work with smart contracts.
        </div>

        {
          !currentAccount && (
            <div className="bio">
This is just an example so, please connect your metamask wallet and send me a wave!
        </div>
          )
        }

        {
          (currentAccount && !wrongNetworkError) &&
        (<div>
          <div className="bio">Here you will visualize all waves that people already sent to me.</div>
          <div className="bio counter">Total wave count: {totalWaves}</div>
          </div>)
        }

        <div className="btnContainer">
        {
          !mineLoading ? 
          (
            <button disabled={!currentAccount || wrongNetworkError} className="waveButton" onClick={wave}>
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