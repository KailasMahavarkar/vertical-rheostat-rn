/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import VerticalRheostat from './VerticalRheostat/VerticalRheostat';
import { linearAlgorithm, log10Algorithm } from './VerticalRheostat/algorithm';
import VerticalRheostat2 from './VerticalRheostat/VerticalRheostat2';

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

    const [topValue, setTopValue] = useState(maxValue);
    const [bottomValue, setBottomValue] = useState(minValue);
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
            <VerticalRheostat2
                handleSize={24}
                handleDelta={10}
                rheostatWidth={200}
                rheostatHeight={600}

                tooltipPosition="right"
                tooltipTopTextSuffix=" cr"
                tooltipBottomTextSuffix=" lakh"
                minRange={minValue}
                maxRange={maxValue}
                algorithm={log10Algorithm}

                topLabel={<Label text="Top Label" />}
                bottomLabel={<Label text="Bottom Label" />}

                showSnapLines={true}
                snap={true}
                shouldShowMarkings={true}
                snapPoints={[minValue, 100, 200, 300, 400, 500, 600, 700, 800, maxValue]}
                topHandleValue={topValue}
                bottomHandleValue={bottomValue}
                onSliderMove={(panType, stateValues, event, gesture) => {
                    console.log({
                        stateValues
                    })
                }}
                labelStyles={{
                    backgroundColor: 'yellow',
                }}
            />


            <Pressable
                onPress={() => {
                    if (pressed) {
                        setTopValue(415);
                        setBottomValue(410);
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
