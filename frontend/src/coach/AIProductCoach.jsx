import { useState } from "react";
import LandingScreen from "./LandingScreen";
import GoalScreen from "./GoalScreen";
import SessionStartScreen from "./SessionStartScreen";
import MainSession from "./MainSession";

export default function AIProductCoach() {
  const [screen, setScreen] = useState("landing"); // landing | goal | session-start | main

  const reset = () => setScreen("landing");

  if (screen === "landing") return <LandingScreen onStart={() => setScreen("goal")} />;
  if (screen === "goal") return <GoalScreen onSelect={() => setScreen("session-start")} onBack={() => setScreen("landing")} />;
  if (screen === "session-start") return <SessionStartScreen onStart={() => setScreen("main")} onBack={() => setScreen("goal")} />;
  if (screen === "main") return <MainSession onRestart={reset} />;

  return null;
}
