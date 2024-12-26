import { shallow } from 'enzyme';
import React from 'react';
import Image from '../index';
import { TouchableHighlight } from 'react-native';
const defaultSrc = require('../assets/no_cars_img.png');
describe('<Image />', function() {
    const src =
        'https://imgd.aeplcdn.com/1056x594/cw/ec/36265/Porsche-Macan-Exterior-161084.jpg?wm=0&q=80';
    describe('render', function() {
        it('should render an image', function() {
            const component = mount(<Image src={src} />);

            expect(component).toMatchSnapshot();
        });
    });

    describe('component props', function() {
        describe('should render an image with aspect ratio', function() {
            it('should render an image with 21:9 aspect ratio', function() {
                const component = shallow(
                    <Image src={src} aspectRatio="21:9" />
                );
                expect(component).toMatchSnapshot();
            });

            it('should render an image with 16:9 aspect ratio', function() {
                const component = shallow(
                    <Image src={src} aspectRatio="16:9" />
                );
                expect(component).toMatchSnapshot();
            });

            it('should render an image with 4:3 aspect ratio', function() {
                const component = shallow(
                    <Image src={src} aspectRatio="4:3" />
                );
                expect(component).toMatchSnapshot();
            });

            it('should render an image with 1:1 aspect ratio', function() {
                const component = shallow(
                    <Image src={src} aspectRatio="1:1" />
                );
                expect(component).toMatchSnapshot();
            });
        });

        it('should render an image with placeholder image when image is broken', function() {
            const placeholderSrc =
                'https://imgd.aeplcdn.com/0x0/cw/static/used/no-car-images.svg';
            const component = shallow(
                <Image placeholderSrc={placeholderSrc} />
            );
            const imageComponent = component.find('Image');
            expect(imageComponent).toHaveLength(1);
            expect(imageComponent.props('src').source.uri).toEqual(
                placeholderSrc
            );
        });

        it('should fire onPress event', function() {
            const mockFn = jest.fn();
            const component = mount(<Image src={src} onPress={mockFn} />);
            const container = component.find(TouchableHighlight);
            expect(container).toHaveLength(1);
            container
                .first()
                .props()
                .onPress();

            expect(mockFn).toHaveBeenCalled();
        });

        it('should handle error and render placeholder image', function() {
            const component = mount(<Image src="" />);

            const wrapper = component.find('Image').last();

            wrapper.props().onError();

            expect(component).toMatchSnapshot();
        });
        it('should render placeholder image with defaultSource prop', function() {
            const component = mount(<Image defaultSrc={defaultSrc} />);

            const wrapper = component.find('Image').last();

            wrapper.props().onError();

            expect(component).toMatchSnapshot();
        });

        it('should render Image with data-testing-id', function() {
            const wrapper = mount(<Image src={src} data-testing-id="review" />);

            expect(wrapper).toMatchSnapshot();
        });
    });
});
