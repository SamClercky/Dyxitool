const DEBUGGING = true;
const PREFIX = "dyxitool - ";

class Log {
    static info(msg: any) {
        if (DEBUGGING) console.info(PREFIX, msg);
    }

    static log(msg: any) {
        if (DEBUGGING) console.log(PREFIX, msg);
    }

    static warn(msg: any) {
        if (DEBUGGING) console.warn(PREFIX, msg);
    }

    static error(msg: any) {
        if (DEBUGGING) console.error(PREFIX, msg);
    }

    static debugRaw(object: any) {
        if (DEBUGGING) {
            console.log(PREFIX);
            console.log(object);
        }
    }
}