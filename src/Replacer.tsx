import * as React from "react";

export type MatchFunc = (value: any) => boolean;

export type ReplacerFunc = (value: any) => React.ReactElement;

export type ReplacerProps =
    | {
        match: MatchFunc;
        replace: ReplacerFunc;
    }
    | {
        matchElement: React.ComponentType | string;
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
): React.ReactElement | React.ReactElement[] {
    if (!skipMatch && props.match(input)) {
        return replaceTree(props.replace(input), props, index, true);
    } else if (React.isValidElement(input)) {
        let element = (input as any) as React.ReactElement;
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
    props: React.PropsWithChildren<ReplacerProps>
): React.ReactElement {
    let match: MatchFunc = () => false;
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
