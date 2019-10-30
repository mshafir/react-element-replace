import * as React from "react";

const {
    isValidElement,
    cloneElement
} = React;

export function rebuildElement(
    parent: React.ReactNode, children?: React.ReactNode | React.ReactNode[]
): React.ReactNode {
    if (!children) {
        return parent;
    }
    if (Array.isArray(children)) {
        children = children.map((e, i) =>
            isValidElement(e) ?
                cloneElement(e, { ...e.props, key: i }) :
                e);
    }
    if (!parent || Array.isArray(parent)) {
        return children;
    }
    if (isValidElement(parent)) {
        return cloneElement(parent, {
            ...parent.props,
            children
        } as any);
    }
    return parent;
}