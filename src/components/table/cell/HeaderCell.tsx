import { Text } from "@sanity/ui";
import { StyledCell } from "./Cell.styles";
import { ComponentPropsWithoutRef } from "react";

interface HeaderCellProps extends ComponentPropsWithoutRef<'th'> {
    as?: React.ElementType
    children: React.ReactNode
}

export function HeaderCell(props: HeaderCellProps) {
    const {as = 'th', children, ...rest} = props
    return <StyledCell as={as} {...rest}><Text as="span" size={2}>{children}</Text></StyledCell>
}