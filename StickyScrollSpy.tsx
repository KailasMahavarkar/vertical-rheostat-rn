import React from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';


import useScrollSpy from './ui/hooks/useScrollSpy';
import Animated from 'react-native-reanimated';


const NestedScrollSpy = () => {
    const {
        activeIndex: parentActiveIndex,
        handleScroll: handleParentScroll,
        TabList: ParentTabList,
        Section: ParentSection,
        contentRef: parentContentRef,
    } = useScrollSpy({
        threshold: 50,
        // onActiveIndexChange: (index: any) => console.log('Parent section:', index),
        tabNavBgColor: '#e0e0e0',
        styleType: 'pill',
    });


    const parentSections = [
        { title: 'Section 0', content: 'Content 0' },
        { title: 'Section 1', content: 'Content 1' },
        { title: 'Section 2', content: 'Content 2' },
    ];

    return (
        <>
            <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'pink',
                zIndex: 10
            }}>
                <Text>Parent Active Index: {parentActiveIndex}</Text>
            </View>
            <Animated.ScrollView
                ref={parentContentRef}
                onScroll={handleParentScroll}
                stickyHeaderIndices={[0]}
                nestedScrollEnabled={true}
                style={{
                    flex: 1,
                    backgroundColor: '#f0f0f0',
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                <ParentTabList items={parentSections} />



                {parentSections.map((section, index) => (
                    <ParentSection key={index} index={index}>
                        <View
                            style={{
                                height: 500,
                                backgroundColor: ['red', 'green', 'blue'][index % 3],
                                color: ['white', 'black', 'white'][index % 3],
                            }}>
                            <Text>{section.content}</Text>
                        </View>
                    </ParentSection>
                ))}

                <View style={{ height: 300 }} />

            </Animated.ScrollView>
        </>

    );
};

export default NestedScrollSpy;