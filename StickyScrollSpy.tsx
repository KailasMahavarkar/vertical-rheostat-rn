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
        onActiveIndexChange: (index) => console.log('Parent section:', index),
        tabNavBgColor: '#e0e0e0',
        styleType: 'pill',
        isNested: false
    });

    const {
        activeIndex: childActiveIndex,
        handleScroll: handleChildScroll,
        TabList: ChildTabList,
        Section: ChildSection,
        contentRef: childContentRef,
    } = useScrollSpy({
        threshold: 50,
        onActiveIndexChange: (index) => console.log('Child section:', index),
        tabNavBgColor: '#e0e0e0',
        styleType: 'pill',
        isNested: true // Mark as nested
    });

    const parentSections = [
        { title: 'Section 0', content: 'Content 0' },
        { title: 'Section 1', content: 'Content 1' },
        { title: 'Section 2', content: 'Content 2' },
    ];

    const childSections = [
        { title: 'Nested 0', content: 'Nested Content 0' },
        { title: 'Nested 1', content: 'Nested Content 1' },
        { title: 'Nested 2', content: 'Nested Content 2' },
    ];

    return (
        <Animated.ScrollView
            ref={parentContentRef}
            onScroll={handleParentScroll}
            scrollEventThrottle={16}
            stickyHeaderIndices={[0]}
            nestedScrollEnabled={true} // Enable nested scrolling
        >
            <ParentTabList items={parentSections} />

            {parentSections.map((section, index) => (
                <ParentSection key={index} index={index}>
                    {index === 1 ? (
                        <Animated.ScrollView
                            ref={childContentRef}
                            onScroll={handleChildScroll}
                            scrollEventThrottle={16}
                            stickyHeaderIndices={[0]}
                            nestedScrollEnabled={true}
                            style={{ maxHeight: 600 }} // Constrain height of nested scroll view
                        >
                            <ChildTabList items={childSections} />

                            {childSections.map((childSection, childIndex) => (
                                <ChildSection key={childIndex} index={childIndex}>
                                    <View style={{ height: 300 }}>
                                        <Text>{childSection.content}</Text>
                                    </View>
                                </ChildSection>
                            ))}
                        </Animated.ScrollView>
                    ) : (
                        <View style={{ height: 500 }}>
                            <Text>{section.content}</Text>
                        </View>
                    )}
                </ParentSection>
            ))}

            <View style={{ height: 300 }} />
        </Animated.ScrollView>
    );
};

export default NestedScrollSpy;