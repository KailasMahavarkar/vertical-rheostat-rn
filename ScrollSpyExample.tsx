import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
// import StickyScrollspy from './StickyScrollSpy';

import ScrollSpy from './ui/ScrollSpy';
/* knobs */

// prop: textTransform
const textTransformLabel = 'textTransform';
const textTransformOptions = {
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    uppercase: 'uppercase',
};
const textTransformDefaultValue = textTransformOptions.uppercase;

// prop: styleType
const styleTypeLabel = 'styleType';
const styleTypeOptions = {
    default: 'default',
    pill: 'pill',
};
const styleTypeDefaultValue = styleTypeOptions.default;

const tabNavBgColorLabel = 'tabNavBgColor';
const tabNavBgColorOptions = {
    white: 'white',
    transparent: 'transparent',
};
const tabNavBgColorDefaultValue = 'white';

let scrollContainerRef = React.createRef();


const handleScroll = event => {
};
const styles = StyleSheet.create({
    customListStyle: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'red',
    },
});



const ScrollSpyExample = () => {
    return (
        <ScrollView
            ref={scrollContainerRef}
            style={{ height: 500, backgroundColor: '#efefef' }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            <View style={{ height: 100 }}></View>
            <ScrollSpy
                customListStyle={[styles.customListStyle]}
                scrollableContainer={scrollContainerRef}
                textTransform={textTransformDefaultValue}
                handleDisabledClick={index =>
                    console.log('handleDisabledClick called', index)
                }
                styleType={styleTypeDefaultValue}
                onTabSwitch={index => {

                }}
                threshold={10}
                shouldStick={false}
                hasFirstLastChildPadding={true}
                zIndex={1}
                tabNavBgColor={tabNavBgColorLabel}
                // onScrollEmitter={scrollEvent}
            >
                <ScrollSpy.Pane
                    link="#"
                    title="title1"
                    sponsoredText="ad"
                    active
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                    style={{ height: 300, backgroundColor: 'red' }}
                >
                    <Text>Content 1</Text>
                </ScrollSpy.Pane>
                <ScrollSpy.Pane
                    title="title2"
                    style={{ height: 300, backgroundColor: 'green' }}
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                >
                    <Text>Content 2</Text>
                </ScrollSpy.Pane>
                <ScrollSpy.Pane
                    title="title3"
                    style={{ height: 300, backgroundColor: 'blue' }}
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                >
                    <Text>Content 3</Text>
                </ScrollSpy.Pane>
                <ScrollSpy.Pane
                    title="Title4"
                    style={{ height: 300, backgroundColor: 'yellow' }}
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                >
                    <Text>Content 4</Text>
                </ScrollSpy.Pane>
                <ScrollSpy.Pane
                    title="Title5"
                    style={{ height: 300, backgroundColor: 'cyan' }}
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                >
                    <Text>Content 5</Text>
                </ScrollSpy.Pane>
                <ScrollSpy.Pane
                    title="Title6"
                    style={{ height: 300, backgroundColor: 'red' }}
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                >
                    <Text>Content 6</Text>
                </ScrollSpy.Pane>
                <ScrollSpy.Pane
                    title="Title7"
                    style={{ height: 300, backgroundColor: 'green' }}
                    onTabClick={(event, index) => {
                        // scrollEvent.emit('onTabSwitch', index);
                    }}
                >
                    <Text>Content 7</Text>
                </ScrollSpy.Pane>
            </ScrollSpy>
            <View style={{ height: 500 }}></View>
        </ScrollView>
    )
}


export default ScrollSpyExample;