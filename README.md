# react-element-replace
This library provides React utility methods that transforms element subtrees, 
replacing elements following the provided rules. This can be very useful in
many situations where you want to either extend React functionality or 
modify components that you may not have access to. 

- [react-element-replace](#react-element-replace)
  - [Install](#install)
  - [What is this for](#what-is-this-for)
  - [Caveats](#caveats)
  - [traverseElementTree](#traverseelementtree)
    - [Example](#example)
  - [rebuildElement](#rebuildelement)
  - [replaceInTree / Replacer](#replaceintree--replacer)
    - [Example: Replace numbers with their increment](#example-replace-numbers-with-their-increment)
    - [Example: Replace objects with their JSON.stringify representation](#example-replace-objects-with-their-jsonstringify-representation)
      - [Example: Replace divs with spans](#example-replace-divs-with-spans)


## Install
```bash
yarn add react-element-replace
# or
npm install react-element-replace
```

## What is this for

This library is a generic ste of utility functions that can
be used for any situation where you want to recurse through a 
React element tree and do something.

Here is a small and non-exhaustive list of things you could do with this library:
* render all objects in a subtree with JSON.stringify instead of throwing an error
* replace all promises with a loading component that shows a loader until promise resolution
* inject classNames into elements or components that meet a specific criteria, in a way that can apply / switch a theme
* remove components that are slow for testing
* count the number of elements of a certain kind in a subtree
* Redact or Internationalize content

## Caveats

This library can enable a completely new pattern of React development, 
but it does violate the explicit design of the framework. 
An important caveat is that replacing elements does sometimes interfere with React
renderer operations, causing errors when there are changes of state below the replacer node.
This happens when inside your Replacer you create or destroy new non-pure components
and the update does not cause a full remount from above the Replacer. Additionally,
if you create new elements below the Replacer that need replacing, they won't get replaced until
the Replacer node gets reevaluated. To avoid these issues, it's best to use this library
as close to the target elements as possible and to maintain the relevant state, and especially
any state that creates / destroys elements, above the replacing code. 
These are unfortunate limitations, but as far as I can tell there is no easy way around them. 
If you have any clues on how to make this more robust I'd appreciate it!

This library can be used as function calls, but also provides a Replacer component for convenience.


## traverseElementTree

```ts
function traverseElementTree<T=any, S=any>(
    node: React.ReactNode,
    visitor: Visitor<T,S>,
    state?: S
) : T
```

This function forms the core of the library. It enables you to 
recurse through a given `ReactNode` and it's descendants
and apply the given visitor logic to it. 
The optional state will get passed to each visitor invocation and
can be used to keep track of information as you go. `T` is the output type and `S` is the state type. This is the Visitor interface:

```ts
interface Visitor<T=any, S=any> {
    visit(
        element: React.ReactNode, 
        state?: S, 
        children?: (newState: S) => T | T[]): T;
}
```

It provides a `visit` function that performs logic for each node in the tree. It is passed the given node, the state, and a function that visits
that node's children (allowing you to pass new state to the children). The children function is undefined if the given element has no children.

### Example

Let us, for example, show how this can be used to count the number of elements in a tree. We define our `Visitor` as so:

```ts
class TreeElementCounter implements Visitor<number,null> {
    visit(
        element: React.ReactNode, 
        state?: null, 
        children?: (newState: null) => number | number[]
    ): number {
        // visit the children if they exist
        let childCounts = children ? children(state) : 0;  
        // coerce the result into an Array
        if (!Array.isArray(childCounts)) {
            childCounts = [childCounts];
        }
        // determine if the current node is an element (vs text)
        const elementCount = React.isValidElement(element) ? 1 : 0;
        // add the child counts to the elementCount and return
        return childCounts.reduce((count, cur) => count + cur, elementCount);
    }
}
```

Now we can use this `Visitor` as so:

```tsx
import { traverseElementTree } from 'react-element-replace';

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
let result = traverseElementTree(elements, new TreeElementCounter(), null);
expect(result).toEqual(6);
```

## rebuildElement

```ts
function rebuildElement(
    parent: React.ReactNode, 
    children?: React.ReactNode | React.ReactNode[]
): React.ReactNode
```

This function take a parent node and a child or children nodes (aka the result of a `children()` visitor invocation) and recreates the react element using `React.cloneElement`. This is necessary if you are modifying an element's children as part of a tree traversal. It is how the replace
method rebuilds the elements in the tree after the replace as happened.

## replaceInTree / Replacer

```ts
function replaceInTree<S = any>(
    node: React.ReactNode, 
    args: ReplacerProps<S>
): React.ReactNode
```

or use the `Replacer` component with the same `ReplacerProps` and `node` specified by the component's children.

Where the ReplacerProps type is

```ts
{
    // A replacing function
    replace: (value: React.ReactNode, state?: S) => React.ReactNode;

    // Value and function for initializing & updating state of type <S>
    updateState?: (input: React.ReactNode, state?: S) => S;
    initialState?: S;

    // and ONE of
    // match is for matching anything
    match: (value: React.ReactNode, state?: S) => boolean;
    // match Element is for matching a component of a specific type or 
    // a DOM element of a specific name
    matchElement: React.ComponentType | string;
    // match Literal is for matching non-elements & non Arrays
    // as in literal values like strings
    matchLiteral: (value: React.ReactNode, state?: S) => boolean;
}
```

### Example: Replace numbers with their increment
```tsx
import { Replacer } from 'react-element-replace';

<Replacer 
    match={x => typeof x === 'number'} 
    replace={x => x + 1}>
        <div>
            {1}
            {2}
            <div>{3}</div>
        </div>
</Replacer>

// renders >>>>

<div>
    2
    3
    <div>4</div>
</div>
```

### Example: Replace objects with their JSON.stringify representation
```tsx
<Replacer
    matchLiteral={item => typeof item === "object" }
    replace={item => JSON.stringify(item)} >
    <div>{{ comment: "testing" }}</div>
</Replacer>

// renders >>>>>

<div>{comment: "testing" }</div>
// Note: normally this throws an error
```

#### Example: Replace divs with spans

```tsx
<Replacer
    matchElement="div"
    replace={(item: React.ReactElement) => <span {...item.props} />}>
    <div>A div becomes a span</div>
</Replacer>

// renders >>>>>
<span>A div becomes a span</span>
```
