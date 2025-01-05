import {
  AnchorProvider,
  BN,
  Program,
  setProvider,
  utils,
  web3,
} from "@coral-xyz/anchor";
import { FC, useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { PublicKey } from "@solana/web3.js";
import { Solanapdas } from "./solanapdas";
import bs58 from "bs58";
import idl from "./solanapdas.json";
import { notify } from "../utils/notifications";
import { verify } from "@noble/ed25519";

const programId = new PublicKey(idl.address);
const idl_object = JSON.parse(JSON.stringify(idl));

type BankType = {
  bank: PublicKey;
  name: string;
  balance: BN;
  owner: PublicKey;
};

export const Bank: FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const getProvider = useCallback(() => {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
    setProvider(provider);
    return provider;
  }, [wallet, connection]);

  const [banks, setBanks] = useState<BankType[]>([]);

  useEffect(() => {
    if (!wallet.publicKey) {
      return;
    }
    getBanks();
  }, [wallet.publicKey]);

  const getBanks = async () => {
    try {
      const anchorProvider = getProvider();
      const program = new Program<Solanapdas>(idl_object, anchorProvider);
      Promise.all(
        (await connection.getParsedProgramAccounts(programId)).map(
          async (bank) => ({
            ...(await program.account.bank.fetch(bank.pubkey)),
            bank: bank.pubkey,
          })
        )
      ).then((banks) => {
        console.log({ banks });
        setBanks(banks);
      });
    } catch (error) {
      console.error("Get Banks error", error);
      notify({
        message: "Get Banks failed",
        description: `${error}`,
        type: "error",
      });
    }
  };
  const createBank = async () => {
    try {
      const anchorProvider = getProvider();
      const program = new Program<Solanapdas>(idl_object, anchorProvider);

      await program.methods
        .create("New Bank 2")
        .accounts({
          user: anchorProvider.publicKey,
        })
        .rpc({
          skipPreflight: true,
        });

      console.log("New Bank created");
    } catch (error) {
      console.error("Create Bank error", error);
      notify({
        message: "Create Bank failed",
        description: `${error}`,
        type: "error",
      });
    }
  };
  const deposit = async (publicKey) => {
    try {
      const anchorProvider = getProvider();
      const program = new Program<Solanapdas>(idl_object, anchorProvider);

      await program.methods
        .deposit(new BN(0.01 * web3.LAMPORTS_PER_SOL))
        .accounts({
          user: anchorProvider.publicKey,
          bank: publicKey,
        })
        .rpc();
      console.log("Deposit created");
      getBanks();
    } catch (error) {
      console.error("Deposit error", error);
      notify({
        message: "Deposit failed",
        description: `${error}`,
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="relative group items-center">
        <div
          className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        ></div>
        <button
          className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={createBank}
          disabled={!wallet.publicKey}
        >
          <div className="hidden group-disabled:block">
            Wallet not connected
          </div>
          <span className="block group-disabled:hidden">Create Bank </span>
        </button>
        <button
          className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={getBanks}
          disabled={!wallet.publicKey}
        >
          <div className="hidden group-disabled:block">
            Wallet not connected
          </div>
          <span className="block group-disabled:hidden">Get Banks </span>
        </button>
      </div>
      <div className="flex flex-row justify-center">
        {banks.map((bank) => (
          <div
            key={bank.bank.toString()}
            className="flex flex-row flex-wrap justify-center"
          >
            <div className="m-2 p-2 bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white rounded-lg">
              <div className="text-center">{bank.name}</div>
              <div className="text-center">
                {bank.owner.toString().slice(0, 4) +
                  "..." +
                  bank.owner.toString().slice(-4)}{" "}
                💳
              </div>
              <div className="text-center">
                Balance: {(bank.balance / web3.LAMPORTS_PER_SOL).toString()} Sol
              </div>
              <button
                className="w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                onClick={() => deposit(bank.bank)}
                disabled={!wallet.publicKey}
              >
                <div className="hidden group-disabled:block">
                  Wallet not connected
                </div>
                <span className="block group-disabled:hidden">
                  Deposit 0.01 Sol
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
