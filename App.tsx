/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import VerticalRheostat from './VerticalRheostat/VerticalRheostat';
import { linearAlgorithm, log10Algorithm } from './VerticalRheostat/algorithm';

function Label({ text }) {
    return <View style={{
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        <Text style={{ color: 'white', fontSize: 16 }}>{text}</Text>
    </View>;
}

function App(): React.JSX.Element {
    const maxValue = 1000;
    const minValue = 0;

    const [topValue, setTopValue] = useState(700);
    const [bottomValue, setBottomValue] = useState(200);
    const [pressed, setPressed] = useState(true);

    const backgroundStyle = {
        backgroundColor: 'black',
    };

    return <SafeAreaView style={backgroundStyle} >
        <View
            style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'red',
                borderStyle: 'solid',
            }}
        >
            <VerticalRheostat
                handleSize={24}
                handleDelta={10}
                rheostatWidth={200}
                rheostatHeight={600}

                tooltipPosition="right"
                tooltipTextSuffix=" °C"

                minRange={50}
                maxRange={900}
                algorithm={linearAlgorithm}

                topLabel={<Label text="Top Label" />}
                bottomLabel={<Label text="Vottom Label" />}

                showSnapLines={true}
                shouldSnap={false}
                snappingPoints={[minValue, 100, 200, 300, 400, 500, 600, 700, 800, 900, maxValue]}

                topHandleValue={300}
                bottomHandleValue={50}

                tooltipFloatPrecision={0}

                labelStyles={{
                    backgroundColor: 'yellow',
                }}
            />


            <Pressable
                onPress={() => {
                    if (pressed) {
                        setTopValue(600);
                        setBottomValue(200);
                    } else {
                        setTopValue(maxValue);
                        setBottomValue(minValue);
                    }
                    setPressed(!pressed);
                }}
            >
                <View style={{
                    width: 200,
                    height: 20,
                }}>
                    <Text
                        style={{
                            color: 'black',
                            backgroundColor: 'pink',
                        }}>
                        Reposition
                    </Text>
                </View>
            </Pressable>
        </View>
    </SafeAreaView>;
}

export default App;
