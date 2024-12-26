import React from 'react';
import { Image, View } from 'react-native';
import { create } from 'react-test-renderer';

import ZoomableImage from '../ZoomableImage';

const mockFn = jest.fn();
const defaulImageSrc = require('../assets/no_cars_img.png');
const allProps = {
    width: 360,
    aspectRatio: '21:9',
    threshold: 2,
    maxScale: 4,
    src:
        'https://imgd.aeplcdn.com/0x0/n/cw/ec/41523/sonet-exterior-right-front-three-quarter-108.jpeg?q=85',
    placeholderSrc:
        'https://imgd.aeplcdn.com/310x174/n/cw/ec/54437/2021-wrangler-exterior-right-front-three-quarter.jpeg?q=75',
    defaultSrc: defaulImageSrc,
    onTouchMove: mockFn,
    onPinch: mockFn,
    onDoubleTap: mockFn,
    wrapperStyle: { padding: 10 },
    style: { padding: 10 },
    doubleTapDelay: 300,
    'data-testing-id': 'parent',
};

const findAllByTestID = (instance, testId, component) =>
    instance.root.findAll(
        el => el.props.testID === testId && el.type === component
    );

import { NO_CAR_IMAGE } from '../../utils/icons';

describe('<ZoomableImage />', function() {
    describe('render', function() {
        it('Should render with default props', function() {
            const wrapper = mount(<ZoomableImage width={allProps.width} />);

            expect(wrapper).toMatchSnapshot();
        });

        it('Should render with custom props', function() {
            const wrapper = mount(<ZoomableImage {...allProps} />);

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('props', function() {
        describe('width', function() {
            it('Should add given width to Image component', function() {
                const wrapper = mount(<ZoomableImage width={allProps.width} />);

                const image = wrapper.find(Image);
                const width = image.props().style[2].width;

                expect(width).toBe(allProps.width);
            });
        });

        describe('aspectRatio', function() {
            it('Should apply appropriate height with default aspectRatio i.e. 16:9', function() {
                const wrapper = mount(<ZoomableImage width={allProps.width} />);

                const image = wrapper.find(Image);
                const height = image.props().style[2].height;

                expect(height).toBe((allProps.width * 9) / 16);
            });

            it('Should apply same height as width when aspectRatio is 1:1', function() {
                const wrapper = mount(
                    <ZoomableImage width={allProps.width} aspectRatio="1:1" />
                );

                const image = wrapper.find(Image);
                const height = image.props().style[2].height;

                expect(height).toBe(allProps.width);
            });
        });

        describe('data-testing-id', function() {
            it('Should apply null testID with blank data-testing-id', function() {
                const wrapper = create(
                    <ZoomableImage width={allProps.width} />
                );

                const viewCount = findAllByTestID(
                    wrapper,
                    'zoomable-image-wrapper',
                    'View'
                ).length;

                expect(viewCount).toEqual(0);
            });

            it('Should apply given testID with data-testing-id', function() {
                const wrapper = create(
                    <ZoomableImage
                        width={allProps.width}
                        data-testing-id={allProps['data-testing-id']}
                    />
                );

                const viewCount = findAllByTestID(
                    wrapper,
                    `${allProps['data-testing-id']}-zoomable-image-wrapper`,
                    'View'
                ).length;

                expect(viewCount).toEqual(1);
            });
        });

        describe('placeholderSrc', function() {
            it('Should apply default placeholder src with blank src', function() {
                const wrapper = mount(<ZoomableImage width={allProps.width} />);

                const image = wrapper.find(Image);
                const imageURL = image.props().source.uri;

                expect(imageURL).toBe(NO_CAR_IMAGE);
            });

            it('Should apply given placeholder to Image component when src is not passed/working', function() {
                const wrapper = mount(
                    <ZoomableImage
                        width={allProps.width}
                        placeholderSrc={allProps.placeholderSrc}
                    />
                );

                const image = wrapper.find(Image);
                const imageURL = image.props().source.uri;

                expect(imageURL).toBe(allProps.placeholderSrc);
            });
        });

        describe('defaultSrc', function() {
            it('should apply given defaultSrc to Image component', function() {
                const wrapper = shallow(
                    <ZoomableImage
                        width={allProps.width}
                        defaultSrc={allProps.defaultSrc}
                    />
                );
                const image = wrapper.find(Image);
                expect(image.prop('defaultSource')).toEqual(
                    allProps.defaultSrc
                );
            });
        });

        describe('src', function() {
            it('Should apply no car image with blank src', function() {
                const wrapper = mount(<ZoomableImage width={allProps.width} />);

                const image = wrapper.find(Image);
                const imageURL = image.props().source.uri;

                expect(imageURL).toBe(NO_CAR_IMAGE);
            });

            it('Should apply given src to Image component', function() {
                const wrapper = mount(
                    <ZoomableImage width={allProps.width} src={allProps.src} />
                );

                const image = wrapper.find(Image);
                const imageURL = image.props().source.uri;

                expect(imageURL).toBe(allProps.src);
            });
        });

        describe('style', function() {
            it('Should not apply style when with blank style', function() {
                const wrapper = mount(<ZoomableImage width={allProps.width} />);

                const style = wrapper.find(Image).props().style[1];

                expect(style).toBe(null);
            });

            it('Should apply style to image', function() {
                const wrapper = mount(
                    <ZoomableImage
                        width={allProps.width}
                        style={allProps.style}
                    />
                );

                const style = wrapper.find(Image).props().style[1];

                expect(style).toBe(allProps.style);
            });
        });

        describe('wrapperStyle', function() {
            it('Should not apply style when with blank wrapperStyle', function() {
                const wrapper = mount(<ZoomableImage width={allProps.width} />);

                const style = wrapper.find(View).props().style[1];

                expect(style).toBe(null);
            });

            it('Should apply style to image wrapper', function() {
                const wrapper = mount(
                    <ZoomableImage
                        width={allProps.width}
                        wrapperStyle={allProps.wrapperStyle}
                    />
                );

                const style = wrapper.find(View).props().style[1];

                expect(style).toBe(allProps.wrapperStyle);
            });
        });
    });
});
