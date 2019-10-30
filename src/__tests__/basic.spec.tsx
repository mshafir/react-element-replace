import * as React from 'react';
import { Replacer } from "..";
import { create } from 'react-test-renderer';

test("number replace", () => {
    const component = create(
        <Replacer 
            match={x => typeof x === 'number'} 
            replace={(x: number) => <>{x + 1}</>}>
                {1}{2}{3}
        </Replacer>
    );
    let tree = component.toJSON();
    expect(tree).toStrictEqual(['2','3','4']);
});

test("basic div replace", () => {
    const component = create(
        <Replacer
            match={(x: {type: any}) => x.type === 'div'}
            replace={() => <>{"This was a div"}</>}>
            <div>Replace Me</div>
            <span>Don't Replace Me</span>
        </Replacer>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test("no-op replace", () => {
    const component = create(
        <Replacer
            match={() => false}
            replace={() => <></>}>
            <div>
                <div>1</div>
                <div>
                    <div>2</div>
                </div>
            </div>
        </Replacer>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

