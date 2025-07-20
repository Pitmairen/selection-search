/* https://stackoverflow.com/a/74538176/183921 */
const createLock = () => {
    const queue = [];
    let active = false;
    return (fn) => {
        let deferredResolve;
        let deferredReject;
        const deferred = new Promise((resolve, reject) => {
            deferredResolve = resolve;
            deferredReject = reject;
        });
        const exec = async () => {
            try {
                const result = await fn();
                deferredResolve(result);
            } catch (err) {
                deferredReject(err);
            }
            if (queue.length > 0) {
                queue.shift()();
            } else {
                active = false;
            }
        };
        if (active) {
            queue.push(exec);
        } else {
            active = true;
            exec();
        }
        return deferred;
    };
};