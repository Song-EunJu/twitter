import { authService, dbService, storageService} from "fbInstance";
import React, {useState} from "react";

const Profile = ({refreshUser, userObj}) => {
    const [newDisPlayName, setNewDisPlayName]=useState(userObj.displayName);
    const [attachment, setAttachment]=useState("");
    const [docId, setdocId] = useState("");
    
    const onLogOutClick = () => {
        authService.signOut();
    }

    // const getMyTweets = async() => {
    //     const tweets = await dbService
    //         .collection("tweets")
    //         .where("creatorId","==",userObj.uid)
    //         .orderBy("createdAt")
    //         .get();
    //     console.log(tweets.docs.map((doc)=>doc.data()));
    // }

    // useEffect(() => {
    //     getMyTweets();
    // },[]);

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

    const onPhotoSubmit = async(event) => {
        event.preventDefault();
        let photo="";

        if(attachment!==""){
            const fileRef=storageService.ref().child(`profiles/${userObj.uid}`);
            await fileRef.putString(attachment, "data_url");
            photo=await fileRef.getDownloadURL();
        }
        
        const isEmpty = (await dbService.collection("user").where("creatorId","==",userObj.uid).get()).empty;
        if(isEmpty){ // 처음 만드는 경우 
            const profileObj = { 
                photo,
                creatorId:userObj.uid,
                createdAt:Date.now()
            }
            setdocId((await dbService.collection("user").add(profileObj)).id);
        }
        else{ // 이미 파일이 있는 경우 업데이트
            await dbService.doc(`user/${docId}`).update({
                photo
            });
        }
        const photo2=photo;
        await userObj.updateProfile({
            photoURL:photo2
        })
        setAttachment("");
        refreshUser();
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
                    { userObj.photoURL && <img src={userObj.photoURL} alt="0"/>}
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