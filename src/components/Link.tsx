
// Because we do not save any game state at the moment nor warn the user about
// losing their changes, we force any link clicks to open in a new tab, for now.
const target_blank = "_blank"

export function Link(props: { url: string, children: React.ReactNode })
{
    return <a
        href={props.url}
        target={target_blank}
        rel="noopener"
        onClick={e => {
            e.preventDefault()

            // When hosted on WikiSim inside an iFrame, we want to open links in
            // a new tab on the parent window, not inside the iFrame
            if (window.parent !== window)
            {
                window.parent.open(props.url, target_blank)
            }
            else
            {
                window.open(props.url, target_blank)
            }
        }}
    >
        {props.children}
    </a>
}
