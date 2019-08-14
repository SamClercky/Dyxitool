interface Settings {
    dyslexic: Setting,
    font: Setting,
    markup: Setting,
    screen: Setting,
    color: Setting,
    opacity: Setting,
    _firstRunPassed: Setting
}
interface Setting {
    value: SettingValue,
    type: Type,
    label: string,
    help: string,
    spacer: number
}
interface PackedSetting {
    name: string,
    value: SettingValue
}
enum Type {
    checkbox = "checkbox",
    color = "color",
    range = "range"
}
type SettingValue = boolean | Color | number;
