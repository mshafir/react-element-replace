import React, { useState } from "react";
import { Replacer } from "../src/index";


function TestComponentWithObject(props) {
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

function ReplaceObjectExample() {
    return (
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
}

export { ReplaceObjectExample };