export const findAllByTestID = (instance, testId, component) =>
    instance.root.findAll(
        el => el.props.testID === testId && el.type === component
    );
