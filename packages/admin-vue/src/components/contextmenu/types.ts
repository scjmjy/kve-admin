export interface ContextMenuItem {
    label: string;
    // command: string | number;
    handler: () => void | Promise<void>;
    icon?: string;
    disabled?: boolean;
    divider?: "top" | "bottom" | "top-bottom";
}
