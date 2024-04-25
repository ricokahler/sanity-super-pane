import { Text } from "@sanity/ui";
import { StyledCell } from "./Cell.styles";

export function Cell({children}: {children: React.ReactNode}) {
   return <StyledCell><Text size={1}>{children}</Text></StyledCell>
}