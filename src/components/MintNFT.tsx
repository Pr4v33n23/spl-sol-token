import {
  Account,
  AuthorityType,
  createMint,
  createSetAuthorityInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionError,
} from "@solana/web3.js";
import React, { useRef } from "react";

window.Buffer = window.Buffer || require("buffer").Buffer;

const MintNFT = () => {
  //Setting connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  //Generating a keypair to interact
  const fromWallet = Keypair.generate();

  const [createdNFT, setCreatedNFT] = React.useState("");
  const [mintedNFTTx, setMintedNFTTx] = React.useState("");
  const [lockedNFTTx, setLockedNFTTx] = React.useState("");

  const refMint = useRef<PublicKey>();
  const refFromTokenAccount = useRef<Account>();
  const refMintTx = useRef<string>();
  const refFromWallet = useRef(fromWallet);

  //token public key
  const toWallet = new PublicKey(
    "HXKqMFnrT5WybDMhg8wyqF3KFWEa9Tpxi793szZ7WHAV"
  );

  //Create NFT and associated token account
  async function createNFT() {
    const fromAirdropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirdropSignature);

    //Creating a new NFT mint
    refMint.current = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      0
    );
    setCreatedNFT(refMint.current?.toBase58());
    console.log(`Create NFT: ${refMint.current.toBase58()}`);

    refFromTokenAccount.current = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      refMint.current,
      fromWallet.publicKey
    );

    console.log(
      `Create NFT Account ${refFromTokenAccount.current.address.toBase58()}`
    );
  }

  //Mint NFT with the token and account created
  async function mintNFT() {
    const signature = await mintTo(
      connection,
      refFromWallet.current,
      refMint.current!,
      refFromTokenAccount.current?.address!,
      refFromWallet.current.publicKey,
      1 //10 billion i.e 10tokens we are minting. P.S. 1 Billion = 1 token
    );
    refMintTx.current = signature;
    setMintedNFTTx(signature);
    console.log(`NFT Mint signature: ${signature}`);
  }

  async function lockNFT() {
    //Making a transaction to change the minting permissions
    let transaction = new Transaction().add(
      createSetAuthorityInstruction(
        refMint.current!,
        refFromWallet.current.publicKey,
        AuthorityType.MintTokens,
        null
      )
    );

    //send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      refFromWallet.current,
    ]);

    setLockedNFTTx(signature);
    console.log(`Lock signature: ${signature}`);
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-3xl font-bold flex justify-center m-4">
        Mint NFT Section
      </h3>
      <div className="flex space-x-2 justify-center m-2">
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={createNFT}
        >
          Create NFT
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={mintNFT}
        >
          Mint NFT
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={lockNFT}
        >
          Lock NFT
        </button>
      </div>
      <div className=" sm:text-xl flex flex-col justify-center font-bold m-4 p-4 space-y-2 max-w-4xl">
        <div>
          {createdNFT && (
            <p className="truncate ...">Created NFT: {createdNFT}</p>
          )}
        </div>
        <div>
          {mintedNFTTx && (
            <p className="truncate ...">Minted Token Tx: {mintedNFTTx}</p>
          )}
        </div>
        <div>
          {lockedNFTTx && (
            <p className="truncate ...">NFT lock Tx: {lockedNFTTx}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MintNFT;
