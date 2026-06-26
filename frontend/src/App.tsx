import { useState } from "react";
import ToDoApp from "./ToDoApp";
import ConnectMetamask from "./ConnectMetamask";
import type { Session } from "@chromia/ft4";
import "./App.css";
export default function App() {
  const [session, setSession] = useState<Session>();
  const [logout, setLogout] = useState<()=>Promise<void>>();
  const onConnected = (session : Session, logout: () => Promise<void>) => { setSession(session); setLogout(() => logout);}

  const onDisconnect = async () => {
    if (logout) await logout();
  };

  function handleDisconnect(_: React.MouseEvent<HTMLButtonElement>) {
    setSession(undefined);
    onDisconnect();
  }

  return session ? <ToDoApp session={session} handleDisconnect={handleDisconnect}/> : <ConnectMetamask onConnected={onConnected}/>;
}