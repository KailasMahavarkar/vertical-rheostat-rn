import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import ScrollSpy from "./ui/ScrollSpy"

const textTransformLabel = 'textTransform';
const textTransformOptions = {
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    uppercase: 'uppercase',
};
const textTransformDefaultValue = textTransformOptions.uppercase;

const styleTypeLabel = 'styleType';
const styleTypeOptions = {
    default: 'default',
    pill: 'pill',
};
const styleTypeDefaultValue = styleTypeOptions.default;

let scrollContainerRef = React.createRef();

// let scrollEvent = new Emitter();

const styles = StyleSheet.create({
    customListStyle: {
        borderWidth: 3,
        borderStyle: 'solid',
        borderColor: 'red',
    },
    stickyScrollspyStyle: {
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
});
export default class StickyScrollspy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFixed: false,
            dynamicHeight: 200,
            shouldShowPane: true,
        };
        this.userScroll = React.createRef(false);
    }

    handleScroll = event => {
        if (!this.userScroll.current) return;
        if (event.nativeEvent.contentOffset.y > 100) {
            this.setState({ isFixed: true });
        } else {
            this.setState({ isFixed: false });
        }
        // scrollEvent.emit('scrollSpyScroll', event);
    };

    render() {
        return (
            <View>
                {this.state.isFixed && (
                    <ScrollView style={[styles.stickyScrollspyStyle]}>
                        <ScrollSpy
                            type="sticky"
                            styleType={styleTypeDefaultValue}
                            textTransform={textTransformDefaultValue}
                            // onScrollEmitter={scrollEvent}
                            onScrollSpyScroll={(x, y, z) => {
                                console.log({
                                    x, y, z
                                })
                            }}
                        >
                            <ScrollSpy.Pane
                                title="title1"
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit(
                                    //     'onStickyTabChange',
                                    //     index
                                    // );
                                }}
                                active
                            />
                            <ScrollSpy.Pane
                                title="title2"
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit(
                                    //     'onStickyTabChange',
                                    //     index
                                    // );
                                }}
                            />
                            {this.state.shouldShowPane && (
                                <ScrollSpy.Pane
                                    title="title3"
                                    onTabClick={(event, index) => {
                                        // scrollEvent.emit(
                                        //     'onStickyTabChange',
                                        //     index
                                        // );
                                    }}
                                />
                            )}
                            <ScrollSpy.Pane
                                title="Title4"
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit(
                                    //     'onStickyTabChange',
                                    //     index
                                    // );
                                }}
                            />
                            <ScrollSpy.Pane
                                title="Title5"
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit(
                                    //     'onStickyTabChange',
                                    //     index
                                    // );
                                }}
                            />
                            <ScrollSpy.Pane
                                title="Title6"
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit(
                                    //     'onStickyTabChange',
                                    //     index
                                    // );
                                }}
                            />
                            <ScrollSpy.Pane
                                title="Title7"
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit(
                                    //     'onStickyTabChange',
                                    //     index
                                    // );
                                }}
                            />
                        </ScrollSpy>
                    </ScrollView>
                )}

                <ScrollView
                    customListStyle={[styles.customListStyle]}
                    ref={scrollContainerRef}
                    style={{ height: 500, backgroundColor: '#efefef' }}
                    onScroll={this.handleScroll}
                    onScrollBeginDrag={() => {
                        this.userScroll.current = true;
                    }}
                    onMomentumScrollEnd={() => {
                        this.userScroll.current = false;
                    }}
                    scrollEventThrottle={50}
                >
                    <ScrollSpy
                        scrollableContainer={scrollContainerRef}
                        textTransform={textTransformDefaultValue}
                        handleDisabledClick={index =>
                            console.log('handleDisabledClick called', index)
                        }
                        styleType={styleTypeDefaultValue}
                        onTabSwitch={index => {
                            // scrollEvent.emit('onTabSwitch', index);
                        }}
                        threshold={46}
                        // onScrollEmitter={scrollEvent}
                        shouldStick={false}
                    >
                        <ScrollSpy.Pane
                            link="#"
                            title="title1"
                            active
                            onTabClick={(event, index) => {
                                // scrollEvent.emit('onTabSwitch', index);
                            }}
                            style={{ height: 400, backgroundColor: 'red' }}
                        >
                            <Text>Content 1</Text>
                        </ScrollSpy.Pane>
                        <ScrollSpy.Pane
                            title="title2"
                            style={{
                                height: this.state.dynamicHeight,
                                backgroundColor: 'green',
                            }}
                            onTabClick={(event, index) => {
                                // scrollEvent.emit('onTabSwitch', index);
                            }}
                        >
                            <Text>Content 2</Text>
                        </ScrollSpy.Pane>
                        <View style={{ height: 100 }}>
                            <Text>Custom Node 1</Text>
                        </View>
                        {this.state.shouldShowPane && (
                            <ScrollSpy.Pane
                                title="title3"
                                style={{ height: 300, backgroundColor: 'blue' }}
                                onTabClick={(event, index) => {
                                    // scrollEvent.emit('onTabSwitch', index);
                                }}
                            >
                                <Text>Content 3</Text>
                            </ScrollSpy.Pane>
                        )}
                        <ScrollSpy.Pane
                            title="Title4"
                            style={{ height: 300, backgroundColor: 'yellow' }}
                            onTabClick={(event, index) => {
                                // scrollEvent.emit('onTabSwitch', index);
                            }}
                        >
                            <Text>Content 4</Text>
                        </ScrollSpy.Pane>
                        <View style={{ height: 100 }}>
                            <Text>Custom Node 2</Text>
                        </View>
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
                <View style={{ height: 100 }}></View>
                <TouchableOpacity
                    onPress={() =>
                        this.setState({
                            dynamicHeight: 400,
                            shouldShowPane: false,
                        })
                    }
                >
                    <Text
                        style={{
                            padding: 5,
                            borderWidth: 1,
                            borderColor: '#000',
                            borderStyle: 'solid',
                        }}
                    >
                        Press here to increase height of pane 2 and remove pane
                        3
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}