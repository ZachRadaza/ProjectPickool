import { useEffect, useRef, useState } from "react";
import { type Club_Messages, type UserHeader } from "../../utils/schemas";
import SendButton from "../ui/buttons/SendButton";
import MessageBubbleComp from "../ui/core/MessageBubbleComp";
import "./ClubMessageComp.css";
import { ExtensionService } from "../../utils/ExtensionService";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import Button from "../ui/buttons/Button";
import { supabase } from "../../utils/supabase";
import CloseButton from "../ui/buttons/CloseButton";

type ClubMessageCompProps = {
    club_id: string | null;
    userHeader: UserHeader | null;
};

export default function ClubMessageComp({ club_id, userHeader }: ClubMessageCompProps){
    const [message, setMessage] = useState<string>('');
    const [clubMessages, setClubMessages] = useState<Club_Messages[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [currentPageMessages, setCurrentPageMessages] = useState<number>(1);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [replyingToMessage, setReplyingToMessage] = useState<Club_Messages | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const messageTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const bottomMessageAreaRef = useRef<HTMLDivElement | null>(null);
    const messageAreaRef = useRef<HTMLDivElement | null>(null);

    async function loadMessages(page: number){
        try{
            if(!hasMoreMessages || !club_id)
                return;

            const { data: fetchedMessages, hasMore } = await ExtensionService.ClubMessageService.getClubMessages(club_id, page);

            setCurrentPageMessages(page + 1);
            setClubMessages((cm) => [...fetchedMessages, ...cm]);
            setHasMoreMessages(hasMore);
            return { hasMore, page: page + 1 };
        } catch(error){
            setError('Error In Loading Messages');
        }
    }

    async function sendMessage(){
        try{
            if(!userHeader || !club_id || message.trim() === '')
                return;

            const tempMessage: Club_Messages = {
                id: `temp-${crypto.randomUUID()}`,
                club_id: club_id,
                created_at: new Date().toISOString(),
                user: userHeader,
                message: message,
                replying_to_id: replyingToMessage?.id,
                replying_to: replyingToMessage 
                    ? { id: replyingToMessage?.id!, message: replyingToMessage.message!, user_id: replyingToMessage.user?.id! } 
                    : undefined
            };

            setMessage('');
            setReplyingToMessage(null);
            setClubMessages((clubMessages) => [...clubMessages, tempMessage]);

            const sentMessage = await ExtensionService.ClubMessageService.addClubMessage(userHeader.id, club_id, message, replyingToMessage?.id);

            if(sentMessage)
                setClubMessages((clubMessages) => 
                    clubMessages.map((m) => m.id === tempMessage.id ? sentMessage : m)
                );
        } catch(error){
            setError('Error in Sending Message');
        }
    }

    function scrollToBottom(){
        bottomMessageAreaRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }

    function hasReplyingToMessageLoaded(replyId: string){
        for(const mes of clubMessages){
            if(mes.id === replyId)
                return mes;
        }

        return null;
    }
    
    function onReplyBtnClick(id: string){
        let replyMessage = hasReplyingToMessageLoaded(id);

        setReplyingToMessage(replyMessage);
    }

    async function scrollToMessage(id: string | null){
        if(!id)
            return;

        let more = true;
        let page = currentPageMessages;
        let messageToScroll = document.getElementById(`message-${id}`);

        while(!messageToScroll && more){
            const loadedData = await loadMessages(page) ??  { hasMore: false, page: 1 };

            messageToScroll = document.getElementById(`message-${id}`);
            more = loadedData.hasMore;
            page = loadedData.page;
        }

        if(!messageToScroll)
            return;

        messageToScroll.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    useEffect(() => {
        initLoad();

        const channel = supabase
            .channel(`club_messages:${club_id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "club_messages",
                    filter: `club_id=eq.${club_id}`,
                },
                (payload) => getNewMessage(payload)
            )
            .subscribe();

        async function getNewMessage(payload: any){
            const newMessage = payload.new as Club_Messages;
            const fullMesssage = await ExtensionService.ClubMessageService.getClubMessage(newMessage.id!);
            if(fullMesssage && fullMesssage.user?.id !== userHeader?.id)
                setClubMessages((messages) => [...messages, fullMesssage]);
        }

        async function initLoad(){
            setIsLoading(true);
            await loadMessages(currentPageMessages);
            setIsLoading(false);
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if(clubMessages.length === 0)
            return;

        const lastClubMessageId = clubMessages[clubMessages.length - 1].id;
        if(lastMessageId !== lastClubMessageId){
            scrollToBottom();
            setLastMessageId(lastClubMessageId ?? null);
        }
    }, [clubMessages]);

    let content;

    if(isLoading)
        content = <Loading/>;
    else if(error)
        content = <ErrorPage error={ error }/>;
    else
        content = <>
            <div className="messages-cont" ref={ messageAreaRef }>
                { clubMessages.length === 0 &&
                    <h6 className="no-messages">Club has not sent any message yet. Start the chat!</h6>
                }
                { hasMoreMessages &&
                    <Button 
                        content="Load More" 
                        onBtnClick={ () => loadMessages(currentPageMessages) } 
                        additionalClasses="load-more"
                    />
                }
                { clubMessages.map((clubMessage, i) => {
                    const nextMessage = i + 1 < clubMessages.length 
                        ? clubMessages[i + 1]
                        : null;
                    
                    return <>
                        { (i === 0 && nextMessage) &&
                            <p 
                                className="date-separators"
                                key={`first-date-${nextMessage.club_id}`}
                            >{ new Date(nextMessage.created_at).toLocaleDateString() }</p>
                        }
                        <MessageBubbleComp 
                            key={ clubMessage.id! } 
                            userHeader={ userHeader } 
                            clubMessage={ clubMessage } 
                            nextClubMessageUserId={ nextMessage?.user?.id || null }
                            onReplyBtnClick={ onReplyBtnClick }
                            onReplyBubbleClick={ scrollToMessage }
                        />
                        { (nextMessage && 
                            new Date(nextMessage?.created_at).toDateString() !== new Date(clubMessage.created_at).toDateString()
                          ) &&
                            <p 
                                className="date-separators"
                                key={ `date-${nextMessage.id}` }
                            >{ new Date(nextMessage.created_at).toLocaleDateString() }</p>
                        }
                    </>
                })}
                <div ref={ bottomMessageAreaRef }></div>
            </div>
            { replyingToMessage &&
                <div className="replying-to-cont">
                    <div className="content">
                        <p className="replying-to-text">Replying to...</p>
                        <p>{ replyingToMessage.message }</p>
                    </div>
                    <CloseButton setIsClosed={ () => setReplyingToMessage(null) }/>
                </div>
            }
            <div className="send-message-cont">
                <textarea
                    ref={ messageTextAreaRef }
                    placeholder="Send message..."
                    className="send-message-input"
                    value={ message }
                    onChange={ (event) => { 
                        event.currentTarget.style.height = "auto";
                        event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                        setMessage(event.target.value);
                    }}
                    onKeyDown={ (event) => { 
                        if(event.key === "Enter" && !event.shiftKey){
                            event.preventDefault();
                            sendMessage();
                        }
                    }}
                    rows={ 1 }
                ></textarea>
                <SendButton onBtnCLick={ sendMessage }/>
            </div>
        </>;

    return (
        <div className="club-message-comp">
            { content }
        </div>
    );
}