import React, { ReactElement, ComponentType, PropsWithChildren } from "react";

export type MatchFunc = (value: any) => boolean;

export type ReplacerFunc = (value: any) => ReactElement;

export type ReplacerProps =
    | {
        match: MatchFunc;
        replace: ReplacerFunc;
    }
    | {
        matchElement: ComponentType | string;
        replace: ReplacerFunc;
    }
    | {
        matchLiteral: MatchFunc;
        replace: ReplacerFunc;
    };

function replaceTree(
    input: any,
    props: { match: MatchFunc; replace: ReplacerFunc },
    index?: any,
    skipMatch: boolean = false
): ReactElement | ReactElement[] {
    if (!skipMatch && props.match(input)) {
        return replaceTree(props.replace(input), props, index, true);
    } else if (React.isValidElement(input)) {
        let element = (input as any) as ReactElement;
        if (typeof element.type === "function") {
            element = (element.type as any)(element.props);
        }
        return React.cloneElement(element, {
            ...element.props,
            key: index,
            children: replaceTree(element.props.children, props, index)
        });
    } else if (Array.isArray(input)) {
        return input.reduce(
            (acc, item, index) => acc.concat(replaceTree(item, props, index)),
            []
        );
    } else {
        return input as any;
    }
}

function Replacer(
    props: PropsWithChildren<ReplacerProps>
): ReactElement {
    let match: MatchFunc = v => false;
    let replace = props.replace;
    if ("matchElement" in props) {
        match = i => React.isValidElement(i) && i.type === props.matchElement;
    } else if ("matchLiteral" in props) {
        match = i =>
            !Array.isArray(i) && !React.isValidElement(i) && props.matchLiteral(i);
    } else {
        match = props.match;
    }
    return replaceTree(props.children, { match, replace }) as any;
}

export { Replacer };
