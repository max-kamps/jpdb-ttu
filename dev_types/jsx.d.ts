// FIXME This is horrible, this should be replaced with something less brittle as soon as possible

type CommonAttributes = {
    id?: string;
    class?: string;
    role?: string;
    style?: string;
    contenteditable?: boolean;

    lang?: 'ja';
    part?: string;

    onclick?: undefined | ((event: MouseEvent) => any);
    onmousedown?: undefined | ((event: MouseEvent) => any);
    onmouseup?: undefined | ((event: MouseEvent) => any);
    onmouseenter?: undefined | ((event: MouseEvent) => any);
    onmouseleave?: undefined | ((event: MouseEvent) => any);

    onwheel?: undefined | ((event: WheelEvent) => any);

    oninput?: undefined | ((event: InputEvent) => any);
};
type AnyChildren = {
    children?: (string | Text | HTMLElement | (string | Text | HTMLElement)[])[];
};

type Regular = CommonAttributes & AnyChildren;

type AttributesForTag = {
    link: {
        rel: string;
        href: string;
    };

    style: { [k: string]: never };

    span: Regular;
    small: Regular;

    ruby: Regular;
    rt: Regular;

    div: Regular;
    article: Regular;
    section: Regular;
    dialog: Regular;
    h1: Regular;
    h2: Regular;
    h3: Regular;
    h4: Regular;
    h5: Regular;
    h6: Regular;

    ol: Regular & { start: number };
    li: Regular;

    template: Regular;

    a: {
        href: string;
        target?: '_self' | '_blank' | '_parent' | '_top';
    } & Regular;

    label: {
        for?: string;
    } & Regular;
    button: {
        name?: string;
        disabled?: boolean;
    } & Regular;
    input: {
        type: 'checkbox' | 'text' | 'number';
        name?: string;
        pattern?: string;
        disabled?: boolean;
        checked?: boolean;
    } & Regular;
    textarea: {
        name?: string;
        disabled?: boolean;
        rows?: number | string;
        cols?: number | string;
    } & Regular;

    slot: {
        name?: string;
    };
};

declare namespace JSX {
    type Element = HTMLElement;

    type IntrinsicElements = AttributesForTag;
}
