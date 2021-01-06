import { dbService, storageService } from "fbInstance";
import { v4 as uuidv4 } from 'uuid';
import React, {useState} from "react";

const TweetFactory = ({userObj}) => {
    const [tweet, setTweet]=useState("");
    const [attachment, setAttachment]=useState("");

    const onSubmit = async(event) => {
        event.preventDefault();
        let attachmentUrl = "";
        if(attachment !== ""){
            const attachmentRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`)
            const response = await attachmentRef.putString(attachment, "data_url");
            attachmentUrl = await response.ref.getDownloadURL();
        }
        const tweetObj={
            text:tweet,
            createdAt: Date.now(),
            creatorId: userObj.uid,
            attachmentUrl
        }
        await dbService.collection("tweets").add(tweetObj);
        setTweet("");
        setAttachment("");
    }

    const onChange = (event) => {
        const { target : {value}} = event;
        setTweet(value);
    }

    const onFileChange =(event) => {
        const {target:{files}} = event;
        const theFile = files[0];
        const reader = new FileReader();
        reader.onloadend = (finishedEvent) => {
            const {currentTarget:{result}} = finishedEvent;
            setAttachment(result)
        }
        if(theFile)
            reader.readAsDataURL(theFile); 
    }

    const onClearAttachment = () => {
        setAttachment("");
    }

    return (
        <form onSubmit={onSubmit}> 
            <input 
                type="text" 
                value={tweet} 
                placeholder="What's on your mind?" 
                maxLength={120} 
                onChange={onChange}                
            />
            <input type="file" accept="image/*" onChange={onFileChange}/>
            <input type="submit" value="Tweet"/>
            {attachment && (
                <div> 
                    <img src={attachment} width="150px" height="150px" alt="0"/>
                    <button onClick={onClearAttachment}>Clear</button>
                </div>
            )}
        </form>
    )
}
export default TweetFactory;