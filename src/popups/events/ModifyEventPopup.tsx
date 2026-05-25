import { useEffect, useState } from "react";
import { EventType, Level, Recurring, Sex, type Events, type Locations, type UserHeader } from "../../utils/schemas";
import CloseButton from "../../components/ui/buttons/CloseButton";
import "../popup.css";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import Button from "../../components/ui/buttons/Button";
import LevelChooser from "../../components/ui/choosers/LevelChooser";
import RecurringChooser from "../../components/ui/choosers/RecurringChooser";
import SexChooser from "../../components/ui/choosers/SexChooser";
import "./ModifyEventPopup.css";
import LocationInput from "../../components/ui/inputs/LocationInput";
import EventTypeChooser from "../../components/ui/choosers/EventTypeChooser";
import { convertHoursToSeconds, convertSecondsToHours } from "../../utils/random";

type ModifyEventPopup = {
    userHeader: UserHeader | null;
    setIsClosed: (close: boolean) => void;
    isEditing: boolean;
    club_id: string | null;
    event_id: string | null;
};

export default function ModifyEventPopup({ setIsClosed, userHeader, isEditing, club_id, event_id }: ModifyEventPopup){
    const [event, setEvent] = useState<Events | null>(null);
    const [eventCopy, setEventCopy] = useState<Events | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    let content;

    function toLocalDateValue(isoString: string) {
        const d = new Date(isoString);
        if (Number.isNaN(d.getTime())) return "";

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function toLocalTimeValue(isoString: string) {
        const d = new Date(isoString);
        if (Number.isNaN(d.getTime())) return "";

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    function notEmpty(){
        return (
            event?.name &&
            event.start_time &&
            event.end_time &&
            event.max_players
        );
    }

    async function saveChanges(saveFuture: boolean){
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
        if(event.event_type !== eventCopy?.event_type) updates.event_type = event.event_type;
        if(event.is_singles !== eventCopy?.is_singles) updates.is_singles = event.is_singles;
        if(event.approve_window !== eventCopy?.approve_window) updates.approve_window = convertHoursToSeconds(event.approve_window || 0);

        if(
            JSON.stringify(event?.location) !== JSON.stringify(eventCopy?.location) &&
            event?.location
        )
            updates.location = event?.location;

        const updated = await ExtensionService.EventService.updateEvent(event_id, updates);
        if(saveFuture && event.series_id) await ExtensionService.EventService.updateEventSeries(event.series_id, updates);

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

        const eventHoursUpdated: Events = { ...event, approve_window: convertHoursToSeconds(event.approve_window || 0) };

        const newEvent = await ExtensionService.EventService.addEvent(eventHoursUpdated);

        if(!newEvent || !newEvent.id){
            setIsSaving(false);
            setError("Error in Creating New Event")
            return;
        }

        if(newEvent.series_id)
            await ExtensionService.HostService.addHostSeries(newEvent.series_id, userHeader.id);
        else
            await ExtensionService.HostService.addHost(newEvent.id, userHeader.id);

        setIsSaving(false);
        setIsClosed(true);
        window.location.reload();
    }

    useEffect(() => {
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
                        sex: Sex.ANY,
                        level: Level.ALL,
                        max_players: 10,
                        recurring: Recurring.NONE,
                        is_singles: true,
                        is_auto_approve: true,
                        event_type: EventType.OPENPLAY,
                        approve_window: 10
                    };

                    setEvent(eventNew);
                    setEventCopy({ ...eventNew });
                } else {
                    const eventData = await ExtensionService.EventService.getEvent(event_id);

                    if(!eventData){
                        setIsLoading(false);
                        setError("Error in Getting Event");
                        return;
                    }

                    setEvent({... eventData, approve_window: convertSecondsToHours(eventData.approve_window || 0) });
                    setEventCopy({ ...eventData, approve_window: convertSecondsToHours(eventData.approve_window || 0) });
                }
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in Modifying Event");
            }
        }
    }, [event_id]);

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
                <div>
                    <h6>Date</h6>
                    <input
                        type="date"
                        min="2000-01-01T00:00"
                        max="2100-12-31T23:59"
                        value={ event?.start_time ? toLocalDateValue(event.start_time) : ""}
                        onChange={ (e) => {
                            const date = e.target.value;
                            if(!date)
                                return;

                            const [y, m, d] = date.split("-").map(Number);
                            const start = new Date(y, m - 1, d);
                            if(Number.isNaN(start.getTime()))
                                return;

                            const end = new Date(start.getTime() + 60 * 60 * 1000);

                            setEvent((ev) => ev 
                                ? { 
                                    ...ev, 
                                    start_time: start.toISOString(), 
                                    end_time: end.toISOString() 
                                } 
                                : ev
                            );
                        }}
                    />
                </div>
                <div>
                    <h6>Start Time</h6>
                    <input
                        type="time"
                        value={ event?.start_time ? toLocalTimeValue(event.start_time) : ""}
                        onChange={ (e) => {
                            const time = e.target.value;
                            if(!time)
                                return;

                            const [hours, minutes] = time.split(":").map(Number);

                            setEvent((ev) => {
                                if(!ev) 
                                    return ev;

                                const base = ev.start_time ? new Date(ev.start_time) : new Date();
                                if(Number.isNaN(base.getTime())) 
                                    return ev;

                                const start = new Date(base);
                                start.setHours(hours, minutes, 0, 0);
                                const end = new Date(start.getTime() + 60 * 60 * 1000);

                                return {
                                    ...ev,
                                    start_time: start.toISOString(),
                                    end_time: end.toISOString(),
                                };
                            });
                        }}
                    />
                </div>
                <div className="numbers-cont">
                    <h6>Duration (in hours)</h6>
                    <input
                        type="number"
                        min={ 1 }
                        step={ 0.5 }
                        placeholder="Duration (hours)"
                        value={ event?.start_time && event?.end_time
                            ? ((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 3600000)
                            : ""
                        }
                        onChange={(e) => {
                            const durationHours = Number(e.target.value);

                            setEvent((ev) => {
                                if (!ev || !ev.start_time)
                                    return ev;

                                const start = new Date(ev.start_time);

                                if (Number.isNaN(start.getTime()))
                                    return ev;

                                const end = new Date(
                                    start.getTime() + durationHours * 3600000
                                );

                                return {
                                    ...ev,
                                    end_time: end.toISOString(),
                                };
                            });
                        }}
                    />
                </div>
                <div className="choosers chooser-1">
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
                        disabled={ isEditing }
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

                            if(value === ""){
                                setEvent(ev => ev ? { ...ev, max_players: 0 } : ev);
                                return;
                            }

                            const intValue = Math.floor(Number(value));
                            setEvent(ev => ev ? { ...ev, max_players: intValue } : ev);
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
                <div className="choosers chooser-2">
                    <h6>Sex</h6>
                    <SexChooser 
                        sex={ event?.sex ?? Sex.MIXED }
                        setSex={ (sex) => setEvent((ev) => ev ? { ...ev, sex } : ev) }
                    />
                </div>
                <div className="choosers chooser-3">
                    <h6>Level</h6>
                    <LevelChooser 
                        isPlayer={ false }
                        level={ event?.level ?? Level.ALL }
                        setLevel={ (level: Level) => setEvent((ev) => ev ? { ...ev, level: level } : ev) }
                    />
                </div>
                <div className="choosers chooser-4">
                    <h6>Event Type</h6>
                    <EventTypeChooser
                        event_type={ event?.event_type ?? EventType.OPENPLAY }
                        setEventType={ (event_type) => setEvent((ev) => ev ? { ...ev, event_type } : ev) }
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
                <div className="approve-cont">
                    <div className="switch">
                        <Button 
                            content="Auto-Approve"
                            onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_auto_approve: true } : ev) }
                            additionalClasses={ event?.is_auto_approve ? "active" : "" }
                        />
                        <Button 
                            content="Request Join"
                            onBtnClick={() => setEvent((ev) => ev ? { ...ev, is_auto_approve: false } : ev) }
                            additionalClasses={ event?.is_auto_approve ? "" : "active" }
                        />
                    </div>
                    { (!event?.is_auto_approve && (event?.price ? event.price : 0) > 0) &&
                        <div className="input-pair">
                            <h6>Number of Hours to Pay</h6>
                            <input 
                                type="number"
                                min={ 0 }
                                max={ 240 }
                                step="1"
                                value={ event?.approve_window ?? "" }
                                onChange={ (e) => {
                                    const value = e.target.value;
                                    setEvent((ev) => ev ? { ...ev, approve_window: value === "" ? null : Number(e.target.value) } : ev) 
                                }}
                            />
                        </div>
                    }
                </div>
            </div>
            <div className="save-btn-cont">
                <Button 
                    content={ isEditing 
                        ? ( isSaving ?  "Saving Changes..." : "Save Changes" ) 
                        : ( isSaving ? "Creating Event..." : "Create Event" ) 
                    }
                    onBtnClick={ () => isEditing ? saveChanges(false) : createEvent() }
                />
                { event?.series_id &&
                    <Button 
                        content={ isSaving ? "Saving Changes..." : "Save for Future Events" }
                        onBtnClick={ () => saveChanges(true) }
                    />
                }
            </div>
        </>;

    return (
        <div className="popup modify-event">
            <CloseButton setIsClosed={ setIsClosed } />
            { content }
        </div>
    );
}