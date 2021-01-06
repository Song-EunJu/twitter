import React,{useEffect, useState} from "react";
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

      // user.reload = async () => {
      //   setUserObj(null);
      //   setUserObj(()=>authService.currentUser);

      // }
      // setUserObj(user);
      // setInit(true);
    });
  },[]);

  
  const refreshUser = () => {
    const user=authService.currentUser;
    setUserObj({
      displayName:user.displayName,
      uid:user.uid,
      updateProfile: (args) => user.updateProfile(args)
    });
  }
  

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
      {/* <footer>&copy; {new Date().getFullYear()} Twitter</footer> */}
    </>
  ) 
}

export default App;