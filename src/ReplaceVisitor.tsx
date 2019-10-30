import * as React from "react";
import { Visitor, NextFunc } from "./traverse-element-tree";

const {
    isValidElement,
    cloneElement
} = React;

export type MatchFunc<S> = (value: React.ReactNode, state?: S) => boolean;

export type ReplacerFunc<V extends React.ReactNode, S> = (value: V, state?: S) => React.ReactNode;

export type StateUpdateFunc<S> = (input: React.ReactNode, state?: S) => S;

export class ReplaceVisitor<S = any> implements Visitor<React.ReactNode, S> {
    match: MatchFunc<S>;
    replace: ReplacerFunc<any,S>;
    updateState?: StateUpdateFunc<S>;
    constructor(match: MatchFunc<S>, replace: ReplacerFunc<any,S>, updateState?: StateUpdateFunc<S>) {
        this.match = match;
        this.replace = replace;
        this.updateState = updateState;
    }
    visit(element: React.ReactNode, state: S, next?: NextFunc<React.ReactNode, S>): React.ReactNode {
        // update the state
        const newState = this.updateState ? this.updateState(element, state) : state;

        // grab the traversal result
        let result = next ? next(newState) : element;

        // perform the replace
        if (this.match(element, state)) {
            return this.replace(element, state);
        } else {
            return result;
        }
    }
    combine(parent: React.ReactNode | null, children: React.ReactNode | React.ReactNode[], _: S): React.ReactNode {
        if (Array.isArray(children)) {
            children = children.map((e, i) => {
                if (isValidElement(e)) {
                    return cloneElement(e, { ...e.props, key: i });
                } else {
                    return e;
                }
            });
        }
        if (parent && isValidElement(parent)) {
            return cloneElement(parent, {
                ...parent.props,
                children
            } as any);
        } else {
            return parent || children;
        }
    }
}
