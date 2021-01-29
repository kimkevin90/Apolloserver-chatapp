import React, { createContext, useReducer, useContext } from "react";
import jwtDecode from "jwt-decode";

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

let user = null;
const token = localStorage.getItem("token");
if (token) {
  const decodedToken = jwtDecode(token);
  const expriesAt = new Date(decodedToken.exp * 1000);

  if (new Date() > expriesAt) {
    localStorage.removeItem("token");
  } else {
    user = decodedToken;
    // console.log(user);
  }
} else console.log("토큰없어");

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
      };
    default:
      throw new Error(`${action.type}없는 액션 타입입니다`);
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user });
  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        {children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
