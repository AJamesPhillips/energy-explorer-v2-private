
// Because we do not save any game state at the moment nor warn the user about
// losing their changes, we force any link clicks to open in a new tab, for now.
const target = "_blank"

export function Link(props: { url: string, noWrap?: boolean, children: React.ReactNode, style?: React.CSSProperties })
{
    const { url } = props

    return <a
        href={url}
        target={target}
        rel="noopener noreferrer"
        style={{ whiteSpace: props.noWrap ? "nowrap" : undefined, ...props.style }}
        onClick={e => {
            e.preventDefault()

            // When hosted on WikiSim inside an iFrame, we want to open links in
            // a new tab on the parent window, not inside the iFrame
            if (window.parent !== window)
            {
                window.parent.postMessage({ type: "OPEN_URL", url, target }, "*")
            }
            else
            {
                window.open(url, target)
            }
        }}
    >
        {props.children}
    </a>
}
