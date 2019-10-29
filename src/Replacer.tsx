import * as React from "react";

export type MatchFunc<S> = (value: any, state?: S) => boolean;

export type ReplacerFunc<S> = (value: any, state?: S) => React.ReactElement;

export type StateUpdateFunc<S> = (input: any, state?: S) => S;

export type ReplacerSharedProps<StateType=any> = {
    replace: ReplacerFunc<StateType>;
    updateState?: StateUpdateFunc<StateType>;
    initialState?: StateType;
}

export type ReplacerProps<StateType = any> = ReplacerSharedProps<StateType> & 
    ({
        match: MatchFunc<StateType>;
    }
    | {
        matchElement: React.ComponentType | string;
    }
    | {
        matchLiteral: MatchFunc<StateType>;
    });

function replaceTree<StateType>(
    input: any,
    props: { 
        match: MatchFunc<StateType>; 
        replace: ReplacerFunc<StateType>;
        updateState?: StateUpdateFunc<StateType>;
    },
    index?: any,
    state?: StateType,
    skipMatch: boolean = false
): React.ReactElement | React.ReactElement[] {
    if (props.updateState) {
        state = props.updateState(input, state);
    }
    if (!skipMatch && props.match(input, state)) {
        return replaceTree(props.replace(input, state), props, index, state, true);
    } else if (React.isValidElement(input)) {
        let element = (input as any) as React.ReactElement;
        if (typeof element.type === "function") {
            element = (element.type as any)(element.props);
        }
        return React.cloneElement(element, {
            ...element.props,
            key: index,
            children: replaceTree(element.props.children, props, index, state)
        });
    } else if (Array.isArray(input)) {
        return input.reduce(
            (acc, item, index) => acc.concat(replaceTree(item, props, index, state)),
            []
        );
    } else {
        return input as any;
    }
}

function Replacer<StateType=any>(
    props: React.PropsWithChildren<ReplacerProps<StateType>>
): React.ReactElement {
    let match: MatchFunc<StateType> = () => false;
    const replace = props.replace;
    const updateState = props.updateState;
    if ("matchElement" in props) {
        match = i => React.isValidElement(i) && i.type === props.matchElement;
    } else if ("matchLiteral" in props) {
        match = i =>
            !Array.isArray(i) && !React.isValidElement(i) && props.matchLiteral(i);
    } else {
        match = props.match;
    }
    return replaceTree(props.children, { match, replace, updateState }, undefined, props.initialState) as any;
}

export { Replacer };
