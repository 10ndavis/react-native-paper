/* @flow */

import * as React from 'react';
import {
  View,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import color from 'color';
import Icon from './Icon';
import Paper from './Paper';
import Text from './Typography/Text';
import { black, white } from '../styles/colors';
import withTheme from '../core/withTheme';
import type { Theme } from '../types';
import type { IconSource } from './Icon';
import type { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedPaper = Animated.createAnimatedComponent(Paper);

type Route = {
  key: string,
  title: string,
  icon: IconSource,
  color?: string,
};

type NavigationState<T> = {
  index: number,
  routes: Array<T>,
};

type Scene<T> = {
  route: T,
  focused: boolean,
  index: number,
};

type Props<T> = {
  shifting?: boolean,
  navigationState: NavigationState<T>,
  onIndexChange: (index: number) => void,
  renderScene: (props: Scene<T>) => ?React.Node,
  theme: Theme,
  style?: StyleProp,
};

type State = {
  tabs: Animated.Value[],
  shifts: Animated.Value[],
  index: Animated.Value,
  ripple: Animated.Value,
  layout: { height: number, width: number, measured: boolean },
};

const MIN_RIPPLE_SCALE = 0.1;

class BottomNavigation<T: Route> extends React.Component<Props<T>, State> {
  constructor(props) {
    super(props);

    const { routes, index } = this.props.navigationState;

    this.state = {
      tabs: routes.map((_, i) => new Animated.Value(i === index ? 1 : 0)),
      shifts: routes.map(
        (_, i) =>
          new Animated.Value(this._getShiftAmount(index, i, routes.length))
      ),
      index: new Animated.Value(index),
      ripple: new Animated.Value(MIN_RIPPLE_SCALE),
      layout: { height: 0, width: 0, measured: false },
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.navigationState.index !== this.props.navigationState.index) {
      const { routes, index } = this.props.navigationState;

      this.state.ripple.setValue(MIN_RIPPLE_SCALE);

      Animated.parallel([
        ...routes.map((_, i) =>
          Animated.timing(this.state.tabs[i], {
            toValue: i === index ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          })
        ),
        ...routes.map((_, i) =>
          Animated.timing(this.state.shifts[i], {
            toValue: this._getShiftAmount(index, i, routes.length),
            duration: 200,
            useNativeDriver: true,
          })
        ),
        Animated.timing(this.state.ripple, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Workaround a bug in native animations where this is reset after first animation
        this.state.tabs.map((tab, i) => tab.setValue(i === index ? 1 : 0));
        this.state.index.setValue(index);
        this.state.ripple.setValue(MIN_RIPPLE_SCALE);
      });
    }
  }

  _getShiftAmount = (activeIndex, currentIndex, numberOfItems) => {
    if (activeIndex < currentIndex) {
      return 2;
    }

    if (activeIndex > currentIndex) {
      return -2;
    }

    if (activeIndex === currentIndex) {
      if (currentIndex === 0) {
        return 1;
      }

      if (currentIndex === numberOfItems - 1) {
        return -1;
      }
    }

    return 0;
  };

  _handleLayout = e =>
    this.setState({
      layout: {
        height: e.nativeEvent.layout.height,
        width: e.nativeEvent.layout.width,
        measured: true,
      },
    });

  render() {
    const { navigationState, onIndexChange, renderScene, theme } = this.props;
    const { layout } = this.state;
    const { routes } = navigationState;
    const { colors } = theme;

    const shifting =
      typeof this.props.shifting === 'boolean'
        ? this.props.shifting
        : routes.length > 3;

    const backgroundColor = shifting
      ? this.state.index.interpolate({
          inputRange: routes.map((_, i) => i),
          outputRange: routes.map(route => route.color),
        })
      : theme.dark ? black : white;
    const activeColor = shifting ? white : colors.primary;
    const inactiveColor = shifting
      ? white
      : color(color(backgroundColor).light() ? black : white)
          .alpha(0.5)
          .rgb()
          .string();

    const maxTabWidth = routes.length > 3 ? 96 : 168;
    const tabWidth = Math.min(layout.width / routes.length, maxTabWidth);

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
          this.props.style,
        ]}
        onLayout={this._handleLayout}
        pointerEvents={this.state.layout.measured ? 'auto' : 'none'}
      >
        <View style={styles.content}>
          {routes.map((route, index) => {
            const focused = this.state.tabs[index];
            const opacity = focused.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            });
            const translateY = focused.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [6, 6, 0],
            });

            return (
              <Animated.View
                key={route.key}
                style={[
                  StyleSheet.absoluteFill,
                  { opacity, transform: [{ translateY }] },
                ]}
              >
                {renderScene({
                  route,
                  index,
                  focused: index === navigationState.index,
                })}
              </Animated.View>
            );
          })}
        </View>
        <AnimatedPaper style={[styles.bar, { backgroundColor }]}>
          <View
            style={[styles.items, { maxWidth: maxTabWidth * routes.length }]}
          >
            {shifting ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ripple,
                  {
                    top: -layout.width + 28,
                    left:
                      -layout.width +
                      tabWidth / 2 +
                      navigationState.index * tabWidth,
                    height: layout.width * 2,
                    width: layout.width * 2,
                    borderRadius: layout.width,
                    backgroundColor: routes[navigationState.index].color,
                    transform: [{ scale: this.state.ripple }],
                    opacity: this.state.ripple.interpolate({
                      inputRange: [0, 0.1, 0.2, 1],
                      outputRange: [0, 0, 1, 1],
                    }),
                  },
                ]}
              />
            ) : null}
            {routes.map((route, index) => {
              const shift = this.state.shifts[index];
              const focused = this.state.tabs[index];
              const scale = focused.interpolate({
                inputRange: [0, 1],
                outputRange: [shifting ? 0.5 : 12 / 14, 1],
              });
              const translateY = focused.interpolate({
                inputRange: [0, 1],
                outputRange: [shifting ? 10 : 2, 0],
              });
              const translateX = shifting ? Animated.multiply(shift, 5) : 0;
              const inactiveOpacity = focused.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              });
              const activeIconOpacity = shifting
                ? focused.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  })
                : focused;
              const activeLabelOpacity = focused;
              const inactiveIconOpacity = inactiveOpacity;
              const inactiveLabelOpacity = inactiveOpacity;

              return (
                <TouchableWithoutFeedback
                  key={route.key}
                  onPress={() => onIndexChange(index)}
                >
                  <Animated.View
                    style={[styles.item, { transform: [{ translateX }] }]}
                  >
                    <Animated.View
                      style={[
                        styles.iconContainer,
                        { transform: [{ translateY }] },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.iconWrapper,
                          { opacity: activeIconOpacity },
                        ]}
                      >
                        <Icon
                          style={styles.icon}
                          name={route.icon}
                          color={activeColor}
                          size={24}
                        />
                      </Animated.View>
                      {shifting ? null : (
                        <Animated.View
                          style={[
                            styles.iconWrapper,
                            { opacity: inactiveIconOpacity },
                          ]}
                        >
                          <Icon
                            style={styles.icon}
                            name={route.icon}
                            color={inactiveColor}
                            size={24}
                          />
                        </Animated.View>
                      )}
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.labelContainer,
                        {
                          transform: [{ scale }, { translateY }],
                        },
                      ]}
                    >
                      <AnimatedText
                        style={[
                          styles.label,
                          {
                            opacity: activeLabelOpacity,
                            color: activeColor,
                          },
                        ]}
                      >
                        {route.title}
                      </AnimatedText>
                      {shifting ? null : (
                        <AnimatedText
                          style={[
                            styles.label,
                            {
                              opacity: inactiveLabelOpacity,
                              color: inactiveColor,
                            },
                          ]}
                        >
                          {route.title}
                        </AnimatedText>
                      )}
                    </Animated.View>
                  </Animated.View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        </AnimatedPaper>
      </View>
    );
  }
}

export default withTheme(BottomNavigation);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bar: {
    elevation: 8,
    paddingHorizontal: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  items: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    paddingBottom: 10,
    paddingTop: 6,
  },
  ripple: {
    position: 'absolute',
  },
  iconContainer: {
    height: 24,
    width: 24,
    marginHorizontal: 12,
    alignSelf: 'center',
  },
  iconWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  icon: {
    backgroundColor: 'transparent',
  },
  labelContainer: {
    height: 16,
  },
  label: {
    ...StyleSheet.absoluteFillObject,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
