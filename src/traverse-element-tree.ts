import * as React from "react";

const {
    isValidElement
} = React;

export type ChildrenFunc<T, S> = (newState: S) => T | T[];

export interface Visitor<T=any, S=any> {
    visit(element: React.ReactNode, state: S, children?: ChildrenFunc<T,S>): T;
}

export function traverseElementTree<T=any, S=any>(
    node: React.ReactNode,
    visitor: Visitor<T,S>,
    state?: any
) : T {
    function visit(target: React.ReactNode, children?: ChildrenFunc<T,S>) {
        return visitor.visit(target, state, children);
    }
    function traverse(target: React.ReactNode, newState?: S) {
        return traverseElementTree(target, visitor, newState || state);
    }

    if (isValidElement(node)) {
        if (typeof node.type === "function") {
            if ('prototype' in node.type && node.type.prototype.isReactComponent) {
                node = new (node.type as React.ComponentClass)(node.props).render();
            } else {
                node = (node.type as any)(node.props);
            }
            return traverse(node);
        } else if (node.props && 'children' in node.props) {
            const children : any | any[] = node.props['children'];
            const traverseChildren : ChildrenFunc<T,S> = (newState: S) =>
                Array.isArray(children) ? 
                    children.map((child: any) => 
                        traverse(child, newState)) :
                    traverse(children, newState);
            return visit(node, traverseChildren);
        }
    } else if (Array.isArray(node)) {
        const nodeArray = node;
        const traverseChildren : ChildrenFunc<T,S> = (newState: S) =>
            nodeArray.map((item: React.ReactNode) => traverse(item, newState));
        return visit(node, traverseChildren);
    }
    return visit(node);
}