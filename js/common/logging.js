const DEBUGGING = false;
const PREFIX = "dyxitool - ";
class Log {
    static info(msg) {
        if (DEBUGGING)
            console.info(PREFIX + msg);
    }
    static log(msg) {
        if (DEBUGGING)
            console.log(PREFIX + msg);
    }
    static error(msg) {
        if (DEBUGGING)
            console.error(PREFIX + msg);
    }
    static debugRaw(object) {
        if (DEBUGGING) {
            console.log(PREFIX);
            console.log(object);
        }
    }
}
//# sourceMappingURL=logging.js.map