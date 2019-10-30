import * as React from "react";

const {
    isValidElement
} = React;

export interface Visitor<T=any, S=any> {
    updateState(state: S): S;
    visit(element: React.ReactNode, state: S): T;
    combine(parent: React.ReactNode | null, children: T | T[], state: S) : T;
}

export function traverseElementTree<T=any, S=any>(
    node: React.ReactNode,
    visitor: Visitor<T,S>,
    state?: any
) : T {
    state = visitor.updateState(state);

    function visit(target: React.ReactNode) {
        return visitor.visit(target, state);
    }
    function traverse(target: React.ReactNode) {
        return traverseElementTree(target, visitor, state);
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
            const traversed = Array.isArray(children) ? 
                children.map((child: any) => 
                    traverse(child)) :
                traverse(children);
            const combined = visitor.combine(node, traversed, state);
            return visit(combined);
        } else {
            return visit(node);
        }
    } else if (Array.isArray(node)) {
        const visited = node.map(
            (item: React.ReactNode) => traverse(item));
        return visitor.combine(null, visited, state);
    } else {
        return visit(node);
    }
}