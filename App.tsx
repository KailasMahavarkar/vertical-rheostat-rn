/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, useColorScheme, View, Text, Pressable } from 'react-native';
import VerticalRheostat from './VerticalRheostat/VerticalRheostat';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { linearAlgorithm, log10Algorithm } from './VerticalRheostat/algorithm';

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    const maxValue = 1000;
    const minValue = 0;

    const [topValue, setTopValue] = useState(900);
    const [bottomValue, setBottomValue] = useState(100);
    const [pressed, setPressed] = useState(true);

    const backgroundStyle = {
        backgroundColor: 'black'
    };

    function Label({ value }) {
        return <Text style={{ color: 'white', fontSize: 16 }}>{value}</Text>;
    }

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
                handleSize={30}
                handleDelta={30}
                rheostatWidth={200}
                rheostatHeight={600}

                tooltipPosition="left"
                suffix=' Lakh'

                minRange={minValue}
                maxRange={maxValue}

                algorithm={linearAlgorithm}

                topLabel={<Label value={10} />}
                bottomLabel={<Label value={100} />}

                shouldSnap={false}
                snappingPoints={[minValue, 100, 200, 300, 400, 500, 600, 700, 800, 900, maxValue]}

                topValue={topValue}
                bottomValue={bottomValue}
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
