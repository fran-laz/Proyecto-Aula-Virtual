import { useReducer } from "react";
import { AppContext } from "./AppContext";
import { appReducer } from "./appReducer";
import { initialState } from "../store/initialState";

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};