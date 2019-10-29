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

function ReplaceDivExample() {
    return (
        <Replacer
            matchElement={"div"}
            replace={({ type: Div, props }) => (
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
}

export { ReplaceDivExample };