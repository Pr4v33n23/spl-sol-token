import {
  closeAccount,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  NATIVE_MINT,
  transfer,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

window.Buffer = window.Buffer || require("buffer").Buffer;

const SendSol = () => {
  //Setting connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  //Generating a keypair to interact
  const fromWallet = Keypair.generate();
  let associatedTokenAccount: PublicKey;

  async function wrapSol() {
    const airdropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(airdropSignature);

    associatedTokenAccount = await getAssociatedTokenAddress(
      NATIVE_MINT,
      fromWallet.publicKey
    );

    //Create token account to hold your wrapped sol
    const ataTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        fromWallet.publicKey,
        associatedTokenAccount,
        fromWallet.publicKey,
        NATIVE_MINT
      )
    );

    await sendAndConfirmTransaction(connection, ataTransaction, [fromWallet]);

    //Transfer SOL to token wallet and SyncNative to update wrapped SOL balance

    const solTransferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: associatedTokenAccount,
        lamports: LAMPORTS_PER_SOL,
      }),
      createSyncNativeInstruction(associatedTokenAccount)
    );

    await sendAndConfirmTransaction(connection, solTransferTransaction, [
      fromWallet,
    ]);

    const accountInfo = await getAccount(connection, associatedTokenAccount);
    console.log(
      `Native ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`
    );
  }

  async function unwrapSol() {
    await closeAccount(
      connection,
      fromWallet,
      associatedTokenAccount,
      fromWallet.publicKey,
      fromWallet
    );

    const walletBalancePostAccountClose = await connection.getBalance(
      fromWallet.publicKey
    );
    console.log(
      `Balance after unwrapping WSOL: ${walletBalancePostAccountClose}`
    );
  }

  async function sendSol() {
    // airdrop SOL to send
    const fromAirdropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

    // Generate a new wallet to receive newly minted token
    //token public key
    const toWallet = new PublicKey(
      "HXKqMFnrT5WybDMhg8wyqF3KFWEa9Tpxi793szZ7WHAV"
    );
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      NATIVE_MINT,
      fromWallet.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      NATIVE_MINT,
      toWallet
    );

    // Transfer the new token to the "toTokenAccount" we just created
    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      100000000
    );
    console.log("Transfer tx:", signature);
  }
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-3xl font-bold flex justify-center m-4">
        Send SOL Section
      </h3>
      <div className="flex space-x-2 justify-center m-2">
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={wrapSol}
        >
          Wrap SOL
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={unwrapSol}
        >
          Unwrap SOL
        </button>
        <button
          type="button"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          onClick={sendSol}
        >
          Send SOL
        </button>
      </div>
      {/* <div className=" sm:text-xl flex flex-col justify-center font-bold m-4 p-4 space-y-2 max-w-4xl">
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
      </div> */}
    </div>
  );
};

export default SendSol;
