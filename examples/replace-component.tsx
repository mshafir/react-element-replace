import React from 'react';
import { Replacer } from "../src/index";


function TestComponent(props) {
    return (
        <div>
            {props.label} :{" "}
            <div
                style={{
                    display: "inline-block",
                    border: "1px solid black"
                }}
            >
                Label Me
      </div>
            <div>{props.children}</div>
        </div>
    );
}

function ReplaceComponentExample() {
    return (
        <Replacer
            matchElement={TestComponent}
            replace={({ type: TestComponent, props }) => (
                <TestComponent {...props} label="The Label" />
            )}>
            <TestComponent>
                <TestComponent />
            </TestComponent>
        </Replacer>
    );
}

export { ReplaceComponentExample };