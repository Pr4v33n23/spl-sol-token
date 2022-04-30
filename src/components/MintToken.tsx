import {
  Account,
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import React, { useRef } from "react";

window.Buffer = window.Buffer || require("buffer").Buffer;

const MintToken = () => {
  //Setting connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  //Generating a keypair to interact
  const fromWallet = Keypair.generate();

  const [createdToken, setCreatedToken] = React.useState("");
  const [mintedTokenTx, setMintedTokenTx] = React.useState("");
  const [tokenBalance, setTokenBalance] = React.useState("");
  const [tokenTransferTx, setTokenTransferTx] = React.useState("");

  const refMint = useRef<PublicKey>();
  const refFromTokenAccount = useRef<Account>();
  const refMintTx = useRef<string>();
  const refFromWallet = useRef(fromWallet);

  //token public key
  const toWallet = new PublicKey(
    "HXKqMFnrT5WybDMhg8wyqF3KFWEa9Tpxi793szZ7WHAV"
  );

  //Create token and associated token account
  async function createToken() {
    const fromAirdropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirdropSignature);

    //Creating a new token mint
    refMint.current = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9
    );
    setCreatedToken(refMint.current?.toBase58());
    console.log(`Create Token: ${refMint.current.toBase58()}`);

    refFromTokenAccount.current = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      refMint.current,
      fromWallet.publicKey
    );

    console.log(
      `Create Token Account ${refFromTokenAccount.current.address.toBase58()}`
    );
  }

  //Mint token with the token and account created
  async function mintToken() {
    const signature = await mintTo(
      connection,
      refFromWallet.current,
      refMint.current!,
      refFromTokenAccount.current?.address!,
      refFromWallet.current.publicKey,
      10000000000 //10 billion i.e 10tokens we are minting. P.S. 1 Billion = 1 token
    );
    refMintTx.current = signature;
    setMintedTokenTx(signature);
    console.log(`Mint signature: ${signature}`);
  }

  //Check token balance from the token address
  async function checkBalance() {
    //get the supply of tokens we have minted into existance
    const mintInfo = await getMint(connection, refMint.current!);
    console.log(mintInfo.supply);

    //get the amount of tokens left in the account
    const tokenAccountInfo = await getAccount(
      connection,
      refFromTokenAccount.current?.address!
    );
    setTokenBalance(tokenAccountInfo.amount.toString());
    console.log(tokenAccountInfo.amount);
  }

  //Send token to another wallet address
  async function sendToken() {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      refFromWallet.current,
      refMint.current!,
      toWallet
    );

    console.log(`toTokenAccount ${toTokenAccount.address}`);

    let signature = await transfer(
      connection,
      refFromWallet.current,
      refFromTokenAccount.current?.address!,
      toTokenAccount.address,
      refFromWallet.current.publicKey,
      1000000000
    );
    setTokenTransferTx(signature);
    console.log(`signature: ${signature}`);
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-3xl font-bold flex justify-center m-4">
        Mint Token Section
      </h3>
      <div className="flex space-x-2 justify-center m-2">
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={createToken}
        >
          Create Token
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={mintToken}
        >
          Mint Token
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={checkBalance}
        >
          Check Balance
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={sendToken}
        >
          Send Token
        </button>
      </div>
      <div className=" sm:text-xl flex flex-col justify-center font-bold m-4 border-2 border-gray-100 p-4 shadow-lg space-y-2 max-w-4xl">
        <div>
          {createdToken && (
            <p className="truncate ...">Created Token: {createdToken}</p>
          )}
        </div>
        <div>
          {mintedTokenTx && (
            <p className="truncate ...">Minted Token Tx: {mintedTokenTx}</p>
          )}
        </div>
        <div>
          {tokenBalance && (
            <p className="truncate ...">Token Balance: {tokenBalance}</p>
          )}
        </div>
        <div>
          {tokenTransferTx && (
            <p className="truncate ...">Token Transfer Tx: {tokenTransferTx}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MintToken;
