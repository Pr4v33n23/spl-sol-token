import React from "react";
import "./App.css";
import MintNFT from "./components/MintNFT";
import MintToken from "./components/MintToken";
import SendSol from "./components/SendSol";

function App() {
  return (
    <div className="flex justify-center flex-col">
      <MintToken />
      <MintNFT />
      <SendSol/>
    </div>
  );
}

export default App;
