import * as React from "react"
import FontIcon from "material-ui/FontIcon"
import {red500,lightBlue600} from "material-ui/styles/colors"
import IconButton from "material-ui/IconButton"

interface ToolbarProps {
    title: string;
    color: string;
    icon: string;
    onClick: () => any;
}

export default class ToolButton extends React.Component<ToolbarProps, {}> {
    render() {
        return <IconButton tooltip={this.props.title} title={this.props.title} onClick={this.props.onClick}>
                <FontIcon className="material-icons" color={this.props.color}>{ this.props.icon }</FontIcon>
            </IconButton>
    }
}

interface ButtonProps {
    title: string;
    onClick: () => any;
}

export function GenerateButton({ title, onClick }: ButtonProps) {
    return <ToolButton color={lightBlue600} icon="add_circle" title={title} onClick={onClick} />
}

export function ClipboardButton({ title, onClick }: ButtonProps) {
    return <ToolButton color={red500} icon="content_copy" title={title} onClick={onClick} />
}
