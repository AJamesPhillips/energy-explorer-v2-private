

export const SINGLETON = {
    _mouse_events_locks: new Set<string>(),
    any_mouse_events_locked(): boolean
    {
        return this._mouse_events_locks.size > 0
    },
    acquire_mouse_events_lock(name: string): { release: () => void }
    {
        if (this._mouse_events_locks.size > 0)
        {
            console.warn(`Lock "${name}" requested mouse event lock but it is already held by components: ${Array.from(this._mouse_events_locks).join(", ")}. This may cause issues with dragging and other mouse interactions.`)
        }

        this._mouse_events_locks.add(name)
        return {
            release: () =>
            {
                this._mouse_events_locks.delete(name)
            }
        }
    },
}
