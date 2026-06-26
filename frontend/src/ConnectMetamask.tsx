import {
  createWeb3ProviderEvmKeyStore,
  registerAccount,
  registrationStrategy,
  createSingleSigAuthDescriptorRegistration,
  type Session,
  createKeyStoreInteractor,
  createSessionStorageLoginKeyStore,
  type SessionWithLogout,
} from "@chromia/ft4";
import { createClient } from "postchain-client";
import type React from "react";

const NODE_URL = "http://localhost:7740/";

async function connectWallet(): Promise<SessionWithLogout> {
    if (!window.ethereum) {
        throw new Error("Metamask not found. Please connect wallet!");
    }

    const client = await createClient({
        nodeUrlPool: [NODE_URL],
        blockchainIid: 0,
    });
    const evmKeyStore = await createWeb3ProviderEvmKeyStore(window.ethereum);
    const interactor = createKeyStoreInteractor(client, evmKeyStore); 

    // Check if the user already has an account
    const accounts = await interactor.getAccounts();


    if (accounts.length == 0) {
        // Register this new user 
        const authDescriptor = createSingleSigAuthDescriptorRegistration(
            ["A", "T"],//Permissions for the account
            evmKeyStore.id
        );

        // Register the account
        await registerAccount(client, evmKeyStore, registrationStrategy.open(authDescriptor));


        // Login after registering by refetching accounts
        const accounts = await interactor.getAccounts();
        const { session, logout } = await interactor.login({
            accountId: accounts[0].id,
            config: {
                flags: ["A", "T"],
                rules: null,
            },
            loginKeyStore: createSessionStorageLoginKeyStore(),
        });

        return {session, logout}; 
    } else {
        const { session, logout } = await interactor.login({
            accountId: accounts[0].id,
            config: {
                flags: ["A", "T"],
                rules: null,
            },
            loginKeyStore: createSessionStorageLoginKeyStore(),
        });

        return {session, logout};
    }
}

interface ConnectedMetamaskProps {
    onConnected : (session: Session, logout: () => Promise<void>) => void
}

export default function ConnectMetamask({onConnected} : ConnectedMetamaskProps) {
    const handleConnect = async (_ : React.MouseEvent<HTMLButtonElement>) => {
        try {
            // Login or register the user and handle errors 
            const {session, logout} = await connectWallet()
            // Send session back to the upper component 
            onConnected(session, logout);
        } catch (e) {
            console.log("Error when connecting to wallet : " + e);
        }
    }
    
    return <div className="connect-container">
        <button className="connect-wallet-btn" onClick={handleConnect}>Connect Wallet</button>
    </div>
}