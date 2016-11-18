import React from 'react'
import CheckValue from "./component/check-value"
import Section from "./component/section"
import * as companyId from "../calc/companyid"
import * as bankReference from "../calc/bankreference"
import * as hetu from "../calc/hetu"
import * as util from "../util/util"

export default class Identifiers extends React.Component {

    render() {
        return <Section title="Tunnisteet">
            <CheckValue name="Henkilötunnus" id="hetu"
                        check={hetu.check} generate={hetu.generate} combine={util.combine}
                        onValue={this.props.onValue} maxLength="10" width="7em" />
            <CheckValue name="Viitenumero" id="bank-reference"
                        check={bankReference.check} generate={bankReference.generate} combine={util.combine}
                        onValue={this.props.onValue} maxLength="24" width="10em" />
            <CheckValue name="Y-tunnus" id="companyId"
                        check={companyId.check} generate={companyId.generate} combine={util.combineWith("-")}
                        onValue={this.props.onValue} maxLength="7" width="7em" />
        </Section>

    }
}
