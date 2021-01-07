import { authService, dbService, storageService} from "fbInstance";
import React, {useState, useEffect} from "react";

const Profile = ({refreshUser, userObj}) => {
    const [newDisPlayName, setNewDisPlayName]=useState(userObj.displayName);
    const [attachment, setAttachment]=useState("");
    const [user, setUser] = useState(userObj);
    const onLogOutClick = () => {
        authService.signOut();
    }

    const onChange = (event) => {
        const {target:{value}}=event;
        setNewDisPlayName(value);
    }

    const onProfileSubmit = async(event) => {
        event.preventDefault();
        if(userObj.displayName !== newDisPlayName){
            await userObj.updateProfile({
                displayName:newDisPlayName,
            })
        }
        refreshUser();
    }

    useEffect(()=>{
        dbService.collection("user").where("creatorId","==",userObj.uid).onSnapshot(snapshot => {
            const userArray = snapshot.docs.map(doc => ({
                id:doc.id,
                ...doc.data()
            }));
            setUser(userArray[0]);
        })
        refreshUser();
    },[]);

    const onPhotoSubmit = async(event) => {
        event.preventDefault();
        let photo="";
        if(attachment!==""){
            const fileRef=storageService.ref().child(`profiles/${userObj.uid}`);
            await fileRef.putString(attachment, "data_url");
            photo=await fileRef.getDownloadURL();
        }
        if(user===undefined){ 
            const profileObj = { 
                photo,
                creatorId:userObj.uid,
                createdAt:Date.now()
            }
            await dbService.collection("user").add(profileObj)
        }
        else{ 
            await dbService.doc(`user/${user.id}`).update({
                photo
            });
        }
        await userObj.updateProfile({
            photoURL:photo
        })
        refreshUser();
        setAttachment("");
    }

    const fileChange = (event) => {
        const {target:{files}}=event;
        const theFile = files[0];

        if(theFile){
            const fileReader = new FileReader();
            fileReader.onloadend = (files) => {
                const {currentTarget:{result}}=files;
                setAttachment(result);
            }
            fileReader.readAsDataURL(theFile);
        }
    }

    return (

           <div className="container">
                 <form onSubmit={onProfileSubmit} className="profileForm">
                    { userObj.photoURL && 
                        <div>
                            <img src={userObj.photoURL} alt="0" width="70px" height="70px"/>
                            <br/>
                        </div>
                    }
                    <input 
                        type="text" 
                        placeholder="Display name"
                        autoFocus
                        value={newDisPlayName}
                        onChange={onChange}
                        className="formInput"
                    />
                    <input 
                        type="submit" 
                        value="Update Profile"
                        className="formBtn"
                        style={{
                            marginTop: 10,
                        }}
                    />
                </form>
                
                <form onSubmit={onPhotoSubmit}>
                    
                    { attachment && <img src={attachment} alt="0" width="70px" height="70px"/> }
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={fileChange}
                    />
                    <input 
                        type="submit" 
                        value="Update Photo"
                    />
                </form>
        
                <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
    	            Log Out
                </span>
            </div>
        
    );
}
export default Profile;