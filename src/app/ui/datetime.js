import React from "react"
import {HalfSection} from "./component/section"
import Item from "./component/item"
import TextField from "material-ui/TextField"
import moment from "moment"
import * as Bacon from "baconjs"
import {isDefined} from "../util/util"
import {strToInt} from "../calc/numbers"
import {zeroPad} from "../util/strings"
import {getNameDay} from "../util/namedays"

window.moment = moment

const styles = {
    len2: { width: "1.8em" },
    len3: { width: "2.6em" },
    len4: { width: "3.5em" },
    len7: { width: "4.2em" },
    center: { textAlign: "center", width: "100%" }
}

function readJavaTime(s) {
    if (typeof s === "string") s = parseInt(s, 10)
    if (typeof s !== "number" || isNaN(s)) return
    return moment(s)
}

function readUnixTime(s) {
    if (typeof s === "string") s = parseInt(s, 10)
    if (typeof s !== "number" || isNaN(s)) return
    return moment.unix(s)
}

function toIsoWeek(v) {
    return v.isValid() ? `${v.isoWeekYear()}/${v.isoWeek()}` : ""
}

function pad(val, len) {
    if (typeof val == "number" && isNaN(val)) return val
    return zeroPad(val, len)
}

const texts = {
    weekDay: ["", "ma", "ti", "ke", "to", "pe", "la", "su"]
}


const typeInfo = {
    week: { reportValue: true },
    focused: { },
    selected: { },
    iso8601: { reportValue: true },
    iso8601utc: { reportValue: true },
    nameDay: { reportValue: true },
    weekDay: { },
    javaTime: { read: readJavaTime, src: "javaTime", reportValue: true, write: m => m.valueOf() },
    unixTime: { read: readUnixTime, src: "unixTime", reportValue: true, write: m => m.unix() },
    day: { read: strToInt, src: "value", write: m => pad(m.date(), 2), style: styles.len2, maxLength: 2 },
    month: { read: v => strToInt(v) - 1, src: "value", write: m => pad(m.month() + 1, 2), style: styles.len2, maxLength: 2 },
    year: { read: strToInt, src: "value", write: m => m.year(), style: styles.len4, maxLength: 4 },
    hour: { read: strToInt, src: "value", write: m => pad(m.hour(), 2), style: styles.len2, maxLength: 2 },
    minute: { read: strToInt, src: "value", write: m => pad(m.minute(), 2), style: styles.len2, maxLength: 2 },
    second: { read: strToInt, src: "value", write: m => pad(m.second(), 2), style: styles.len2, maxLength: 2 },
    millisecond: { read: strToInt, src: "value", write: m => pad(m.millisecond(), 3), style: styles.len3, maxLength: 3 },
    direct: { src: "direct" }
}

const hints = {
    day: "31",
    month: "12",
    year: "2016",
    hour: "10",
    minute: "00",
    second: "00",
    millisecond: "000"
}

const valueTypes = ["day", "month", "year", "hour", "minute", "second", "millisecond"]

const types = Object.keys(typeInfo)

function toStateValue(mom, writer) {
    if (typeof mom !== "object") return ""
    let s = writer(mom)
    if (!isDefined(s) || (typeof s === "number" && isNaN(s))) return ""
    return (typeof s === "number") ? `${s}` : s
}

