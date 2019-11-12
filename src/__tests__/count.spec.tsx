import * as React from 'react';
import { Visitor, traverseElementTree } from '..';

class TreeElementCounter implements Visitor<number,null> {
    visit(element: React.ReactNode, state?: null, children?: (newState: any) => number | number[]): number {
        let childCounts = children ? children(state) : 0;  
        if (!Array.isArray(childCounts)) {
            childCounts = [childCounts];
        }
        const elementCount = React.isValidElement(element) ? 1 : 0;
        return childCounts.reduce((count, cur) => count + cur, elementCount);
    }
}

test("count elements", () => {
    const elements = (
        <div>1
            <div>2</div>
            <div>3
                <div>4</div>
                <div>5</div>
            </div>
            <div>6</div>
        </div>
    );
    let result = traverseElementTree(elements, new TreeElementCounter(), {});
    expect(result).toEqual(6);
});
