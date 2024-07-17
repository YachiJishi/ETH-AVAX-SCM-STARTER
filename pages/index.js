import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uniqueContract_abi from "../artifacts/contracts/UniqueContract.sol/UniqueContract.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [tickets, setTickets] = useState(0);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = uniqueContract_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      setAccount(account);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getContract();
  };

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

    setContract(contractInstance);
  };

  const getBalance = async () => {
    if (contract) {
      const balance = await contract.balance();
      setBalance(balance);
    }
  };

  const handleTicketChange = (e) => {
    setTickets(e.target.value);
  };

  const buyTickets = async () => {
    if (contract) {
      let ticketValue = ethers.utils.parseEther((tickets * 0.01).toString());
      let tx = await contract.buyTickets(tickets, { value: ticketValue });
      await tx.wait();
      getBalance();
    }
  };

  const drawWinner = async () => {
    if (contract) {
      let tx = await contract.drawWinner();
      await tx.wait();
      getBalance();
    }
  };

  const transferOwnership = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    if (!newOwnerAddress) {
      alert("Please enter a valid new owner address");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getContract();

    try {
      await contract.transferOwnership(newOwnerAddress);
      setAccount(newOwnerAddress);
      alert(`Ownership transferred successfully to ${newOwnerAddress}`);
    } catch (error) {
      alert(`Failed to transfer ownership: ${error.message}`);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this application.</p>;
    }

    if (!account) {
      return (
        <button className="connect-button" onClick={connectAccount}>
          Connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="user-info">
        <p className="account-info">Your Account: {account}</p>
        <p className="balance-info">
          Contract Balance: {balance && ethers.utils.formatEther(balance)} ETH
        </p>

        <input
          className="tickets-input"
          type="number"
          value={tickets}
          onChange={handleTicketChange}
          placeholder="Enter number of tickets"
        />
        <button className="buy-tickets-button" onClick={buyTickets}>
          Buy Tickets
        </button>

        <button className="draw-winner-button" onClick={drawWinner}>
          Draw Winner
        </button>

        <div className="ownership-section">
          <input
            className="new-owner-input"
            type="text"
            value={newOwnerAddress}
            onChange={(e) => setNewOwnerAddress(e.target.value)}
            placeholder="Enter new owner address"
          />
          <button className="ownership-button" onClick={transferOwnership}>
            Transfer Ownership
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Welcome to the Unique Contract App!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          min-height: 100vh;
          font-family: Arial, sans-serif;
        }

        .header {
          background-color: #007bff;
          color: white;
          padding: 1rem;
          width: 100%;
          text-align: center;
        }

        .title {
          margin: 0;
          font-size: 2rem;
        }

        .connect-button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
          border-radius: 4px;
        }

        .connect-button:hover {
          background-color: #218838;
        }

        .user-info {
          margin-top: 2rem;
          text-align: center;
        }

        .account-info {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .balance-info {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

.tickets-input {
          padding: 0.5rem;
          font-size: 1rem;
          width: 10rem;
          margin-right: 1rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .buy-tickets-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
        }

        .buy-tickets-button:hover {
          background-color: #0056b3;
        }

        .draw-winner-button {
          background-color: #ff0000;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
          border-radius: 4px;
        }

        .draw-winner-button:hover {
          background-color: #cc0000;
        }

        .ownership-section {
          margin-top: 1rem;
        }

        .new-owner-input {
          padding: 0.5rem;
          font-size: 1rem;
          width: 20rem;
          margin-right: 1rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .ownership-button {
          background-color: #ffc107;
          color: black;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
        }

        .ownership-button:hover {
          background-color: #e0a800;
        }
      `}</style>
    </main>
  );
}

