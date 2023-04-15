import React, { useState, useEffect, useContext } from "react";
import Wenb3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";

//INTERNAL  IMPORT
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Wenb3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract");
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Discover, collect, and sell NFTs";

  //------USESTATE
  const [currentAccount, setCurrentAccount] = useState("");

  const checkContract = async () => {
    const contract = await connectingWithSmartContract();
    console.log(contract);
  };

  //---CHECK IF WALLET IS CONNECTD
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        setError("No Account Found");
        setOpenError(true);
      }
    } catch (error) {
      setError("Something wrong while connecting to wallet");
      setOpenError(true);
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  //---CONNET WALLET FUNCTION
  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      // window.location.reload();
    } catch (error) {
      setError("Error while connecting to wallet");
      setOpenError(true);
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        checkContract,
        checkIfWalletConnected,
        connectWallet,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
