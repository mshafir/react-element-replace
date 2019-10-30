import * as React from 'react';
import { Replacer } from "..";
import { create } from 'react-test-renderer';

const { useState } = React;

function TestComponentWithObject(props: { label?: string, value: string, children: any }) {
    const [label, setLabel] = useState<any>("a string");
    return (
        <div>
            <div>Test</div>
            <span>A span</span>
            <div>{{ comment: props.value }}</div>
            <div>{props.children}</div>
            <div>{label}</div>
            <button onClick={() => setLabel({ test: "an object" })}>Testing</button>
        </div>
    );
}

test("object to string replace", () => {
    const component = create(
        <Replacer
            matchLiteral={i => typeof i === "object"}
            replace={i => <>{JSON.stringify(i)}</>}>
            <TestComponentWithObject value="text">
                <TestComponentWithObject value="text">
                    {{ test: 123 }}
                </TestComponentWithObject>
            </TestComponentWithObject>
        </Replacer>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    

});
