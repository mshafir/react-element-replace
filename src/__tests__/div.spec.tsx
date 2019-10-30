import * as React from 'react';
import { Replacer } from "..";
import { create } from 'react-test-renderer';


function TestComponent(props: {
    label?: string;
    children?: any;
}) {
    return (<div>
        {props.label} :{" "}
        <div style={{
            display: "inline-block",
            border: "1px solid black"
        }}>
            Label Me
      </div>
        <div>{props.children}</div>
    </div>);
}

test("div color replace", () => {
    const component = create(
        <Replacer
            matchElement={"div"}
            replace={({ type: Div, props }: any) => (
                <Div
                    {...props}
                    style={{
                        ...props.style,
                        color: "blue",
                        padding: "3px"
                    }}
                />
            )}
        >
            <TestComponent>
                <TestComponent />
            </TestComponent>
            <TestComponent />
        </Replacer>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
