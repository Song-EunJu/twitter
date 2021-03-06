import React,{useEffect, useState, useCallback} from "react";
import AppRouter from "components/Router";
import {authService} from "fbInstance";

function App() {
  const [ init, setInit ] = useState(false);
  const [ userObj, setUserObj ] = useState(null);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if(user){
        setUserObj({
          displayName:user.displayName,
          uid:user.uid,
          updateProfile: (args) => user.updateProfile(args)
        })
      }
      else
        setUserObj(null);
      setInit(true);
    });
  },[]);

  
  const refreshUser = useCallback(async () => {
    const user=authService.currentUser;
    setUserObj({
        displayName:user.displayName,
        photoURL:user.photoURL,
        uid:user.uid,
        updateProfile: (args) => user.updateProfile(args)
    });
  },[setUserObj]);
  
  return (
    <>
      { 
        init ? (
          <AppRouter
              refreshUser={refreshUser}
              isLoggedIn={Boolean(userObj)} 
              userObj={userObj}
          /> 
        )
      : "Initializing"}
      <br/>
      <footer>&copy; {new Date().getFullYear()} Twitter</footer>
    </>
  ) 
}

export default App;
