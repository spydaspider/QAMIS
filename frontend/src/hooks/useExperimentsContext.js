import { ExperimentsContext } from "../context/experimentContext.js";
import { useContext } from "react";

export const useExperimentsContext = () => {
  const context = useContext(ExperimentsContext);
  if (!context) {
    throw new Error('useExperimentsContext must be used within an ExperimentsContextProvider');
  }
  return context;
};
