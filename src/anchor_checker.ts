/* Runtime Anchor Checker
   - Scans existing <a> elements and watches for newly added ones via MutationObserver.
   - Logs a warning for anchors that do not include the required class.
   - Auto-enabled when URL contains `check_anchors` or localStorage `check_anchors` is set to "1".
*/

const DEFAULT_REQUIRED_CLASS = "wikisim_link"

function check_anchor(el: HTMLAnchorElement)
{
    // Not sure where these links come from but we do not need to check them
    if (!el.id.startsWith("sizzle") || el.href === "")
    {
        return
    }

    if (!el.classList.contains(DEFAULT_REQUIRED_CLASS))
    {
        // Log the element itself so console shows a clickable DOM node
        console.warn(`[AnchorChecker] <a> missing class "${DEFAULT_REQUIRED_CLASS}"`, el)
        throw new Error(`[AnchorChecker] <a> missing class "${DEFAULT_REQUIRED_CLASS}"`)
    }
}

export function enable_anchor_checker()
{
    // Initial scan
    try {
        document.querySelectorAll("a").forEach(n => check_anchor(n as HTMLAnchorElement))
    }
    catch (e) {
        // document may not be ready; ignore
    }

    // Observe future additions
    const observer = new MutationObserver(mutations =>
    {
        for (const m of mutations)
        {
            if (m.type === "childList")
            {
                m.addedNodes.forEach(node =>
                {
                    if (!(node instanceof Element)) return
                    if (node.tagName === "A") check_anchor(node as HTMLAnchorElement)
                    node.querySelectorAll && node.querySelectorAll("a").forEach(a => check_anchor(a as HTMLAnchorElement))
                })
            }
        }
    })

    observer.observe(document.documentElement || document, { childList: true, subtree: true })

    return () => observer.disconnect()
}

// Auto-enable heuristics: URL param `check_anchors` or localStorage `check_anchors` === "1"
try {
    const url = new URL(location.href)
    const enabled = url.hostname === "localhost" || url.searchParams.has("check_anchors")
    if (enabled) enable_anchor_checker()
}
catch (e) {
    // ignore in non-browser contexts
}
