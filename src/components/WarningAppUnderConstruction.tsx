import { JSX } from "react"


export function WarningAppUnderConstruction(props: { custom_message?: string | JSX.Element })
{
    return <div style={{
        backgroundColor: "#fff3cd",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ffeeba",
        marginBottom: "16px",
        textAlign: "center",
    }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ flex: "0 0 auto" }}>🚧</span>
            <span style={{
                flex: "0 1 auto",
                minWidth: 0,
                whiteSpace: "normal",
                overflowWrap: "break-word",
                maxWidth: "60ch",
            }}>
                {props.custom_message ?? "This section is under construction"}
            </span>
            <span style={{ flex: "0 0 auto" }}>🚧</span>
        </div>
    </div>
}
