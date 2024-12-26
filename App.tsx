/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import ScrollSpyExample from './ScrollSpyExample';
import StickyScrollspy from './StickyScrollSpy';

function App(): React.JSX.Element {
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
            <StickyScrollspy />
        </View>
    </SafeAreaView>;
}

export default App;
