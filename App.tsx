/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import VerticalRheostat from './VerticalRheostat/VerticalRheostat';
import { linearAlgorithm, log10Algorithm } from './VerticalRheostat/algorithm';

function Label({ value }) {
    return <Text style={{ color: 'white', fontSize: 16 }}>{value}</Text>;
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
                handleDelta={0}
                rheostatWidth={200}
                rheostatHeight={600}

                tooltipPosition="left"
                tooltipTextSuffix=" °C"

                minRange={minValue}
                maxRange={maxValue}
                algorithm={linearAlgorithm}

                topLabel={<Label value={topValue} />}
                bottomLabel={<Label value={bottomValue} />}

                showSnapLines={true}
                shouldSnap={true}
                snappingPoints={[minValue, 100, 200, 300, 400, 500, 600, 700, 800, 900, maxValue]}

                topHandleValue={topValue}
                bottomHandleValue={bottomValue}

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
