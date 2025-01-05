import { FC, useCallback } from "react";

import bs58 from "bs58";
import { notify } from "../utils/notifications";
import { useWallet } from "@solana/wallet-adapter-react";
import { verify } from "@noble/ed25519";

export const Bank: FC = () => {
  const { publicKey, signMessage } = useWallet();

  return (
    <div className="flex flex-row justify-center">
      <div className="relative group items-center">
        <div
          className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        ></div>
        <button
          className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={async () => {}}
          disabled={!publicKey}
        >
          <div className="hidden group-disabled:block">
            Wallet not connected
          </div>
          <span className="block group-disabled:hidden">Bank </span>
        </button>
      </div>
    </div>
  );
};
