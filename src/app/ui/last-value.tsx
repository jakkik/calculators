import * as React from "react"
import { ClipboardButton } from "./component/tool-button"
import log from "../util/log"
import TextField from "material-ui/TextField"
import {ToolbarGroup} from "material-ui/Toolbar"

export default class LastValue extends React.Component<{}, any> {

    constructor(props: {}) {
        super(props)
        this.state = { value: "" }
        this.setValue = this.setValue.bind(this)
        this.copyToClipboard = this.copyToClipboard.bind(this)
    }

    setValue(v: any) {
        this.setState({ value: v || "" })
    }

    copyToClipboard() {
        const field = this.refs.lastValue as TextField
        try {
            field.select()
            document.execCommand("copy")
        } catch (e) {
            log(`Could not copy: ${e}`)
        }
    }

    render() {
        return <ToolbarGroup>
            <ClipboardButton title="Kopioi leikepöydälle" onClick={this.copyToClipboard} />
            <TextField value={ this.state.value } ref="lastValue" name="lastValue" fullWidth={true}
                       hintText="Viimeisin arvo" onChange={(i, v) => this.setValue(v)}/>
        </ToolbarGroup>
    }
}
