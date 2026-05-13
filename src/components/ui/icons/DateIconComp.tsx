import "./IconComp.css";

type DateIconCompProp = {
    startTime: string | null;
    endTime: string | null;
    name?: string | null;
    description?: string | null;
    address?: string | null;
};

export default function DateIconComp({ startTime, endTime, name, description, address }: DateIconCompProp){
    if(!startTime || !endTime || !name)
        return <></>;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: name ?? "",
        dates: `${format(start)}/${format(end)}`,
        details: description ?? "",
        location: address ?? ""
    });

    const hrefCal = `https://calendar.google.com/calendar/render?${params.toString()}`;

    return (
        <div className={`icon-comp-cont`}>
            <svg viewBox="-0.5 0 15 15" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M61,154.006845 C61,153.45078 61.4499488,153 62.0068455,153 L73.9931545,153 C74.5492199,153 75,153.449949 75,154.006845 L75,165.993155 C75,166.54922 74.5500512,167 73.9931545,167 L62.0068455,167 C61.4507801,167 61,166.550051 61,165.993155 L61,154.006845 Z M62,157 L74,157 L74,166 L62,166 L62,157 Z M64,152.5 C64,152.223858 64.214035,152 64.5046844,152 L65.4953156,152 C65.7740451,152 66,152.231934 66,152.5 L66,153 L64,153 L64,152.5 Z M70,152.5 C70,152.223858 70.214035,152 70.5046844,152 L71.4953156,152 C71.7740451,152 72,152.231934 72,152.5 L72,153 L70,153 L70,152.5 Z" transform="translate(-61 -152)"/>
            </svg>
            <div className="right-side">
                <h6 className="name">
                    { new Date(startTime).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    })}
                </h6>
                <p className="bottom">{
                    `${ startTime ? new Date(startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "" } - ${ endTime? new Date(endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "" }`} • <a href={ hrefCal } target="_blank">Add to Calendar</a>
                </p>
            </div>
        </div>
    );
}