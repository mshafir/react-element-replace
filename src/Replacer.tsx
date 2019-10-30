import * as React from "react";
import { traverseElementTree } from "./traverse-element-tree";
import { MatchFunc, ReplacerFunc, StateUpdateFunc, ReplaceVisitor } from './ReplaceVisitor';

const {
    isValidElement
} = React;

export type ReplacerSharedProps<StateType = any> = {
    replace: ReplacerFunc<any, StateType>;
    updateState?: StateUpdateFunc<StateType>;
    initialState?: StateType;
}

export type ReplacerProps<StateType = any> = ReplacerSharedProps<StateType> &
    ({
        match: MatchFunc<StateType>;
        replace: ReplacerFunc<React.ReactNode, StateType>;
    }
    | {
        matchElement: React.ComponentType | string;
        replace: ReplacerFunc<React.ReactElement, StateType>;
    }
    | {
        matchLiteral: MatchFunc<StateType>;
        replace: ReplacerFunc<React.ReactNode, StateType>;
    });

function Replacer<StateType = any>(
    props: React.PropsWithChildren<ReplacerProps<StateType>>
): React.ReactElement {
    let match: MatchFunc<StateType> = () => false;
    const replace = props.replace;
    const updateState = props.updateState;
    if ("matchElement" in props) {
        match = i => isValidElement(i) && i.type === props.matchElement;
    } else if ("matchLiteral" in props) {
        match = i =>
            !Array.isArray(i) && !isValidElement(i) && props.matchLiteral(i);
    } else {
        match = props.match;
    }
    const visitor = new ReplaceVisitor(match, replace, updateState);
    return <>{traverseElementTree(props.children, visitor)}</>;
}

export { Replacer };