export default class DateTime extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}
        types.forEach(t => this.state[t] = "")
        this.inputChanged = this.inputChanged.bind(this)
        this.focusChanged = this.focusChanged.bind(this)
    }

    componentDidMount() {
        this.streams = { focused: new Bacon.Bus() }
        const incoming = { direct: new Bacon.Bus(), focused: this.streams.focused }
        types.forEach(t => {
            if (t != "focused") {
                this.streams[t] = new Bacon.Bus()
                this.streams[t].onValue(v => this.setState({[t]: v}))
                incoming[t] = ((typeInfo[t].read) ? this.streams[t].map(typeInfo[t].read) : this.streams[t])
            }
        })
        incoming.value = Bacon.combineTemplate({
            day: incoming.day,
            month: incoming.month,
            year: incoming.year,
            hour: incoming.hour,
            minute: incoming.minute,
            second: incoming.second,
            millisecond: incoming.millisecond
        }).map(v => moment(v))
        const newVal = Bacon.mergeAll(incoming.direct, incoming.unixTime, incoming.javaTime,
            Bacon.combineAsArray(incoming.value, this.streams.selected)
                .flatMapLatest(t => t[1] == "value" ? t[0] : Bacon.never()))
        Bacon.combineAsArray(newVal, this.streams.selected).onValue(r => {
            const val = r[0]
            const src = r[1]
            types.forEach(t => {
                if (typeInfo[t].src == src || !typeInfo[t].write) return
                const output = toStateValue(val, typeInfo[t].write)
                this.setState({ [t]: output })
                if (src != "value" && valueTypes.includes(t))
                    this.streams[t].push(output)
            })
            incoming.iso8601.push(toStateValue(val, v => v.isValid() && v.format()))
            incoming.iso8601utc.push(toStateValue(val, v => v.isValid() && v.utc().format()))
            incoming.week.push(toStateValue(val, toIsoWeek))
            incoming.weekDay.push(toStateValue(val, v => texts.weekDay[v.isoWeekday()]))
            incoming.nameDay.push(toStateValue(val, v => getNameDay(v.month() + 1, v.date())))
        })
        this.pushValue(moment(), "direct")
    }

    inputChanged(event) {
        const src = event.target.name
        const val = event.target.value
        this.pushValue(val, src)
    }

    focusChanged(event) {
        const src = event.target.name
        this.streams.focused.push(src)
    }

    pushValue(val, src) {
        this.streams.selected.push(typeInfo[src].src)
        this.streams[src].push(val)
    }

    renderType(type) {
        return <TextField type="text" value={this.state[type]} style={typeInfo[type].style}
                          maxLength={typeInfo[type].maxLength} name={type} hintText={hints[type]}
                          inputStyle={styles.center} hintStyle={styles.center}
                          onChange={this.inputChanged} onFocus={this.focusChanged} />
    }

    render() {
        return <HalfSection title="Aikaleimat">
            <Item name="Java/JS time">
                <TextField type="text" value={this.state.javaTime} fullWidth={true} name="javaTime"
                           onChange={this.inputChanged } onFocus={this.focusChanged} />
            </Item>
            <Item name="Unixtime">
                <TextField type="text" value={this.state.unixTime} fullWidth={true} name="unixTime"
                           onChange={this.inputChanged} onFocus={this.focusChanged} />
            </Item>
            <Item name="Päivä" style={styles.item}>
                {this.renderType("day")}.{this.renderType("month")}.{this.renderType("year")}
                (<TextField type="text" value={this.state.weekDay} style={styles.len2} name="weekDay"
                            hintText="la" inputStyle={styles.center} hintStyle={styles.center} readOnly
                            onFocus={this.focusChanged} />)
            </Item>
            <Item name="Kellonaika" style={styles.item}>
                {this.renderType("hour")}:{this.renderType("minute")}:{this.renderType("second")}.{this.renderType("millisecond")}
            </Item>
            <Item name="Viikko">
                <TextField type="text" name="week" value={this.state.week} style={styles.len7} readOnly
                           inputStyle={styles.center} hintStyle={styles.center} hintText="2016/52"
                           onFocus={this.focusChanged} />
            </Item>
            <Item name="Nimipäivä">
                <TextField type="text" name="nameDay" value={this.state.nameDay} fullWidth={true} readOnly
                           multiLine={true} onFocus={this.focusChanged} />
            </Item>
            <Item name="ISO-8601">
                <TextField type="text" name="iso8601" value={this.state.iso8601} fullWidth={true} readOnly
                           onFocus={this.focusChanged} />
            </Item>
            <Item name="ISO-8601 UTC">
                <TextField type="text" name="iso8601utc" value={this.state.iso8601utc} fullWidth={true} readOnly
                           onFocus={this.focusChanged} />
            </Item>
            </HalfSection>

    }
}