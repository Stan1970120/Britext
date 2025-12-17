import { useContext } from "react";
import { AppLoadingContext, LoggedInContext, UserContext, UserTypeContext } from "@/context";
import { usePathname } from "next/navigation";

export default function useUser() {
  const [user, setUser] = useContext(UserContext);
  return { user, setUser };
}

export function useUserType() {
  const [userType, setUserType] = useContext(UserTypeContext);
  return { userType, setUserType };
}

export function useLoggedIn() {
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  return { loggedIn, setLoggedIn };
}

export function useAppLoading() {
  const [appLoading, setAppLoading] = useContext(AppLoadingContext);
  return { appLoading, setAppLoading };
}


export  function useSignedPathProtector(pathPrefex) {
  const { user } = useUser();
  const { loggedIn } = useLoggedIn();

  const currentPath = usePathname();
  if (loggedIn && user) {
    const isPathArea = currentPath ? currentPath.startsWith(pathPrefex) : false;
    return isPathArea;
  }
}
