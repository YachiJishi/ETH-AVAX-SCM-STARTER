import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [operation, setOperation] = useState("deposit");
  const [amount, setAmount] = useState(0);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

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
    if (account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance);
    }
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleNewOwnerAddressChange = (e) => {
    setNewOwnerAddress(e.target.value);
  };

  const handleOperation = async () => {
    if (operation === "deposit") {
      await deposit();
    } else if (operation === "withdraw") {
      await withdraw();
    }
  };

  const deposit = async () => {
    if (atm) {
      let amountValue = ethers.utils.parseEther(amount.toString());
      let tx = await atm.deposit(amountValue);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let amountValue = ethers.utils.parseEther(amount.toString());
      let tx = await atm.withdraw(amountValue);
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
    getATMContract();

    try {
      await atm.transferOwnership(newOwnerAddress);
      alert(`Ownership transferred successfully to ${newOwnerAddress}`);
    } catch (error) {
      alert(`Failed to transfer ownership: ${error.message}`);
    }
  };

  const freezeAccount = async (freeze) => {
    if (atm) {
      let tx = await atm.freezeAccount(freeze);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
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
          Your Balance: {balance && ethers.utils.formatEther(balance)} ETH
        </p>

        <select className="operation-select" value={operation} onChange={handleOperationChange}>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>

        <input
          className="amount-input"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder={`Enter ${operation} amount`}
        />
        <button className="operation-button" onClick={handleOperation}>
          {operation}
        </button>

        <div className="ownership-section">
          <input
            className="new-owner-input"
            type="text"
            value={newOwnerAddress}
            onChange={handleNewOwnerAddressChange}
            placeholder="Enter new owner address"
          />
          <button className="ownership-button" onClick={transferOwnership}>
            Transfer Ownership
          </button>
        </div>

        <div className="freeze-section">
          <button className="freeze-button" onClick={() => freezeAccount(true)}>
            Freeze Account
          </button>
          <button className="unfreeze-button" onClick={() => freezeAccount(false)}>
            Unfreeze Account
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
        <h1 className="title">Welcome to the Metacrafters ATM!</h1>
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

        .operation-select {
          font-size: 1rem;
          padding: 0.5rem;
          margin-right: 1rem;
        }

        .amount-input {
          padding: 0.5rem;
          font-size: 1rem;
          width: 10rem;
          margin-right: 1rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .operation-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
        }

        .operation-button:hover {
          background-color: #0056b3;
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

        .freeze-section {
          margin-top: 1rem;
        }

        .freeze-button,
        .unfreeze-button {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
          margin: 0 0.5rem;
        }

        .freeze-button:hover,
        .unfreeze-button:hover {
          background-color: #5a6268;
        }
      `}</style>
    </main>
  );
}
