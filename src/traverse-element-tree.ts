import * as React from "react";

const {
    isValidElement
} = React;

export type NextFunc<T,S> = (newState: S) => T;

export interface Visitor<T=any, S=any> {
    visit(element: React.ReactNode, state: S, next?: NextFunc<T,S>): T;
    combine(parent: React.ReactNode | null, children: T | T[], state: S) : T;
}

export function traverseElementTree<T=any, S=any>(
    node: React.ReactNode,
    visitor: Visitor<T,S>,
    state?: any
) : T {
    function visit(next?: React.ReactNode) {
        return visitor.visit(node, state, next ? 
            (newState: S) => traverseElementTree(next, visitor, newState) : 
            undefined);
    }

    if (isValidElement(node)) {
        if (typeof node.type === "function") {
            if ('prototype' in node.type && node.type.prototype.isReactComponent) {
                node = new (node.type as React.ComponentClass)(node.props).render();
            } else {
                node = (node.type as any)(node.props);
            }
            return traverseElementTree(node, visitor, state);
        } else if (node.props && 'children' in node.props) {
            const children : any | any[] = node.props['children'];
            const traversed = Array.isArray(children) ? 
                children.map((child: any) => 
                    traverseElementTree(child, visitor, state)) :
                traverseElementTree(children, visitor, state);
            return visitor.visit(visitor.combine(node, traversed, state), state);
        } else {
            return visit();
        }
    } else if (Array.isArray(node)) {
        const visited = node.map(
            (item: React.ReactNode) => visit(item));
        return visitor.combine(null, visited, state);
    } else {
        return visit();
    }
}