import React from "react"
import {HalfSection} from "./component/section"
import {zeroPad,isNumber} from "../util/util"
import {intToHexStr,hexStrToInt} from "../calc/numbers"
import Item from "./component/item"
import * as Bacon from "baconjs"
import TextField from "material-ui/TextField"
import Avatar from "material-ui/Avatar"
import ByteValueSelector from "./component/byte-value-selector"

const styles = {
    avatar: {
        border: "1px solid #BBBBBB"
    }
}

function toRGBColor(r, g, b) {
    return (isNumber(r) && isNumber(g) && isNumber(b)) ? `rgb(${r}, ${g}, ${b})` : ""
}

function isValidComp(value) {
    return isNumber(value) && !isNaN(value) &&  value >= 0 && value <= 255
}

function toHexComp(value) {
    return isValidComp(value) ? zeroPad(intToHexStr(value), 2) : ""
}

function hexToComponents(value) {
    let r = ""
    let g = ""
    let b = ""
    value.replace(/^#?([0-9A-Za-z]{2})([0-9A-Za-z]{2})([0-9A-Za-z]{2})$/, (m, rr, gg, bb) => {
        r = hexStrToInt(rr)
        g = hexStrToInt(gg)
        b = hexStrToInt(bb)
        return undefined
    })

    return (isNumber(r) && isNumber(g) && isNumber(b)) ? { r: r, g: g, b: b } : undefined
}

function componentsToHex(value) {
    const r = `#${toHexComp(value.r)}${toHexComp(value.g)}${toHexComp(value.b)}`
    return r
}

const texts = {
    hex: "Heksakoodi",
    rgb: "RGB-arvo",
    r: "Red",
    g: "Green",
    b: "Blue"
}

const comps = ["r", "g", "b"]
const compInfo = {
    "hex": { write: v => v.hex },
    "r": { write: v => v.r },
    "g": { write: v => v.g },
    "b": { write: v => v.b }
}

export default class Colors extends React.Component {

    constructor(props) {
        super(props)

        this.valueChanged = this.valueChanged.bind(this)
        this.select = this.select.bind(this)

        this.components = ["r", "g", "b"]
        this.state = {
            hex: "#FFFFFF",
            color: "#FFFFFF",
            selected: "hex"
        }
        this.streams = {
            hex: new Bacon.Bus(),
            curSrc: new Bacon.Bus()
        }
        this.streams.hex.onValue(v => this.setState({ hex: v }))
        comps.forEach(c => {
            this.state[c] = 255
            this.streams[c] = new Bacon.Bus()
            this.streams[c].onValue(v => this.setState({[c]: v}))
        })
        const compStr = Bacon.combineTemplate({ r: this.streams.r, g: this.streams.g, b: this.streams.b})
        const hexStr = this.streams.hex.map(hexToComponents).filter(v => v !== undefined)
        const newValue = Bacon.mergeAll(compStr, hexStr)
        Bacon.combineTemplate({ value: newValue, src: this.streams.curSrc.skipDuplicates() }).onValue(t => {
            t.value.hex = componentsToHex(t.value)
            this.setState({ color: t.value.hex })
            if (t.src !== "hex") this.setState({ hex: t.value.hex })
            comps.forEach(c => {
                if (t.src != c) {
                    const v = compInfo[c].write(t.value)
                    this.setState({[c]: v})
                    this.refs[c].setValue(v)
                }
            })
        })
    }

    componentDidMount() {
        comps.forEach(c => this.streams[c].push(255))
    }

    asRgb() {
        return toRGBColor(this.state.r, this.state.g, this.state.b)
    }

    sendToParent(src) {
        const val = (src || this.state.selected) == "hex" ? this.state.hex : this.asRgb()
        this.props.onValue && this.props.onValue(val)
    }

    select(src) {
        this.setState({ selected: src })
        this.sendToParent(src)
    }

    valueChanged(value, src) {
        this.streams.curSrc.push(src)
        this.streams[src].push(value)
    }

    render() {
        return <HalfSection title="Väri" subtitle={texts[this.state.selected]}
                        avatar={<Avatar backgroundColor={this.state.color} style={styles.avatar}>&nbsp;</Avatar>}>
            <Item name="Heksa">
                <TextField hintText="#FFFFFF" name="color-hex" value={this.state.hex} maxLength={7}
                           onChange={e => this.valueChanged(e.target.value, "hex")} onFocus={e => this.select("hex")}/>
            </Item>
            <Item name="RGB-arvo">
                <TextField hintText="rgb(255,255,255)" name="color-rgb" value={this.asRgb()} readOnly
                           onFocus={e => this.select("rgb")}/>
            </Item>
            {
                comps.map(c => <ByteValueSelector key={c} name={texts[c]} value={this.state[c]}
                                                  onValue={v => this.valueChanged(v, c)} ref={c} />)
            }
        </HalfSection>

    }
}
