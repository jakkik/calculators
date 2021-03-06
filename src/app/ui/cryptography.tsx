import * as React from 'react'
import * as Bacon from 'baconjs'
import SelectableOutput from './component/selectable-output'
import Section from './component/section'
import Item from './component/item'
import TextField from 'material-ui/TextField'
const crypto = require('crypto-browserify')

interface CryptographyProps {
    readonly onValue: (x: any) => any
}

interface CryptoType {
    readonly name: string
    readonly calculate: (x: string) => string
    readonly code: string
    valueStream?: Bacon.Bus<any, string>
}

export function hash(x: string, algorithm: string): string {
    return crypto.createHash(algorithm).update(x).digest('hex')
}

export default class Cryptography extends React.Component<CryptographyProps, any> {

    private cryptoList: CryptoType[]
    private cryptos: { [key: string]: CryptoType }
    private default: string
    private inputStream: Bacon.Bus<any, string>
    private cryptoSelectStream: Bacon.Bus<any, string>

    constructor(props: CryptographyProps) {
        super(props)
        this.cryptoList = [
            { name: 'MD5', calculate: x => hash(x, 'md5'), code: 'md5' },
            { name: 'SHA-1', calculate: x => hash(x, 'sha1'), code: 'sha1' },
            { name: 'SHA-256', calculate: x => hash(x, 'sha256'), code: 'sha256' },
            { name: 'SHA-512', calculate: x => hash(x, 'sha512'), code: 'sha512' },
        ]
        this.cryptos = {}
        this.cryptoList.forEach((c: any) => this.cryptos[c.code] = c)
        this.default = this.cryptoList[0].code

        this.state = { input: '', selected: this.default }
    }

    public componentDidMount() {
        this.inputStream = new Bacon.Bus<any, string>()
        this.cryptoSelectStream = new Bacon.Bus<any, string>()
        this.inputStream.onValue(v => this.cryptoList.forEach(c => (this.refs[c.code] as SelectableOutput).setValue(v)))
        this.cryptoList.forEach(l => {
            l.valueStream = new Bacon.Bus<any, string>()
            const prop = l.valueStream.toProperty('')
            prop.combine(
                this.cryptoSelectStream.toProperty(this.default).map(c => c === l.code),
                (val, match) => [val, match],
            ).onValue(x => x[1] && this.props.onValue(x[0]))
        })
    }

    private inputChanged = (event: any) => {
        const inp = event.target.value
        this.setState({ input: inp })
        this.inputStream.push(inp)
    }

    private selectCrypto(code: any) {
        this.setState({ selected: code })
        this.cryptoSelectStream.push(code)
    }

    public render() {
        return <Section title="Kryptografia" subtitle={this.cryptos[this.state.selected].name}>
            <Item name="Syöte">
                <TextField onChange={this.inputChanged} fullWidth={true} multiLine={true} name="input" />
            </Item>
            {this.cryptoList.map(this.renderCrypto)}
        </Section>
    }

    private renderCrypto = (c: CryptoType) => {
        return <SelectableOutput
            ref={c.code}
            type={c.code}
            label={c.name}
            calculate={c.calculate}
            onValue={v => c.valueStream && c.valueStream.push(v)}
            key={c.code}
            onSelect={() => this.selectCrypto(c.code)} />
    }

}
