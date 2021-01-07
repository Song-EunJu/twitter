import { authService, dbService, storageService} from "fbInstance";
import React, {useState, useEffect} from "react";

const Profile = ({refreshUser, userObj}) => {
    const [newDisPlayName, setNewDisPlayName]=useState(userObj.displayName);
    const [attachment, setAttachment]=useState("");
    const [user, setUser] = useState([]);

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
            setUser(userArray);
        })
    },[]);

    const onPhotoSubmit = async(event) => {
        event.preventDefault();
        let photo="";
        if(attachment!==""){
            const fileRef=storageService.ref().child(`profiles/${userObj.uid}`);
            await fileRef.putString(attachment, "data_url");
            photo=await fileRef.getDownloadURL();
        }

        if(user.length===0){ // 처음 만드는 경우 
            const profileObj = { 
                photo,
                creatorId:userObj.uid,
                createdAt:Date.now()
            }
            await dbService.collection("user").add(profileObj)
        }
        else{ // 이미 파일이 있는 경우 업데이트
            console.log(user);
            await dbService.doc(`user/${user[0].id}`).update({
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
        <>
           <div>
                <form onSubmit={onProfileSubmit}>
                    { userObj.photoURL && 
                        <div>
                            <img src={userObj.photoURL} alt="0" width="70px" height="70px"/>
                            <br/>
                        </div>
                    }
                    <input 
                        type="text" 
                        placeholder="Display name" 
                        value={newDisPlayName}
                        onChange={onChange}
                    />
                    <input 
                        type="submit" 
                        value="Update Profile"
                    />
                </form>
                
                <form onSubmit={onPhotoSubmit}>
                    
                    { attachment && <img src={attachment} alt="0"/> }
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
        
                <button onClick={onLogOutClick}>Log Out</button>
            </div>
        </>
    );
}
export default Profile;