import { ReactNode } from "react";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <AppHeader />
    <main className="pt-20 pb-28 px-5 max-w-5xl mx-auto">{children}</main>
    <BottomNav />
  </div>
);

export default AppLayout;