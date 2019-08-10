const DEBUGGING = true;
const PREFIX = "dyxitool - ";

class Log {
    static info(msg: string) {
        if (DEBUGGING) console.info(PREFIX + msg);
    }

    static log(msg: string) {
        if (DEBUGGING) console.log(PREFIX + msg);
    }

    static error(msg: string) {
        if (DEBUGGING) console.error(PREFIX + msg);
    }

    static debugRaw(object: any) {
        if (DEBUGGING) {
            console.log(PREFIX);
            console.log(object);
        }
    }
}