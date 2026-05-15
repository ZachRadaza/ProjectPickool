import { Recurring, type Events } from "../schemas";
import { supabase } from "../supabase";
import { EventSeriesService } from "./EventSeriesService";
import { LocationService } from "./LocationService";

const eventBody = `
    id,
    name,
    club:clubs(
        id,
        name,
        profile_pic
    ),
    start_time,
    end_time,
    location:locations(*),
    price,
    description,
    is_auto_approve,
    is_singles,
    event_type,
    sex,
    level,
    max_players,
    recurring,
    approve_window,
    series_id
`;

export const EventService = {

    async getEvent(id: string){
        try{
            const { data, error } = await supabase
                .from("events")
                .select(eventBody)
                .eq("id", id)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToEvent(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubEvents(club_id: string, page: number){
        try{
            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            const { data, error } = await supabase
                .from("events")
                .select(eventBody)
                .eq("club_id", club_id)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const events: Events[] = this.convertListOfEvents(trimmedData);

            return { data: events, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getPossibleUserEvents(user_id: string, page: number){
        try{
            const { data: dataClub, hasMore: hasMoreClub } = await this.getPossileUserClubEvents(user_id, page);
            const { data: dataClose, hasMore: hasMoreClose } = await this.getNearUserEvents(user_id, page);

            const hasMore = hasMoreClub || hasMoreClose;
            const data = [...dataClub, ...dataClose];

            const uniqueEvents = Array.from(
                new Map(data.map(e => [e.id, e])).values()
            );

            return { data: uniqueEvents, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getPossileUserClubEvents(user_id: string, page: number){
        const pageSize = 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: clubData, error: clubError } = await supabase
            .from("club_members")
            .select("club_id")
            .eq("user_id", user_id);

        if(clubError)
            throw new Error(clubError.message);

        const club_ids = clubData.map((club) => club.club_id);

        if(club_ids.length === 0)
            return { data: [], hasMore: false };

        const { data, error } = await supabase
            .from("events")
            .select(eventBody)
            .in("club_id", club_ids)
            .order("created_at", { ascending: false })
            .range(from, to + 1);

        if(error)
            throw new Error(error.message);

        const hasMore = data.length > pageSize;
        const trimmedData = data.slice(0, pageSize);
        const converted = this.convertListOfEvents(trimmedData);

        return { data: converted, hasMore };
    },

    async getNearUserEvents(user_id: string, page: number){
        try{
            const pageSize = 10;
            const { data, error } = await supabase.rpc("get_nearby_events", {
                p_user_id: user_id,
                p_radius_km: 20,
                p_page: page,
                p_page_size: pageSize + 1
            });

            if(error) 
                throw new Error(error.message);

            const hasMore = (data?.length ?? 0) > pageSize;
            const trimmedData = data?.slice(0, pageSize) ?? [];
            const events = this.convertListOfEvents(trimmedData);

            return { data: events, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryEvents(query: string, page: number){
        try{
            if(!query.trim()) 
                return { data: [], hasMore: false };

            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("events")
                .select(eventBody)
                .ilike("name", `%${query.trim()}%`)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const converted = this.convertListOfEvents(trimmedData);

            return { data: converted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryNearUserEvents(user_id: string, query: string, page: number){
        try{
            if(!query.trim())
                return { data: [], hasMore: false };

            const pageSize = 10;
            const { data, error } = await supabase.rpc("get_nearby_events", {
                p_user_id: user_id,
                p_radius_km: 20,
                p_page: page,
                p_page_size: pageSize + 1
            });

            if(error)
                throw new Error(error.message);

            if(!data)
                return { data: [], hasMore: false };

            const events = data?.slice(0, pageSize) ?? [];
            const filtered = events.filter((event: Events) => event.name.toLowerCase().includes(query.toLowerCase()));
            const converted = this.convertListOfEvents(filtered);
            const hasMore = (data?.length ?? 0) > pageSize;

            return { data: converted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getTopEvents(page: number){
        try{
            const pageSize = 10;
            const { data, error } = await supabase.rpc('get_top_events', {
                page_number: page,
                page_size: pageSize + 1,
            });

            if(error)
                throw new Error(error.message);
            
            if(!data)
                return { data: [], hasMore: false };

            const hasMore = (data?.length ?? 0) > pageSize;
            const eventsRaw = data?.slice(0, pageSize) ?? [];
            const events = this.convertListOfEvents(eventsRaw);

            return { data: events, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addEvent(event: Events){
        try{
            const { location, ...eventNoLoc } = event;
            let eventUpdatedLoc = eventNoLoc;

            if(location && !location.id){
                const locationNew = await LocationService.locationExists(location);
                eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
            }

            let addedEvent;
            if(eventUpdatedLoc.recurring !== Recurring.NONE)
                addedEvent = await EventSeriesService.addEventSeries(eventUpdatedLoc);
            else {
                const { data, error } = await supabase
                    .from("events")
                    .insert([event])
                    .select(eventBody)
                    .single();

                if(error)
                    throw new Error(error.message);

                addedEvent = this.convertToEvent(data);
            }
                
            return addedEvent;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateEvent(event_id: string, event: Partial<Events>){
        try{
            const { location, ...eventNoLoc } = event;
            let eventUpdatedLoc = eventNoLoc;

            if(location && !location.id){
                const locationNew = await LocationService.locationExists(location);
                eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
            }

            const { data, error } = await supabase
                .from("events")
                .update(eventUpdatedLoc)
                .eq("id", event_id)
                .select(eventBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToEvent(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateEventSeries(series_id: string, event: Partial<Events>){
        try{
            const { location, ...eventNoLoc } = event;
            let eventUpdatedLoc = eventNoLoc;

            if(location && !location.id){
                const locationNew = await LocationService.locationExists(location);
                eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
            }

            const updated = await EventSeriesService.updateEventSeries(series_id, eventUpdatedLoc);

            return this.convertToEvent(updated);
        } catch(error){
            console.error("error", error);
            throw error;
        }   
    },

    async deleteEvent(event_id: string){
        try{
            const { data, error } = await supabase
                .from("events")
                .delete()
                .eq("id", event_id)
                .select(eventBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToEvent(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteEventSeries(event_id: string, series_id: string){
        try{
            const ret = await this.deleteEvent(event_id);
            await EventSeriesService.deleteEventSeries(series_id);

            return ret;
        } catch(error){
            console.error("error", error);
            throw error;
        }   
    },

    convertToEvent(data: any){
        if(data === null)
            return null;

        const event: Events = {
            id: data.id,
            name: data.name,
            club: data.club,
            start_time: data.start_time,
            end_time: data.end_time,
            location: data.location,
            price: data.price,
            description: data.description,
            is_auto_approve: data.is_auto_approve,
            is_singles: data.is_singles,
            event_type: data.event_type,
            sex: data.sex,
            level: data.level,
            max_players: data.max_players,
            recurring: data.recurring,
            approve_window: data.approve_window,
            series_id: data.series_id
        };

        return event;
    },

    convertListOfEvents(data: any[]){
        const raw: any[] = data.map((event) => this.convertToEvent(event));
        const events: Events[] = raw.filter((event) => event !== null);

        return events;
    }
};