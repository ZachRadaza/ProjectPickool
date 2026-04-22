import { useEffect, useState } from "react";
import { Level, Recurring, Sex, type Events, type Locations, type UserHeader } from "../../../utils/schemas";
import CloseButton from "../../ui/buttons/CloseButton";
import "../popup.css";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import Button from "../../ui/buttons/Button";
import LevelChooser from "../../ui/choosers/LevelChooser";
import RecurringChooser from "../../ui/choosers/RecurringChooser";
import SexChooser from "../../ui/choosers/SexChooser";
import "./ModifyEventPopup.css";
import LocationInput from "../../ui/inputs/LocationInput";

type ModifyEventPopup = {
    userHeader: UserHeader | null;
    isClosed: boolean;
    setIsClosed: (close: boolean) => void;
    isEditing: boolean;
    club_id: string | null;
    event_id: string | null;
};

export default function ModifyEventPopup({ isClosed, setIsClosed, userHeader, isEditing, club_id, event_id }: ModifyEventPopup){
    const [event, setEvent] = useState<Events | null>(null);
    const [eventCopy, setEventCopy] = useState<Events | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    let content;

    function toLocalInputValue(dateString: string) {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000;
        const local = new Date(date.getTime() - offset);
        return local.toISOString().slice(0, 16);
    }

    function notEmpty(){
        return (
            event?.name &&
            event.start_time &&
            event.end_time &&
            event.max_players
        );
    }

    async function saveChanges(){
        setIsSaving(true);

        if(!event || !event_id){
            setIsSaving(false);
            return;
        }

        if(!notEmpty()){
            setMessage("Please Enter all Containers");
            setIsSaving(false);
            return;
        } else 
            setMessage("");

        const updates: Partial<Events> = { name: event.name };

        if(event.description !== eventCopy?.description) updates.description = event.description;
        if(event.start_time !== eventCopy?.start_time) updates.start_time = event.start_time;
        if(event.end_time !== eventCopy?.end_time) updates.end_time = event.end_time;
        if(event.recurring !== eventCopy?.recurring) updates.recurring = event.recurring;
        if(event.price !== eventCopy?.price) updates.price = event.price;
        if(event.max_players !== eventCopy?.max_players) updates.max_players = event.max_players;
        if(event.sex !== eventCopy?.sex) updates.sex = event.sex;
        if(event.level !== eventCopy?.level) updates.level = event.level;
        if(event.is_auto_approve !== eventCopy?.is_auto_approve) updates.is_auto_approve = event.is_auto_approve;
        if(event.is_dupr !== eventCopy?.is_dupr) updates.is_dupr = event.is_dupr;
        if(event.is_singles !== eventCopy?.is_singles) updates.is_singles = event.is_singles;
        if(event.is_tournament !== eventCopy?.is_tournament) updates.is_tournament = event.is_tournament;

        if(
            JSON.stringify(event?.location) !== JSON.stringify(eventCopy?.location) &&
            event?.location
        )
            updates.location = event?.location;

        console.log(updates);

        const updated = await ExtensionService.updateEvent(event_id, updates);

        if(!updated){
            setIsSaving(false);
            setError("Error in Saving Updates to Event");
            return;
        }

        setIsSaving(false);
        setIsClosed(true);
        window.location.reload();
    }

    async function createEvent(){
        setIsSaving(true);

        if(!event){
            setIsSaving(false);
            setError("Error has occured");
            return;
        }

        if(!userHeader || !club_id){
            setError("User and Club are required to make an event");
            setIsSaving(false);
            return;
        }

        if(!notEmpty()){
            setMessage("Please Enter all Containers");
            setIsSaving(false);
            return;
        } else 
            setMessage("");

        const newEvent = await ExtensionService.addEvent(event);

        if(!newEvent){
            setIsSaving(false);
            setError("Error in Creating New Event")
            return;
        }
        
        setIsSaving(false);
        setIsClosed(true);
        window.location.reload();
    }

    useEffect(() => {
        if(isClosed)
            return;

        setEvent(null);
        setIsLoading(true);
        setIsSaving(false);
        setError(null);
        setMessage("");
    }, [isClosed])

    useEffect(() => {
        if(!isClosed)
            getEvent();

        async function getEvent(){
            try{
                setIsLoading(true);

                if(!userHeader){
                    setIsClosed(true);
                    return;
                }

                if(!event_id){
                    if(!club_id){
                        setIsLoading(false);
                        setError("Club Required to create event");
                        return;
                    }

                    const eventNew: Events = {
                        name: "",
                        description: "",
                        club_id,
                        start_time: new Date().toISOString(),
                        end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                        price: 0,
                        sex: Sex.MIXED,
                        level: Level.ALL,
                        max_players: 10,
                        recurring: Recurring.NONE,
                        is_singles: true,
                        is_auto_approve: true,
                        is_dupr: true,
                        is_tournament: false
                    };

                    setEvent(eventNew);
                    setEventCopy({ ...eventNew });
                } else {
                    const eventData = await ExtensionService.getEvent(event_id);

                    if(!eventData){
                        setIsLoading(false);
                        setError("Error in Getting Event");
                    }

                    setEvent(eventData);
                    setEventCopy({ ...eventData });
                }
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in Modifying Event");
            }
        }
    }, [event_id, isClosed]);

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error } />
    else
        content = <>
            <h4>{ isEditing ? "Edit Event" : "Create Event"}</h4>
            <p className="message">{ message }</p>
            <div className="name-cont">
                <h5>Event Name: </h5>
                <input 
                    value={ event?.name ?? "" }
                    onChange={ (e) => setEvent((ev) =>  ev ? { ...ev, name: e.target.value} : ev) }
                />
            </div>
            <div className="desc-cont">
                <h6>Description</h6>
                <textarea
                    value={ event?.description ?? "" }
                    onChange={ (e) => setEvent((ev) =>  ev ? { ...ev, description: e.target.value} : ev) }
                    rows={ 4 }
                ></textarea>
            </div>
            <div className="additional-info">
                <div className="time-cont">
                    <h6>Start Time</h6>
                    <input
                        type="datetime-local"
                        value={ event?.start_time ? toLocalInputValue(event.start_time) : ""}
                        onChange={(e) => {
                            const time = e.target.value;
                            setEvent((ev) => ev 
                                ? { 
                                    ...ev, 
                                    start_time: new Date(time).toISOString(), 
                                    end_time: new Date(new Date(time).getTime() + 60 * 60 * 1000).toISOString() 
                                } 
                                : ev
                            );
                        }}
                    />
                </div>
                <div className="time-cont">
                    <h6>End Time</h6>
                    <input
                        type="datetime-local"
                        value={ event?.end_time ? toLocalInputValue(event.end_time) : ""}
                        onChange={(e) => {
                            const time = e.target.value;
                            setEvent((ev) => {
                                if(!ev) 
                                    return ev;

                                const newEnd = new Date(time);
                                const start = new Date(ev.start_time);
                                const finalEnd = newEnd < start ? start : newEnd;

                                return { ...ev, end_time: finalEnd.toISOString() };
                            });
                        }}
                    />
                </div>
                <div className="time-cont recurring choosers">
                    <h6>Recurring </h6>
                    <RecurringChooser 
                        recurring={ event?.recurring ?? Recurring.NONE }
                        setRecurring={ (recurring) => setEvent((ev) => ev ? {...ev, recurring } : ev) }
                    />
                </div>
                <div className="numbers-cont">
                    <h6>Price</h6>
                    <input
                        type="number"
                        min={ 0 }
                        step="0.01"
                        value={ event?.price ?? "" }
                        onChange={ (e) => {
                            const value = e.target.value;
                            if(/^\d*\.?\d{0,2}$/.test(value))
                                setEvent((ev) => ev ? { ...ev, price: value === "" ? null : Number(e.target.value) } : ev) 
                        }}
                    />
                </div>
                <div className="numbers-cont">
                    <h6>Max Number of Players</h6>
                    <input
                        type="number"
                        min={ 2 }
                        max={ 100 }
                        step="1"
                        value={ event?.max_players ?? "" }
                        onChange={ (e) => {
                            const value = e.target.value;
                            setEvent((ev) => ev ? { ...ev, max_players: value === "" ? null : Number(e.target.value) } : ev) 
                        }}
                    />
                </div>
                <div className="loc">
                    <h6>Event Location</h6>
                    <LocationInput 
                        locationName={ event?.location?.name || "" }
                        onSelect={(loc) => setEvent((event) => {
                            const location: Locations = {
                                longitude: loc.longitude,
                                latitude: loc.latitude,
                                address: loc.address,
                                name: loc.name
                            }
                            return event ? { ...event, location } : event
                        })}
                    />
                </div>
                <div className="choosers">
                    <h6>Sex</h6>
                    <SexChooser 
                        sex={ event?.sex ?? Sex.MIXED }
                        setSex={ (sex) => setEvent((ev) => ev ? {...ev, sex } : ev) }
                    />
                </div>
                <div className="choosers">
                    <h6>Level</h6>
                    <LevelChooser 
                        isPlayer={ false }
                        level={ event?.level ?? Level.ALL }
                        setLevel={ (level: Level) => setEvent((ev) => ev ? { ...ev, level: level } : ev) }
                    />
                </div>
            </div>
            <h6>Settings</h6>
            <div className="switches-cont">
                <div className="switch">
                    <Button 
                        content="Singles"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_singles: true } : ev) }
                        additionalClasses={ event?.is_singles ? "active" : "" }
                    />
                    <Button 
                        content="Double"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_singles: false } : ev) }
                        additionalClasses={ !event?.is_singles ? "active" : "" }
                    />
                </div>
                <div className="switch">
                    <Button 
                        content="Casual"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_tournament: false } : ev) }
                        additionalClasses={ !event?.is_tournament ? "active" : "" }
                    />
                    <Button 
                        content="Tournament"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_tournament: true } : ev) }
                        additionalClasses={ event?.is_tournament ? "active" : "" }
                    />
                </div>
                <div className="switch">
                    <Button 
                        content="DUPR Rating"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_dupr: true } : ev) }
                        additionalClasses={ event?.is_dupr ? "active" : "" }
                    />
                    <Button 
                        content="No DUPR Rating"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_dupr: false } : ev) }
                        additionalClasses={ !event?.is_dupr ? "active" : "" }
                    />
                </div>
                <div className="switch">
                    <Button 
                        content="Auto-Approve"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_auto_approved: true } : ev) }
                        additionalClasses={ event?.is_auto_approve ? "active" : "" }
                    />
                    <Button 
                        content="Request Join"
                        onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_auto_approved: false } : ev) }
                        additionalClasses={ !event?.is_auto_approve ? "active" : "" }
                    />
                </div>
            </div>
            <Button 
                content={ isEditing 
                    ? ( isSaving ?  "Saving Changes..." : "Save Changes" ) 
                    : ( isSaving ? "Creating Event..." : "Create Event" ) 
                }
                onBtnClick={ () => isEditing ? saveChanges() : createEvent() }
            />
        </>;

    return (
        <div className="container">
            <div className={ `popup modify-event ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ setIsClosed } />
                { content }
            </div>
        </div>
    );
}