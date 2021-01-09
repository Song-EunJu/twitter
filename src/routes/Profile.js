import { authService, dbService, storageService} from "fbInstance";
import React, {useState, useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const Profile = ({refreshUser, userObj}) => {
    const [newDisPlayName, setNewDisPlayName]=useState(userObj.displayName);

    // if(userObj.displayName==null)
    //     const [newDisPlayName, setNewDisPlayName]=useState("");
    // else
    //     const [newDisPlayName, setNewDisPlayName]=useState(userObj.displayName);

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
    },[refreshUser,userObj.uid]);

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

    const onClearAttachment = () => {
        setAttachment("");
    }

    return (

           <div className="container">
                <form onSubmit={onProfileSubmit} className="profileForm">
                    { userObj.photoURL && 
                        <div className="profile">
                            <img src={userObj.photoURL} alt="0" width="70px" height="70px"/>
                            <br/>
                        </div>
                    }
                    <input 
                        type="text" 
                        placeholder="Display name"
                        autoFocus
                        value={newDisPlayName==null ? "" : newDisPlayName}
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
                    <label htmlFor="attach-file" className="factoryInput__label">
                        <span>Update photo</span>
                        <FontAwesomeIcon icon={faPlus} />
                    </label>
                    <input
                        id="attach-file"
                        type="file"
                        accept="image/*"
                        onChange={fileChange}
                        style={{
                            opacity: 0,
                        }}
                    />

                    {attachment && (
                        <div className="factoryForm__attachment">
                            <img
                                src={attachment}
                                style={{
                                    backgroundImage: attachment,
                                    marginBottom:20,
                                }}
                                alt="0"
                            />
                            <div className="factoryForm__clear" >
                                <input 
                                    type="submit" 
                                    value="Update Profile"
                                    style={{
                                        marginTop: 10,
                                        marginBottom: 10,
                                        marginRight: 10
                                    }}
                                />
                                <FontAwesomeIcon icon={faCheck} />

                            </div>
                            <div className="factoryForm__clear" onClick={onClearAttachment}>
                                <span style={{
                                    fontSize:14.3333
                                }}>Remove</span>
                                <FontAwesomeIcon icon={faTimes} />
                            </div>
                        </div>
                    )}	  
                </form>
    
                <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
    	            Log Out
                </span>
            </div>
        
    );
}
export default Profile;